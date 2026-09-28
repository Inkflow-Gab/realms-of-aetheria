// ============================================
// REALMS OF AETHERIA - MAIN ENTRY POINT
// ============================================

import { GAME_CONFIG } from './config/GameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MainMenuScene } from './scenes/MainMenuScene.js';
import { CharacterCreationScene } from './scenes/CharacterCreationScene.js';
import { WorldLoadScene } from './scenes/WorldLoadScene.js';
import { WorldScene } from './scenes/WorldScene.js';
import { BattleScene } from './scenes/BattleScene.js';
import { InventoryScene } from './scenes/InventoryScene.js';
import { SkillsScene } from './scenes/SkillsScene.js';
import { QuestLogScene } from './scenes/QuestLogScene.js';
import { StatsScene } from './scenes/StatsScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { SettingsScene } from './scenes/SettingsScene.js';
import { CosmeticsScene } from './scenes/CosmeticsScene.js';
import { MapScene } from './scenes/MapScene.js';
import { SettingsSystem } from './systems/SettingsSystem.js';

// ============================================
// IMMERSIVE FULLSCREEN
// ============================================
// System bars / cutout are handled natively in MainActivity + styles.xml.
// This project ships vanilla ES modules (no bundler), so @capacitor/*
// packages are not importable from the WebView. Do not import them here.
function enterImmersive() {
    // Re-assert layout after returning from the background.
    try {
        document.documentElement.style.background = '#0a0a1a';
        document.body.style.background = '#0a0a1a';
    } catch {
        /* ignore */
    }
}

enterImmersive();

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
        // RESIZE fills the real device screen. FIT left black letterbox bars
        // on modern wide phones -- the "black thing" in the screenshot corner.
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_CONFIG.WIDTH,
        height: GAME_CONFIG.HEIGHT,
        expandParent: true,
        orientation: Phaser.Scale.Orientation.LANDSCAPE,
    },
    input: {
        activePointers: 3,
    },
    render: {
        pixelArt: false,
        antialias: true,
        roundPixels: true,
        powerPreference: 'high-performance',
    },
    fps: {
        target: 60,
        min: 30,
        forceSetTimeOut: false,
    },
    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        CharacterCreationScene,
        WorldLoadScene,
        WorldScene,
        BattleScene,
        InventoryScene,
        SkillsScene,
        QuestLogScene,
        StatsScene,
        ShopScene,
        SettingsScene,
        CosmeticsScene,
        MapScene,
    ],
};

// ============================================
// START GAME
// ============================================

window.__phaserStarted = true;
window.setLoadingMessage?.(1, 'Starting game engine...');

if (typeof Phaser === 'undefined') {
    window.showLoadingError?.(
        'Could not load the Phaser game engine (phaser.min.js). ' +
        'Reinstall the app so the bundled engine is restored.'
    );
    throw new Error('Phaser failed to load');
}

const bootSettings = SettingsSystem.get();
const gfxBoot = SettingsSystem.getGraphicsProfile(bootSettings);

const game = new Phaser.Game({
    ...config,
    render: {
        ...config.render,
        antialias: gfxBoot.antialias,
    },
    fps: {
        target: bootSettings.fpsCap === 0 ? 60 : bootSettings.fpsCap,
        min: 30,
        forceSetTimeOut: bootSettings.fpsCap !== 0 && bootSettings.fpsCap <= 30,
    },
});

// Prefer the top-most interactive object under a finger (HUD over world).
game.events.once('ready', () => {
    try { game.input.setTopOnly(true); } catch { /* ignore */ }
});

SettingsSystem.apply(game, bootSettings);

// Keep canvas locked to the visible viewport after orientation / inset changes.
const refit = () => {
    try {
        game.scale.resize(window.innerWidth, window.innerHeight);
        game.scale.refresh();
    } catch {
        /* game may not be ready */
    }
};
window.addEventListener('resize', refit);
window.addEventListener('orientationchange', () => setTimeout(refit, 80));
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        enterImmersive();
        refit();
    }
});

document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.scene.isActive('World')) {
        const worldScene = game.scene.getScene('World');
        if (worldScene && worldScene.saveGame) {
            worldScene.saveGame();
        }
    }
});

window.game = game;
