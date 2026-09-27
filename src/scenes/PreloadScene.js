// ============================================
// REALMS OF AETHERIA - PRELOAD SCENE
// ============================================

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
        this.loadTimeout = null;
        this.loadComplete = false;
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background with purchased asset
        this.add.image(width / 2, height / 2, 'bg_1').setDisplaySize(width, height).setAlpha(0.4);

        // Dark overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a, 0.7);

        // Title with glow effect
        const title = this.add.text(width / 2, height / 2 - 120, 'Realms of Aetheria', {
            fontFamily: 'Georgia, serif',
            fontSize: '42px',
            color: '#c9a84c',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(width / 2, height / 2 - 70, 'A MOBILE RPG ADVENTURE', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#f0e6d3',
        }).setOrigin(0.5);

        // Progress bar background
        const barWidth = 500;
        const barHeight = 20;
        const barX = width / 2 - barWidth / 2;
        const barY = height / 2 + 20;

        // Bar border
        this.add.rectangle(barX - 3, barY - 3, barWidth + 6, barHeight + 6, 0xc9a84c, 0.3)
            .setOrigin(0, 0.5);
        // Bar background
        this.add.rectangle(barX, barY, barWidth, barHeight, 0x1a1a2e)
            .setOrigin(0, 0.5);

        // Progress bar fill with gradient effect
        this.progressBar = this.add.rectangle(barX, barY, 0, barHeight, 0xc9a84c)
            .setOrigin(0, 0.5);

        // Percentage text
        this.percentText = this.add.text(width / 2, barY + 35, '0%', {
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            color: '#f0e6d3',
            fontStyle: 'bold',
        }).setOrigin(0.5);

        // Status text
        this.statusText = this.add.text(width / 2, barY + 65, 'Initializing...', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#888888',
        }).setOrigin(0.5);

        // Tip text
        this.add.text(width / 2, height - 40, 'Tip: Explore all 9 zones to find legendary loot!', {
            fontFamily: 'Georgia, serif',
            fontSize: '12px',
            color: '#666666',
        }).setOrigin(0.5);

        // Update HTML loading screen
        if (window.updateLoading) {
            window.updateLoading(0, 'Initializing...');
        }

        // Progress handler
        this.load.on('progress', (value) => {
            this.progressBar.width = barWidth * value;
            const pct = Math.floor(value * 100);
            this.percentText.setText(pct + '%');
            this.statusText.setText(`Loading assets... ${pct}%`);
            if (window.updateLoading) {
                window.updateLoading(pct, `Loading assets... ${pct}%`);
            }
        });

        // File loaded handler
        this.load.on('fileprogress', (file) => {
            this.statusText.setText(`Loading: ${file.key.substring(0, 30)}...`);
        });

        // Error handler
        this.load.on('loaderror', (file) => {
            console.warn('Missing asset:', file.key);
        });

        // Complete handler
        this.load.on('complete', () => {
            this.loadComplete = true;
            this.progressBar.width = barWidth;
            this.percentText.setText('100%');
            this.statusText.setText('Ready!');
            if (window.updateLoading) {
                window.updateLoading(100, 'Ready!');
            }
        });

        // Load assets
        this.loadAssets();

        // Hard timeout - skip loading after 15 seconds
        this.loadTimeout = this.time.delayedCall(15000, () => {
            if (!this.loadComplete) {
                console.warn('Load timeout - skipping remaining assets');
                this.loadComplete = true;
                this.scene.start('MainMenu');
            }
        });
    }

    loadAssets() {
        // === CHARACTER SPRITES ===
        for (let i = 0; i <= 10; i++) {
            this.load.image(`char_${i}`, `assets/characters/${i}.png`);
        }

        // === MONSTERS ===
        const monsters = [
            'bat', 'cyclop', 'dragon', 'goblin', 'skeleton', 'slim', 'snake',
            'boar', 'giant', 'yeti', 'chest', 'mushroom', 'Slime_Green'
        ];
        for (const m of monsters) {
            const key = m.toLowerCase().replace(/ /g, '_');
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

        // === TILES ===
        const tiles = ['Grass_Middle', 'Path_Tile', 'Cliff_Tile', 'Water_Tile'];
        for (const t of tiles) {
            this.load.image(`tile_${t}`, `assets/tiles/${t}.png`);
        }

        // === BACKGROUNDS ===
        for (let i = 1; i <= 10; i++) {
            this.load.image(`bg_${i}`, `assets/backgrounds/${i}.png`);
        }

        // === UI (purchased assets) ===
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

        // === AUDIO ===
        this.load.audio('music_1', 'assets/music/theme-1.ogg');
        this.load.audio('music_2', 'assets/music/theme-2.ogg');

        // Sound effects
        const sfxFiles = ['attack', 'hit', 'heal', 'coin', 'levelup'];
        for (const s of sfxFiles) {
            this.load.audio(`sfx_${s}`, `assets/sounds/${s}.ogg`);
        }
    }

    create() {
        if (this.loadTimeout) {
            this.loadTimeout.remove();
        }

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
