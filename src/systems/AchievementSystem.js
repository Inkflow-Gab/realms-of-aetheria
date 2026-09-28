// ============================================
// REALMS OF AETHERIA - ACHIEVEMENT SYSTEM
// ============================================
//
// Watches the player and running stats, unlocks achievements the first time
// their condition is met, grants the reward, and shows a notification.
//
// The notification is deliberately not a toast that vanishes in two seconds:
// an achievement is the game telling the player "that mattered", so the panel
// stays up until dismissed and spells out exactly what was won.
// ============================================

import { ACHIEVEMENTS } from '../data/Achievements.js';
import { layout } from '../ui/Layout.js';

export class AchievementSystem {
    constructor(player) {
        this.player = player;
        /** Set of achievement ids already unlocked. Persisted with the save. */
        this.unlocked = new Set(player.achievements || []);
        /** Queued so two achievements unlocking on the same tick both show. */
        this.queue = [];
        this.showing = false;
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;
    }

    // ---------------------------------------------------------------
    // Checking
    // ---------------------------------------------------------------

    /**
     * Evaluate every locked achievement against the current player.
     *
     * Called after combat, looting, levelling, zone changes and spending --
     * never per frame. Tests are cheap and short-circuit on the first pass.
     */
    check() {
        if (!this.player) return;

        for (const a of ACHIEVEMENTS) {
            if (this.unlocked.has(a.id)) continue;
            let passed = false;
            try {
                passed = a.test(this.player);
            } catch {
                passed = false;
            }
            if (passed) this.unlock(a);
        }

        this.pump();
    }

    // ---------------------------------------------------------------
    // Unlocking
    // ---------------------------------------------------------------

    unlock(achievement) {
        if (this.unlocked.has(achievement.id)) return;
        this.unlocked.add(achievement.id);
        this.queue.push(achievement);
    }

    isUnlocked(id) {
        return this.unlocked.has(id);
    }

    get unlockedCount() {
        return this.unlocked.size;
    }

    /** Pull the next queued achievement into the notification panel. */
    pump() {
        if (this.showing || !this.queue.length || !this.scene) return;
        this.showing = true;
        this.show(this.queue.shift());
    }

    // ---------------------------------------------------------------
    // Rewards
    // ---------------------------------------------------------------

    /**
     * Grant an achievement's reward to the player.
     *
     * Rewards are applied silently -- the notification panel is what tells the
     * player they got something, so the grant itself must not also print.
     */
    grant(achievement) {
        const r = achievement.reward || {};
        const p = this.player;

        if (r.gold) p.gold += r.gold;
        if (r.exp) p.gainExp(r.exp);
        if (r.item) p.addItem(r.item, 1);
    }

    // ---------------------------------------------------------------
    // Notification
    // ---------------------------------------------------------------

    show(achievement) {
        const scene = this.scene;
        const L = layout(scene);

        this.grant(achievement);

        const r = achievement.reward || {};
        const rewardLines = [];
        if (r.gold) rewardLines.push(`${r.gold} Gold`);
        if (r.exp) rewardLines.push(`${r.exp} EXP`);
        if (r.item) rewardLines.push(this.itemName(r.item));

        // Backdrop plate so the panel is readable over any zone.
        const panelW = Math.min(L.w * 0.72, L.font(420));
        const panelH = L.font(150);
        const px = L.cx - panelW / 2;
        const py = L.h * 0.16;

        const bg = scene.add.graphics().setScrollFactor(0).setDepth(900);
        bg.fillStyle(0x0a0a1a, 0.94);
        bg.fillRoundedRect(px, py, panelW, panelH, 12);
        bg.lineStyle(2, 0xffd700, 0.9);
        bg.strokeRoundedRect(px, py, panelW, panelH, 12);

        const title = scene.add.text(L.cx, py + L.font(18), 'ACHIEVEMENT UNLOCKED', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(15)}px`,
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(901);

        const name = scene.add.text(L.cx, py + L.font(44), achievement.name, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(24)}px`,
            color: '#f0e6d3',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(901);

        const desc = scene.add.text(L.cx, py + L.font(80), achievement.desc, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#c9a84c',
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(901);

        const rewards = scene.add.text(
            L.cx,
            py + L.font(104),
            rewardLines.length ? `Reward: ${rewardLines.join('  ·  ')}` : 'Reward: --',
            {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(13)}px`,
                color: '#8aff8a',
                stroke: '#000',
                strokeThickness: 2,
            }
        ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(901);

        const hint = scene.add.text(L.cx, py + panelH - L.font(22), 'tap to continue', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(11)}px`,
            color: '#888888',
        }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(901);

        const dismiss = () => {
            [bg, title, name, desc, rewards, hint].forEach((o) => o.destroy());
            this.showing = false;
            this.pump();
        };

        // Tap anywhere to dismiss, or auto-dismiss after a while so the game
        // is never hard-blocked if the player is mid-fight.
        const zone = scene.add.zone(L.cx, L.cy, L.w, L.h)
            .setScrollFactor(0)
            .setDepth(902)
            .setInteractive();
        zone.on('pointerdown', dismiss);
        scene.time.delayedCall(6000, () => {
            if (zone.active) dismiss();
        });

        // Entrance animation.
        [bg, title, name, desc, rewards, hint].forEach((o) => o.setAlpha(0));
        scene.tweens.add({
            targets: [bg, title, name, desc, rewards, hint],
            alpha: 1,
            duration: 260,
            ease: 'Sine.easeOut',
        });
    }

    itemName(itemId) {
        // Lazy import avoidance: Items is a plain map, safe to read directly.
        const { ITEMS } = AchievementSystem._items || {};
        return (ITEMS && ITEMS[itemId]?.name) || itemId;
    }

    // ---------------------------------------------------------------
    // Persistence
    // ---------------------------------------------------------------

    serialize() {
        return [...this.unlocked];
    }

    static hydrate(player, ids) {
        player.achievements = Array.isArray(ids) ? ids : [];
        return new AchievementSystem(player);
    }
}

// Items is bound lazily so this module has no import cycle with data/Items.
import { ITEMS } from '../data/Items.js';
AchievementSystem._items = { ITEMS };
