// ============================================
// REALMS OF AETHERIA - COMBAT VFX
// ============================================
//
// Plays short spritesheet bursts from public/assets/fx. The resilient loader
// delivers each sheet as a plain image; we re-slice it into frames the first
// time a scene asks for an effect. Missing textures degrade silently.
// ============================================

/** Compact VFX packs already shipped in the APK (small variants only). */
export const FX_MANIFEST = [
    {
        key: 'fx_hit',
        file: 'assets/fx/impacts/symmetrical_impact_001/symmetrical_impact_001_small_yellow/spritesheet.png',
        frameWidth: 48,
        frameHeight: 48,
        endFrame: 6,
        anim: 'fx_hit_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_crit',
        file: 'assets/fx/explosions/stylized_explosion_001/stylized_explosion_001_small_yellow/spritesheet.png',
        frameWidth: 48,
        frameHeight: 48,
        endFrame: 8,
        anim: 'fx_crit_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_heal',
        file: 'assets/fx/spells/spell_heal_001/spell_heal_001_small_red/spritesheet.png',
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 15,
        anim: 'fx_heal_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_sparkle',
        file: 'assets/fx/bursts/round_sparkle_burst_001/round_sparkle_burst_001_small_blue/spritesheet.png',
        frameWidth: 32,
        frameHeight: 32,
        endFrame: 13,
        anim: 'fx_sparkle_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_lightning',
        file: 'assets/fx/lightning/lightning_strike_001/lightning_strike_001_small_violet/spritesheet.png',
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 6,
        anim: 'fx_lightning_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_poison',
        file: 'assets/fx/spells/spell_poison_001/spell_poison_001_small_green/spritesheet.png',
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 16,
        anim: 'fx_poison_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_guard',
        file: 'assets/fx/spells/spell_defense_up_001/spell_defense_up_001_small_blue/spritesheet.png',
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 17,
        anim: 'fx_guard_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_buff',
        file: 'assets/fx/spells/spell_attack_up_001/spell_attack_up_001_small_red/spritesheet.png',
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 17,
        anim: 'fx_buff_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_death',
        file: 'assets/fx/spells/spell_death_001/spell_death_001_small_red/spritesheet.png',
        frameWidth: 32,
        frameHeight: 32,
        endFrame: 19,
        anim: 'fx_death_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_boom',
        file: 'assets/fx/explosions/epic_explosion_001/epic_explosion_001_small_orange/spritesheet.png',
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 12,
        anim: 'fx_boom_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_haste',
        file: 'assets/fx/spells/spell_haste_001/spell_haste_001_small_green/spritesheet.png',
        frameWidth: 64,
        frameHeight: 64,
        endFrame: 19,
        anim: 'fx_haste_anim',
        group: 'gameplay',
    },
    {
        key: 'fx_burst',
        file: 'assets/fx/bursts/round_firework_burst_001/round_firework_burst_001_small_green/spritesheet.png',
        frameWidth: 48,
        frameHeight: 48,
        endFrame: 14,
        anim: 'fx_burst_anim',
        group: 'gameplay',
    },
];

export class EffectsSystem {
    /** Turn a loaded full-sheet image into a Phaser spritesheet (once). */
    static prepareSheet(scene, fx) {
        if (!scene.textures.exists(fx.key)) return false;

        const tex = scene.textures.get(fx.key);
        if (tex.frameTotal > 1) return true;

        const source = tex.getSourceImage();
        if (!source) return false;

        try {
            scene.textures.remove(fx.key);
            scene.textures.addSpriteSheet(fx.key, source, {
                frameWidth: fx.frameWidth,
                frameHeight: fx.frameHeight,
            });
            return true;
        } catch (err) {
            console.warn(`[fx] could not slice ${fx.key}:`, err);
            return false;
        }
    }

