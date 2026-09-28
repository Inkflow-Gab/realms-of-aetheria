// ============================================
// REALMS OF AETHERIA - BATTLE SCENE
// ============================================

import { MONSTERS } from '../data/Monsters.js';
import { SKILLS } from '../data/Skills.js';
import { ITEMS } from '../data/Items.js';
import { UIComponents } from '../ui/UIComponents.js';
import { GAME_CONFIG } from '../config/GameConfig.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { EffectsSystem } from '../systems/EffectsSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';

export class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Battle' });
    }

    init(data) {
        this.player = data.player;
        this.monsterId = data.monsterId;
        this.monsterSprite = data.monsterSprite;
        this.monsterHpBar = data.monsterHpBar;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Local audio + quest systems so battle never depends on a paused World
        // scene holding them (the previous code called this.audio with nothing
        // initialised and crashed the first Attack tap).
        this.audio = new AudioSystem();
        this.audio.init(this);
        this.questSystem = new QuestSystem(this.player);
        EffectsSystem.ensureAnims(this);

        // Background
        const bgKey = this.textures.exists('bg_5') ? 'bg_5' : null;
        if (bgKey) {
            this.add.image(width / 2, height / 2, bgKey).setDisplaySize(width, height);
        }
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.7);
        overlay.fillRect(0, 0, width, height);

        // === MONSTER DISPLAY ===
        const monsterData = MONSTERS[this.monsterId];
        const monsterKey = `monster_${String(monsterData.sprite).split('/').pop().replace('.png', '')}`;
        const monsterX = width / 2 + Math.min(220, width * 0.18);
        const monsterY = height / 2 - 50;
        if (this.textures.exists(monsterKey)) {
            this.monsterDisplay = this.add.image(monsterX, monsterY, monsterKey)
                .setScale((monsterData.scale || 1) * 2)
                .setDepth(10);
        } else {
            this.monsterDisplay = this.add.rectangle(monsterX, monsterY, 80, 80, monsterData.tint || 0xe74c3c)
                .setDepth(10);
        }

        if (monsterData.tint && this.monsterDisplay.setTint) {
            this.monsterDisplay.setTint(monsterData.tint);
        }

        // Monster name & level
        this.add.text(this.monsterDisplay.x, height / 2 - 200, `${monsterData.name} Lv.${monsterData.level}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '24px',
            color: '#e74c3c',
        }).setOrigin(0.5);

        // Monster HP bar
        this.monsterHpBarUI = UIComponents.createBar(
            this,
            this.monsterDisplay.x - 100,
            height / 2 - 170,
            200, 20,
            monsterData.hp, monsterData.hp,
            GAME_CONFIG.COLORS.HP
        );

        // === PLAYER DISPLAY ===
        const charKey = `char_${this.player.avatarIndex}`;
        const playerX = width / 2 - Math.min(220, width * 0.18);
        const playerY = height / 2 - 50;
        if (this.textures.exists(charKey)) {
            this.playerDisplay = this.add.image(playerX, playerY, charKey)
                .setScale(2)
                .setDepth(10);
        } else {
            this.playerDisplay = this.add.rectangle(playerX, playerY, 72, 72, 0xc9a84c)
                .setDepth(10);
        }

        this.add.text(this.playerDisplay.x, height / 2 - 200, `${this.player.name} Lv.${this.player.level}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '24px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        this.playerHpBar = UIComponents.createBar(
            this,
            this.playerDisplay.x - 100,
            height / 2 - 170,
            200, 20,
            this.player.hp, this.player.maxHp,
            GAME_CONFIG.COLORS.HP
        );
        this.playerMpBar = UIComponents.createBar(
            this,
            this.playerDisplay.x - 100,
            height / 2 - 145,
            200, 14,
            this.player.mp, this.player.maxMp,
            GAME_CONFIG.COLORS.MP
        );

        // === COMBAT LOG ===
        this.combatLog = [];
        this.combatLogText = this.add.text(20, height - 180, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#f0e6d3',
            wordWrap: { width: Math.min(400, width * 0.4) },
            lineSpacing: 4,
        });

        // === ACTION BUTTONS ===
        this.createActionButtons();

        // === COMBAT STATE ===
        this.inCombat = true;
        this.monsterCurrentHp = monsterData.hp;
        this.monsterBuffs = [];
        this.turnCooldown = false;

        this.addLog(`A wild ${monsterData.name} appears!`);
        EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'sparkle', { scale: 2 });

        this.audio.playMusic('battle');
    }

    createActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        UIComponents.createButton(this, width / 2 - 200, height - 80, 'Attack', () => {
            this.playerAttack();
        }, { width: 120, height: 50, fontSize: 18, bgColor: 0x8b0000 });

        const skills = this.player.skills.slice(0, 4);
        skills.forEach((skillId, i) => {
            const skill = SKILLS[skillId];
            if (!skill) return;
            const x = width / 2 - 50 + (i * 100);
            UIComponents.createButton(this, x, height - 80, skill.name.split(' ')[0], () => {
                this.playerUseSkill(skillId);
            }, { width: 90, height: 50, fontSize: 12, bgColor: 0x2a2a6a });
        });

        UIComponents.createButton(this, width / 2 + 250, height - 80, 'Potion', () => {
            this.usePotion();
        }, { width: 100, height: 50, fontSize: 16, bgColor: 0x2a4a2a });

        UIComponents.createButton(this, width - 80, height - 80, 'Flee', () => {
            this.flee();
        }, { width: 80, height: 50, fontSize: 16, bgColor: 0x4a2a2a });
    }

    playerAttack() {
        if (this.turnCooldown || !this.inCombat) return;
        this.turnCooldown = true;

        this.tweens.add({
            targets: this.playerDisplay,
            x: this.playerDisplay.x + 50,
            duration: 150,
            yoyo: true,
        });

        const damage = Math.max(1, this.player.atk - Math.floor(MONSTERS[this.monsterId].def * 0.3));
        const isCrit = Math.random() < (0.05 + this.player.luk * 0.005);
        const finalDamage = isCrit ? Math.floor(damage * 1.5) : damage;

        this.monsterCurrentHp = Math.max(0, this.monsterCurrentHp - finalDamage);
        this.monsterHpBarUI.updateValue(this.monsterCurrentHp, MONSTERS[this.monsterId].hp);

        this.addLog(`${this.player.name} attacks for ${finalDamage}${isCrit ? ' CRITICAL!' : '!'}`);
        this.audio.play(isCrit ? 'crit' : 'attack');

        EffectsSystem.play(
            this,
            this.monsterDisplay.x,
            this.monsterDisplay.y,
            isCrit ? 'crit' : 'hit',
            { scale: isCrit ? 2.2 : 1.7 }
        );
        EffectsSystem.shake(this, isCrit ? 0.01 : 0.004, isCrit ? 180 : 100);

        this.showDamageNumber(this.monsterDisplay.x, this.monsterDisplay.y - 50, finalDamage, isCrit);

        if (this.monsterCurrentHp <= 0) {
            this.onMonsterDefeated();
        } else {
            this.time.delayedCall(1000, () => {
                this.monsterAttack();
            });
        }
    }

    playerUseSkill(skillId) {
        if (this.turnCooldown || !this.inCombat) return;
        const skill = SKILLS[skillId];
        if (!skill) return;
        if (this.player.mp < skill.mpCost) {
            this.addLog('Not enough MP!');
            return;
        }

        this.turnCooldown = true;
        this.player.mp -= skill.mpCost;
        this.playerMpBar.updateValue(this.player.mp, this.player.maxMp);

        this.tweens.add({
            targets: this.playerDisplay,
            scaleX: 2.2,
            scaleY: 2.2,
            duration: 200,
            yoyo: true,
        });

        const damage = Math.floor(this.player.atk * skill.damage);
        const finalDamage = Math.max(1, damage - Math.floor(MONSTERS[this.monsterId].def * 0.3));
        this.monsterCurrentHp = Math.max(0, this.monsterCurrentHp - finalDamage);
        this.monsterHpBarUI.updateValue(this.monsterCurrentHp, MONSTERS[this.monsterId].hp);

        this.addLog(`${this.player.name} uses ${skill.name} for ${finalDamage}!`);
        this.audio.play('magic');

        const fxKind = /lightning|bolt|thunder/i.test(skill.name) ? 'lightning'
            : /heal|holy|divine/i.test(skill.name) ? 'heal'
            : 'crit';
        EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, fxKind, { scale: 2 });
        EffectsSystem.shake(this, 0.008, 140);

        this.showDamageNumber(this.monsterDisplay.x, this.monsterDisplay.y - 50, finalDamage, false);

        if (this.monsterCurrentHp <= 0) {
            this.onMonsterDefeated();
        } else {
            this.time.delayedCall(1200, () => {
                this.monsterAttack();
            });
        }
    }

    monsterAttack() {
        if (!this.inCombat) return;

        const monsterData = MONSTERS[this.monsterId];

        this.tweens.add({
            targets: this.monsterDisplay,
            x: this.monsterDisplay.x - 50,
            duration: 150,
            yoyo: true,
        });

        const damage = Math.max(1, monsterData.atk - Math.floor(this.player.def * 0.3));
        this.player.hp = Math.max(0, this.player.hp - damage);
        this.playerHpBar.updateValue(this.player.hp, this.player.maxHp);

        this.addLog(`${monsterData.name} attacks for ${damage}!`);
        this.audio.play('hit');

        EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'hit', { scale: 1.5 });
        EffectsSystem.shake(this, 0.006, 110);

        this.showDamageNumber(this.playerDisplay.x, this.playerDisplay.y - 50, damage, false, true);

        if (this.player.hp <= 0) {
            this.onPlayerDefeated();
        } else {
            this.turnCooldown = false;
        }
    }

    usePotion() {
        if (this.turnCooldown) return;
        if (this.player.hasItem('health_potion')) {
            this.player.useItem('health_potion');
            this.playerHpBar.updateValue(this.player.hp, this.player.maxHp);
            this.addLog('Used Health Potion!');
            this.audio.play('potion');
            EffectsSystem.play(this, this.playerDisplay.x, this.playerDisplay.y, 'heal', { scale: 1.8 });
            this.turnCooldown = true;
            this.time.delayedCall(1000, () => this.monsterAttack());
        } else {
            this.addLog('No potions!');
        }
    }

    flee() {
        if (Math.random() < 0.6) {
            this.addLog('Escaped successfully!');
            this.time.delayedCall(1000, () => this.endBattle(false));
        } else {
            this.addLog('Failed to escape!');
            this.turnCooldown = true;
            this.time.delayedCall(1000, () => this.monsterAttack());
        }
    }

    onMonsterDefeated() {
        this.inCombat = false;
        const monsterData = MONSTERS[this.monsterId];

        this.addLog(`${monsterData.name} defeated!`);
        this.addLog(`Gained ${monsterData.exp} EXP and ${monsterData.gold[0]}-${monsterData.gold[1]} Gold!`);

        const leveled = this.player.gainExp(monsterData.exp);
        const goldGain = Math.floor(Math.random() * (monsterData.gold[1] - monsterData.gold[0] + 1)) + monsterData.gold[0];
        this.player.gold += goldGain;
        this.player.killCount++;

        if (monsterData.drops) {
            for (const drop of monsterData.drops) {
                if (Math.random() < drop.chance) {
                    this.player.addItem(drop.item, 1);
                    this.addLog(`Looted: ${ITEMS[drop.item]?.name || drop.item}`);
                }
            }
        }

        this.questSystem?.updateQuest('kill', this.monsterId);

        EffectsSystem.play(this, this.monsterDisplay.x, this.monsterDisplay.y, 'crit', { scale: 2.4 });

        this.tweens.add({
            targets: this.monsterDisplay,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 1000,
        });

        this.audio.play('victory');
        this.audio.play('fanfare');

        if (leveled) {
            this.time.delayedCall(500, () => {
                this.showLevelUp();
            });
        }

        this.time.delayedCall(2500, () => this.endBattle(true));
    }

    onPlayerDefeated() {
        this.inCombat = false;
        this.addLog('You have been defeated...');
        this.audio.play('defeat');

        const goldLoss = Math.floor(this.player.gold * 0.1);
        this.player.gold -= goldLoss;
        this.player.deathCount++;

        this.time.delayedCall(2000, () => {
            this.player.hp = Math.floor(this.player.maxHp * 0.5);
            this.player.mp = Math.floor(this.player.maxMp * 0.5);
            this.player.x = 5;
            this.player.y = 5;
            this.endBattle(false);
        });
    }

    showLevelUp() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        EffectsSystem.play(this, width / 2, height / 2, 'sparkle', { scale: 3, depth: 220 });

        const levelUpText = this.add.text(width / 2, height / 2, 'LEVEL UP!', {
            fontFamily: 'Georgia, serif',
            fontSize: '48px',
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: levelUpText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 500,
            yoyo: true,
            repeat: 2,
            onComplete: () => levelUpText.destroy(),
        });

        this.audio.play('levelup');
    }

    showDamageNumber(x, y, damage, isCrit, isPlayer = false) {
        const color = isCrit ? '#ff6b35' : (isPlayer ? '#e74c3c' : '#ffffff');
        const dmgText = this.add.text(x, y, `-${damage}`, {
            fontFamily: 'Georgia, serif',
            fontSize: isCrit ? '28px' : '20px',
            color: color,
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: dmgText,
            y: y - 60,
            alpha: 0,
            duration: 1000,
            onComplete: () => dmgText.destroy(),
        });
    }

    addLog(msg) {
        this.combatLog.push(msg);
        if (this.combatLog.length > 6) {
            this.combatLog.shift();
        }
        this.combatLogText.setText(this.combatLog.join('\n'));
    }

    endBattle(victory) {
        this.sound.stopAll();
        this.scene.stop();
        this.scene.resume('World', { victory, monsterId: this.monsterId });
    }
}
