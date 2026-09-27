// ============================================
// REALMS OF AETHERIA - RESILIENT ASSET LOADER
// ============================================
//
// WHY THIS EXISTS
// ---------------
// Phaser's built-in LoaderPlugin has one fatal property: it is all-or-nothing.
// `preload()` does not resume until *every* queued file has finished. If a
// single request never settles -- because the Android WebView declined to
// hand the request to the asset loader, or a connection stalled, or a decode
// threw -- the scene's `create()` is never called, the game never advances,
// and the player is left staring at a frozen progress bar.
//
// That is exactly the "0 / 31 assets" symptom: the request was made, the
// spinner turned, and not one file ever reported back.
//
// This loader replaces the blocking queue with a bounded, self-healing one:
//
//   * finite concurrency, so 31 files do not all hit the WebView at once
//   * a hard per-file timeout, so a stalled socket cannot wedge the queue
//   * one automatic retry, which absorbs the common transient failures
//   * an overall deadline, after which loading stops and the game continues
//   * failures are recorded, never thrown -- the menu draws without a texture
//     rather than never drawing at all
//
// The results are written into the normal Phaser caches
// (`scene.textures` / `scene.cache.audio`), so every other system keeps
// reading them by key exactly as before and is unaware this code exists.
// ============================================

const IMAGE_TIMEOUT = 7000;
const AUDIO_TIMEOUT = 15000;

/** Resolve after `ms`, used to bound a single file's wait. */
function withTimeout(promise, ms) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export class ResilientLoader {
    /**
     * @param {Phaser.Scene} scene
     * @param {object}  [options]
     * @param {number}  [options.concurrency]  parallel requests (default 6)
     * @param {number}  [options.deadline]     total ms budget for a run
     * @param {number}  [options.retries]      retries per file (default 1)
     */
    constructor(scene, options = {}) {
        this.scene = scene;
        this.concurrency = options.concurrency ?? 6;
        this.deadline = options.deadline ?? 20000;
        this.retries = options.retries ?? 1;

        this.loaded = 0;
        this.failed = [];
        this.done = 0;
    }

    // ---------------------------------------------------------------
    // Single files
    // ---------------------------------------------------------------

    /**
     * Load one image into the texture cache.
     * @returns {Promise<boolean>} true if the texture is usable
     */
    loadImage(key, url) {
        const scene = this.scene;

        if (scene.textures.exists(key)) return Promise.resolve(true);

        return new Promise((resolve) => {
            const img = new Image();

            img.onload = () => {
                try {
                    scene.textures.addImage(key, img);
                    resolve(true);
                } catch (err) {
                    console.warn(`[loader] texture "${key}" present but unusable:`, err);
                    resolve(false);
                }
            };

            img.onerror = () => {
                console.warn(`[loader] image failed: ${url}`);
                resolve(false);
            };

            // Assign the URL exactly once. Setting `src` to an empty string
            // first -- a common cache-busting habit -- makes the browser
            // resolve '' to the *current page URL* and start loading the
            // document as an image. That spurious attempt races the real one
            // and its decode error is reported against the real asset, which
            // marks good files as failed.
            img.src = url;
        });
    }

    /**
     * Fetch and decode one audio track into the audio cache.
     *
     * The ArrayBuffer is stored undecoded, exactly as Phaser's own loader
     * does, so `scene.sound.add(key)` decodes it lazily on first play.
     *
     * @returns {Promise<boolean>} true if the sound is playable
     */
    async loadAudio(key, url) {
        const scene = this.scene;

        if (scene.cache.audio.exists(key)) return true;

        // The Web Audio context starts suspended until a user gesture, so a
        // decode at boot would be rejected. Storing raw bytes defers that.
        try {
            const res = await fetch(url, { cache: 'force-cache' });
            if (!res.ok) {
                console.warn(`[loader] audio HTTP ${res.status}: ${url}`);
                return false;
            }
            const buffer = await res.arrayBuffer();
            if (!buffer || buffer.byteLength === 0) {
                console.warn(`[loader] audio empty: ${url}`);
                return false;
            }
            scene.cache.audio.add(key, buffer);
            return true;
        } catch (err) {
            console.warn(`[loader] audio failed: ${url}`, err);
            return false;
        }
    }

    /** One file, with timeout and retry. Never rejects. */
    async loadOne(asset) {
        const isAudio = /\.(ogg|mp3|wav|m4a)$/i.test(asset.file);
        const timeout = isAudio ? AUDIO_TIMEOUT : IMAGE_TIMEOUT;

        for (let attempt = 0; attempt <= this.retries; attempt++) {
            try {
                const ok = await withTimeout(
                    isAudio
                        ? this.loadAudio(asset.key, asset.file)
                        : this.loadImage(asset.key, asset.file),
                    timeout
                );
                if (ok) return true;
            } catch (err) {
                console.warn(
                    `[loader] ${asset.file} attempt ${attempt + 1}:`,
                    err?.message || err
                );
            }
        }
        return false;
    }

    // ---------------------------------------------------------------
    // Whole runs
    // ---------------------------------------------------------------

    /**
     * Load a list of manifest entries with bounded concurrency.
     *
     * @param {Array<{key:string,file:string}>} assets
     * @param {(state:{done:number,total:number,loaded:number,current:string})=>void} [onProgress]
     * @param {object}  [options]
     * @param {boolean} [options.background]  fire-and-forget (no awaiting)
     * @returns {Promise<{loaded:number, failed:string[]}>}
     */
    async loadAll(assets, onProgress, options = {}) {
        const total = assets.length;
        this.done = 0;
        this.loaded = 0;
        this.failed = [];

        if (!total) return { loaded: 0, failed: [] };

        const started = Date.now();
        let queue = assets.slice();
        let stopped = false;

        const report = (current = '') => {
            onProgress?.({
                done: this.done,
                total,
                loaded: this.loaded,
                current,
            });
        };

        report('');

        const worker = async () => {
            while (queue.length && !stopped) {
                if (Date.now() - started > this.deadline) {
                    stopped = true;
                    console.warn(
                        `[loader] deadline of ${this.deadline}ms hit -- ` +
                        `continuing with ${this.loaded}/${total} loaded`
                    );
                    return;
                }

                const asset = queue.shift();
                const ok = await this.loadOne(asset);
                this.done++;
                if (ok) this.loaded++;
                else this.failed.push(asset.file);

                report(asset.file);
            }
        };

        // A small pool, not one worker per file: 31 simultaneous requests
        // against the WebView asset loader is what made this stall.
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
}
