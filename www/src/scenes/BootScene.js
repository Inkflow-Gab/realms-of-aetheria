// ============================================
// REALMS OF AETHERIA - BOOT SCENE
// ============================================

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }

    create() {
        // Update HTML loading screen
        if (window.updateLoading) {
            window.updateLoading(5, 'Starting game engine...');
        }

        // Small delay to let the loading screen update
        this.time.delayedCall(100, () => {
            this.scene.start('Preload');
        });
    }
}
