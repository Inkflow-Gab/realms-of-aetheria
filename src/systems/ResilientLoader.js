// ============================================
// REALMS OF AETHERIA - RESILIENT ASSET LOADER
// ============================================
//
// WHY THIS EXISTS
// ---------------
// The game hung on its loading screen at "0 / 31 assets", indefinitely, with
// no error. Diagnosis and elimination:
//
//   * the previous APK was unpacked and every critical file was confirmed
//     present at assets/public/assets/... , at exactly the paths requested
//   * every file was confirmed to be a valid, non-empty PNG or OGG
//   * the shipped JavaScript was confirmed byte-identical to the source
//   * the engine itself loaded from vendor/phaser.min.js, proving the WebView
//     asset server answers for same-origin scripts
//
// So the files were right and the server was up, yet <img> and fetch() requests
// for the same directory never settled. Something specific to those two paths
// is being dropped by the WebView.
//
// Rather than keep guessing which mechanism is blocked, each file is attempted
// through several independent transports and the first one that works is used:
//
//   images  1. <img> element            the classic path
//           2. fetch() -> Blob -> <img> forces the bytes through fetch first
//           3. fetch() -> createImageBitmap -> canvas
//                                     bypasses the <img> decode path entirely
//   audio   1. fetch()
//           2. XMLHttpRequest          a genuinely different network stack
//
// Every attempt is bounded by a timeout, retried once, and capped by an overall
// deadline. Failures are recorded, never thrown, and results land in the normal
// texture and audio caches, so every other system reads them by key as before
// and is unaware this module exists.
// ============================================

import { EMBEDDED_IMAGES } from '../data/embeddedAssets.js';

const IMAGE_TIMEOUT = 3000;
const AUDIO_TIMEOUT = 8000;

/** Bound a single attempt. */
function withTimeout(promise, ms) {
    let timer;
    const guard = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
    });
    return Promise.race([promise, guard]).finally(() => clearTimeout(timer));
}

/** Absolute URL, so no base-URL ambiguity can strand a relative path. */
export function absolute(assetPath) {
    try {
        return new URL(assetPath, document.baseURI || location.href).href;
    } catch {
        return assetPath;
    }
}

// ---------------------------------------------------------------
// Image transports
// ---------------------------------------------------------------

/** 1. The classic <img> element path. */
function viaImageElement(scene, key, url) {
    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            try {
                scene.textures.addImage(key, img);
                resolve(true);
            } catch (err) {
                console.warn(`[loader] "${key}" decoded but unusable:`, err);
                resolve(false);
            }
        };
        img.onerror = () => resolve(false);

        // Assigned exactly once. Setting src to '' first -- a common
        // cache-busting habit -- resolves to the current page URL and starts
        // loading the document as an image; that decode error is then reported
        // against the real asset and good files get marked as failed.
        img.src = url;
    });
}

/** 2. Pull the bytes through fetch, then hand them to an <img> as a blob. */
async function viaFetchBlob(scene, key, url) {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return false;

    const blob = await res.blob();
    if (!blob || blob.size === 0) return false;

    const objectUrl = URL.createObjectURL(blob);
    try {
        return await viaImageElement(scene, key, objectUrl);
    } finally {
        // Revoked only after the texture has taken its own reference.
        URL.revokeObjectURL(objectUrl);
    }
}

/** 3. Decode off the <img> path entirely, via the bitmap decoder. */
async function viaImageBitmap(scene, key, url) {
    if (typeof createImageBitmap !== 'function') return false;

    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return false;

    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);

    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext('2d').drawImage(bitmap, 0, 0);
    bitmap.close?.();

    scene.textures.addCanvas(key, canvas);
    return true;
}

// ---------------------------------------------------------------
// Audio transports
// ---------------------------------------------------------------

/** 1. fetch() into the audio cache as an undecoded ArrayBuffer. */
async function viaFetchAudio(scene, key, url) {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return false;

    const buffer = await res.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) return false;

    // Stored undecoded, exactly as Phaser's own loader does. The Web Audio
    // context starts suspended until a user gesture, so decoding here would
    // be rejected on a cold start; scene.sound.add() decodes lazily instead.
    scene.cache.audio.add(key, buffer);
    return true;
}

/** 2. XMLHttpRequest -- a different network stack inside the WebView. */
function viaXhrAudio(scene, key, url) {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = () => {
            if (xhr.status < 200 || xhr.status >= 300 || !xhr.response?.byteLength) {
                return resolve(false);
            }
            try {
                scene.cache.audio.add(key, xhr.response);
                resolve(true);
            } catch {
                resolve(false);
            }
        };
        xhr.onerror = () => resolve(false);
        xhr.onabort = () => resolve(false);
        // A cached response is fine; anything else is a real transport fault.
        xhr.ontimeout = () => resolve(false);
        xhr.send();
    });
}

// ---------------------------------------------------------------

const IMAGE_PLAN = [
    ['img', viaImageElement],
    ['fetch+blob', viaFetchBlob],
    ['bitmap', viaImageBitmap],
];

