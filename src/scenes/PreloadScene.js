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

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

        // Title
        this.add.text(width / 2, height / 2 - 100, 'Realms of Aetheria', {
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        // Progress bar
        const barWidth = 400;
        const barHeight = 25;
        const barX = width / 2 - barWidth / 2;
        const barY = height / 2 - 10;

        this.add.rectangle(barX - 2, barY - 2, barWidth + 4, barHeight + 4, 0xc9a84c, 0.3)
            .setOrigin(0, 0.5);
        this.add.rectangle(barX, barY, barWidth, barHeight, 0x1a1a2e)
            .setOrigin(0, 0.5);

        this.progressBar = this.add.rectangle(barX, barY, 0, barHeight, 0xc9a84c)
            .setOrigin(0, 0.5);

        // Percentage
        this.percentText = this.add.text(width / 2, barY + 30, '0%', {
            fontFamily: 'Georgia, serif',
            fontSize: '22px',
            color: '#f0e6d3',
        }).setOrigin(0.5);

        // Status text
        this.statusText = this.add.text(width / 2, barY + 60, 'Initializing...', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#888888',
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
            this.statusText.setText(`Loading: ${file.key}`);
        });

        // Error handler - don't crash, just warn
        this.load.on('loaderror', (file) => {
            console.warn('Missing asset:', file.key, file.url);
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

        // Load assets - only files that exist
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
        // Essential assets only - these MUST load
        // Characters
        for (let i = 0; i <= 10; i++) {
            this.load.image(`char_${i}`, `assets/characters/${i}.png`);
        }

        // Monsters
        const monsters = [
            'bat', 'cyclop', 'dragon', 'goblin', 'skeleton', 'slim', 'snake',
            'boar', 'giant', 'yeti', 'chest', 'mushroom', 'Slime_Green'
        ];
        for (const m of monsters) {
            const key = m.toLowerCase().replace(/ /g, '_');
            this.load.image(`monster_${key}`, `assets/monsters/${m}.png`);
        }

        // NPCs
        const npcs = [
            'MiniNobleMan', 'MiniNobleWoman', 'MiniOldMan', 'MiniOldWoman',
            'MiniPeasant', 'MiniPrincess', 'MiniQueen', 'MiniVillagerMan',
            'MiniVillagerWoman', 'MiniWorker'
        ];
        for (let i = 0; i < npcs.length; i++) {
            this.load.image(`npc_${i + 1}`, `assets/npcs/${npcs[i]}.png`);
        }

        // Items
        for (let i = 1; i <= 19; i++) {
            this.load.image(`item_${i}`, `assets/items/${i}.png`);
        }

        // Tiles
        const tiles = ['Grass_Middle', 'Path_Tile', 'Cliff_Tile', 'Water_Tile'];
        for (const t of tiles) {
            this.load.image(`tile_${t}`, `assets/tiles/${t}.png`);
        }

        // Backgrounds
        for (let i = 1; i <= 10; i++) {
            this.load.image(`bg_${i}`, `assets/backgrounds/${i}.png`);
        }

        // UI
        this.load.image('ui_medieval', 'assets/ui/MediavelFree.png');
        this.load.image('ui_fantasy', 'assets/ui/freefantasy.png');

        // HUD
        this.load.image('hud_life_box', 'assets/hud/life-box.png');
        this.load.image('hud_life_empty', 'assets/hud/life-box-empty.png');
        this.load.image('hud_heart_full', 'assets/hud/full-heart.png');
        this.load.image('hud_heart_empty', 'assets/hud/empty-heart.png');

        // Audio - only first few to keep loading fast
        this.load.audio('music_1', 'assets/music/theme-1.ogg');
        this.load.audio('music_2', 'assets/music/theme-2.ogg');

        // Sound effects - only essential ones
        const sfxFiles = ['attack', 'hit', 'heal', 'coin', 'levelup'];
        for (const s of sfxFiles) {
            this.load.audio(`sfx_${s}`, `assets/sounds/${s}.ogg`);
        }
    }

    create() {
        // Clear timeout
        if (this.loadTimeout) {
            this.loadTimeout.remove();
        }

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
