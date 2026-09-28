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
                frameRate: 18,
                hideOnComplete: true,
            });
        }
    }

    /**
     * @param {Phaser.Scene} scene
     * @param {number} x
     * @param {number} y
     * @param {'hit'|'crit'|'heal'|'sparkle'|'lightning'} kind
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
}
