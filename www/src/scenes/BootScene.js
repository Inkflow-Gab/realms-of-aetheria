// ============================================
// REALMS OF AETHERIA - BOOT SCENE
// ============================================

import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    preload() {
        // Show loading progress
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x1a1a2e, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xc9a84c, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        this.scene.start('Preload');
    }
}
