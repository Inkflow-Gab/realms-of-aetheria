// ============================================
// REALMS OF AETHERIA - MAIN MENU SCENE
// ============================================

import { UIComponents } from '../ui/UIComponents.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.image(width / 2, height / 2, 'bg_1').setDisplaySize(width, height);

        // Dark overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.6);
        overlay.fillRect(0, 0, width, height);

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

        let btnY = 280;

        // New Game
        UIComponents.createButton(this, width / 2, btnY, 'New Game', () => {
            this.scene.start('CharacterCreation');
        }, { width: 280, height: 55, fontSize: 22 });

        btnY += 70;

        // Continue
        if (hasSave) {
            const continueBtn = UIComponents.createButton(this, width / 2, btnY, `Continue (Lv.${saveInfo?.level || 1})`, () => {
                this.scene.start('World', { loadSave: true });
            }, { width: 280, height: 55, fontSize: 22, bgColor: 0x2a4a2a });

            btnY += 70;
        }

        // Settings
        UIComponents.createButton(this, width / 2, btnY, 'Settings', () => {
            this.scene.start('Settings');
        }, { width: 280, height: 55, fontSize: 22 });

        btnY += 70;

        // Credits
        UIComponents.createButton(this, width / 2, btnY, 'Credits', () => {
            this.showCredits();
        }, { width: 280, height: 55, fontSize: 22 });

        // Version
        this.add.text(width - 10, height - 10, 'v1.0.0', {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#666666',
        }).setOrigin(1, 1);

        // Play menu music
        if (this.sound.get('music_menu')) {
            this.sound.play('music_menu', { loop: true, volume: 0.4 });
        }
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
