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
