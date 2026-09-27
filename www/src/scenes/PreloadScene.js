// ============================================
// REALMS OF AETHERIA - PRELOAD SCENE
// ============================================

import { GAME_CONFIG } from '../config/GameConfig.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Preload' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Progress bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x1a1a2e, 0.8);
        progressBox.fillRect(width / 2 - 200, height / 2 - 30, 400, 60);

        const loadingText = this.add.text(width / 2, height / 2 - 60, 'Realms of Aetheria', {
            fontFamily: 'Georgia, serif',
            fontSize: '28px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        const percentText = this.add.text(width / 2, height / 2, '0%', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#f0e6d3',
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xc9a84c, 1);
            progressBar.fillRect(width / 2 - 190, height / 2 - 20, 380 * value, 40);
            percentText.setText(Math.floor(value * 100) + '%');
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        // === LOAD CHARACTER SPRITES ===
        // Medieval fantasy characters
        for (let i = 0; i <= 10; i++) {
            this.load.image(`char_${i}`, `assets/characters/${i}.png`);
        }

        // RPG Battle System characters
        this.load.image('warrior_idle', 'assets/characters/sprite-sheet-240x104.png');
        this.load.image('mage_idle', 'assets/characters/mage.png');
        this.load.image('paladin_idle', 'assets/characters/paladin.png');
        this.load.image('wizard_idle', 'assets/characters/Wizard.png');
        this.load.image('bowman_idle', 'assets/characters/bowman.png');
        this.load.image('warrior2_idle', 'assets/characters/warrior2.png');

        // Cute Fantasy player
        this.load.image('player_cute', 'assets/characters/Player.png');
        this.load.image('player_actions', 'assets/characters/Player_Actions.png');

        // === LOAD MONSTERS ===
        const monsterSprites = [
            'bat', 'cyclop', 'dragon', 'goblin', 'king skeleton', 'leonard',
            'skeleton', 'slim', 'snake', 'boar', 'giant', 'yeti', 'octopus',
            'chest', 'mimic', 'mushroom', 'reptile', 'slime', 'dino', 'ghost'
        ];
        for (const m of monsterSprites) {
            const key = m.replace(/ /g, '_').toLowerCase();
            this.load.image(`monster_${key}`, `assets/monsters/${m}.png`);
        }

        // Tiny RPG monsters
        this.load.image('monster_demon', 'assets/monsters/Demon_A.png');
        this.load.image('monster_blood', 'assets/monsters/Blood Monster_A.png');

        // === LOAD NPC SPRITES ===
        for (let i = 1; i <= 13; i++) {
            this.load.image(`npc_${i}`, `assets/npcs/villager_${i}.png`);
        }

        // === LOAD ITEMS ===
        for (let i = 1; i <= 19; i++) {
            this.load.image(`item_${i}`, `assets/items/${i}.png`);
        }
        this.load.image('item_barrel', 'assets/items/barrel.png');
        this.load.image('item_crate', 'assets/items/crate.png');
        this.load.image('item_chest_close', 'assets/items/gold-chest-close.png');
        this.load.image('item_chest_open', 'assets/items/gold-chest-open.png');
        this.load.image('item_wood_chest_close', 'assets/items/wood-chest-close.png');
        this.load.image('item_wood_chest_open', 'assets/items/wood-chest-open.png');

        // === LOAD TILES ===
        const tiles = ['Beach_Tile', 'Cliff_Tile', 'FarmLand_Tile', 'Grass_Middle', 'Path_Middle', 'Path_Tile', 'Water_Middle', 'Water_Tile'];
        for (const t of tiles) {
            this.load.image(`tile_${t}`, `assets/tiles/${t}.png`);
        }

        // === LOAD BACKGROUNDS ===
        for (let i = 1; i <= 27; i++) {
            this.load.image(`bg_${i}`, `assets/backgrounds/${i}.png`);
        }

        // === LOAD FX ===
        // Explosions
        this.load.image('fx_explosion_1', 'assets/fx/explosions/symmetrical_explosion_001/symmetrical_explosion_001_large_orange/symmetrical_explosion_001_large_orange_0.png');
        this.load.image('fx_explosion_2', 'assets/fx/explosions/symmetrical_explosion_002/symmetrical_explosion_002_large_orange/symmetrical_explosion_002_large_orange_0.png');

        // Spells
        this.load.image('fx_fireball', 'assets/fx/spells/spell_attack_up_001/spell_attack_up_001_large_red/spell_attack_up_001_large_red_0.png');
        this.load.image('fx_heal', 'assets/fx/spells/spell_heal_001/spell_heal_001_large_red/spell_heal_001_large_red_0.png');
        this.load.image('fx_poison', 'assets/fx/spells/spell_poison_001/spell_poison_001_large_green/spell_poison_001_large_green_0.png');

        // Impacts
        this.load.image('fx_impact_1', 'assets/fx/impacts/symmetrical_impact_001/symmetrical_impact_001_large_yellow/symmetrical_impact_001_large_yellow_0.png');
        this.load.image('fx_impact_2', 'assets/fx/impacts/symmetrical_impact_002/symmetrical_impact_002_large_blue/symmetrical_impact_002_large_blue_0.png');

        // Lightning
        this.load.image('fx_lightning', 'assets/fx/lightning/lightning_strike_001/lightning_strike_001_large_violet/lightning_strike_001_large_violet_0.png');

        // Bursts
        this.load.image('fx_burst_1', 'assets/fx/bursts/round_sparkle_burst_001/round_sparkle_burst_001_large_blue/round_sparkle_burst_001_large_blue_0.png');
        this.load.image('fx_burst_2', 'assets/fx/bursts/round_light_burst_001/round_light_burst_001_large_yellow/round_light_burst_001_large_yellow_0.png');

        // === LOAD UI ===
        this.load.image('ui_panel', 'assets/ui/panel.png');
        this.load.image('ui_button', 'assets/ui/button.png');
        this.load.image('ui_slot', 'assets/ui/slot.png');

        // === LOAD HUD ===
        this.load.image('hud_frame', 'assets/hud/frame.png');
        this.load.image('hud_bar', 'assets/hud/bar.png');

        // === LOAD FONTS (as images) ===
        this.load.image('font_1', 'assets/ui/font-1.png');
        this.load.image('font_2', 'assets/ui/font-2.png');

        // === LOAD AUDIO ===
        // Music
        const musicFiles = ['town', 'battle', 'dungeon', 'boss', 'menu'];
        for (const m of musicFiles) {
            this.load.audio(`music_${m}`, `assets/music/${m}.mp3`);
        }

        // Sound effects
        const sfxFiles = ['attack', 'hit', 'crit', 'heal', 'levelup', 'death', 'coin', 'potion', 'equip', 'quest', 'click', 'step'];
        for (const s of sfxFiles) {
            this.load.audio(`sfx_${s}`, `assets/sounds/${s}.mp3`);
        }
    }

    create() {
        // Hide loading screen
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }

        this.scene.start('MainMenu');
    }
}
