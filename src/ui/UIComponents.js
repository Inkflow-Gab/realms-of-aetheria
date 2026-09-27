// ============================================
// REALMS OF AETHERIA - UI COMPONENTS
// ============================================

import { GAME_CONFIG } from '../config/GameConfig.js';

export class UIComponents {
    static createButton(scene, x, y, text, callback, style = {}) {
        const width = style.width || 220;
        const height = style.height || 50;
        const bgColor = style.bgColor || 0x2a2a4a;
        const hoverColor = style.hoverColor || 0x3a3a6a;
        const textColor = style.textColor || '#f0e6d3';
        const fontSize = style.fontSize || 20;

        const container = scene.add.container(x, y);

        const bg = scene.add.graphics();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
        bg.lineStyle(2, GAME_CONFIG.COLORS.UI_BORDER, 1);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);

        const label = scene.add.text(0, 0, text, {
            fontFamily: 'Georgia, serif',
            fontSize: `${fontSize}px`,
            color: textColor,
            align: 'center',
        }).setOrigin(0.5);

        container.add([bg, label]);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });

        container.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(hoverColor, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
            bg.lineStyle(2, 0xffd700, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
        });

        container.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(bgColor, 1);
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, 8);
            bg.lineStyle(2, GAME_CONFIG.COLORS.UI_BORDER, 1);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 8);
        });

        container.on('pointerdown', () => {
            scene.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 50,
                yoyo: true,
            });
            callback();
        });

        return container;
    }

    static createPanel(scene, x, y, width, height, alpha = 0.9) {
        const panel = scene.add.graphics();
        panel.fillStyle(GAME_CONFIG.COLORS.UI_BG, alpha);
        panel.fillRoundedRect(x, y, width, height, 12);
        panel.lineStyle(2, GAME_CONFIG.COLORS.UI_BORDER, 1);
        panel.strokeRoundedRect(x, y, width, height, 12);
        return panel;
    }

    static createBar(scene, x, y, width, height, value, max, color, bgColor = 0x1a1a2e) {
        const container = scene.add.container(x, y);

        const bg = scene.add.graphics();
        bg.fillStyle(bgColor, 0.8);
        bg.fillRoundedRect(0, 0, width, height, 4);

        const fill = scene.add.graphics();
        const fillWidth = Math.max(0, (value / max) * width);
        fill.fillStyle(color, 1);
        fill.fillRoundedRect(0, 0, fillWidth, height, 4);

        const border = scene.add.graphics();
        border.lineStyle(1, 0xffffff, 0.3);
        border.strokeRoundedRect(0, 0, width, height, 4);

        const label = scene.add.text(width / 2, height / 2, `${Math.floor(value)}/${max}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '11px',
            color: '#ffffff',
        }).setOrigin(0.5);

        container.add([bg, fill, border, label]);
        container.fillGraphics = fill;
        container.label = label;
        container.width = width;
        container.height = height;

        container.updateValue = (newVal, newMax) => {
            const fw = Math.max(0, (newVal / newMax) * width);
            fill.clear();
            fill.fillStyle(color, 1);
            fill.fillRoundedRect(0, 0, fw, height, 4);
            label.setText(`${Math.floor(newVal)}/${newMax}`);
        };

        return container;
    }

    static createText(scene, x, y, text, style = {}) {
        return scene.add.text(x, y, text, {
            fontFamily: style.fontFamily || 'Georgia, serif',
            fontSize: style.fontSize || '16px',
            color: style.color || '#f0e6d3',
            align: style.align || 'left',
            wordWrap: style.wordWrap || false,
            stroke: style.stroke || '#000000',
            strokeThickness: style.strokeThickness || 2,
        }).setOrigin(style.originX || 0, style.originY || 0);
    }

    static createSlot(scene, x, y, size, item = null, count = 0) {
        const container = scene.add.container(x, y);

        const bg = scene.add.graphics();
        bg.fillStyle(0x1a1a2e, 0.9);
        bg.fillRoundedRect(-size / 2, -size / 2, size, size, 6);
        bg.lineStyle(1, 0xc9a84c, 0.6);
        bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 6);

        container.add(bg);

        if (item) {
            // Only draw an icon if its texture actually resolved. There is no
            // 'items/default' texture in the pack, so the old fallback asked
            // for a key that does not exist and rendered Phaser's green
            // missing-image box over the slot. An empty slot is better.
            const iconKey = item.icon;
            if (iconKey && scene.textures.exists(iconKey)) {
                const icon = scene.add.image(0, 0, iconKey);
                icon.setDisplaySize(size - 8, size - 8);
                container.add(icon);
            }

            if (count > 1) {
                const countText = scene.add.text(size / 2 - 4, size / 2 - 4, count.toString(), {
                    fontFamily: 'Georgia, serif',
                    fontSize: '12px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 2,
                }).setOrigin(1, 1);
                container.add(countText);
            }
        }

        container.setSize(size, size);
        return container;
    }
}
