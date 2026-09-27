// ============================================
// REALMS OF AETHERIA - SKILLS SCENE
// ============================================

import { SKILLS } from '../data/Skills.js';
import { UIComponents } from '../ui/UIComponents.js';

export class SkillsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Skills' });
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
        this.add.text(width / 2, 30, 'Skills', {
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        // Skill Points
        this.add.text(width / 2, 70, `Skill Points: ${this.player.skillPoints}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#ffd700',
        }).setOrigin(0.5);

        // Skills list
        const classSkills = Object.values(SKILLS).filter(s => s.class === this.player.class.id || s.class === 'universal');

        classSkills.forEach((skill, i) => {
            const y = 120 + i * 60;
            const learned = this.player.skills.includes(skill.id);
            const level = this.player.skillLevels[skill.id] || 0;

            // Skill background
            const bg = this.add.graphics();
            bg.fillStyle(learned ? 0x2a2a4a : 0x1a1a2e, 0.8);
            bg.fillRoundedRect(100, y, width - 200, 50, 8);
            bg.lineStyle(1, learned ? 0xc9a84c : 0x444444, 1);
            bg.strokeRoundedRect(100, y, width - 200, 50, 8);

            // Skill name
            this.add.text(120, y + 5, skill.name, {
                fontFamily: 'Georgia, serif',
                fontSize: '18px',
                color: learned ? '#c9a84c' : '#666666',
            });

            // Level
            if (learned) {
                this.add.text(120, y + 28, `Lv.${level}`, {
                    fontFamily: 'Georgia, serif',
                    fontSize: '12px',
                    color: '#888888',
                });
            }

            // Description
            this.add.text(350, y + 5, skill.desc, {
                fontFamily: 'Georgia, serif',
                fontSize: '13px',
                color: learned ? '#f0e6d3' : '#555555',
                wordWrap: { width: 500 },
            });

            // MP Cost & Cooldown
            this.add.text(350, y + 28, `MP: ${skill.mpCost} | CD: ${skill.cooldown / 1000}s`, {
                fontFamily: 'Georgia, serif',
                fontSize: '11px',
                color: '#888888',
            });

            // Learn/Upgrade button
            if (!learned) {
                const canLearn = this.player.level >= skill.level;
                UIComponents.createButton(this, width - 150, y + 25, 'Learn', () => {
                    if (canLearn) {
                        this.player.learnSkill(skill.id);
                        this.scene.restart({ player: this.player });
                    }
                }, { width: 80, height: 30, fontSize: 12, bgColor: canLearn ? 0x2a4a2a : 0x333333 });
            } else if (this.player.skillPoints > 0) {
                UIComponents.createButton(this, width - 150, y + 25, 'Upgrade', () => {
                    this.player.upgradeSkill(skill.id);
                    this.scene.restart({ player: this.player });
                }, { width: 80, height: 30, fontSize: 12, bgColor: 0x2a2a6a });
            }
        });

        // Close button
        UIComponents.createButton(this, width / 2, height - 40, 'Close (K)', () => {
            this.scene.stop();
            this.scene.resume('World');
        }, { width: 150, height: 40, fontSize: 16 });

        // Keyboard
        this.input.keyboard.on('keydown-K', () => {
            this.scene.stop();
            this.scene.resume('World');
        });
    }
}
