// ============================================
// REALMS OF AETHERIA - SETTINGS (FPS / GRAPHICS)
// ============================================

import { SaveSystem } from './SaveSystem.js';

export const FPS_OPTIONS = [
    { id: 30, label: '30 FPS' },
    { id: 45, label: '45 FPS' },
    { id: 60, label: '60 FPS' },
    { id: 0, label: 'Uncapped' },
];

export const GRAPHICS_OPTIONS = [
    { id: 'low', label: 'Low', desc: 'Less effects, lighter zoom' },
    { id: 'balanced', label: 'Balanced', desc: 'Default look' },
    { id: 'high', label: 'High', desc: 'Sharper + more VFX' },
];

export const DEFAULT_SETTINGS = {
    musicVol: 0.5,
    sfxVol: 0.7,
    muted: false,
    fpsCap: 60,
    graphics: 'balanced',
    showFps: false,
    particles: true,
    screenShake: true,
    joystickSize: 1.0,
};

let fpsEl = null;

export class SettingsSystem {
    /** Merge saved settings with defaults (handles old saves). */
    static get() {
        const save = new SaveSystem();
        const raw = save.loadSettings() || {};
        return { ...DEFAULT_SETTINGS, ...raw };
    }

    static save(partial) {
        const next = { ...SettingsSystem.get(), ...partial };
        new SaveSystem().saveSettings(next);
        SettingsSystem.apply(window.game, next);
        return next;
    }

    static cycleFps(current) {
        const ids = FPS_OPTIONS.map((o) => o.id);
        const i = ids.indexOf(current);
        return ids[(i + 1) % ids.length];
    }

    static cycleGraphics(current) {
        const ids = GRAPHICS_OPTIONS.map((o) => o.id);
        const i = ids.indexOf(current);
        return ids[(i + 1) % ids.length];
    }

    static labelFps(cap) {
        return FPS_OPTIONS.find((o) => o.id === cap)?.label || `${cap} FPS`;
    }

    static labelGraphics(id) {
        return GRAPHICS_OPTIONS.find((o) => o.id === id)?.label || id;
    }

    /** Runtime profile used by World / Battle / EffectsSystem. */
    static getGraphicsProfile(settings = SettingsSystem.get()) {
        const g = settings.graphics || 'balanced';
        const particles = settings.particles !== false && g !== 'low';
        return {
            quality: g,
            // Camera zoom breaks HUD hit-testing on Capacitor WebViews.
            // Keep zoom at 1 and use a subtle world feel via other settings.
            cameraZoom: 1,
            particles,
            screenShake: settings.screenShake !== false && g !== 'low',
            antialias: g !== 'low',
            sparkles: g === 'high',
            playerScale: g === 'high' ? 1.65 : g === 'low' ? 1.35 : 1.5,
        };
    }

    static apply(game = window.game, settings = SettingsSystem.get()) {
        window.__aetheriaSettings = settings;

        if (game?.loop) {
            game.loop.targetFps = settings.fpsCap === 0 ? 0 : settings.fpsCap;
        }

        SettingsSystem.updateFpsOverlay(settings.showFps);

        // Push camera zoom to an active world scene without restarting.
        const world = game?.scene?.getScene?.('World');
        if (world?.cameras?.main) {
            // Keep zoom at 1 so HUD hit-testing stays aligned.
            world.cameras.main.setZoom(1);
            if (world.playerSprite) {
                const profile = SettingsSystem.getGraphicsProfile(settings);
                world.playerSprite.setScale(profile.playerScale || 1.5);
            }
        }
    }

    static updateFpsOverlay(show) {
        if (!fpsEl && typeof document !== 'undefined') {
            fpsEl = document.createElement('div');
            fpsEl.id = 'aetheria-fps';
            fpsEl.style.cssText =
                'position:fixed;top:6px;right:6px;z-index:9999;' +
                'font:12px monospace;color:#c9a84c;background:rgba(10,10,26,0.85);' +
                'padding:4px 8px;border-radius:4px;pointer-events:none;display:none;';
            document.body.appendChild(fpsEl);
        }
        if (!fpsEl) return;

        if (!show) {
            fpsEl.style.display = 'none';
            if (SettingsSystem._fpsTimer) {
                clearInterval(SettingsSystem._fpsTimer);
                SettingsSystem._fpsTimer = null;
            }
            return;
        }

        fpsEl.style.display = 'block';
        if (SettingsSystem._fpsTimer) return;

        SettingsSystem._fpsTimer = setInterval(() => {
            const game = window.game;
            const fps = game?.loop?.actualFps;
            if (fpsEl && fps) {
                fpsEl.textContent = `FPS ${Math.round(fps)}`;
            }
        }, 500);
    }
}

// Publish for non-module callers if needed.
if (typeof window !== 'undefined') {
    window.__aetheriaSettings = SettingsSystem.get();
}
