// ============================================
// REALMS OF AETHERIA - PRELOAD SCENE
// ============================================

import { getCriticalAssets, getDeferredAssets } from '../data/AssetManifest.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
        this.loadComplete = false;
        this.failedFiles = [];
        this.totalBytes = 0;
        this.progressValue = 0;
    }

    preload() {
        const critical = getCriticalAssets();

        // --------------------------------------------------
        // Progress -> HTML loading screen
        // --------------------------------------------------
        // The HTML screen sits on top of the canvas (z-index 1000), so it is
        // the only progress display the player ever actually sees. Everything
        // is mirrored there; the canvas is just a fallback.
        this.load.on('progress', (value) => {
            this.progressValue = value;
            this.setStatus(`Loading assets... ${Math.floor(value * 100)}%`);
        });

        this.load.on('fileprogress', (file) => {
            // Show the real filename so the screen is never blank-looking.
            this.setStatus(`Loading ${prettyName(file.key)}`);
        });

        this.load.on('loaderror', (file) => {
            this.failedFiles.push(file.key);
            console.warn('[preload] missing asset:', file.key, file.src || '');
        });

        this.load.on('complete', () => {
            this.loadComplete = true;
        });

        // --------------------------------------------------
        // Queue the critical assets
        // --------------------------------------------------
        for (const asset of critical) {
            if (asset.file.endsWith('.ogg')) {
                this.load.audio(asset.key, asset.file);
            } else {
                this.load.image(asset.key, asset.file);
            }
        }

        this.totalBytes = critical.length;

        // --------------------------------------------------
        // Canvas fallback UI (only used if the HTML screen is missing)
        // --------------------------------------------------
        if (!document.getElementById('loading')) {
            this.buildCanvasLoader();
        }

        // Tell the HTML screen how much work there is, up front.
        window.setLoadingMessage?.(2, 'Loading game assets...');
    }

    /**
     * Minimal in-canvas loader. Only drawn when there is no HTML loading
     * screen -- otherwise the HTML one covers the canvas completely and this
     * would be invisible work.
     */
    buildCanvasLoader() {
        const { width, height } = this.cameras.main;

        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

        this.add.text(width / 2, height / 2 - 60, 'Realms of Aetheria', {
            fontFamily: 'Georgia, serif',
            fontSize: '40px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        this.canvasBar = this.add.rectangle(width / 2 - 200, height / 2, 0, 18, 0xc9a84c)
            .setOrigin(0, 0.5);

        this.canvasPct = this.add.text(width / 2, height / 2 + 40, '0%', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        }).setOrigin(0.5);

        const barWidth = 400;
        this.load.on('progress', (value) => {
            this.canvasBar.width = barWidth * value;
            this.canvasPct.setText(`${Math.floor(value * 100)}%`);
        });
    }

    /** Push a status line to whichever loader is actually visible. */
    setStatus(text) {
        window.updateLoading?.(this.progressValue * 100, text, {
            loaded: this.load?.totalComplete ?? 0,
            total: this.totalBytes,
        });
    }

    create() {
        // Progress is real now, so the screen reaches 100% on its own.
        window.updateLoading?.(100, 'Ready!', {
            loaded: this.totalBytes,
            total: this.totalBytes,
        });

        if (this.failedFiles.length) {
            console.warn(
                `[preload] ${this.failedFiles.length} asset(s) failed to load:`,
                this.failedFiles
            );
        }

        // Hand off to the menu, then keep loading the rest in the background.
        this.scene.start('MainMenu');
        this.loadDeferredAssets();
    }

    /**
     * Loads gameplay sprites and the 22MB of audio without blocking the menu.
     *
     * The main menu is already on screen and interactive at this point, so the
     * player can start a new game or read the credits while this runs.
     */
    loadDeferredAssets() {
        const deferred = getDeferredAssets();
        if (!deferred.length) return;

        console.info(`[deferred] loading ${deferred.length} assets in the background`);

        this.load.on('loaderror', (file) => {
            console.warn('[deferred] missing asset:', file.key, file.src || '');
        });

        for (const asset of deferred) {
            if (asset.file.endsWith('.ogg')) {
                this.load.audio(asset.key, asset.file);
            } else {
                this.load.image(asset.key, asset.file);
            }
        }

        // Non-blocking: returns immediately, menu stays interactive.
        this.load.start();
    }
}

/** 'assets/music/theme-1.ogg' -> 'theme-1.ogg' */
function prettyName(key) {
    const parts = key.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : key;
}