    /** Register spritesheet frames + animations. Safe to call repeatedly. */
    static ensureAnims(scene) {
        for (const fx of FX_MANIFEST) {
            if (!EffectsSystem.prepareSheet(scene, fx)) continue;
            if (scene.anims.exists(fx.anim)) continue;

            scene.anims.create({
                key: fx.anim,
                frames: scene.anims.generateFrameNumbers(fx.key, {
                    start: 0,
                    end: fx.endFrame,
                }),
                frameRate: 20,
                hideOnComplete: true,
            });
        }
    }

    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {string} kind  hit|crit|heal|sparkle|lightning|poison|guard|buff|death|boom|haste|burst
     * @param {object} [opts]
     */
    static play(scene, x, y, kind, opts = {}) {
        const settings = window.__aetheriaSettings || {};
        if (settings.particles === false || settings.graphics === 'low') {
            if (!opts.force) return null;
        }

        const key = `fx_${kind}`;
        const anim = `${key}_anim`;
        if (!scene.textures.exists(key)) return null;

        EffectsSystem.ensureAnims(scene);
        if (!scene.textures.exists(key)) return null;

        const sprite = scene.add.sprite(x, y, key)
            .setDepth(opts.depth ?? 150)
            .setScale(opts.scale ?? 1.6)
            .setBlendMode(Phaser.BlendModes.ADD);

        if (opts.tint != null && sprite.setTint) sprite.setTint(opts.tint);

        if (scene.anims.exists(anim)) {
            sprite.play(anim);
            sprite.once('animationcomplete', () => sprite.destroy());
        } else {
            scene.tweens.add({
                targets: sprite,
                alpha: 0,
                scale: (opts.scale ?? 1.6) * 1.4,
                duration: 350,
                onComplete: () => sprite.destroy(),
            });
        }

        return sprite;
    }

    /** Soft camera kick for hits / crits. */
    static shake(scene, intensity = 0.004, duration = 120) {
        const settings = window.__aetheriaSettings || {};
        if (settings.screenShake === false || settings.graphics === 'low') return;
        scene.cameras?.main?.shake(duration, intensity);
    }

    /** Brief freeze-frame — the AAA “hit stop” feel. */
    static hitStop(scene, ms = 60) {
        const settings = window.__aetheriaSettings || {};
        if (settings.graphics === 'low') return;
        try {
            const prev = scene.tweens.timeScale;
            scene.tweens.timeScale = 0.08;
            // Real-time restore so Clock timeScale can't strand us paused.
            window.setTimeout(() => {
                try {
                    if (scene.sys?.isActive()) scene.tweens.timeScale = prev || 1;
                } catch { /* scene gone */ }
            }, ms);
        } catch {
            /* ignore */
        }
    }

    /** Full-screen white/colour flash. */
    static flash(scene, color = 0xffffff, alpha = 0.35, ms = 80) {
        const settings = window.__aetheriaSettings || {};
        if (settings.graphics === 'low') return;
        const cam = scene.cameras.main;
        const g = scene.add.rectangle(cam.centerX, cam.centerY, cam.width, cam.height, color, alpha)
            .setScrollFactor(0)
            .setDepth(400);
        scene.tweens.add({
            targets: g,
            alpha: 0,
            duration: ms,
            onComplete: () => g.destroy(),
        });
    }

    /** Tint-flash a combatant sprite. */
    static flashTarget(scene, target, color = 0xffffff, ms = 120) {
        if (!target || !target.setTint) return;
        const prev = target.tintTopLeft;
        target.setTint(color);
        scene.time.delayedCall(ms, () => {
            if (!target.active) return;
            if (prev === 0xffffff || prev == null) target.clearTint?.();
            else target.setTint(prev);
        });
    }

    /**
     * Floating combat text (damage, heal, PERFECT, etc).
     * @param {'dmg'|'crit'|'heal'|'info'|'perfect'|'guard'} style
     */
    static floatText(scene, x, y, text, style = 'dmg') {
        const styles = {
            dmg: { color: '#ffffff', size: 22 },
            crit: { color: '#ff6b35', size: 32 },
            heal: { color: '#2ecc71', size: 24 },
            info: { color: '#f0e6d3', size: 18 },
            perfect: { color: '#ffd700', size: 28 },
            guard: { color: '#5dade2', size: 22 },
        };
        const s = styles[style] || styles.dmg;
        const t = scene.add.text(x, y, text, {
            fontFamily: 'Georgia, serif',
            fontSize: `${s.size}px`,
            color: s.color,
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(200);

        scene.tweens.add({
            targets: t,
            y: y - 70,
            alpha: 0,
            scaleX: style === 'crit' || style === 'perfect' ? 1.25 : 1.05,
            scaleY: style === 'crit' || style === 'perfect' ? 1.25 : 1.05,
            duration: style === 'crit' ? 1100 : 900,
            ease: 'Cubic.easeOut',
            onComplete: () => t.destroy(),
        });
        return t;
    }
}
