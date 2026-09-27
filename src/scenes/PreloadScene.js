// ============================================
// REALMS OF AETHERIA - PRELOAD SCENE
// ============================================
//
// The critical assets are loaded through ResilientLoader rather than Phaser's
// built-in loader. Phaser's queue is all-or-nothing: one request that never
// settles blocks `create()` forever, which is what produced the frozen
// "0 / 31 assets" screen. The resilient loader bounds every wait, retries
// once, and always hands control on to the main menu.
//
// Nothing in here is allowed to throw. A missing texture degrades to the dark
// backdrop; a missing sound is silent. The game always starts.
// ============================================

import { getCriticalAssets, getDeferredAssets } from '../data/AssetManifest.js';
import { ResilientLoader } from '../systems/ResilientLoader.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
        this.failedFiles = [];
    }

    // No `preload()` on purpose.
    //
    // Assets are loaded in `create()` by ResilientLoader, because that is the
    // only way to bound the wait. Phaser's own loader is left with an empty
    // queue, so the preload phase finishes instantly and hands straight over.
    // (Phaser 3.80 has no `LoaderPlugin.skip()`; calling a method that does
    // not exist here would throw inside the scene boot and hang the game.)

    async create() {
        const critical = getCriticalAssets();
        const total = critical.length;

        window.setLoadingMessage?.(1, 'Loading game assets...');

        const loader = new ResilientLoader(this, {
            concurrency: 6,
            deadline: 18000,
            retries: 1,
        });

        const result = await loader.loadAll(
            critical,
            ({ done, loaded, current }) => {
                // Progress is measured against the critical set, so the bar
                // genuinely reaches 100% when the menu can be drawn.
                const percent = 2 + (done / total) * 96;
                window.updateLoading?.(percent, describe(current, done, total), {
                    loaded,
                    total,
                });
            }
        );

        this.failedFiles = result.failed;

        if (this.failedFiles.length) {
            // Surfaced on screen, not just the console: this is the line that
            // tells us *why* assets are missing if it happens on a device.
            window.reportDiag?.(
                `${result.loaded}/${total} loaded · ` +
                `${this.failedFiles.length} failed: ` +
                this.failedFiles.slice(0, 3).map(prettyName).join(', ')
            );
        } else {
            window.reportDiag?.(`${result.loaded}/${total} assets ready`);
        }

        window.updateLoading?.(100, 'Ready!', {
            loaded: result.loaded,
            total,
        });

        // Hand off, then keep the remaining sprites and 22MB of audio loading
        // behind the menu so it appears immediately and stays interactive.
        this.scene.start('MainMenu');
        this.loadDeferredAssets(loader);
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

        loader.loadAll(deferred, undefined, { background: true }).then(({ failed }) => {
            if (failed.length) {
                console.warn(`[deferred] ${failed.length} unavailable:`, failed);
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
