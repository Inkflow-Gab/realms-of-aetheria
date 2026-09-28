// ============================================
// REALMS OF AETHERIA - PRELOAD SCENE
// ============================================
//
// Assets are loaded through ResilientLoader, not Phaser's loader, because
// Phaser's queue is all-or-nothing: one request that never settles blocks
// `create()` forever and the game is stuck on the loading screen with no error
// and no progress. The resilient loader bounds every wait and always hands
// control on.
//
// Two rules govern this scene:
//
//   1. The main menu renders with zero assets -- its buttons are drawn with
//      graphics, not textures -- so a total asset failure must still leave the
//      player with a playable menu. Hence the short deadline: we wait briefly
//      for the nice-looking path, then start the game regardless.
//   2. Whatever happens is reported on the loading screen, not only in logcat.
//      A screenshot should be enough to tell what the device is doing.
//
// Nothing here is allowed to throw. A missing texture degrades to the dark
// backdrop; a missing sound is silent. The game always starts.
// ============================================

import { getCriticalAssets, getDeferredAssets } from '../data/AssetManifest.js';
import { ResilientLoader, absolute } from '../systems/ResilientLoader.js';

/** How long we wait for critical assets before starting the game regardless. */
const CRITICAL_DEADLINE = 12000;

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    // No `preload()` on purpose.
    //
    // Assets are loaded in `create()` so every wait can be bounded. Phaser's
    // loader is left with an empty queue, so the preload phase finishes
    // instantly and hands straight over. (Phaser 3.80 has no
    // `LoaderPlugin.skip()`; calling a method that does not exist throws during
    // scene boot and hangs the game all over again.)

    async create() {
        const critical = getCriticalAssets();
        const total = critical.length;

        window.setLoadingMessage?.(1, 'Loading game assets...');

        // ---------------------------------------------------------------
        // Probe
        // ---------------------------------------------------------------
        // One small file, one short attempt, purely to learn whether this
        // device can fetch assets at all. Its result is shown immediately, so
        // a failing device says why within a second instead of stalling.
        const probe = await this.probe();
        if (probe) window.reportDiag?.(probe);

        // ---------------------------------------------------------------
        // Critical assets
        // ---------------------------------------------------------------
        const loader = new ResilientLoader(this, {
            concurrency: 6,
            deadline: CRITICAL_DEADLINE,
            retries: 1,
        });

        const result = await loader.loadAll(
            critical,
            ({ done, loaded, current }) => {
                // Measured against the critical set, so the bar genuinely
                // reaches 100% at the moment the menu can be drawn.
                const percent = 2 + (done / total) * 96;
                window.updateLoading?.(percent, describe(current, done, total), {
                    loaded,
                    total,
                });
            }
        );

        // The transport summary is the useful fact: it separates "the WebView
        // is refusing every mechanism" from "one transport is blocked".
        const summary =
            `probe: ${probe || 'skipped'} · ${loader.describeTransports()}`;

        window.reportDiag?.(
            result.failed.length
                ? `${result.loaded}/${total} loaded · ${summary}`
                : `${result.loaded}/${total} assets ready · ${summary}`
        );

        if (result.failed.length) {
            console.warn('[preload] unavailable assets:', result.failed);
        }

        window.updateLoading?.(100, 'Ready!', { loaded: result.loaded, total });

        // Start the game. The menu is fully playable without any texture, so
        // whatever did or did not load, the player is never stuck here.
        // Hide the HTML overlay here as well as in MainMenu -- if either path
        // is skipped the watchdog used to show a false "Failed to load".
        window.hideLoading?.();
        this.scene.start('MainMenu');
        this.loadDeferredAssets(loader);
    }

    /**
     * Try to fetch one tiny asset and report which transport worked.
     * @returns {Promise<string|null>} short human-readable result
     */
    async probe() {
        const scene = this;
        const url = absolute('assets/hud/life-box.png');
        if (!url) return null;

        const attempt = (name, fn, ms) => new Promise((resolve) => {
            const timer = setTimeout(() => resolve(`${name}=timeout`), ms);
            Promise.resolve()
                .then(fn)
                .then((ok) => {
                    clearTimeout(timer);
                    resolve(`${name}=${ok ? 'ok' : 'fail'}`);
                })
                .catch((err) => {
                    clearTimeout(timer);
                    resolve(`${name}=${err?.name === 'AbortError' ? 'timeout' : 'fail'}`);
                });
        });

        // Deliberately short: this is a diagnostic, not real work.
        const viaImg = attempt('img', () => new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        }), 2500);

        const viaFetch = attempt('fetch', async () => {
            const res = await fetch(url, { cache: 'force-cache' });
            if (!res.ok) return false;
            return (await res.blob()).size > 0;
        }, 2500);

        const results = await Promise.all([viaImg, viaFetch]);

        if (scene.textures.exists('probe_img')) scene.textures.remove('probe_img');

        // All timeouts means the asset pipeline is blocked, not merely slow.
        if (results.every((r) => r.includes('timeout'))) {
            window.showLoadingError?.(
                'This device is not returning any game assets. Reinstalling ' +
                'usually fixes it; if not, the APK data is damaged.'
            );
            return 'ASSETS BLOCKED (' + results.join(' ') + ')';
        }
        if (results.every((r) => r.includes('fail'))) {
            return 'ASSETS MISSING (files not found in bundle)';
        }
        return results.join(' ');
    }

    /**
     * Loads gameplay sprites and audio without blocking the menu.
     *
     * Textures and audio are written to the game-wide caches, so they stay
     * valid even though this scene has been shut down by the time they land.
     */
    loadDeferredAssets(loader) {
        const deferred = getDeferredAssets();
        if (!deferred.length) return;

        console.info(`[deferred] loading ${deferred.length} assets in background`);

        loader.concurrency = 4;
        loader.deadline = 120000;
        loader.retries = 0;

        loader.loadAll(deferred, undefined, { background: true }).then(({ loaded, failed }) => {
            if (failed.length) {
                console.warn(`[deferred] ${loaded} ok, ${failed.length} unavailable:`, failed);
            } else {
                console.info(`[deferred] all ${loaded} assets ready`);
            }
        });
    }
}

/** 'assets/music/theme-1.ogg' -> 'theme-1.ogg' */
function prettyName(file) {
    const name = String(file).split('/').pop() || String(file);
    return name.replace(/\.[a-z0-9]+$/i, '');
}

/** A status line that always names a real file, so the screen is never blank. */
function describe(file, done, total) {
    if (file) {
        return `Loading ${prettyName(file)} (${done + 1}/${total})`;
    }
    return `Loading assets... ${done}/${total}`;
}
