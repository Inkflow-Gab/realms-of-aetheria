// ============================================
// REALMS OF AETHERIA - SETTINGS SCENE
// ============================================

import { UIComponents } from '../ui/UIComponents.js';
import { layout, addBetaBadge } from '../ui/Layout.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { SettingsSystem, GRAPHICS_OPTIONS } from '../systems/SettingsSystem.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Settings' });
    }

    create() {
        const L = layout(this);
        const saveSystem = new SaveSystem();
        let settings = SettingsSystem.get();

        if (this.textures.exists('bg_1')) {
            this.add.image(L.cx, L.cy, 'bg_1').setDisplaySize(L.w, L.h);
        }
        this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 0.92);

        addBetaBadge(this, 'top-left');

        this.add.text(L.cx, L.pad, 'Settings', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(28)}px`,
            color: '#c9a84c',
        }).setOrigin(0.5, 0);

        UIComponents.createPanel(this, L.x(0.06), L.y(0.12), L.w * 0.88, L.h * 0.72, 0.92);

        const labelX = L.x(0.1);
        const valueX = L.x(0.52);
        let y = L.y(0.16);
        const row = Math.max(36, L.font(38));
        const btnSize = Math.max(32, L.font(34));

        const save = () => {
            settings = SettingsSystem.save(settings);
        };

        // --- Audio ---
        this.add.text(labelX, y, '— Audio —', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(14)}px`, color: '#888',
        });
        y += row - 8;

        y = this.volumeRow(y, 'Music', labelX, valueX, btnSize, L,
            () => settings.musicVol,
            (v) => { settings.musicVol = v; save(); },
            (v) => `${Math.floor(v * 100)}%`);

        y = this.volumeRow(y, 'SFX', labelX, valueX, btnSize, L,
            () => settings.sfxVol,
            (v) => { settings.sfxVol = v; save(); },
            (v) => `${Math.floor(v * 100)}%`);

        y = this.toggleRow(y, 'Mute All', labelX, valueX, L, () => settings.muted, () => {
            settings.muted = !settings.muted;
            save();
            return settings.muted;
        });

        y += 6;
        this.add.text(labelX, y, '— Performance —', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(14)}px`, color: '#888',
        });
        y += row - 8;

        y = this.cycleRow(y, 'FPS Cap', labelX, valueX, L, () => SettingsSystem.labelFps(settings.fpsCap), () => {
            settings.fpsCap = SettingsSystem.cycleFps(settings.fpsCap);
            save();
        });

        y = this.cycleRow(y, 'Graphics', labelX, valueX, L, () => SettingsSystem.labelGraphics(settings.graphics), () => {
            settings.graphics = SettingsSystem.cycleGraphics(settings.graphics);
            save();
        });

        const gfxHint = GRAPHICS_OPTIONS.find((g) => g.id === settings.graphics);
        this.add.text(labelX, y, gfxHint?.desc || '', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(11)}px`, color: '#666',
        });
        y += L.font(18);

        y = this.toggleRow(y, 'Show FPS', labelX, valueX, L, () => settings.showFps, () => {
            settings.showFps = !settings.showFps;
            save();
            return settings.showFps;
        });

        y = this.toggleRow(y, 'Battle Particles', labelX, valueX, L, () => settings.particles, () => {
            settings.particles = !settings.particles;
            save();
            return settings.particles;
        });

        y = this.toggleRow(y, 'Screen Shake', labelX, valueX, L, () => settings.screenShake, () => {
            settings.screenShake = !settings.screenShake;
            save();
            return settings.screenShake;
        });

        y += 10;

        UIComponents.createButton(this, L.cx, y, 'Cosmetics & Traits', () => {
            this.scene.start('Cosmetics');
        }, {
            width: Math.min(280, L.w * 0.5),
            height: Math.max(40, L.font(42)),
            fontSize: L.font(15),
            variant: 'primary',
        });

        if (saveSystem.hasSave) {
            y += row + 4;
            UIComponents.createButton(this, L.cx, y, 'Delete Save Data', () => {
                if (confirm('Are you sure? This cannot be undone!')) {
                    saveSystem.deleteSave();
                    this.scene.start('MainMenu');
                }
            }, {
                width: Math.min(260, L.w * 0.5),
                height: Math.max(38, L.font(40)),
                fontSize: L.font(14),
                variant: 'danger',
            });
        }

        UIComponents.createButton(this, L.cx, L.bottom(L.pad + 22), 'Back', () => {
            this.scene.start('MainMenu');
        }, {
            width: Math.min(200, L.w * 0.38),
            height: Math.max(42, L.font(44)),
            fontSize: L.font(16),
            variant: 'ghost',
        });
    }

    volumeRow(y, label, labelX, valueX, btnSize, L, getVal, setVal, fmt) {
        this.add.text(labelX, y, label, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(15)}px`, color: '#f0e6d3',
        });
        const valText = this.add.text(valueX, y, fmt(getVal()), {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(15)}px`, color: '#c9a84c',
        });
        UIComponents.createButton(this, L.x(0.68), y + 6, '−', () => {
            setVal(Math.max(0, +(getVal() - 0.1).toFixed(1)));
            valText.setText(fmt(getVal()));
        }, { width: btnSize, height: btnSize, fontSize: L.font(16) });
        UIComponents.createButton(this, L.x(0.78), y + 6, '+', () => {
            setVal(Math.min(1, +(getVal() + 0.1).toFixed(1)));
            valText.setText(fmt(getVal()));
        }, { width: btnSize, height: btnSize, fontSize: L.font(16) });
        return y + Math.max(36, L.font(38));
    }

    toggleRow(y, label, labelX, valueX, L, getVal, toggle) {
        this.add.text(labelX, y, label, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(15)}px`, color: '#f0e6d3',
        });
        const valText = this.add.text(valueX, y, getVal() ? 'ON' : 'OFF', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(15)}px`, color: getVal() ? '#2ecc71' : '#e74c3c',
        });
        UIComponents.createButton(this, L.x(0.72), y + 6, 'Toggle', () => {
            const on = toggle();
            valText.setText(on ? 'ON' : 'OFF');
            valText.setColor(on ? '#2ecc71' : '#e74c3c');
        }, { width: Math.max(80, L.font(90)), height: Math.max(32, L.font(34)), fontSize: L.font(12), variant: 'ghost' });
        return y + Math.max(36, L.font(38));
    }

    cycleRow(y, label, labelX, valueX, L, getLabel, onCycle) {
        this.add.text(labelX, y, label, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(15)}px`, color: '#f0e6d3',
        });
        const valText = this.add.text(valueX, y, getLabel(), {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(15)}px`, color: '#c9a84c',
        });
        UIComponents.createButton(this, L.x(0.72), y + 6, 'Change', () => {
            onCycle();
            valText.setText(getLabel());
        }, { width: Math.max(90, L.font(100)), height: Math.max(32, L.font(34)), fontSize: L.font(12), variant: 'ghost' });
        return y + Math.max(36, L.font(38));
    }
}
