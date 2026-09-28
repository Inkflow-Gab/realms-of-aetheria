// ============================================
// REALMS OF AETHERIA - RESPONSIVE LAYOUT
// ============================================
//
// After switching to Phaser.Scale.RESIZE the game canvas matches the real
// device size. Hard-coded 1280x720 coordinates (e.g. Begin Adventure at y=620)
// land off-screen on phones. Every scene should size from this helper.
// ============================================

import { GAME_CONFIG } from '../config/GameConfig.js';

/** Snapshot of the live camera size + handy helpers. */
export function layout(scene) {
    const w = scene.cameras.main.width;
    const h = scene.cameras.main.height;
    const scale = Math.min(w / GAME_CONFIG.WIDTH, h / GAME_CONFIG.HEIGHT);
    const ui = Phaser.Math.Clamp(scale, 0.55, 1.15);

    return {
        w,
        h,
        cx: w / 2,
        cy: h / 2,
        scale,
        ui,
        pad: Math.max(10, Math.round(14 * ui)),
        // 13px floor: below this, Georgia serif becomes illegible on a phone
        // held at arm's length, which is how these screens get played.
        font: (base) => Math.max(13, Math.round(base * ui)),
        x: (pct) => w * pct,
        y: (pct) => h * pct,
        /** Keep a point inside the screen with a margin. */
        clampX: (x, margin = 40) => Phaser.Math.Clamp(x, margin, w - margin),
        clampY: (y, margin = 30) => Phaser.Math.Clamp(y, margin, h - margin),
        bottom: (offset = 40) => h - offset,
        right: (offset = 40) => w - offset,
    };
}

/**
 * Readable HUD / world text — bright glyphs on a solid dark plate.
 * Use this for any label that sits over gameplay art.
 */
export function readableText(scene, x, y, content, {
    size = 15,
    color = '#fff8e7',
    depth = 100,
    originX = 0,
    originY = 0,
    align = 'left',
    wrap = 0,
} = {}) {
    const L = layout(scene);
    const style = {
        fontFamily: 'Georgia, serif',
        fontSize: `${L.font(size)}px`,
        color,
        stroke: '#000000',
        strokeThickness: 5,
        backgroundColor: 'rgba(8, 8, 20, 0.88)',
        padding: { x: 10, y: 6 },
        align,
    };
    if (wrap > 0) style.wordWrap = { width: wrap };
    return scene.add.text(x, y, content, style)
        .setOrigin(originX, originY)
        .setScrollFactor(0)
        .setDepth(depth);
}

/** Shared bright text style for scenes that build Text manually. */
export const HUD_TEXT = {
    color: '#fff8e7',
    gold: '#ffe566',
    accent: '#ffd700',
    muted: '#e8dcc0',
    stroke: '#000000',
    strokeThickness: 5,
    plate: 'rgba(8, 8, 20, 0.88)',
};

/**
 * Persistent corner badge so builds are obviously tagged as beta.
 * Safe to call once per scene create().
 */
export function addBetaBadge(scene, corner = 'top-left') {
    const L = layout(scene);
    const label = scene.add.text(0, 0, 'BETA · PLAY', {
        fontFamily: 'Georgia, serif',
        fontSize: `${L.font(13)}px`,
        color: '#0a0a1a',
        backgroundColor: '#c9a84c',
        padding: { x: 8, y: 4 },
    }).setDepth(1000).setScrollFactor(0);

    if (corner === 'top-right') {
        label.setOrigin(1, 0).setPosition(L.w - L.pad, L.pad);
    } else if (corner === 'bottom-left') {
        label.setOrigin(0, 1).setPosition(L.pad, L.h - L.pad);
    } else {
        label.setOrigin(0, 0).setPosition(L.pad, L.pad);
    }

    // Soft pulse so it reads as live / in-progress, not a watermark.
    scene.tweens.add({
        targets: label,
        alpha: { from: 0.85, to: 1 },
        duration: 1400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    return label;
}
