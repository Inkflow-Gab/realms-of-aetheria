// ============================================
// REALMS OF AETHERIA - PRELOAD SCENE
// ============================================

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

        // Title
        this.add.text(width / 2, height / 2 - 80, 'Realms of Aetheria', {
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        // Progress bar background
        const barWidth = 400;
        const barHeight = 30;
        const barX = width / 2 - barWidth / 2;
        const barY = height / 2 - 10;

        this.add.rectangle(barX - 2, barY - 2, barWidth + 4, barHeight + 4, 0xc9a84c, 0.3)
            .setOrigin(0, 0.5);
        this.add.rectangle(barX, barY, barWidth, barHeight, 0x1a1a2e)
            .setOrigin(0, 0.5);

        // Progress bar fill
        this.progressBar = this.add.rectangle(barX, barY, 0, barHeight, 0xc9a84c)
            .setOrigin(0, 0.5);

        // Percentage text
        this.percentText = this.add.text(width / 2, barY + 30, '0%', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        }).setOrigin(0.5);

        // Loading text
        this.loadingText = this.add.text(width / 2, barY + 60, 'Loading...', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#888888',
        }).setOrigin(0.5);

        // Progress handler
        this.load.on('progress', (value) => {
            this.progressBar.width = barWidth * value;
            const pct = Math.floor(value * 100);
            this.percentText.setText(pct + '%');
            this.loadingText.setText(`Loading assets... ${pct}%`);
            // Update HTML loading screen
            if (window.updateLoading) {
                window.updateLoading(pct, `Loading assets... ${pct}%`);
            }
        });

        this.load.on('complete', () => {
            this.percentText.setText('100%');
            this.loadingText.setText('Complete!');
            if (window.updateLoading) {
                window.updateLoading(100, 'Complete!');
            }
        });

        this.load.on('loaderror', (file) => {
            console.warn('Failed to load:', file.key, file.url);
        });

        // === LOAD ASSETS ===
        this.loadAssets();
    }

    loadAssets() {
        // === CHARACTER SPRITES ===
        for (let i = 0; i <= 10; i++) {
            this.load.image(`char_${i}`, `assets/characters/${i}.png`);
        }
        this.load.image('player_cute', 'assets/characters/Player.png');
        this.load.image('player_actions', 'assets/characters/Player_Actions.png');

        // === MONSTERS ===
        const monsters = [
            'bat', 'cyclop', 'dragon', 'goblin', 'king skeleton', 'leonard',
            'skeleton', 'slim', 'snake', 'boar', 'giant', 'yeti', 'octopus',
            'chest', 'mimic', 'mushroom', 'reptile', 'slime', 'Slime_Green'
        ];
        for (const m of monsters) {
            const key = m.replace(/ /g, '_').toLowerCase();
            this.load.image(`monster_${key}`, `assets/monsters/${m}.png`);
        }

        // === NPC SPRITES ===
        const npcs = [
            'MiniNobleMan', 'MiniNobleWoman', 'MiniOldMan', 'MiniOldWoman',
            'MiniPeasant', 'MiniPrincess', 'MiniQueen', 'MiniVillagerMan',
            'MiniVillagerWoman', 'MiniWorker'
        ];
        for (let i = 0; i < npcs.length; i++) {
            this.load.image(`npc_${i + 1}`, `assets/npcs/${npcs[i]}.png`);
        }

        // === ITEMS ===
        for (let i = 1; i <= 19; i++) {
            this.load.image(`item_${i}`, `assets/items/${i}.png`);
        }
        this.load.image('item_barrel', 'assets/items/barrel.png');
        this.load.image('item_crate', 'assets/items/crate.png');
        this.load.image('item_chest_gold', 'assets/items/gold-chest-close.png');
        this.load.image('item_chest_gold_open', 'assets/items/gold-chest-open.png');
        this.load.image('item_chest_wood', 'assets/items/wood-chest-close.png');
        this.load.image('item_chest_wood_open', 'assets/items/wood-chest-open.png');

        // === TILES ===
        const tiles = ['Beach_Tile', 'Cliff_Tile', 'FarmLand_Tile', 'Grass_Middle', 'Path_Middle', 'Path_Tile', 'Water_Middle', 'Water_Tile'];
        for (const t of tiles) {
            this.load.image(`tile_${t}`, `assets/tiles/${t}.png`);
        }

        // === BACKGROUNDS ===
        for (let i = 1; i <= 35; i++) {
            this.load.image(`bg_${i}`, `assets/backgrounds/${i}.png`);
        }

        // === UI ===
        this.load.image('ui_medieval', 'assets/ui/MediavelFree.png');
        this.load.image('ui_fantasy', 'assets/ui/freefantasy.png');
        this.load.image('ui_free', 'assets/ui/FreeUI.png');
        this.load.image('ui_cozy', 'assets/ui/UiCozyFree.png');
        this.load.image('ui_pastel', 'assets/ui/PastelUIFree.png');

        // === HUD ===
        this.load.image('hud_life_box', 'assets/hud/life-box.png');
        this.load.image('hud_life_empty', 'assets/hud/life-box-empty.png');
        this.load.image('hud_heart_full', 'assets/hud/full-heart.png');
        this.load.image('hud_heart_empty', 'assets/hud/empty-heart.png');
        this.load.image('hud_frame', 'assets/hud/life-box-2.png');

        // === AUDIO (OGG format) ===
        for (let i = 1; i <= 16; i++) {
            this.load.audio(`music_${i}`, `assets/music/theme-${i}.ogg`);
        }

        // Sound effects - load a few key ones
        const sfxFiles = ['attack', 'hit', 'heal', 'coin', 'potion', 'levelup', 'death', 'click'];
        for (const s of sfxFiles) {
            this.load.audio(`sfx_${s}`, `assets/sounds/${s}.ogg`);
        }
    }

    create() {
        // Hide HTML loading screen
        if (window.hideLoading) {
            window.hideLoading();
        } else {
            const loadingEl = document.getElementById('loading');
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
        }

        this.scene.start('MainMenu');
    }
}
