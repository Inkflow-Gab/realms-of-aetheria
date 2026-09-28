// ============================================
// REALMS OF AETHERIA - MAIN MENU SCENE
// ============================================
//
// Visual language matches the HTML boot loader: night backdrop, cream title,
// gold accents, floating motes, soft vignette. Flat navy rectangles felt like
// a different game after the cinematic loading screen.
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
        this.cameras.main.setBackgroundColor('#0a0a1a');

        // Full-bleed backdrop with a slow breathing pan — same art as boot.
        let bg = null;
        if (this.textures.exists('bg_1')) {
            bg = this.add.image(L.cx, L.cy, 'bg_1')
                .setDisplaySize(L.w * 1.1, L.h * 1.1)
                .setAlpha(0);
            this.tweens.add({
                targets: bg,
                alpha: 0.92,
                duration: 1000,
                ease: 'Sine.easeOut',
            });
            this.tweens.add({
                targets: bg,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 12000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        } else {
            this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 1);
        }

        // Vignette grade (matches #loading-grade)
        const grade = this.add.graphics().setDepth(1);
        grade.fillStyle(0x0a0a1a, 0.42);
        grade.fillRect(0, 0, L.w, L.h);
        grade.fillStyle(0x0a0a1a, 0.55);
        grade.fillRect(0, 0, L.w, L.h * 0.16);
        grade.fillRect(0, L.h * 0.78, L.w, L.h * 0.22);

        addBetaBadge(this, 'top-left');

        // Title — cream like the loader, gold underline subtitle
        const titleSize = L.font(L.h < 420 ? 32 : 48);
        const title = this.add.text(L.cx, L.y(0.16), 'REALMS OF AETHERIA', {
            fontFamily: 'Georgia, serif',
            fontSize: `${titleSize}px`,
            color: '#f0e6d3',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center',
        }).setOrigin(0.5).setDepth(10);

        this.tweens.add({
            targets: title,
            alpha: { from: 0.88, to: 1 },
            duration: 2400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Soft gold glow under the title
        const glow = this.add.ellipse(L.cx, title.y + titleSize * 0.35, L.w * 0.55, titleSize * 0.9, 0xc9a84c, 0.12)
            .setDepth(9);
        this.tweens.add({
            targets: glow,
            alpha: { from: 0.08, to: 0.2 },
            scaleX: { from: 0.95, to: 1.08 },
            duration: 2800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.add.text(L.cx, title.y + titleSize * 0.85, 'A MOBILE RPG ADVENTURE', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#c9a84c',
            letterSpacing: 4,
        }).setOrigin(0.5).setDepth(10);

        // Decorative hairline
        const rule = this.add.graphics().setDepth(10);
        rule.lineStyle(1, 0xc9a84c, 0.45);
        const ruleW = Math.min(280, L.w * 0.45);
        rule.lineBetween(L.cx - ruleW / 2, title.y + titleSize * 1.25, L.cx + ruleW / 2, title.y + titleSize * 1.25);

        const saveSystem = new SaveSystem();
        const hasSave = saveSystem.hasSave;
        const saveInfo = SaveSystem.getSaveInfo();

        const btnW = Math.min(340, L.w * 0.58);
        const btnH = Math.max(48, L.font(50));
        const gap = Math.max(14, L.font(16));
        const entries = [
            { label: 'New Game', variant: 'primary', fn: () => this.scene.start('CharacterCreation') },
        ];
        if (hasSave) {
            entries.push({
                label: `Continue  ·  Lv.${saveInfo?.level || 1}`,
                variant: 'default',
                bgColor: 0x1a2e1a,
                fn: () => this.scene.start('WorldLoad', { loadSave: true }),
            });
        }
        entries.push(
            { label: 'Settings', variant: 'ghost', fn: () => this.scene.start('Settings') },
            { label: 'Credits', variant: 'ghost', fn: () => this.showCredits() },
        );

        const stackH = entries.length * btnH + (entries.length - 1) * gap;
        let btnY = Phaser.Math.Clamp(
            L.cy + L.font(28),
            L.y(0.42),
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
            btn.setDepth(20);
            btnY += btnH + gap;
            return btn;
        });

        this.add.text(L.w - L.pad, L.h - L.pad, `v${GAME_CONFIG.VERSION}`, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(12)}px`,
            color: '#8a7a5a',
        }).setOrigin(1, 1).setDepth(10);

        this.spawnMenuMotes();
        this.tryPlayMenuMusic();
        this.time.addEvent({
            delay: 800,
            repeat: 20,
            callback: () => this.tryPlayMenuMusic(),
        });
        this.time.delayedCall(900, () => this.spawnMenuSparkles());
        this.fadeInMenuButtons(buttons);
    }

    spawnMenuMotes() {
        const L = layout(this);
        for (let i = 0; i < 16; i++) {
            const m = this.add.circle(
                Phaser.Math.Between(8, L.w - 8),
                Phaser.Math.Between(L.h * 0.35, L.h + 30),
                Phaser.Math.FloatBetween(1.1, 2.6),
                0xc9a84c,
                Phaser.Math.FloatBetween(0.25, 0.55)
            ).setDepth(3);
            this.tweens.add({
                targets: m,
                y: m.y - Phaser.Math.Between(160, 320),
                alpha: 0,
                duration: Phaser.Math.Between(4500, 8500),
                delay: Phaser.Math.Between(0, 2800),
                repeat: -1,
                onRepeat: () => {
                    m.x = Phaser.Math.Between(8, L.w - 8);
                    m.y = L.h + 16;
                    m.alpha = Phaser.Math.FloatBetween(0.25, 0.55);
                },
            });
        }
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
                delay: 2400,
                loop: true,
                callback: () => {
                    if (!this.scene.isActive()) return;
                    EffectsSystem.play(
                        this,
                        Phaser.Math.Between(40, L.w - 40),
                        Phaser.Math.Between(50, L.h * 0.4),
                        'sparkle',
                        { scale: 1.0, depth: 8 }
                    );
                },
            });
        });
    }

    fadeInMenuButtons(buttons) {
        buttons.forEach((button, i) => {
            button.setAlpha(0.3);
            this.tweens.add({
                targets: button,
                alpha: 1,
                duration: 320,
                delay: 100 * i,
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
