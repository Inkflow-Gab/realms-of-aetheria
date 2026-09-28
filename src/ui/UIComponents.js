// ============================================
// REALMS OF AETHERIA - UI COMPONENTS
// ============================================

import { GAME_CONFIG } from '../config/GameConfig.js';

function drawFallbackButton(graphics, width, height, fill, border) {
    graphics.clear();
    graphics.fillStyle(fill, 0.95);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    graphics.lineStyle(2, border, 1);
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    graphics.lineStyle(1, 0xffffff, 0.12);
    graphics.strokeRoundedRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6, 8);
}

export class UIComponents {
    /**
     * Fantasy-styled button.
     *
     * Tap handling uses an invisible Zone (most reliable on Android WebView).
     * A short debounce stops accidental double-fires from multi-touch.
     */
    static createButton(scene, x, y, text, callback, style = {}) {
        const width = Math.max(36, style.width || 220);
        const height = Math.max(32, style.height || 50);
        const bgColor = style.bgColor || 0x2a2a4a;
        const textColor = style.textColor || '#f0e6d3';
        const fontSize = style.fontSize || 20;
        const variant = style.variant || 'default';
        const depth = style.depth ?? 200;

        const fillIdle =
            variant === 'primary' ? 0x3a5a2a
            : variant === 'danger' ? 0x5a1a1a
            : variant === 'ghost' ? 0x1e2436
            : bgColor;
        const fillHot =
            variant === 'primary' ? 0x4a7a3a
            : variant === 'danger' ? 0x7a2a2a
            : 0x3a3a6a;

        const container = scene.add.container(x, y).setDepth(depth);

        const bgGfx = scene.add.graphics();
        drawFallbackButton(bgGfx, width, height, fillIdle, GAME_CONFIG.COLORS.UI_BORDER);
        container.add(bgGfx);

        const label = scene.add.text(0, 0, text, {
            fontFamily: 'Georgia, serif',
            fontSize: `${fontSize}px`,
            color: textColor,
            align: 'center',
            stroke: '#000000',
            strokeThickness: Math.max(2, Math.round(fontSize / 10)),
        }).setOrigin(0.5);
        if (label.width > width - 12) {
            label.setScale(Math.max(0.55, (width - 12) / label.width));
        }
        container.add(label);

        // Hit target: Zone sized a bit larger than the art for fat fingers.
        const pad = 8;
        const zone = scene.add.zone(0, 0, width + pad * 2, height + pad * 2);
        zone.setInteractive({ useHandCursor: true });
        container.add(zone);
        container.setSize(width + pad * 2, height + pad * 2);

        let locked = false;
        const fire = () => {
            if (locked) return;
            locked = true;
            scene.time.delayedCall(180, () => { locked = false; });
            if (typeof callback === 'function') callback();
        };

        zone.on('pointerover', () => {
            drawFallbackButton(bgGfx, width, height, fillHot, 0xffd700);
            label.setColor('#fff6d0');
        });
        zone.on('pointerout', () => {
            drawFallbackButton(bgGfx, width, height, fillIdle, GAME_CONFIG.COLORS.UI_BORDER);
            label.setColor(textColor);
            scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
        });
        zone.on('pointerdown', () => {
            scene.tweens.add({ targets: container, scaleX: 0.94, scaleY: 0.94, duration: 50 });
        });
        zone.on('pointerup', () => {
            scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
            fire();
        });

        container.btnLabel = label;
        container.btnWidth = width;
        container.btnHeight = height;
        container.hitZone = zone;

        container.pinToHud = () => {
            container.setScrollFactor(0);
            zone.setScrollFactor(0);
            container.setDepth(depth);
            return container;
        };

        return container;
    }

    static createArrowButton(scene, x, y, dir, callback, size = 40) {
        return UIComponents.createButton(
            scene, x, y, dir < 0 ? '◀' : '▶', callback,
            { width: size, height: size, fontSize: Math.round(size * 0.45), variant: 'ghost' }
        );
    }

    static createPanel(scene, x, y, width, height, alpha = 0.9) {
        const panel = scene.add.graphics();
        panel.fillStyle(GAME_CONFIG.COLORS.UI_BG, alpha);
        panel.fillRoundedRect(x, y, width, height, 12);
        panel.lineStyle(2, GAME_CONFIG.COLORS.UI_BORDER, 1);
        panel.strokeRoundedRect(x, y, width, height, 12);
        panel.setDepth(50);
        return panel;
    }

    static createBar(scene, x, y, width, height, value, max, color, bgColor = 0x1a1a2e) {
        const container = scene.add.container(x, y);

        const bg = scene.add.graphics();
        bg.fillStyle(bgColor, 0.8);
        bg.fillRoundedRect(0, 0, width, height, 4);

        const fill = scene.add.graphics();
        fill.fillStyle(color, 1);
        fill.fillRoundedRect(0, 0, Math.max(0, (value / Math.max(1, max)) * width), height, 4);

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

        container.updateValue = (newVal, newMax) => {
            fill.clear();
            fill.fillStyle(color, 1);
            fill.fillRoundedRect(0, 0, Math.max(0, (newVal / Math.max(1, newMax)) * width), height, 4);
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
            const iconKey = item.icon;
            if (iconKey && scene.textures.exists(iconKey)) {
                const icon = scene.add.image(0, 0, iconKey);
                icon.setDisplaySize(size - 8, size - 8);
                container.add(icon);
            } else {
                const glyph = scene.add.text(0, 0, (item.name || '?')[0], {
                    fontFamily: 'Georgia, serif',
                    fontSize: `${Math.round(size * 0.4)}px`,
                    color: '#c9a84c',
                }).setOrigin(0.5);
                container.add(glyph);
            }

            if (count > 1) {
                container.add(scene.add.text(size / 2 - 4, size / 2 - 4, String(count), {
                    fontFamily: 'Georgia, serif',
                    fontSize: '12px',
                    color: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 2,
                }).setOrigin(1, 1));
            }
        }

        const zone = scene.add.zone(0, 0, size + 4, size + 4).setInteractive({ useHandCursor: true });
        container.add(zone);
        container.setSize(size, size);
        container.hitZone = zone;
        return container;
    }
}
