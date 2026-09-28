// ============================================
// REALMS OF AETHERIA - SETTINGS SCENE
// ============================================

import { UIComponents } from '../ui/UIComponents.js';
import { layout, addBetaBadge } from '../ui/Layout.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { SettingsSystem } from '../systems/SettingsSystem.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Settings' });
    }

    create() {
        const L = layout(this);
        let settings = SettingsSystem.get();
        const saveSystem = new SaveSystem();

        if (this.textures.exists('bg_1')) {
            this.add.image(L.cx, L.cy, 'bg_1').setDisplaySize(L.w, L.h);
        }
        this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 0.92);
        addBetaBadge(this, 'top-left');

        this.add.text(L.cx, L.pad, 'Settings', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(26)}px`,
            color: '#c9a84c',
        }).setOrigin(0.5, 0);

        const save = () => { settings = SettingsSystem.save(settings); };

        // Two-column compact layout so every control stays on screen.
        const leftX = L.x(0.08);
        const rightX = L.x(0.52);
        const colW = L.w * 0.4;
        let yL = L.y(0.16);
        let yR = L.y(0.16);
        const row = Math.max(34, Math.min(42, (L.h - L.pad * 4 - 120) / 8));

        this.add.text(leftX, yL, 'AUDIO', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(13)}px`, color: '#888',
        });
        yL += row * 0.7;

        yL = this.compactCycle(leftX, yL, colW, row, L, 'Music',
            () => `${Math.round(settings.musicVol * 100)}%`,
            () => {
                settings.musicVol = Math.max(0, +(settings.musicVol - 0.1).toFixed(1));
                save();
            },
            () => {
                settings.musicVol = Math.min(1, +(settings.musicVol + 0.1).toFixed(1));
                save();
            });

        yL = this.compactCycle(leftX, yL, colW, row, L, 'SFX',
            () => `${Math.round(settings.sfxVol * 100)}%`,
            () => {
                settings.sfxVol = Math.max(0, +(settings.sfxVol - 0.1).toFixed(1));
                save();
            },
            () => {
                settings.sfxVol = Math.min(1, +(settings.sfxVol + 0.1).toFixed(1));
                save();
            });

        yL = this.compactToggle(leftX, yL, colW, row, L, 'Mute',
            () => settings.muted,
            () => { settings.muted = !settings.muted; save(); return settings.muted; });

        this.add.text(rightX, yR, 'GRAPHICS', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(13)}px`, color: '#888',
        });
        yR += row * 0.7;

        yR = this.compactToggle(rightX, yR, colW, row, L, 'FPS Cap',
            () => SettingsSystem.labelFps(settings.fpsCap),
            () => {
                settings.fpsCap = SettingsSystem.cycleFps(settings.fpsCap);
                save();
                return SettingsSystem.labelFps(settings.fpsCap);
            }, true);

        yR = this.compactToggle(rightX, yR, colW, row, L, 'Quality',
            () => SettingsSystem.labelGraphics(settings.graphics),
            () => {
                settings.graphics = SettingsSystem.cycleGraphics(settings.graphics);
                save();
                return SettingsSystem.labelGraphics(settings.graphics);
            }, true);

        yR = this.compactToggle(rightX, yR, colW, row, L, 'Show FPS',
            () => settings.showFps,
            () => { settings.showFps = !settings.showFps; save(); return settings.showFps; });

        yR = this.compactToggle(rightX, yR, colW, row, L, 'Particles',
            () => settings.particles,
            () => { settings.particles = !settings.particles; save(); return settings.particles; });

        yR = this.compactToggle(rightX, yR, colW, row, L, 'Screen Shake',
            () => settings.screenShake,
            () => { settings.screenShake = !settings.screenShake; save(); return settings.screenShake; });

        const footerY = L.bottom(L.pad + 70);
        UIComponents.createButton(this, L.x(0.32), footerY, 'Cosmetics', () => {
            this.scene.start('Cosmetics');
        }, {
            width: Math.min(200, L.w * 0.36),
            height: Math.max(42, L.font(44)),
            fontSize: L.font(15),
            variant: 'primary',
            depth: 300,
        });

        UIComponents.createButton(this, L.x(0.68), footerY, 'Back', () => {
            this.scene.start('MainMenu');
        }, {
            width: Math.min(180, L.w * 0.32),
            height: Math.max(42, L.font(44)),
            fontSize: L.font(15),
            variant: 'ghost',
            depth: 300,
        });

        if (saveSystem.hasSave) {
            UIComponents.createButton(this, L.cx, L.bottom(L.pad + 22), 'Delete Save', () => {
                if (confirm('Delete save data? This cannot be undone.')) {
                    saveSystem.deleteSave();
                    this.scene.start('MainMenu');
                }
            }, {
                width: Math.min(180, L.w * 0.35),
                height: Math.max(34, L.font(36)),
                fontSize: L.font(12),
                variant: 'danger',
                depth: 300,
            });
        }
    }

    compactCycle(x, y, colW, row, L, label, getLabel, onMinus, onPlus) {
        this.add.text(x, y, label, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(14)}px`, color: '#f0e6d3',
        });
        const val = this.add.text(x + colW * 0.42, y, getLabel(), {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(14)}px`, color: '#c9a84c',
        });
        const sz = Math.max(30, L.font(32));
        UIComponents.createButton(this, x + colW * 0.72, y + 6, '−', () => {
            onMinus(); val.setText(getLabel());
        }, { width: sz, height: sz, fontSize: L.font(14), depth: 300 });
        UIComponents.createButton(this, x + colW * 0.88, y + 6, '+', () => {
            onPlus(); val.setText(getLabel());
        }, { width: sz, height: sz, fontSize: L.font(14), depth: 300 });
        return y + row;
    }

    compactToggle(x, y, colW, row, L, label, getVal, toggle, isText = false) {
        this.add.text(x, y, label, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(14)}px`, color: '#f0e6d3',
        });
        const initial = getVal();
        const val = this.add.text(x + colW * 0.42, y,
            isText ? String(initial) : (initial ? 'ON' : 'OFF'), {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(14)}px`,
                color: isText ? '#c9a84c' : (initial ? '#2ecc71' : '#e74c3c'),
            });
        UIComponents.createButton(this, x + colW * 0.8, y + 6, 'Set', () => {
            const next = toggle();
            if (isText) {
                val.setText(String(next));
                val.setColor('#c9a84c');
            } else {
                val.setText(next ? 'ON' : 'OFF');
                val.setColor(next ? '#2ecc71' : '#e74c3c');
            }
        }, {
            width: Math.max(56, L.font(60)),
            height: Math.max(30, L.font(32)),
            fontSize: L.font(12),
            variant: 'ghost',
            depth: 300,
        });
        return y + row;
    }
}