const AUDIO_PLAN = [
    ['fetch', viaFetchAudio],
    ['xhr', viaXhrAudio],
];

export class ResilientLoader {
    /**
     * @param {Phaser.Scene} scene
     * @param {object}  [options]
     * @param {number}  [options.concurrency]  parallel requests (default 6)
     * @param {number}  [options.deadline]     total ms budget (default 9000)
     * @param {number}  [options.retries]      retries per transport (default 1)
     */
    constructor(scene, options = {}) {
        this.scene = scene;
        this.concurrency = options.concurrency ?? 6;
        this.deadline = options.deadline ?? 9000;
        this.retries = options.retries ?? 1;

        this.loaded = 0;
        this.done = 0;
        this.failed = [];

        // Which transport actually delivered, per category. This is the whole
        // point: it turns "assets are not responding" into a fact.
        this.used = { image: new Set(), audio: new Set() };
    }

    /** True when the manifest entry is audio rather than an image. */
    isAudio(asset) {
        return /\.(ogg|mp3|wav|m4a)$/i.test(asset.file);
    }

    /** One file: every transport, each retried, all bounded. Never rejects. */
    async loadOne(asset) {
        const audio = this.isAudio(asset);
        const plan = audio ? AUDIO_PLAN : IMAGE_PLAN;

        // Embedded data URLs come first. They need no network at all, so on a
        // device where the WebView refuses <img> and fetch() requests into
        // assets/ this is the copy that still arrives -- which is the whole
        // reason the file exists.
        if (!audio && EMBEDDED_IMAGES[asset.key]) {
            this.used.image.add('embedded');
            try {
                const ok = await withTimeout(
                    viaImageElement(this.scene, asset.key, EMBEDDED_IMAGES[asset.key]),
                    IMAGE_TIMEOUT
                );
                if (ok) return { ok: true, transport: 'embedded' };
            } catch {
                // Fall through to the network transports below.
            }
        }

        const url = absolute(asset.file);
        const timeout = audio ? AUDIO_TIMEOUT : IMAGE_TIMEOUT;
        const kind = audio ? 'audio' : 'image';

        // Skip work already done: an earlier run may have filled the cache.
        // Counting is left to loadAll, so nothing is tallied twice.
        const cache = audio ? this.scene.cache.audio : this.scene.textures;
        if (cache.exists(asset.key)) {
            return { ok: true, transport: 'cached' };
        }

        for (const [name, attempt] of plan) {
            for (let tryNo = 0; tryNo <= this.retries; tryNo++) {
                try {
                    const ok = await withTimeout(
                        Promise.resolve(attempt(this.scene, asset.key, url)),
                        timeout
                    );
                    if (ok) {
                        this.used[kind].add(name);
                        return { ok: true, transport: name };
                    }
                } catch (err) {
                    // A timeout is the interesting case and is worth keeping.
                    if (/timeout/.test(err?.message || '')) {
                        console.warn(
                            `[loader] ${kind}/${name} stalled on ` +
                            `${asset.file} after ${timeout}ms`
                        );
                    }
                }
            }
        }

        this.failed.push(asset.file);
        return { ok: false, transport: null };
    }

    /**
     * Load a list of manifest entries with bounded concurrency.
     *
     * @param {Array<{key:string,file:string}>} assets
     * @param {(state:{done:number,total:number,loaded:number,current:string})=>void} [onProgress]
     * @param {object}  [options]
     * @param {boolean} [options.background]  fire-and-forget (not awaited)
     * @returns {Promise<{loaded:number, failed:string[]}>}
     */
    async loadAll(assets, onProgress, options = {}) {
        const total = assets.length;
        this.done = 0;
        this.loaded = 0;
        this.failed = [];

        if (!total) return { loaded: 0, failed: [] };

        const started = Date.now();
        const queue = assets.slice();
        let stopped = false;

        const report = (current = '') =>
            onProgress?.({ done: this.done, total, loaded: this.loaded, current });

        report('');

        const worker = async () => {
            while (queue.length && !stopped) {
                if (Date.now() - started > this.deadline) {
                    stopped = true;
                    console.warn(
                        `[loader] ${this.deadline}ms deadline hit -- continuing ` +
                        `with ${this.loaded}/${total} loaded`
                    );
                    return;
                }

                const asset = queue.shift();
                const res = await this.loadOne(asset);
                this.done++;
                if (res.ok) this.loaded++;

                report(asset.file);
            }
        };

        // A small pool. 31 simultaneous requests against the WebView asset
        // loader is what made the original queue stall.
        const workers = Array.from(
            { length: Math.min(this.concurrency, total) },
            worker
        );

        if (options.background) {
            // Deliberately not awaited -- the caller continues immediately.
            Promise.all(workers);
        } else {
            await Promise.all(workers);
        }

        return { loaded: this.loaded, failed: this.failed };
    }

    /** Human-readable summary of which transports worked. */
    describeTransports() {
        const image = [...this.used.image].join(', ') || 'none';
        const audio = [...this.used.audio].join(', ') || 'none';
        return `img: ${image} · audio: ${audio}`;
    }
}
