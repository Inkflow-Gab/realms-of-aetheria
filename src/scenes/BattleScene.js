// ============================================
// REALMS OF AETHERIA - BATTLE SCENE
// ============================================
//
// AAA-feel turn combat:
//   • Perfect Timing strikes (tap the gold window)
//   • Combo meter + Guard
//   • Hit-stop, flashes, knockback, telegraph
//   • Skill buffs / poison / stun
//   • Victory loot board with rarity colours
// ============================================

import { MONSTERS } from '../data/Monsters.js';
import { SKILLS } from '../data/Skills.js';
import { ITEMS } from '../data/Items.js';
import { UIComponents } from '../ui/UIComponents.js';
import { layout, addBetaBadge } from '../ui/Layout.js';
import { GAME_CONFIG } from '../config/GameConfig.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { EffectsSystem } from '../systems/EffectsSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { LootSystem } from '../systems/LootSystem.js';
import { MONSTER_SKILLS } from '../data/Monsters.js';

const RARITY_COLOR = {
    common: '#aaaaaa',
    uncommon: '#2ecc71',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#ffd700',
};

export class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Battle' });
    }

    init(data) {
        this.player = data.player;
        this.monsterId = data.monsterId;
        this.monsterSprite = data.monsterSprite;
        this.monsterHpBar = data.monsterHpBar;
        this.worldMonsterRef = data.monsterRef || null;
    }

    create() {
        const L = layout(this);
        const width = L.w;
        const height = L.h;

        this.audio = new AudioSystem();
        this.audio.init(this);
        this.questSystem = new QuestSystem(this.player, this);
        this.achievements = new AchievementSystem(this.player);
        this.achievements.init(this);
        EffectsSystem.ensureAnims(this);
        addBetaBadge(this, 'top-right');

        const monsterData = MONSTERS[this.monsterId];
        this.monsterData = monsterData;

        // Dramatic backdrop
        const zoneBg = this.textures.exists('bg_5') ? 'bg_5'
            : (this.textures.exists('bg_7') ? 'bg_7' : null);
        if (zoneBg) {
            this.add.image(width / 2, height / 2, zoneBg).setDisplaySize(width * 1.05, height * 1.05);
        }
        const overlay = this.add.graphics().setDepth(1);
        overlay.fillStyle(0x0a0a1a, 0.62);
        overlay.fillRect(0, 0, width, height);
        // Vignette strips
        overlay.fillStyle(0x0a0a1a, 0.45);
        overlay.fillRect(0, 0, width, height * 0.12);
        overlay.fillRect(0, height * 0.78, width, height * 0.22);

        // === MONSTER ===
        const monsterKey = `monster_${String(monsterData.sprite).split('/').pop().replace('.png', '')}`;
        const monsterX = width / 2 + Math.min(220, width * 0.18);
        const monsterY = height / 2 - Math.max(40, height * 0.08);
        if (this.textures.exists(monsterKey)) {
            this.monsterDisplay = this.add.image(monsterX, monsterY, monsterKey)
                .setScale((monsterData.scale || 1) * 2.1)
                .setDepth(10);
        } else {
            this.monsterDisplay = this.add.rectangle(monsterX, monsterY, 80, 80, monsterData.tint || 0xe74c3c)
                .setDepth(10);
        }
        if (monsterData.tint && this.monsterDisplay.setTint) {
            this.monsterDisplay.setTint(monsterData.tint);
        }
        this.monsterHomeX = monsterX;
        this.monsterHomeY = monsterY;

        this.monsterNameText = this.add.text(monsterX, monsterY - Math.max(110, height * 0.18), `${monsterData.name}  Lv.${monsterData.level}`, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(20)}px`,
            color: '#e74c3c',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(12);

        this.monsterHpBarUI = UIComponents.createBar(
            this, monsterX - 100, monsterY - Math.max(85, height * 0.14),
            200, 18, monsterData.hp, monsterData.hp, GAME_CONFIG.COLORS.HP
        );

        // Idle bob
        this.tweens.add({
            targets: this.monsterDisplay,
            y: monsterY - 6,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // === PLAYER ===
        const charKey = `char_${this.player.avatarIndex}`;
        const playerX = width / 2 - Math.min(220, width * 0.18);
        const playerY = monsterY;
        if (this.textures.exists(charKey)) {
            this.playerDisplay = this.add.image(playerX, playerY, charKey)
                .setScale(2.1)
                .setDepth(10);
        } else {
            this.playerDisplay = this.add.rectangle(playerX, playerY, 72, 72, 0xc9a84c)
                .setDepth(10);
        }
        this.playerHomeX = playerX;
        this.playerHomeY = playerY;

        this.add.text(playerX, playerY - Math.max(110, height * 0.18), `${this.player.name}  Lv.${this.player.level}`, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(20)}px`,
            color: '#c9a84c',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(12);

        this.playerHpBar = UIComponents.createBar(
            this, playerX - 100, playerY - Math.max(85, height * 0.14),
            200, 18, this.player.hp, this.player.maxHp, GAME_CONFIG.COLORS.HP
        );
        this.playerMpBar = UIComponents.createBar(
            this, playerX - 100, playerY - Math.max(62, height * 0.11),
            200, 12, this.player.mp, this.player.maxMp, GAME_CONFIG.COLORS.MP
        );

        // Combo HUD
        this.combo = 0;
        this.perfectHits = 0;
        this.comboText = this.add.text(L.cx, L.y(0.08), '', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(18)}px`,
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(20).setAlpha(0);

        // Combat log
        this.combatLog = [];
        this.combatLogText = this.add.text(L.pad, height - Math.max(150, height * 0.28), '', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#f0e6d3',
            wordWrap: { width: Math.min(380, width * 0.38) },
            lineSpacing: 3,
        }).setDepth(20);

        // State
        this.inCombat = true;
        this.monsterCurrentHp = monsterData.hp;
        this.turnCooldown = false;
        this.guarding = false;
        this.playerAtkBuff = 1;
        this.monsterAtkBuff = 1;
        this.monsterStunned = false;
        this.monsterPoisonTurns = 0;
        this.playerPoisonTurns = 0;
        this.timingActive = false;
        this._actionButtons = [];
        this.isBoss = !!(monsterData.boss || monsterData.finalBoss);
        this.bossPhase = 1;
        this.monsterMp = monsterData.mp || 0;

        this.createActionButtons();

        if (this.isBoss) {
            this.addLog(`⚠ BOSS: ${monsterData.name}!`);
            EffectsSystem.play(this, monsterX, monsterY, 'boom', { scale: 2.4 });
            EffectsSystem.flash(this, 0x8b0000, 0.35, 220);
            this.monsterNameText.setColor('#ff6b35');
        } else {
            this.addLog(`A wild ${monsterData.name} appears!`);
            EffectsSystem.play(this, monsterX, monsterY, 'sparkle', { scale: 2.2 });
        }
        this.addLog('Tap Attack, then strike in the gold window!');
        this.audio.playMusic('battle');
        this.audio.play(this.isBoss ? 'roar' : 'whoosh');
        EffectsSystem.flash(this, this.isBoss ? 0xff4444 : 0xc9a84c, 0.2, 200);
    }

    createActionButtons() {
        // Clear old
        (this._actionButtons || []).forEach((b) => b?.destroy?.());
        this._actionButtons = [];

        const L = layout(this);
        const btnH = Math.max(42, L.font(46));
        const y = L.bottom(L.pad + btnH / 2);
        const attackW = Math.max(96, L.font(100));

        const mk = (x, label, fn, opts) => {
            const b = UIComponents.createButton(this, x, y, label, fn, {
                height: btnH,
                fontSize: L.font(14),
                ...opts,
            });
            this._actionButtons.push(b);
            return b;
        };

        mk(L.x(0.12), 'Attack', () => this.beginTimingAttack(), {
            width: attackW, bgColor: 0x8b0000, variant: 'danger',
        });

        mk(L.x(0.28), 'Guard', () => this.playerGuard(), {
            width: Math.max(78, L.font(82)), bgColor: 0x1a3a5a, variant: 'ghost',
        });

        const skills = (this.player.skills || []).slice(0, 3);
        const skillW = Math.max(68, Math.min(90, (L.w * 0.36) / Math.max(1, skills.length) - 4));
        skills.forEach((skillId, i) => {
            const skill = SKILLS[skillId];
            if (!skill) return;
            mk(L.x(0.42) + i * (skillW + 5), skill.name.split(' ')[0], () => this.playerUseSkill(skillId), {
                width: skillW, fontSize: L.font(11), bgColor: 0x2a2a6a,
            });
        });

        mk(L.x(0.78), 'Potion', () => this.usePotion(), {
            width: Math.max(74, L.font(80)), bgColor: 0x2a4a2a, variant: 'primary',
        });

        mk(L.right(L.pad + 34), 'Flee', () => this.flee(), {
            width: Math.max(60, L.font(66)), bgColor: 0x4a2a2a, variant: 'ghost',
        });
    }

    setCombo(n) {
        this.combo = Math.max(0, n);
        if (this.combo >= 2) {
            this.comboText.setText(`COMBO x${this.combo}`);
            this.comboText.setAlpha(1);
            this.tweens.add({
                targets: this.comboText,
                scaleX: 1.15,
                scaleY: 1.15,
                duration: 120,
                yoyo: true,
            });
        } else {
            this.comboText.setAlpha(0);
        }
    }

    // ---------------------------------------------------------------
    // PERFECT TIMING ATTACK
    // ---------------------------------------------------------------
    beginTimingAttack() {
        if (this.turnCooldown || !this.inCombat || this.timingActive) return;
        this.timingActive = true;
        this.turnCooldown = true;

        const L = layout(this);
        const barW = Math.min(320, L.w * 0.55);
        const barH = 22;
        const cx = L.cx;
        const cy = L.y(0.72);

        this.timingLayer = this.add.container(0, 0).setDepth(300);

        const hint = this.add.text(cx, cy - 36, 'TAP when the marker hits GOLD!', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(14)}px`,
            color: '#f0e6d3',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5);
        this.timingLayer.add(hint);

        const track = this.add.rectangle(cx, cy, barW, barH, 0x1a1a2e, 0.95)
            .setStrokeStyle(2, 0xc9a84c, 0.7);
        this.timingLayer.add(track);

        // Sweet zone (~18% of bar, slightly right of center)
        const sweetW = barW * 0.18;
        const sweetX = cx + barW * 0.12;
        const sweet = this.add.rectangle(sweetX, cy, sweetW, barH - 4, 0xc9a84c, 0.85);
        this.timingLayer.add(sweet);

        // Good zone around sweet
        const goodW = barW * 0.34;
        const good = this.add.rectangle(sweetX, cy, goodW, barH - 4, 0x2ecc71, 0.35);
        this.timingLayer.add(good);
        this.timingLayer.sendToBack(good);

        const marker = this.add.rectangle(cx - barW / 2 + 4, cy, 6, barH + 8, 0xffffff)
            .setDepth(301);
        this.timingLayer.add(marker);

        const duration = 780;
        const startX = cx - barW / 2 + 4;
        const endX = cx + barW / 2 - 4;
        marker.x = startX;

        this._timingResolved = false;
        const resolve = (forcedMiss = false) => {
            if (this._timingResolved) return;
            this._timingResolved = true;

            const pos = marker.x;
            const dist = Math.abs(pos - sweetX);
            let grade = 'miss';
            if (!forcedMiss) {
                if (dist <= sweetW / 2) grade = 'perfect';
                else if (dist <= goodW / 2) grade = 'good';
            }

            this.timingLayer?.destroy(true);
            this.timingLayer = null;
            this.timingActive = false;
            if (this._timingTap) {
                this.input.off('pointerdown', this._timingTap);
                this._timingTap = null;
            }
            this.executeAttack(grade);
        };

        this._timingTap = () => resolve(false);
        this.input.on('pointerdown', this._timingTap);

        this.tweens.add({
            targets: marker,
            x: endX,
            duration,
            ease: 'Linear',
            onComplete: () => resolve(true),
        });
    }

    executeAttack(grade = 'good') {
        if (!this.inCombat) return;

        const mult = grade === 'perfect' ? 1.55 : grade === 'good' ? 1.2 : 0.85;
        if (grade === 'perfect') {
            this.perfectHits++;
            this.setCombo(this.combo + 1);
            EffectsSystem.floatText(this, this.monsterDisplay.x, this.monsterDisplay.y - 90, 'PERFECT!', 'perfect');
            this.audio.play('crit');
        } else if (grade === 'good') {
            this.setCombo(this.combo + 1);
            EffectsSystem.floatText(this, this.monsterDisplay.x, this.monsterDisplay.y - 90, 'GOOD!', 'info');
            this.audio.play('attack');
        } else {
            this.setCombo(0);
            EffectsSystem.floatText(this, this.monsterDisplay.x, this.monsterDisplay.y - 90, 'WHIFF', 'info');
            this.audio.play('whoosh');
        }

        // Lunge
        this.tweens.add({
            targets: this.playerDisplay,
            x: this.playerHomeX + 70,
            duration: 110,
            yoyo: true,
            ease: 'Cubic.easeOut',
        });

        const weaponPerk = this.player.equipment?.weapon?.perk;
        let damage = Math.max(1, this.player.atk * this.playerAtkBuff - Math.floor(this.monsterData.def * 0.3));
        if (weaponPerk?.bonusVsBoss && /boss|dragon|yeti|king/i.test(this.monsterData.name || '')) {
            damage = Math.floor(damage * 1.15);
        }

        // Combo bonus
        if (this.combo >= 2) {
            damage = Math.floor(damage * (1 + Math.min(0.35, (this.combo - 1) * 0.06)));
        }

        let critChance = 0.05 + this.player.luk * 0.005;
        if (weaponPerk?.critBonus) critChance += weaponPerk.critBonus;
        if (grade === 'perfect') critChance += 0.2;
        const isCrit = Math.random() < critChance;
        let finalDamage = Math.floor(damage * mult * (isCrit ? 1.6 : 1));

        if (weaponPerk?.lifesteal) {
            const heal = Math.floor(finalDamage * weaponPerk.lifesteal);
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
            this.playerHpBar.updateValue(this.player.hp, this.player.maxHp);
            if (heal > 0) EffectsSystem.floatText(this, this.playerDisplay.x, this.playerDisplay.y - 40, `+${heal}`, 'heal');
        }
        if (weaponPerk?.mpOnHit) {
            this.player.mp = Math.min(this.player.maxMp, this.player.mp + weaponPerk.mpOnHit);
            this.playerMpBar.updateValue(this.player.mp, this.player.maxMp);
        }

        this.applyDamageToMonster(finalDamage, isCrit || grade === 'perfect');
        this.addLog(`${this.player.name} strikes for ${finalDamage}${isCrit ? ' CRITICAL!' : ''} (${grade.toUpperCase()})`);

        if (this.monsterCurrentHp <= 0) {
            this.onMonsterDefeated();
        } else {
            this.time.delayedCall(650, () => this.afterPlayerTurn());
        }
    }

    applyDamageToMonster(finalDamage, bigHit = false) {
        this.monsterCurrentHp = Math.max(0, this.monsterCurrentHp - finalDamage);
        this.monsterHpBarUI.updateValue(this.monsterCurrentHp, this.monsterData.hp);

        EffectsSystem.play(
            this,
            this.monsterDisplay.x,
            this.monsterDisplay.y,
            bigHit ? 'crit' : 'hit',
            { scale: bigHit ? 2.4 : 1.8 }
        );
        if (bigHit) EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'boom', { scale: 1.6 });

        EffectsSystem.shake(this, bigHit ? 0.014 : 0.006, bigHit ? 220 : 110);
        EffectsSystem.hitStop(this, bigHit ? 90 : 45);
        EffectsSystem.flashTarget(this, this.monsterDisplay, 0xffffff, 90);
        if (bigHit) EffectsSystem.flash(this, 0xff6b35, 0.22, 90);

        // Knockback
        this.tweens.add({
            targets: this.monsterDisplay,
            x: this.monsterHomeX + (bigHit ? 28 : 14),
            duration: 80,
            yoyo: true,
            ease: 'Quad.easeOut',
        });

        EffectsSystem.floatText(
            this,
            this.monsterDisplay.x,
            this.monsterDisplay.y - 50,
            `-${finalDamage}`,
            bigHit ? 'crit' : 'dmg'
        );
    }

    afterPlayerTurn() {
        if (!this.inCombat) return;
        // Poison tick on monster
        if (this.monsterPoisonTurns > 0) {
            const tick = Math.max(2, Math.floor(this.monsterData.hp * 0.04));
            this.monsterPoisonTurns--;
            this.monsterCurrentHp = Math.max(0, this.monsterCurrentHp - tick);
            this.monsterHpBarUI.updateValue(this.monsterCurrentHp, this.monsterData.hp);
            EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'poison', { scale: 1.5 });
            EffectsSystem.floatText(this, this.monsterDisplay.x + 30, this.monsterDisplay.y - 30, `-${tick}`, 'info');
            this.addLog(`Poison deals ${tick}!`);
            if (this.monsterCurrentHp <= 0) {
                this.onMonsterDefeated();
                return;
            }
        }

        if (this.monsterStunned) {
            this.monsterStunned = false;
            this.addLog(`${this.monsterData.name} is stunned!`);
            EffectsSystem.floatText(this, this.monsterDisplay.x, this.monsterDisplay.y - 70, 'STUNNED', 'info');
            this.turnCooldown = false;
            return;
        }

        this.telegraphThenAttack();
    }

    telegraphThenAttack() {
        // Red flash telegraph
        EffectsSystem.flashTarget(this, this.monsterDisplay, 0xff4444, 280);
        this.addLog(`${this.monsterData.name} winds up...`);
        this.time.delayedCall(320, () => this.monsterAttack());
    }

    playerGuard() {
        if (this.turnCooldown || !this.inCombat) return;
        this.turnCooldown = true;
        this.guarding = true;
        this.addLog(`${this.player.name} raises a guard!`);
        EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'guard', { scale: 1.8 });
        EffectsSystem.floatText(this, this.playerDisplay.x, this.playerDisplay.y - 60, 'GUARD', 'guard');
        this.audio.play('whoosh');
        this.time.delayedCall(400, () => this.afterPlayerTurn());
    }

    playerUseSkill(skillId) {
        if (this.turnCooldown || !this.inCombat) return;
        const skill = SKILLS[skillId];
        if (!skill) return;
        if (this.player.mp < skill.mpCost) {
            this.addLog('Not enough MP!');
            EffectsSystem.floatText(this, this.playerDisplay.x, this.playerDisplay.y - 50, 'No MP!', 'info');
            return;
        }

        this.turnCooldown = true;
        this.player.mp -= skill.mpCost;
        this.playerMpBar.updateValue(this.player.mp, this.player.maxMp);

        this.tweens.add({
            targets: this.playerDisplay,
            scaleX: (this.playerDisplay.scaleX || 2) * 1.12,
            scaleY: (this.playerDisplay.scaleY || 2) * 1.12,
            duration: 160,
            yoyo: true,
        });

        // Buffs / heals
        if (skill.type === 'buff' || skill.effect?.atkUp || skill.effect?.heal) {
            if (skill.effect?.atkUp) {
                this.playerAtkBuff = skill.effect.atkUp;
                this.time.delayedCall(skill.effect.duration || 8000, () => { this.playerAtkBuff = 1; });
                EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'buff', { scale: 1.8 });
                this.addLog(`${skill.name}! ATK up!`);
            }
            if (skill.effect?.heal || /heal|holy|divine|cure/i.test(skill.name)) {
                const healAmt = Math.floor(this.player.maxHp * (skill.effect?.heal || 0.25));
                this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
                this.playerHpBar.updateValue(this.player.hp, this.player.maxHp);
                EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'heal', { scale: 1.9 });
                EffectsSystem.floatText(this, this.playerDisplay.x, this.playerDisplay.y - 50, `+${healAmt}`, 'heal');
                this.addLog(`${skill.name} heals ${healAmt}!`);
            }
            if (skill.effect?.spdUp) {
                EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'haste', { scale: 1.6 });
            }
            this.audio.play('magic');
            this.setCombo(this.combo + 1);
            this.time.delayedCall(700, () => this.afterPlayerTurn());
            return;
        }

        const hits = skill.multi || 1;
        let total = 0;
        const strike = (i) => {
            const damage = Math.floor(this.player.atk * this.playerAtkBuff * (skill.damage || 1));
            const finalDamage = Math.max(1, damage - Math.floor(this.monsterData.def * 0.25));
            total += finalDamage;
            this.applyDamageToMonster(finalDamage, i === hits - 1 && finalDamage > this.player.atk);
        };

        for (let i = 0; i < hits; i++) {
            this.time.delayedCall(i * 160, () => {
                if (!this.inCombat) return;
                strike(i);
            });
        }

        this.time.delayedCall(hits * 160 + 40, () => {
            if (!this.inCombat) return;

            // Status from skill
            if (skill.effect?.stun || /bash|stun/i.test(skill.name)) {
                this.monsterStunned = true;
                EffectsSystem.floatText(this, this.monsterDisplay.x, this.monsterDisplay.y - 80, 'STUN', 'info');
            }
            if (skill.effect?.slow || /poison|ice|bleed/i.test(skill.name) || skill.effect?.poison) {
                this.monsterPoisonTurns = Math.max(this.monsterPoisonTurns, 3);
                EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'poison', { scale: 1.4 });
            }

            this.addLog(`${this.player.name} uses ${skill.name} for ${total}!`);
            this.audio.play('magic');

            const fxKind = /lightning|bolt|thunder/i.test(skill.name) ? 'lightning'
                : /poison|ice/i.test(skill.name) ? 'poison'
                : /fire|meteor|flame/i.test(skill.name) ? 'boom'
                : 'crit';
            EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, fxKind, { scale: 2.1 });
            this.setCombo(this.combo + 1);

            if (this.monsterCurrentHp <= 0) {
                this.onMonsterDefeated();
            } else {
                this.time.delayedCall(500, () => this.afterPlayerTurn());
            }
        });
    }

    monsterAttack() {
        if (!this.inCombat) return;

        // Boss phase thresholds
        if (this.isBoss) {
            const pct = this.monsterCurrentHp / this.monsterData.hp;
            const phase = pct <= 0.25 ? 3 : pct <= 0.55 ? 2 : 1;
            if (phase > this.bossPhase) {
                this.bossPhase = phase;
                this.addLog(`⚠ ${this.monsterData.name} enters Phase ${phase}!`);
                EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'boom', { scale: 2.2 });
                EffectsSystem.flash(this, 0xff4444, 0.3, 160);
                this.monsterAtkBuff = 1 + (phase - 1) * 0.2;
            }
        }

        // Prefer a skill when available
        const skillIds = this.monsterData.skills || [];
        let skill = null;
        if (skillIds.length && Math.random() < (this.isBoss ? 0.72 : 0.45)) {
            const id = skillIds[Math.floor(Math.random() * skillIds.length)];
            skill = MONSTER_SKILLS[id];
        }

        this.tweens.add({
            targets: this.monsterDisplay,
            x: this.monsterHomeX - (skill ? 40 : 60),
            duration: 120,
            yoyo: true,
            ease: 'Cubic.easeOut',
        });

        const mult = (skill?.damage ?? 1) * (this.monsterAtkBuff || 1) * (this.isBoss && this.bossPhase >= 2 ? 1.1 : 1);
        let damage = Math.max(1, Math.floor(this.monsterData.atk * mult - Math.floor(this.player.def * 0.3)));

        if (skill?.effect?.atkUp) {
            this.monsterAtkBuff = skill.effect.atkUp;
            EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'buff', { scale: 1.5 });
            this.addLog(`${this.monsterData.name} powers up!`);
        }

        if (this.guarding) {
            damage = Math.max(1, Math.floor(damage * 0.4));
            this.guarding = false;
            EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'guard', { scale: 1.5 });
            EffectsSystem.floatText(this, this.playerDisplay.x, this.playerDisplay.y - 70, 'BLOCKED', 'guard');
            this.addLog(`Guard absorbs ${skill?.name || 'the blow'}! (${damage})`);
            this.audio.play('hit');
        } else {
            this.setCombo(0);
            const label = skill ? `${this.monsterData.name} uses ${skill.name}` : `${this.monsterData.name} attacks`;
            this.addLog(`${label} for ${damage}!`);
            this.audio.play(skill?.type === 'magic' ? 'magic' : 'hit');
        }

        // Skill status on player
        if (skill?.effect?.poison && !this.guarding) {
            this.playerPoisonTurns = Math.max(this.playerPoisonTurns || 0, 3);
            EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'poison', { scale: 1.3 });
        }
        if (skill?.drain) {
            const heal = Math.floor(damage * 0.4);
            this.monsterCurrentHp = Math.min(this.monsterData.hp, this.monsterCurrentHp + heal);
            this.monsterHpBarUI.updateValue(this.monsterCurrentHp, this.monsterData.hp);
        }

        this.player.hp = Math.max(0, this.player.hp - damage);
        this.playerHpBar.updateValue(this.player.hp, this.player.maxHp);

        const fx = skill?.type === 'magic'
            ? (/fire|hell|meteor|dragon/i.test(skill.name) ? 'boom' : /lightning/i.test(skill.name) ? 'lightning' : 'crit')
            : 'hit';
        EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, fx, { scale: this.isBoss ? 1.9 : 1.6 });
        EffectsSystem.shake(this, this.isBoss ? 0.012 : 0.008, this.isBoss ? 180 : 130);
        EffectsSystem.flashTarget(this, this.playerDisplay, 0xff6666, 100);
        if (this.isBoss) EffectsSystem.hitStop(this, 50);
        EffectsSystem.floatText(this, this.playerDisplay.x, this.playerDisplay.y - 50, `-${damage}`, 'dmg');

        // Player poison tick after monster turn
        if ((this.playerPoisonTurns || 0) > 0 && this.player.hp > 0) {
            const tick = Math.max(2, Math.floor(this.player.maxHp * 0.03));
            this.playerPoisonTurns--;
            this.player.hp = Math.max(0, this.player.hp - tick);
            this.playerHpBar.updateValue(this.player.hp, this.player.maxHp);
            EffectsSystem.floatText(this, this.playerDisplay.x + 24, this.playerDisplay.y - 30, `-${tick}`, 'info');
            this.addLog(`Poison ticks for ${tick}!`);
        }

        if (this.player.hp <= 0) {
            this.onPlayerDefeated();
        } else {
            this.turnCooldown = false;
        }
    }

    usePotion() {
        if (this.turnCooldown || !this.inCombat) return;

        const potionIds = ['super_health_potion', 'greater_health_potion', 'health_potion', 'minor_health_potion'];
        const id = potionIds.find((p) => this.player.hasItem(p));
        if (!id) {
            this.addLog('No potions!');
            EffectsSystem.floatText(this, this.playerDisplay.x, this.playerDisplay.y - 50, 'No potions!', 'info');
            return;
        }

        this.player.useItem(id);
        this.playerHpBar.updateValue(this.player.hp, this.player.maxHp);
        this.addLog(`Used ${ITEMS[id]?.name || 'potion'}!`);
        this.audio.play('potion');
        EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'heal', { scale: 1.9 });
        EffectsSystem.floatText(this, this.playerDisplay.x, this.playerDisplay.y - 50, 'HEAL', 'heal');
        this.turnCooldown = true;
        this.time.delayedCall(700, () => this.afterPlayerTurn());
    }

    flee() {
        if (this.turnCooldown || !this.inCombat) return;
        let chance = 0.55 + this.player.luk * 0.005;
        if (this.isBoss) chance *= 0.35;
        if (this.monsterData.finalBoss) chance = 0.08;
        if (Math.random() < chance) {
            this.addLog('Escaped successfully!');
            EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'haste', { scale: 1.5 });
            this.time.delayedCall(700, () => this.endBattle(false));
        } else {
            this.addLog(this.isBoss ? 'The boss blocks your escape!' : 'Failed to escape!');
            this.turnCooldown = true;
            this.time.delayedCall(700, () => this.afterPlayerTurn());
        }
    }

    onMonsterDefeated() {
        this.inCombat = false;
        this.timingActive = false;

        const loot = LootSystem.rollMonsterLoot(this.monsterId, {
            luck: this.player.luk || 0,
            combo: this.combo,
            perfectHits: this.perfectHits,
        });
        LootSystem.grant(this.player, loot);

        const leveled = this.player.gainExp(loot.exp);
        this.player.killCount++;
        this.questSystem?.updateQuest('kill', this.monsterId);

        this.addLog(`${this.monsterData.name} defeated!`);
        this.addLog(`+${loot.exp} EXP · +${loot.gold} Gold`);

        EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'death', { scale: 2.5 });
        EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'boom', { scale: 2.0 });
        EffectsSystem.flash(this, 0xffd700, 0.3, 160);
        EffectsSystem.shake(this, 0.016, 280);

        this.tweens.add({
            targets: this.monsterDisplay,
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            y: this.monsterDisplay.y - 40,
            duration: 700,
        });

        this.audio.play('victory');
        this.audio.play('fanfare');
        this.achievements?.check();

        if (leveled) {
            this.time.delayedCall(400, () => this.showLevelUp());
        }

        this.time.delayedCall(900, () => {
            this.showVictoryBoard(loot, leveled);
        });
    }

    showVictoryBoard(loot, leveled) {
        const L = layout(this);
        const panel = this.add.container(0, 0).setDepth(350);

        const bg = this.add.rectangle(L.cx, L.cy, Math.min(420, L.w * 0.8), Math.min(360, L.h * 0.72), 0x0a0a1a, 0.94)
            .setStrokeStyle(2, 0xc9a84c, 0.8);
        panel.add(bg);

        panel.add(this.add.text(L.cx, L.cy - 140, 'VICTORY', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(32)}px`,
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5));

        EffectsSystem.play(this, L.cx, L.cy - 140, 'burst', { scale: 2.2, depth: 360 });

        let lines = `+${loot.exp} EXP\n+${loot.gold} Gold`;
        if (loot.bonusGold) lines += `  (combo bonus!)`;
        if (leveled) lines += `\nLEVEL UP!`;
        panel.add(this.add.text(L.cx, L.cy - 90, lines, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(16)}px`,
            color: '#f0e6d3',
            align: 'center',
        }).setOrigin(0.5));

        let y = L.cy - 40;
        if (!loot.items.length) {
            panel.add(this.add.text(L.cx, y, 'No item drops', {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(14)}px`,
                color: '#888',
            }).setOrigin(0.5));
        } else {
            panel.add(this.add.text(L.cx, y - 18, 'LOOT', {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(13)}px`,
                color: '#c9a84c',
            }).setOrigin(0.5));
            loot.items.slice(0, 6).forEach((it, i) => {
                const color = RARITY_COLOR[it.rarity] || '#fff';
                panel.add(this.add.text(L.cx, y + 8 + i * 22, `${it.name} x${it.count}`, {
                    fontFamily: 'Georgia, serif',
                    fontSize: `${L.font(15)}px`,
                    color,
                    stroke: '#000',
                    strokeThickness: 2,
                }).setOrigin(0.5));
            });
        }

        const cont = UIComponents.createButton(this, L.cx, L.cy + 130, 'Continue', () => {
            panel.destroy(true);
            this.endBattle(true, loot);
        }, {
            width: Math.min(200, L.w * 0.4),
            height: Math.max(42, L.font(44)),
            fontSize: L.font(16),
            variant: 'primary',
            depth: 360,
        });
        panel.add(cont);

        // Auto-continue safety
        this.time.delayedCall(6000, () => {
            if (this.scene.isActive()) {
                panel.destroy(true);
                this.endBattle(true, loot);
            }
        });
    }

    onPlayerDefeated() {
        this.inCombat = false;
        this.addLog('You have been defeated...');
        this.audio.play('defeat');
        EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'death', { scale: 2 });
        EffectsSystem.flash(this, 0x8b0000, 0.35, 200);

        const goldLoss = Math.floor(this.player.gold * 0.1);
        this.player.gold -= goldLoss;
        this.player.deathCount++;
        this.setCombo(0);

        this.time.delayedCall(1800, () => {
            this.player.hp = Math.floor(this.player.maxHp * 0.5);
            this.player.mp = Math.floor(this.player.maxMp * 0.5);
            this.player.x = 5;
            this.player.y = 5;
            this.player.zone = 'town';
            this.endBattle(false);
        });
    }

    showLevelUp() {
        const L = layout(this);
        EffectsSystem.play(this, L.cx, L.cy, 'burst', { scale: 3, depth: 220 });
        EffectsSystem.play(this, L.cx, L.cy, 'sparkle', { scale: 2.5, depth: 220 });

        const levelUpText = this.add.text(L.cx, L.cy, 'LEVEL UP!', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(42)}px`,
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 5,
        }).setOrigin(0.5).setDepth(250);

        this.tweens.add({
            targets: levelUpText,
            scaleX: 1.35,
            scaleY: 1.35,
            duration: 450,
            yoyo: true,
            repeat: 2,
            onComplete: () => levelUpText.destroy(),
        });
        this.audio.play('levelup');
    }

    addLog(msg) {
        this.combatLog.push(msg);
        if (this.combatLog.length > 7) this.combatLog.shift();
        this.combatLogText?.setText(this.combatLog.join('\n'));
    }

    endBattle(victory, loot = null) {
        if (this._ended) return;
        this._ended = true;
        this.sound.stopAll();
        this.scene.stop();
        this.scene.resume('World', {
            victory,
            monsterId: this.monsterId,
            loot,
            worldMonsterRef: this.worldMonsterRef,
        });
    }
}
