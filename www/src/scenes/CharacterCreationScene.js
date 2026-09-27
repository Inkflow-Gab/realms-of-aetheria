// ============================================
// REALMS OF AETHERIA - CHARACTER CREATION
// ============================================

import { RACES, CLASSES, TRAITS } from '../config/GameConfig.js';
import { UIComponents } from '../ui/UIComponents.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class CharacterCreationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterCreation' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.image(width / 2, height / 2, 'bg_2').setDisplaySize(width, height);
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.7);
        overlay.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 40, 'Create Your Hero', {
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        // === NAME INPUT ===
        this.add.text(100, 100, 'Name:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        });

        this.nameText = this.add.text(200, 100, 'Hero', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c9a84c',
            backgroundColor: '#1a1a2e',
            padding: { x: 10, y: 5 },
        }).setInteractive({ useHandCursor: true });

        this.nameText.on('pointerdown', () => {
            this.promptName();
        });

        // === RACE SELECTION ===
        this.add.text(100, 160, 'Race:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        });

        this.raceIndex = 0;
        this.raceKeys = Object.keys(RACES);
        this.raceText = this.add.text(200, 160, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#c9a84c',
        });

        UIComponents.createButton(this, 420, 160, '◀', () => this.cycleRace(-1), { width: 40, height: 35, fontSize: 16 });
        UIComponents.createButton(this, 580, 160, '▶', () => this.cycleRace(1), { width: 40, height: 35, fontSize: 16 });

        this.raceDesc = this.add.text(200, 185, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#aaaaaa',
        });

        // === CLASS SELECTION ===
        this.add.text(100, 230, 'Class:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        });

        this.classIndex = 0;
        this.classKeys = Object.keys(CLASSES);
        this.classText = this.add.text(200, 230, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#c9a84c',
        });

        UIComponents.createButton(this, 420, 230, '◀', () => this.cycleClass(-1), { width: 40, height: 35, fontSize: 16 });
        UIComponents.createButton(this, 580, 230, '▶', () => this.cycleClass(1), { width: 40, height: 35, fontSize: 16 });

        this.classDesc = this.add.text(200, 255, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#aaaaaa',
        });

        // === TRAIT SELECTION ===
        this.add.text(100, 300, 'Trait:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        });

        this.traitIndex = 0;
        this.traitKeys = Object.keys(TRAITS);
        this.traitText = this.add.text(200, 300, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#c9a84c',
        });

        UIComponents.createButton(this, 420, 300, '◀', () => this.cycleTrait(-1), { width: 40, height: 35, fontSize: 16 });
        UIComponents.createButton(this, 580, 300, '▶', () => this.cycleTrait(1), { width: 40, height: 35, fontSize: 16 });

        this.traitDesc = this.add.text(200, 325, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#aaaaaa',
        });

        // === AVATAR PREVIEW ===
        this.add.text(700, 100, 'Preview:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#f0e6d3',
        });

        this.avatarPreview = this.add.image(800, 250, 'char_0').setScale(2);

        // Avatar selection
        this.avatarIndex = 0;
        UIComponents.createButton(this, 720, 380, '◀', () => this.cycleAvatar(-1), { width: 40, height: 35, fontSize: 16 });
        UIComponents.createButton(this, 880, 380, '▶', () => this.cycleAvatar(1), { width: 40, height: 35, fontSize: 16 });

        // === STATS PREVIEW ===
        this.statsPanel = UIComponents.createPanel(this, 650, 420, 300, 200);
        this.statsText = this.add.text(670, 440, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#f0e6d3',
            lineSpacing: 4,
        });

        // === BUTTONS ===
        UIComponents.createButton(this, 400, 620, 'Back', () => {
            this.scene.start('MainMenu');
        }, { width: 150, height: 45, fontSize: 18 });

        UIComponents.createButton(this, 800, 620, 'Begin Adventure', () => {
            this.startGame();
        }, { width: 250, height: 50, fontSize: 22, bgColor: 0x2a4a2a });

        // Initialize display
        this.updateDisplay();
    }

    promptName() {
        const currentName = this.nameText.text;
        const newName = prompt('Enter your hero name:', currentName);
        if (newName && newName.trim().length > 0) {
            this.nameText.setText(newName.trim().substring(0, 16));
        }
    }

    cycleRace(dir) {
        this.raceIndex = (this.raceIndex + dir + this.raceKeys.length) % this.raceKeys.length;
        this.updateDisplay();
    }

    cycleClass(dir) {
        this.classIndex = (this.classIndex + dir + this.classKeys.length) % this.classKeys.length;
        this.updateDisplay();
    }

    cycleTrait(dir) {
        this.traitIndex = (this.traitIndex + dir + this.traitKeys.length) % this.traitKeys.length;
        this.updateDisplay();
    }

    cycleAvatar(dir) {
        this.avatarIndex = (this.avatarIndex + dir + 11) % 11;
        this.avatarPreview.setTexture(`char_${this.avatarIndex}`);
    }

    updateDisplay() {
        const race = RACES[this.raceKeys[this.raceIndex]];
        const cls = CLASSES[this.classKeys[this.classIndex]];
        const trait = TRAITS[this.traitKeys[this.traitIndex]];

        this.raceText.setText(race.name);
        this.raceDesc.setText(`${race.desc}\nHP:${race.baseStats.hp} MP:${race.baseStats.mp} ATK:${race.baseStats.atk} DEF:${race.baseStats.def} SPD:${race.baseStats.spd}`);

        this.classText.setText(cls.name);
        this.classDesc.setText(`${cls.desc}\nPrimary: ${cls.primaryStat.toUpperCase()} | Weapons: ${cls.weaponTypes.join(', ')}`);

        this.traitText.setText(trait.name);
        this.traitDesc.setText(trait.desc);

        // Stats preview
        const base = race.baseStats;
        const growth = cls.statGrowth;
        const stats = [
            `HP: ${base.hp + growth.hp}`,
            `MP: ${base.mp + growth.mp}`,
            `ATK: ${base.atk + growth.atk}`,
            `DEF: ${base.def + growth.def}`,
            `SPD: ${base.spd + growth.spd}`,
            `LUK: ${base.luk + growth.luk}`,
            '',
            `STR: ${10 + race.bonuses.str}`,
            `DEX: ${10 + race.bonuses.dex}`,
            `INT: ${10 + race.bonuses.int}`,
            `VIT: ${10 + race.bonuses.vit}`,
            `LUK: ${10 + race.bonuses.luk}`,
        ];
        this.statsText.setText(stats.join('\n'));
    }

    startGame() {
        const name = this.nameText.text;
        const race = this.raceKeys[this.raceIndex];
        const cls = this.classKeys[this.classIndex];
        const trait = this.traitKeys[this.traitIndex];

        const player = new PlayerSystem();
        player.initNew(name, race, cls, trait, this.avatarIndex);

        const saveSystem = new SaveSystem();
        saveSystem.save(player);

        this.scene.start('World', { player });
    }
}
