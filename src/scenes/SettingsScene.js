// ============================================
// REALMS OF AETHERIA - SETTINGS SCENE
// ============================================

import { UIComponents } from '../ui/UIComponents.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Settings' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.image(width / 2, height / 2, 'bg_1').setDisplaySize(width, height);
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.9);
        overlay.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 60, 'Settings', {
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        const saveSystem = new SaveSystem();
        const settings = saveSystem.loadSettings() || { musicVol: 0.5, sfxVol: 0.7, muted: false };

        let y = 150;

        // Music Volume
        this.add.text(200, y, 'Music Volume:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        });
        this.musicVolText = this.add.text(600, y, `${Math.floor(settings.musicVol * 100)}%`, {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c9a84c',
        });
        UIComponents.createButton(this, 500, y, '-', () => {
            settings.musicVol = Math.max(0, settings.musicVol - 0.1);
            this.musicVolText.setText(`${Math.floor(settings.musicVol * 100)}%`);
            saveSystem.saveSettings(settings);
        }, { width: 40, height: 35, fontSize: 16 });
        UIComponents.createButton(this, 700, y, '+', () => {
            settings.musicVol = Math.min(1, settings.musicVol + 0.1);
            this.musicVolText.setText(`${Math.floor(settings.musicVol * 100)}%`);
            saveSystem.saveSettings(settings);
        }, { width: 40, height: 35, fontSize: 16 });

        y += 60;

        // SFX Volume
        this.add.text(200, y, 'SFX Volume:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        });
        this.sfxVolText = this.add.text(600, y, `${Math.floor(settings.sfxVol * 100)}%`, {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c9a84c',
        });
        UIComponents.createButton(this, 500, y, '-', () => {
            settings.sfxVol = Math.max(0, settings.sfxVol - 0.1);
            this.sfxVolText.setText(`${Math.floor(settings.sfxVol * 100)}%`);
            saveSystem.saveSettings(settings);
        }, { width: 40, height: 35, fontSize: 16 });
        UIComponents.createButton(this, 700, y, '+', () => {
            settings.sfxVol = Math.min(1, settings.sfxVol + 0.1);
            this.sfxVolText.setText(`${Math.floor(settings.sfxVol * 100)}%`);
            saveSystem.saveSettings(settings);
        }, { width: 40, height: 35, fontSize: 16 });

        y += 60;

        // Mute
        this.add.text(200, y, 'Mute All:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        });
        this.muteText = this.add.text(600, y, settings.muted ? 'ON' : 'OFF', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: settings.muted ? '#e74c3c' : '#2ecc71',
        });
        UIComponents.createButton(this, 550, y, 'Toggle', () => {
            settings.muted = !settings.muted;
            this.muteText.setText(settings.muted ? 'ON' : 'OFF');
            this.muteText.setColor(settings.muted ? '#e74c3c' : '#2ecc71');
            saveSystem.saveSettings(settings);
        }, { width: 100, height: 35, fontSize: 14 });

        y += 80;

        // Delete Save
        if (saveSystem.hasSave) {
            UIComponents.createButton(this, width / 2, y, 'Delete Save Data', () => {
                if (confirm('Are you sure? This cannot be undone!')) {
                    saveSystem.deleteSave();
                    this.scene.start('MainMenu');
                }
            }, { width: 250, height: 45, fontSize: 16, bgColor: 0x4a2a2a });
            y += 60;
        }

        // Back button
        UIComponents.createButton(this, width / 2, height - 60, 'Back', () => {
            this.scene.start('MainMenu');
        }, { width: 200, height: 50, fontSize: 20 });
    }
}
