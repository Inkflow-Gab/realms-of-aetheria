// ============================================
// REALMS OF AETHERIA - WORLD MAP SCENE
// ============================================
// Zone atlas with quest markers and fast-travel.
// ============================================

import { UIComponents } from '../ui/UIComponents.js';
import { layout } from '../ui/Layout.js';
import { ZONE_INFO, getQuestMarkedZones, getActiveDestination } from '../data/Quests.js';

export class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Map' });
    }

    init(data) {
        this.player = data.player;
        this.currentZone = data.currentZone || this.player?.zone || 'town';
    }

    create() {
        const L = layout(this);
        this.cameras.main.setBackgroundColor('#0a0a1a');

        if (this.textures.exists('bg_1')) {
            this.add.image(L.cx, L.cy, 'bg_1').setDisplaySize(L.w, L.h).setAlpha(0.35);
        }
        this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 0.78);

        this.add.text(L.cx, L.pad + L.font(6), 'WORLD MAP', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(28)}px`,
            color: '#f0e6d3',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        const active = getActiveDestination(this.player);
        if (active) {
            this.add.text(L.cx, L.pad + L.font(34), `Quest → ${active.zoneName} · ${active.label}`, {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(13)}px`,
                color: '#ffd700',
                stroke: '#000',
                strokeThickness: 2,
            }).setOrigin(0.5);
        }

        const marks = getQuestMarkedZones(this.player);
        const panelW = Math.min(520, L.w * 0.88);
        const panelH = Math.min(360, L.h * 0.58);
        const panelX = L.cx - panelW / 2;
        const panelY = L.y(0.18);

        const frame = this.add.graphics();
        frame.fillStyle(0x12122a, 0.92);
        frame.fillRoundedRect(panelX, panelY, panelW, panelH, 12);
        frame.lineStyle(2, 0xc9a84c, 0.7);
        frame.strokeRoundedRect(panelX, panelY, panelW, panelH, 12);

        // Soft path lines between zones
        const paths = [
            ['town', 'meadow'], ['meadow', 'forest'], ['meadow', 'cave'],
            ['forest', 'mountain'], ['cave', 'ruins'], ['cave', 'dungeon'],
            ['ruins', 'dungeon'], ['dungeon', 'abyss'], ['town', 'arena'],
        ];
        const lineG = this.add.graphics();
        lineG.lineStyle(1.5, 0xc9a84c, 0.25);
        for (const [a, b] of paths) {
            const A = ZONE_INFO[a];
            const B = ZONE_INFO[b];
            if (!A || !B) continue;
            lineG.lineBetween(
                panelX + A.mapX * panelW,
                panelY + A.mapY * panelH,
                panelX + B.mapX * panelW,
                panelY + B.mapY * panelH
            );
        }

        this.detail = this.add.text(L.cx, L.y(0.82), 'Tap a region · gold ! = quest destination', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#a09070',
            align: 'center',
            wordWrap: { width: L.w * 0.85 },
        }).setOrigin(0.5);

        Object.values(ZONE_INFO).forEach((zone) => {
            const x = panelX + zone.mapX * panelW;
            const y = panelY + zone.mapY * panelH;
            const here = zone.id === this.currentZone;
            const hasQuest = !!marks[zone.id];
            const col = Phaser.Display.Color.HexStringToColor(zone.color).color;

            const node = this.add.circle(x, y, here ? 16 : 12, col, here ? 1 : 0.75)
                .setStrokeStyle(here ? 3 : 2, hasQuest ? 0xffd700 : 0xf0e6d3, 0.95)
                .setInteractive({ useHandCursor: true });

            this.add.text(x, y + 22, zone.name.split(' ')[0], {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(11)}px`,
                color: here ? '#ffd700' : '#f0e6d3',
                stroke: '#000',
                strokeThickness: 3,
            }).setOrigin(0.5);

            if (hasQuest) {
                const bang = this.add.text(x + 12, y - 14, '!', {
                    fontFamily: 'Georgia, serif',
                    fontSize: `${L.font(18)}px`,
                    color: '#ffd700',
                    stroke: '#000',
                    strokeThickness: 4,
                }).setOrigin(0.5);
                this.tweens.add({
                    targets: bang,
                    y: bang.y - 4,
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }

            if (here) {
                this.add.circle(x, y, 22).setStrokeStyle(1, 0xffd700, 0.5);
            }

            node.on('pointerdown', () => this.selectZone(zone, marks[zone.id]));
        });

        UIComponents.createButton(this, L.cx, L.h - L.pad - 24, 'Close', () => {
            this.scene.stop();
            this.scene.resume('World');
        }, {
            width: Math.min(160, L.w * 0.3),
            height: Math.max(40, L.font(42)),
            fontSize: L.font(16),
            variant: 'primary',
        });
    }

    selectZone(zone, questMarks) {
        const here = zone.id === this.currentZone;
        let msg = `${zone.name}\n${zone.hint}`;
        if (questMarks?.length) {
            msg += `\n\nQuest: ${questMarks[0].quest}\n→ ${questMarks[0].obj}`;
        }
        if (here) msg += '\n\n(You are here)';
        else msg += '\n\nTap Travel to go';
        this.detail.setText(msg);
        this.detail.setColor('#f0e6d3');

        if (this._travelBtn) {
            this._travelBtn.destroy();
            this._travelBtn = null;
        }
        if (here) return;

        const L = layout(this);
        this._travelBtn = UIComponents.createButton(
            this,
            L.cx,
            L.y(0.90),
            `Travel to ${zone.name.split(' ')[0]}`,
            () => this.travelTo(zone.id),
            {
                width: Math.min(280, L.w * 0.55),
                height: Math.max(40, L.font(42)),
                fontSize: L.font(15),
                variant: 'primary',
                bgColor: 0x2a4a2a,
            }
        );
    }

    travelTo(zoneId) {
        if (!this.player) return;
        this.player.zone = zoneId;
        this.player.x = 8;
        this.player.y = 8;
        this.scene.stop();
        const world = this.scene.get('World');
        if (world) {
            world.scene.restart({ player: this.player });
        }
    }
}
