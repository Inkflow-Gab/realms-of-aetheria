// ============================================
// REALMS OF AETHERIA - QUEST LOG SCENE
// ============================================

import { QUESTS, ZONE_INFO, getActiveDestination } from '../data/Quests.js';
import { UIComponents } from '../ui/UIComponents.js';
import { layout } from '../ui/Layout.js';

export class QuestLogScene extends Phaser.Scene {
    constructor() {
        super({ key: 'QuestLog' });
    }

    init(data) {
        this.player = data.player;
    }

    create() {
        const L = layout(this);
        const width = L.w;
        const height = L.h;

        if (this.textures.exists('bg_1')) {
            this.add.image(L.cx, L.cy, 'bg_1').setDisplaySize(width, height).setAlpha(0.4);
        }
        this.add.rectangle(L.cx, L.cy, width, height, 0x0a0a1a, 0.88);

        this.add.text(L.cx, L.pad + 8, 'QUEST LOG', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(28)}px`,
            color: '#f0e6d3',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        const activeDest = getActiveDestination(this.player);
        if (activeDest) {
            this.add.text(L.cx, L.pad + L.font(36), `🧭 Go to: ${activeDest.zoneName} — ${activeDest.label}`, {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(14)}px`,
                color: '#ffd700',
                stroke: '#000',
                strokeThickness: 2,
            }).setOrigin(0.5);

            UIComponents.createButton(this, width - L.pad - 60, L.pad + L.font(36), 'Map', () => {
                this.scene.stop();
                this.scene.launch('Map', { player: this.player, currentZone: this.player.zone });
                this.scene.pause('World');
            }, {
                width: 90,
                height: Math.max(32, L.font(34)),
                fontSize: L.font(13),
                variant: 'primary',
            });
        }

        this.add.text(L.pad, L.y(0.16), 'Active Quests', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(18)}px`,
            color: '#c9a84c',
        });

        const activeQuests = Object.values(this.player.quests || {}).filter((q) => q.status === 'active');

        if (!activeQuests.length) {
            this.add.text(L.pad, L.y(0.22), 'No active quests. Talk to NPCs — then open the Map!', {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(14)}px`,
                color: '#888',
                wordWrap: { width: width * 0.7 },
            });
        }

        const cardW = Math.min(520, width * 0.55);
        activeQuests.forEach((questState, i) => {
            const quest = QUESTS[questState.id];
            if (!quest) return;
            const y = L.y(0.20) + i * Math.min(130, height * 0.2);

            const bg = this.add.graphics();
            bg.fillStyle(0x1a1a2e, 0.88);
            bg.fillRoundedRect(L.pad, y, cardW, 118, 8);
            bg.lineStyle(1.5, quest.type === 'main' ? 0xffd700 : 0xc9a84c, 1);
            bg.strokeRoundedRect(L.pad, y, cardW, 118, 8);

            this.add.text(L.pad + 14, y + 8, quest.name, {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(16)}px`,
                color: quest.type === 'main' ? '#ffd700' : '#c9a84c',
            });

            const dest = quest.destination;
            const zoneName = dest ? (ZONE_INFO[dest.zone]?.name || dest.zone) : '';
            if (dest) {
                this.add.text(L.pad + 14, y + 28, `📍 ${zoneName} · ${dest.label}`, {
                    fontFamily: 'Georgia, serif',
                    fontSize: `${L.font(12)}px`,
                    color: '#5dade2',
                });
            }

            this.add.text(L.pad + 14, y + 46, quest.desc, {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(11)}px`,
                color: '#d0c4a8',
                wordWrap: { width: cardW - 28 },
            });

            let objY = y + 68;
            (questState.objectives || []).forEach((obj, oi) => {
                const def = quest.objectives?.[oi];
                const check = obj.completed ? '✓' : '○';
                const color = obj.completed ? '#2ecc71' : '#aaa';
                const where = def?.destination
                    ? ` → ${ZONE_INFO[def.destination.zone]?.name || def.destination.zone}`
                    : '';
                this.add.text(L.pad + 20, objY, `${check} ${obj.desc} (${obj.current || 0}/${obj.count || 1})${obj.completed ? '' : where}`, {
                    fontFamily: 'Georgia, serif',
                    fontSize: `${L.font(11)}px`,
                    color,
                });
                objY += 14;
            });
        });

        // Rewards
        if (activeQuests.length) {
            const quest = QUESTS[activeQuests[0].id];
            if (quest) {
                const px = width - Math.min(300, width * 0.32) - L.pad;
                UIComponents.createPanel(this, px, L.y(0.20), Math.min(280, width * 0.3), 180);
                this.add.text(px + 16, L.y(0.22), 'Rewards', {
                    fontFamily: 'Georgia, serif',
                    fontSize: `${L.font(15)}px`,
                    color: '#c9a84c',
                });
                let ry = L.y(0.28);
                if (quest.rewards.exp) {
                    this.add.text(px + 16, ry, `EXP: ${quest.rewards.exp}`, { fontFamily: 'Georgia, serif', fontSize: `${L.font(13)}px`, color: '#f0e6d3' });
                    ry += 22;
                }
                if (quest.rewards.gold) {
                    this.add.text(px + 16, ry, `Gold: ${quest.rewards.gold}`, { fontFamily: 'Georgia, serif', fontSize: `${L.font(13)}px`, color: '#ffd700' });
                    ry += 22;
                }
                (quest.rewards.items || []).forEach((itemId) => {
                    this.add.text(px + 16, ry, `Item: ${itemId}`, { fontFamily: 'Georgia, serif', fontSize: `${L.font(12)}px`, color: '#9b59b6' });
                    ry += 20;
                });
            }
        }

        const completedY = Math.min(L.y(0.78), height - 100);
        this.add.text(L.pad, completedY, 'Completed', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(16)}px`,
            color: '#2ecc71',
        });
        (this.player.completedQuests || []).slice(-6).forEach((questId, i) => {
            const quest = QUESTS[questId];
            if (!quest) return;
            this.add.text(L.pad + 12, completedY + 24 + i * 18, `✓ ${quest.name}`, {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(12)}px`,
                color: '#2ecc71',
            });
        });

        UIComponents.createButton(this, L.cx, height - L.pad - 22, 'Close', () => {
            this.scene.stop();
            this.scene.resume('World');
        }, {
            width: Math.min(150, width * 0.28),
            height: Math.max(40, L.font(42)),
            fontSize: L.font(16),
            variant: 'primary',
        });

        this.input.keyboard?.on('keydown-L', () => {
            this.scene.stop();
            this.scene.resume('World');
        });
    }
}
