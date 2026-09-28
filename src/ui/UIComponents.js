// ============================================
// REALMS OF AETHERIA - UI COMPONENTS
// ============================================

import { GAME_CONFIG } from '../config/GameConfig.js';

/** Explicit hit area -- container.setSize alone is unreliable on mobile WebViews. */
function makeHitArea(width, height) {
    return new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height);
}

function drawFallbackButton(graphics, width, height, fill, border) {
    graphics.clear();
    graphics.fillStyle(fill, 0.95);
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    graphics.lineStyle(2, border, 1);
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    // Inner highlight so flat buttons still feel like the painted UI skins.
    graphics.lineStyle(1, 0xffffff, 0.12);
    graphics.strokeRoundedRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 6, 8);
}

export class UIComponents {
    /**
     * Fantasy-styled button.
     *
     * Prefers the packed UI button / panel textures when they are loaded;
     * otherwise draws a gold-rimmed rounded rect. Always installs a real
     * rectangular hit area so taps register on Capacitor WebViews.
     */
    static createButton(scene, x, y, text, callback, style = {}) {
        const width = style.width || 220;
        const height = style.height || 50;
        const bgColor = style.bgColor || 0x2a2a4a;
        const hoverColor = style.hoverColor || 0x3a3a6a;
        const textColor = style.textColor || '#f0e6d3';
        const fontSize = style.fontSize || 20;
        const variant = style.variant || 'default'; // default | primary | danger | ghost

        const container = scene.add.container(x, y);
        const layers = [];

        // --- Background art ---
        let bgImage = null;
        let bgGfx = null;

        const skinKey =
            variant === 'primary' && scene.textures.exists('btn_yes') ? 'btn_yes'
            : variant === 'danger' && scene.textures.exists('btn_no') ? 'btn_no'
            : scene.textures.exists('hud_medium_box') ? 'hud_medium_box'
            : scene.textures.exists('ui_panel_box') ? 'ui_panel_box'
            : null;

        if (skinKey && typeof scene.add.nineslice === 'function') {
            try {
                // Pixel boxes are tiny; keep a few pixels of border intact.
                const lw = skinKey.startsWith('btn_') ? 6 : 8;
                bgImage = scene.add.nineslice(0, 0, skinKey, undefined, width, height, lw, lw, lw, lw);
                bgImage.setTint(variant === 'primary' ? 0xd4c08a
                    : variant === 'danger' ? 0xd08080
                    : variant === 'ghost' ? 0x8899aa
                    : 0xc9a84c);
                layers.push(bgImage);
            } catch {
                bgImage = null;
            }
        }

        if (!bgImage && skinKey) {
            bgImage = scene.add.image(0, 0, skinKey);
            bgImage.setDisplaySize(width, height);
            bgImage.setTint(variant === 'primary' ? 0xe8d5a3
                : variant === 'danger' ? 0xe09090
                : 0xd0b060);
            layers.push(bgImage);
        }

        if (!bgImage) {
            bgGfx = scene.add.graphics();
            drawFallbackButton(bgGfx, width, height, bgColor, GAME_CONFIG.COLORS.UI_BORDER);
            layers.push(bgGfx);
        }

        const label = scene.add.text(0, 0, text, {
            fontFamily: 'Georgia, serif',
            fontSize: `${fontSize}px`,
            color: textColor,
            align: 'center',
            stroke: '#000000',
            strokeThickness: Math.max(2, Math.round(fontSize / 10)),
        }).setOrigin(0.5);
        layers.push(label);

        container.add(layers);
        container.setSize(width, height);
        container.setInteractive(makeHitArea(width, height), Phaser.Geom.Rectangle.Contains);
        // Larger touch target on mobile without changing the visual size.
        if (container.input) {
            container.input.hitArea.setTo(
                -width / 2 - 4,
                -height / 2 - 4,
                width + 8,
                height + 8
            );
        }

        const paint = (fill, border) => {
            if (bgGfx) drawFallbackButton(bgGfx, width, height, fill, border);
            if (bgImage) bgImage.setTint(border === 0xffd700 ? 0xffe08a : (variant === 'primary' ? 0xd4c08a : 0xc9a84c));
            label.setColor(border === 0xffd700 ? '#fff6d0' : textColor);
        };

        container.on('pointerover', () => paint(hoverColor, 0xffd700));
        container.on('pointerout', () => paint(bgColor, GAME_CONFIG.COLORS.UI_BORDER));
        container.on('pointerdown', () => {
            scene.tweens.add({
                targets: container,
                scaleX: 0.94,
                scaleY: 0.94,
                duration: 60,
                yoyo: true,
            });
            if (typeof callback === 'function') callback();
        });

        container.btnLabel = label;
        container.btnWidth = width;
        container.btnHeight = height;
        return container;
    }

    /** Small square cycle control (◀ / ▶) using the arrow asset when present. */
    static createArrowButton(scene, x, y, dir, callback, size = 40) {
        const container = scene.add.container(x, y);
        const bg = scene.add.graphics();
        drawFallbackButton(bg, size, size, 0x1e1e36, GAME_CONFIG.COLORS.UI_BORDER);

        let icon;
        if (scene.textures.exists('btn_arrow')) {
            icon = scene.add.image(0, 0, 'btn_arrow');
            icon.setDisplaySize(size * 0.55, size * 0.55);
            if (dir < 0) icon.setFlipX(true);
        } else {
            icon = scene.add.text(0, 0, dir < 0 ? '◀' : '▶', {
                fontFamily: 'Georgia, serif',
                fontSize: `${Math.round(size * 0.45)}px`,
                color: '#f0e6d3',
            }).setOrigin(0.5);
        }

        container.add([bg, icon]);
        container.setSize(size, size);
        container.setInteractive(makeHitArea(size, size), Phaser.Geom.Rectangle.Contains);
        container.on('pointerdown', () => {
            scene.tweens.add({ targets: container, scaleX: 0.9, scaleY: 0.9, duration: 50, yoyo: true });
            callback();
        });
        return container;
    }

    static createPanel(scene, x, y, width, height, alpha = 0.9) {
        if (scene.textures.exists('ui_panel_box') && typeof scene.add.nineslice === 'function') {
            try {
                const panel = scene.add.nineslice(x + width / 2, y + height / 2, 'ui_panel_box', undefined, width, height, 12, 12, 12, 12);
                panel.setAlpha(alpha);
                panel.setTint(0xb08a40);
                return panel;
            } catch {
                /* fall through */
            }
        }

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
        container.setInteractive(makeHitArea(size, size), Phaser.Geom.Rectangle.Contains);
        return container;
    }
}
