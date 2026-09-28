// ============================================
// REALMS OF AETHERIA - WORLD LOAD SCENE
// ============================================
//
// The interstitial between "Begin Adventure" / Continue and the live World.
//
// WHY IT EXISTS
// -------------
// Tile / monster / NPC textures are deferred. Jumping straight into World
// before they arrive left phones on a black / frozen frame -- which is what
// players reported as "Begin Adventure freezes my screen".
//
// This scene:
//   1. Shows a cinematic loading beat matching the boot screen vibe
//   2. Finishes loading gameplay assets (or waits briefly if already done)
//   3. Hands off to World only when it is safe to draw
// ============================================

import { layout, addBetaBadge } from '../ui/Layout.js';
import { getDeferredAssets } from '../data/AssetManifest.js';
import { ResilientLoader } from '../systems/ResilientLoader.js';

const PHRASES = [
    'Please wait — your pixel world is being built...',
    'Carving rivers through the meadows...',
    'Awakening the villagers of Aetheria...',
    'Lighting Brom\'s forge for the first time...',
    'Seeding grass across the realm...',
    'Painting twilight into the mountain peaks...',
    'Whispering names into unfinished legends...',
    'Sharpening steel and steadying courage...',
    'Almost ready — destiny awaits...',
];

const MIN_DISPLAY_MS = 2200;

