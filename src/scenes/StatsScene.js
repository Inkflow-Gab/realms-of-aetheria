// ============================================
// REALMS OF AETHERIA - STATS SCENE
// ============================================

import { UIComponents } from '../ui/UIComponents.js';

export class StatsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Stats' });
    }

    init(data) {
        this.player = data.player;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.image(width / 2, height / 2, 'bg_1').setDisplaySize(width, height);
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.9);
        overlay.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 30, 'Character Stats', {
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        // Character info
        const p = this.player;
        const info = [
            `Name: ${p.name}`,
            `Race: ${p.race.name}`,
            `Class: ${p.class.name}`,
            `Trait: ${p.trait.name}`,
            `Level: ${p.level}`,
            `EXP: ${p.exp} / ${p.expToNext || 100}`,
            '',
            `HP: ${p.hp} / ${p.maxHp}`,
            `MP: ${p.mp} / ${p.maxMp}`,
            '',
            `ATK: ${p.atk}`,
            `DEF: ${p.def}`,
            `SPD: ${p.spd}`,
            `LUK: ${p.luk}`,
            '',
            `STR: ${p.stats.str}`,
            `DEX: ${p.stats.dex}`,
            `INT: ${p.stats.int}`,
            `VIT: ${p.stats.vit}`,
            `LUK: ${p.stats.luk}`,
            '',
            `Gold: ${p.gold}`,
            `Skill Points: ${p.skillPoints}`,
            `Kills: ${p.killCount}`,
            `Deaths: ${p.deathCount}`,
            `Play Time: ${Math.floor(p.playTime / 60000)} min`,
        ];

        this.add.text(100, 80, info.join('\n'), {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#f0e6d3',
            lineSpacing: 4,
        });

        // Equipment summary
        this.add.text(500, 80, 'Equipment:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c9a84c',
        });

        let equipY = 120;
        for (const slot in p.equipment) {
            const item = p.equipment[slot];
            const text = item ? `${slot}: ${item.name}` : `${slot}: (empty)`;
            const color = item ? '#f0e6d3' : '#555555';
            this.add.text(500, equipY, text, {
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                color: color,
            });
            equipY += 25;
        }

        // Close button
        UIComponents.createButton(this, width / 2, height - 40, 'Close (P)', () => {
            this.scene.stop();
            this.scene.resume('World');
        }, { width: 150, height: 40, fontSize: 16 });

        // Keyboard
        this.input.keyboard.on('keydown-P', () => {
            this.scene.stop();
            this.scene.resume('World');
        });
    }
}
