// ============================================
// REALMS OF AETHERIA - MAIN MENU SCENE
// ============================================

import { UIComponents } from '../ui/UIComponents.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Dismiss the HTML loader the moment the menu can paint. Leaving it up
        // after 100% made the watchdog scream "Failed to load" on device even
        // though every critical asset had already arrived.
        window.hideLoading?.();

        // Background. Guarded so a missing texture shows the dark backdrop
        // instead of Phaser's green "missing image" box.
        if (this.textures.exists('bg_1')) {
            this.add.image(width / 2, height / 2, 'bg_1')
                .setDisplaySize(width, height)
                .setAlpha(0);
        }
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a, 1);

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.6);
        overlay.fillRect(0, 0, width, height);

        // Fade the backdrop in so the handoff from the loading screen is smooth.
        if (this.textures.exists('bg_1')) {
            this.tweens.add({
                targets: this.children.list[0],
                alpha: 1,
                duration: 900,
                ease: 'Sine.easeOut',
            });
        }

        // Title
        const title = this.add.text(width / 2, 100, 'REALMS OF AETHERIA', {
            fontFamily: 'Georgia, serif',
            fontSize: '52px',
            color: '#c9a84c',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.tweens.add({
            targets: title,
            y: 105,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Subtitle
        this.add.text(width / 2, 160, 'A Mobile RPG Adventure', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        }).setOrigin(0.5);

        // Menu buttons
        const saveSystem = new SaveSystem();
        const hasSave = saveSystem.hasSave;
        const saveInfo = SaveSystem.getSaveInfo();

        // Collected so they can be staggered in after the scene appears.
        const buttons = [];
        let btnY = 280;

        // New Game
        buttons.push(UIComponents.createButton(this, width / 2, btnY, 'New Game', () => {
            this.scene.start('CharacterCreation');
        }, { width: 280, height: 55, fontSize: 22 }));

        btnY += 70;

        // Continue
        if (hasSave) {
            buttons.push(UIComponents.createButton(this, width / 2, btnY, `Continue (Lv.${saveInfo?.level || 1})`, () => {
                this.scene.start('World', { loadSave: true });
            }, { width: 280, height: 55, fontSize: 22, bgColor: 0x2a4a2a }));

            btnY += 70;
        }

        // Settings
        buttons.push(UIComponents.createButton(this, width / 2, btnY, 'Settings', () => {
            this.scene.start('Settings');
        }, { width: 280, height: 55, fontSize: 22 }));

        btnY += 70;

        // Credits
        buttons.push(UIComponents.createButton(this, width / 2, btnY, 'Credits', () => {
            this.showCredits();
        }, { width: 280, height: 55, fontSize: 22 }));

        // Version
        this.add.text(width - 10, height - 10, `v${GAME_CONFIG.VERSION}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#666666',
        }).setOrigin(1, 1);

        // Menu music is deferred (large ogg). Play now if ready, otherwise
        // poll briefly so the track starts as soon as the background loader
        // finishes without blocking the menu itself.
        this.tryPlayMenuMusic();
        this.time.addEvent({
            delay: 800,
            repeat: 20,
            callback: () => this.tryPlayMenuMusic(),
        });

        // Ambient sparkles once the VFX sheets land.
        this.time.delayedCall(1200, () => this.spawnMenuSparkles());

        // Stagger the menu in so it assembles instead of snapping into place.
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
            const width = this.cameras.main.width;
            const height = this.cameras.main.height;
            this.time.addEvent({
                delay: 2200,
                loop: true,
                callback: () => {
                    if (!this.scene.isActive()) return;
                    EffectsSystem.play(
                        this,
                        Phaser.Math.Between(40, width - 40),
                        Phaser.Math.Between(60, height - 80),
                        'sparkle',
                        { scale: 1.1, depth: 5 }
                    );
                },
            });
        });
    }

    /** Fade + slide each button in, top to bottom. */
    fadeInMenuButtons(buttons) {
        buttons.forEach((button, i) => {
            const targetY = button.y;
            button.setAlpha(0);
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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.95);
        overlay.fillRect(0, 0, width, height);
        overlay.setInteractive();

        const creditsText = `
REALMS OF AETHERIA

Developed by: Gab
Engine: Phaser 3 + Capacitor

Assets:
- Medieval Fantasy Pack
- RPG Battle System
- Cute Fantasy Free
- Super Pixel Effects Gigapack
- Tiny RPG Character Pack
- Minifolks Villagers
- UI Bundle Free

Thank you for playing!

Tap to return to menu
        `;

        this.add.text(width / 2, height / 2, creditsText, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#f0e6d3',
            align: 'center',
            lineSpacing: 8,
        }).setOrigin(0.5);

        overlay.on('pointerdown', () => {
            overlay.destroy();
            this.scene.restart();
        });
    }
}