export class WorldLoadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldLoad' });
    }

    init(data = {}) {
        this.payload = {
            player: data.player || null,
            loadSave: !!data.loadSave,
        };
        this._startedAt = Date.now();
        this._done = false;
    }

    create() {
        const L = layout(this);
        this.cameras.main.setBackgroundColor('#0a0a1a');
        this.cameras.main.setAlpha(1);
        this.cameras.main.setZoom(1);

        // Backdrop — same art language as the HTML boot loader.
        // Do NOT tween scale after setDisplaySize (collapses to tiny art).
        if (this.textures.exists('bg_1')) {
            const bg = this.add.image(L.cx, L.cy, 'bg_1')
                .setDisplaySize(L.w * 1.06, L.h * 1.06)
                .setAlpha(0.55);
            this.tweens.add({
                targets: bg,
                x: L.cx + 8,
                duration: 10000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            });
        }

        // Vignette grade
        const grade = this.add.graphics().setDepth(1);
        grade.fillStyle(0x0a0a1a, 0.55);
        grade.fillRect(0, 0, L.w, L.h);
        grade.fillStyle(0x0a0a1a, 0.0);
        // Soft radial feel via overlapping rects
        grade.fillStyle(0x0a0a1a, 0.35);
        grade.fillRect(0, 0, L.w, L.h * 0.18);
        grade.fillRect(0, L.h * 0.82, L.w, L.h * 0.18);

        addBetaBadge(this, 'top-left');

        // Title
        this.add.text(L.cx, L.y(0.22), 'REALMS OF AETHERIA', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(28)}px`,
            color: '#f0e6d3',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5).setDepth(5);

        this.add.text(L.cx, L.y(0.22) + L.font(28), 'BUILDING YOUR WORLD', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#c9a84c',
            letterSpacing: 3,
        }).setOrigin(0.5).setDepth(5);

        // Progress ring (drawn with graphics)
        this.ring = this.add.graphics().setDepth(6);
        this.ringPct = this.add.text(L.cx, L.y(0.48), '0%', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(28)}px`,
            color: '#f0e6d3',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(7);

        // Phrase
        this.phrase = this.add.text(L.cx, L.y(0.66), PHRASES[0], {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(15)}px`,
            color: '#d8c9a0',
            fontStyle: 'italic',
            align: 'center',
            wordWrap: { width: L.w * 0.78 },
        }).setOrigin(0.5).setDepth(5);

        // Slim bar
        const barW = Math.min(420, L.w * 0.7);
        const barH = 8;
        const barX = L.cx - barW / 2;
        const barY = L.y(0.58);
        this.add.rectangle(L.cx, barY, barW, barH, 0x0a0a1a, 0.85)
            .setStrokeStyle(1, 0xc9a84c, 0.35)
            .setDepth(5);
        this.barFill = this.add.rectangle(barX, barY, 4, barH - 2, 0xc9a84c)
            .setOrigin(0, 0.5)
            .setDepth(6);

        this.drawRing(0);
        this.spawnMotes();

        // Rotate flavour text
        this.phraseIndex = 0;
        this.time.addEvent({
            delay: 1600,
            loop: true,
            callback: () => this.nextPhrase(),
        });

        // Kick off asset readiness
        this.ensureWorldAssets();
    }

    drawRing(pct) {
        const L = layout(this);
        const r = Math.max(42, L.font(52));
        const cx = L.cx;
        const cy = L.y(0.48);
        this.ring.clear();
        this.ring.lineStyle(5, 0xc9a84c, 0.18);
        this.ring.strokeCircle(cx, cy, r);
        this.ring.lineStyle(5, 0xffd700, 1);
        this.ring.beginPath();
        this.ring.arc(cx, cy, r, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(-90 + 360 * pct), false);
        this.ring.strokePath();
        this.ringPct.setText(`${Math.floor(pct * 100)}%`);
    }

    setProgress(pct) {
        pct = Phaser.Math.Clamp(pct, 0, 1);
        this.drawRing(pct);
        const L = layout(this);
        const barW = Math.min(420, L.w * 0.7);
        this.barFill.width = Math.max(4, barW * pct);
    }

    nextPhrase() {
        if (this._done || !this.phrase) return;
        this.phraseIndex = (this.phraseIndex + 1) % PHRASES.length;
        this.tweens.add({
            targets: this.phrase,
            alpha: 0,
            duration: 220,
            onComplete: () => {
                if (!this.phrase) return;
                this.phrase.setText(PHRASES[this.phraseIndex]);
                this.tweens.add({ targets: this.phrase, alpha: 1, duration: 280 });
            },
        });
    }

    spawnMotes() {
        const L = layout(this);
        for (let i = 0; i < 14; i++) {
            const m = this.add.circle(
                Phaser.Math.Between(10, L.w - 10),
                Phaser.Math.Between(L.h * 0.4, L.h + 40),
                Phaser.Math.FloatBetween(1.2, 2.8),
                0xc9a84c,
                0.55
            ).setDepth(2);
            this.tweens.add({
                targets: m,
                y: m.y - Phaser.Math.Between(180, 340),
                alpha: 0,
                duration: Phaser.Math.Between(4200, 7800),
                delay: Phaser.Math.Between(0, 2500),
                repeat: -1,
                onRepeat: () => {
                    m.x = Phaser.Math.Between(10, L.w - 10);
                    m.y = L.h + 20;
                    m.alpha = 0.55;
                },
            });
        }
    }

    /** True when the textures World needs to paint are already in the cache. */
    worldReady() {
        return this.textures.exists('tile_Grass_Middle')
            && this.textures.exists('bg_1');
    }

    async ensureWorldAssets() {
        try {
            // Soft synthetic progress while we work, so the bar never sits dead.
            let fake = 0.05;
            this.setProgress(fake);
            const pulse = this.time.addEvent({
                delay: 120,
                loop: true,
                callback: () => {
                    if (this._done) return;
                    fake = Math.min(0.92, fake + 0.012);
                    this.setProgress(Math.max(fake, this._realPct || 0));
                },
            });

            if (!this.worldReady()) {
                const needed = getDeferredAssets().filter((a) =>
                    a.group === 'gameplay' && !/\.(ogg|mp3|wav|m4a)$/i.test(a.file)
                );
                // Prefer tiles/npcs/monsters first — those paint the first frame.
                needed.sort((a, b) => {
                    const score = (x) =>
                        (x.key.startsWith('tile_') ? 0 : x.key.startsWith('npc_') ? 1 : x.key.startsWith('monster_') ? 2 : 3);
                    return score(a) - score(b);
                });

                const loader = new ResilientLoader(this, {
                    concurrency: 6,
                    deadline: 14000,
                    retries: 1,
                });

                await loader.loadAll(needed, ({ done, total }) => {
                    this._realPct = 0.08 + (done / Math.max(1, total)) * 0.88;
                    this.setProgress(this._realPct);
                });
            } else {
                // Already warm — still linger so the beat feels intentional.
                for (let p = 0.2; p <= 1; p += 0.15) {
                    this.setProgress(p);
                    await this.wait(180);
                }
            }

            pulse.remove(false);
            this.setProgress(1);
            this.phrase?.setText('Your world awaits...');

            const elapsed = Date.now() - this._startedAt;
            if (elapsed < MIN_DISPLAY_MS) {
                await this.wait(MIN_DISPLAY_MS - elapsed);
            }

            this.enterWorld();
        } catch (err) {
            console.error('[WorldLoad] failed:', err);
            // Never trap the player — enter anyway with whatever we have.
            this.phrase?.setText('Entering with what we have...');
            await this.wait(600);
            this.enterWorld();
        }
    }

    wait(ms) {
        return new Promise((resolve) => this.time.delayedCall(ms, resolve));
    }

    enterWorld() {
        if (this._done) return;
        this._done = true;
        // No fadeOut here — it can leave the next scene on a black camera.
        this.scene.start('World', this.payload);
    }
}
