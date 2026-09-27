// ============================================
// REALMS OF AETHERIA - QUEST LOG SCENE
// ============================================

import { QUESTS } from '../data/Quests.js';
import { UIComponents } from '../ui/UIComponents.js';

export class QuestLogScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuestLog' });
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
        this.add.text(width / 2, 30, 'Quest Log', {
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        // Active Quests
        this.add.text(50, 80, 'Active Quests:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c9a84c',
        });

        const activeQuests = Object.values(this.player.quests).filter(q => q.status === 'active');

        if (activeQuests.length === 0) {
            this.add.text(50, 120, 'No active quests. Talk to NPCs to find quests!', {
                fontFamily: 'Georgia, serif',
                fontSize: '16px',
                color: '#888888',
            });
        }

        activeQuests.forEach((questState, i) => {
            const quest = QUESTS[questState.id];
            if (!quest) return;

            const y = 120 + i * 120;

            // Quest background
            const bg = this.add.graphics();
            bg.fillStyle(0x1a1a2e, 0.8);
            bg.fillRoundedRect(50, y, 500, 100, 8);
            bg.lineStyle(1, quest.type === 'main' ? 0xffd700 : 0xc9a84c, 1);
            bg.strokeRoundedRect(50, y, 500, 100, 8);

            // Quest name
            this.add.text(70, y + 10, quest.name, {
                fontFamily: 'Georgia, serif',
                fontSize: '18px',
                color: quest.type === 'main' ? '#ffd700' : '#c9a84c',
            });

            // Quest description
            this.add.text(70, y + 35, quest.desc, {
                fontFamily: 'Georgia, serif',
                fontSize: '13px',
                color: '#f0e6d3',
                wordWrap: { width: 460 },
            });

            // Objectives
            let objY = y + 60;
            for (const obj of questState.objectives) {
                const check = obj.completed ? '✓' : '○';
                const color = obj.completed ? '#2ecc71' : '#888888';
                this.add.text(90, objY, `${check} ${obj.desc} (${obj.current}/${obj.count})`, {
                    fontFamily: 'Georgia, serif',
                    fontSize: '12px',
                    color: color,
                });
                objY += 18;
            }
        });

        // Completed Quests
        const completedY = 120 + activeQuests.length * 120 + 40;
        this.add.text(50, completedY, 'Completed Quests:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#2ecc71',
        });

        this.player.completedQuests.slice(-10).forEach((questId, i) => {
            const quest = QUESTS[questId];
            if (!quest) return;
            this.add.text(70, completedY + 35 + i * 25, `✓ ${quest.name}`, {
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                color: '#2ecc71',
            });
        });

        // Rewards panel
        if (activeQuests.length > 0) {
            const quest = QUESTS[activeQuests[0].id];
            if (quest) {
                UIComponents.createPanel(this, width - 350, 80, 300, 200);
                this.add.text(width - 330, 100, 'Quest Rewards:', {
                    fontFamily: 'Georgia, serif',
                    fontSize: '16px',
                    color: '#c9a84c',
                });
                let rewardY = 130;
                if (quest.rewards.exp) {
                    this.add.text(width - 330, rewardY, `EXP: ${quest.rewards.exp}`, {
                        fontFamily: 'Georgia, serif', fontSize: '14px', color: '#f0e6d3',
                    });
                    rewardY += 25;
                }
                if (quest.rewards.gold) {
                    this.add.text(width - 330, rewardY, `Gold: ${quest.rewards.gold}`, {
                        fontFamily: 'Georgia, serif', fontSize: '14px', color: '#ffd700',
                    });
                    rewardY += 25;
                }
                if (quest.rewards.items) {
                    for (const itemId of quest.rewards.items) {
                        this.add.text(width - 330, rewardY, `Item: ${itemId}`, {
                            fontFamily: 'Georgia, serif', fontSize: '14px', color: '#9b59b6',
                        });
                        rewardY += 25;
                    }
                }
            }
        }

        // Close button
        UIComponents.createButton(this, width / 2, height - 40, 'Close (L)', () => {
            this.scene.stop();
            this.scene.resume('World');
        }, { width: 150, height: 40, fontSize: 16 });

        // Keyboard
        this.input.keyboard.on('keydown-L', () => {
            this.scene.stop();
            this.scene.resume('World');
        });
    }
}
