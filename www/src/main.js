// ============================================
// REALMS OF AETHERIA - MAIN ENTRY POINT
// ============================================

import { GAME_CONFIG } from './config/GameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { CharacterCreationScene } from './scenes/CharacterCreationScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { InventoryScene } from './scenes/InventoryScene.js';
import { SkillsScene } from './scenes/SkillsScene.js';
import { QuestLogScene } from './scenes/QuestLogScene.js';
import { StatsScene } from './scenes/StatsScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';

// ============================================
// PHASER GAME CONFIGURATION
// ============================================

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: GAME_CONFIG.WIDTH,
    height: GAME_CONFIG.HEIGHT,
    backgroundColor: '#0a0a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GAME_CONFIG.GRAVITY },
            debug: false,
        },
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_CONFIG.WIDTH,
        height: GAME_CONFIG.HEIGHT,
        orientation: Phaser.Scale.Orientation.LANDSCAPE,
    },
    input: {
        activePointers: 3,
    },
    render: {
        pixelArt: false,
        antialias: true,
    },
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        CharacterCreationScene,
        WorldScene,
        BattleScene,
        InventoryScene,
        SkillsScene,
        QuestLogScene,
        StatsScene,
        ShopScene,
        SettingsScene,
    ],
};

// ============================================
// START GAME
// ============================================

// Let the loading screen know the engine is alive, so its watchdog can stop
// claiming "Starting up..." while Phaser is actually booting.
window.__phaserStarted = true;
window.setLoadingMessage?.(1, 'Starting game engine...');

// Phaser is loaded from a CDN <script> tag above. If that failed (offline
// first-run, blocked CDN) there is no engine and the loader would sit at 0%
// forever, so bail out with a readable message instead.
if (typeof Phaser === 'undefined') {
    window.showLoadingError?.(
        'Could not load the Phaser game engine (phaser.min.js). ' +
        'Check your internet connection the first time the app is opened, ' +
        'then restart the app.'
    );
    throw new Error('Phaser failed to load from CDN');
}

const game = new Phaser.Game(config);

// Prevent default touch behaviors
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

// Handle visibility change (auto-save)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.scene.isActive('World')) {
        const worldScene = game.scene.getScene('World');
        if (worldScene && worldScene.saveGame) {
            worldScene.saveGame();
        }
    }
});

// Export for debugging
window.game = game;
