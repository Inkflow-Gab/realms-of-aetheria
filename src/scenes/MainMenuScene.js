// ============================================
// REALMS OF AETHERIA - MAIN MENU SCENE
// ============================================

import { UIComponents } from '../ui/UIComponents.js';
import { layout, addBetaBadge } from '../ui/Layout.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        const L = layout(this);
        window.hideLoading?.();

        if (this.textures.exists('bg_1')) {
            this.add.image(L.cx, L.cy, 'bg_1').setDisplaySize(L.w, L.h).setAlpha(0);
        }
        this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 1);

        const shade = this.add.graphics();
        shade.fillStyle(0x0a0a1a, 0.55);
        shade.fillRect(0, 0, L.w, L.h);

        if (this.textures.exists('bg_1')) {
            this.tweens.add({
                targets: this.children.list[0],
                alpha: 1,
                duration: 900,
                ease: 'Sine.easeOut',
            });
        }

        addBetaBadge(this, 'top-left');

        const titleSize = L.font(L.h < 420 ? 34 : 52);
        const title = this.add.text(L.cx, L.y(0.14), 'REALMS OF AETHERIA', {
            fontFamily: 'Georgia, serif',
            fontSize: `${titleSize}px`,
            color: '#c9a84c',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: title.y + 5,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.add.text(L.cx, title.y + titleSize * 0.75, 'A Mobile RPG Adventure', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(18)}px`,
            color: '#f0e6d3',
        }).setOrigin(0.5);

        const saveSystem = new SaveSystem();
        const hasSave = saveSystem.hasSave;
        const saveInfo = SaveSystem.getSaveInfo();

        const btnW = Math.min(320, L.w * 0.55);
        const btnH = Math.max(44, L.font(48));
        const gap = Math.max(12, L.font(18));
        const entries = [
            { label: 'New Game', variant: 'primary', fn: () => this.scene.start('CharacterCreation') },
        ];
        if (hasSave) {
            entries.push({
                label: `Continue (Lv.${saveInfo?.level || 1})`,
                variant: 'default',
                bgColor: 0x2a4a2a,
                fn: () => this.scene.start('World', { loadSave: true }),
            });
        }
        entries.push(
            { label: 'Settings', variant: 'ghost', fn: () => this.scene.start('Settings') },
            { label: 'Credits', variant: 'ghost', fn: () => this.showCredits() },
        );

        // Center the stack vertically in the lower 2/3 so nothing clips.
        const stackH = entries.length * btnH + (entries.length - 1) * gap;
        let btnY = Phaser.Math.Clamp(
            L.cy + L.font(20),
            L.y(0.38),
            L.h - stackH / 2 - L.pad * 2
        );

        const buttons = entries.map((entry) => {
            const btn = UIComponents.createButton(this, L.cx, btnY, entry.label, entry.fn, {
                width: btnW,
                height: btnH,
                fontSize: L.font(20),
                variant: entry.variant,
                bgColor: entry.bgColor,
            });
            btnY += btnH + gap;
            return btn;
        });

        this.add.text(L.w - L.pad, L.h - L.pad, `v${GAME_CONFIG.VERSION}`, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(12)}px`,
            color: '#888888',
        }).setOrigin(1, 1);

        this.tryPlayMenuMusic();
        this.time.addEvent({
            delay: 800,
            repeat: 20,
            callback: () => this.tryPlayMenuMusic(),
        });
        this.time.delayedCall(1200, () => this.spawnMenuSparkles());
        this.fadeInMenuButtons(buttons);
    }

    tryPlayMenuMusic() {
        if (this._menuMusicPlaying) return;
        if (!this.cache.audio.exists('music_1')) return;
        try {
            this.sound.play('music_1', { loop: true, volume: 0.4 });
            this._menuMusicPlaying = true;
        } catch {
            /* Web Audio may still be locked until a tap */
        }
    }

    spawnMenuSparkles() {
        if (!this.textures.exists('fx_sparkle')) return;
        import('../systems/EffectsSystem.js').then(({ EffectsSystem }) => {
            EffectsSystem.ensureAnims(this);
            const L = layout(this);
            this.time.addEvent({
                delay: 2200,
                loop: true,
                callback: () => {
                    if (!this.scene.isActive()) return;
                    EffectsSystem.play(
                        this,
                        Phaser.Math.Between(40, L.w - 40),
                        Phaser.Math.Between(60, L.h - 80),
                        'sparkle',
                        { scale: 1.1, depth: 5 }
                    );
                },
            });
        });
    }

    fadeInMenuButtons(buttons) {
        buttons.forEach((button, i) => {
            const targetY = button.y;
            button.setAlpha(0);
            button.y = targetY + 18;
            this.tweens.add({
                targets: button,
                alpha: 1,
                y: targetY,
                duration: 420,
                delay: 120 * i,
                ease: 'Cubic.easeOut',
            });
        });
    }

    showCredits() {
        const L = layout(this);
        const layer = [];

        const blocker = this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 0.94)
            .setInteractive()
            .setDepth(500);
        layer.push(blocker);

        const panel = UIComponents.createPanel(
            this, L.x(0.12), L.y(0.12), L.w * 0.76, L.h * 0.76, 0.95
        );
        if (panel?.setDepth) panel.setDepth(501);
        layer.push(panel);

        const body = [
            'REALMS OF AETHERIA',
            '',
            'Developed by Gab',
            'Engine: Phaser 3 + Capacitor',
            '',
            'Assets',
            'Medieval Fantasy · RPG Battle System',
            'Cute Fantasy Free · Pixel Effects',
            'Tiny RPG Characters · Minifolks',
            'UI Bundle Free · Ninja Adventure HUD',
            '',
            'Thank you for playing!',
        ].join('\n');

        const credits = this.add.text(L.cx, L.cy - L.font(10), body, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(16)}px`,
            color: '#f0e6d3',
            align: 'center',
            lineSpacing: 6,
            wordWrap: { width: L.w * 0.68 },
        }).setOrigin(0.5).setDepth(510);
        layer.push(credits);

        const close = () => layer.forEach((n) => n?.destroy?.());

        blocker.on('pointerdown', close);

        const back = UIComponents.createButton(this, L.cx, L.bottom(L.pad + 28), 'Back', close, {
            width: Math.min(200, L.w * 0.4),
            height: Math.max(40, L.font(42)),
            fontSize: L.font(18),
            variant: 'primary',
        });
        back.setDepth(520);
        layer.push(back);
    }
}
