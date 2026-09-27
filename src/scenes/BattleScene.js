// ============================================
// REALMS OF AETHERIA - BATTLE SCENE
// ============================================

import { MONSTERS, MONSTER_SKILLS } from '../data/Monsters.js';
import { SKILLS } from '../data/Skills.js';
import { UIComponents } from '../ui/UIComponents.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

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

        // Background
        this.add.image(width / 2, height / 2, 'bg_5').setDisplaySize(width, height);
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.7);
        overlay.fillRect(0, 0, width, height);

        // === MONSTER DISPLAY ===
        const monsterData = MONSTERS[this.monsterId];
        this.monsterDisplay = this.add.image(width / 2 + 200, height / 2 - 50, `monster_${monsterData.sprite.split('/').pop().replace('.png', '')}`)
            .setScale((monsterData.scale || 1) * 2)
            .setDepth(10);

        if (monsterData.tint) {
            this.monsterDisplay.setTint(monsterData.tint);
        }

        // Monster name & level
        this.add.text(width / 2 + 200, height / 2 - 200, `${monsterData.name} Lv.${monsterData.level}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '24px',
            color: '#e74c3c',
        }).setOrigin(0.5);

        // Monster HP bar
        this.monsterHpBarUI = UIComponents.createBar(this, width / 2 + 100, height / 2 - 170, 200, 20, monsterData.hp, monsterData.hp, GAME_CONFIG.COLORS.HP);

        // === PLAYER DISPLAY ===
        this.playerDisplay = this.add.image(width / 2 - 200, height / 2 - 50, `char_${this.player.avatarIndex}`)
            .setScale(2)
            .setDepth(10);

        this.add.text(width / 2 - 200, height / 2 - 200, `${this.player.name} Lv.${this.player.level}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '24px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        this.playerHpBar = UIComponents.createBar(this, width / 2 - 300, height / 2 - 170, 200, 20, this.player.hp, this.player.maxHp, GAME_CONFIG.COLORS.HP);
        this.playerMpBar = UIComponents.createBar(this, width / 2 - 300, height / 2 - 145, 200, 14, this.player.mp, this.player.maxMp, GAME_CONFIG.COLORS.MP);

        // === COMBAT LOG ===
        this.combatLog = [];
        this.combatLogText = this.add.text(20, height - 180, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#f0e6d3',
            wordWrap: { width: 400 },
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

        // Play battle music
        if (this.sound.get('music_battle')) {
            this.sound.play('music_battle', { loop: true, volume: 0.4 });
        }
    }

    createActionButtons() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Attack button
        UIComponents.createButton(this, width / 2 - 200, height - 80, 'Attack', () => {
            this.playerAttack();
        }, { width: 120, height: 50, fontSize: 18, bgColor: 0x8b0000 });

        // Skill buttons
        const skills = this.player.skills.slice(0, 4);
        skills.forEach((skillId, i) => {
            const skill = SKILLS[skillId];
            if (!skill) return;
            const x = width / 2 - 50 + (i * 100);
            UIComponents.createButton(this, x, height - 80, skill.name.split(' ')[0], () => {
                this.playerUseSkill(skillId);
            }, { width: 90, height: 50, fontSize: 12, bgColor: 0x2a2a6a });
        });

        // Potion button
        UIComponents.createButton(this, width / 2 + 250, height - 80, 'Potion', () => {
            this.usePotion();
        }, { width: 100, height: 50, fontSize: 16, bgColor: 0x2a4a2a });

        // Flee button
        UIComponents.createButton(this, width - 80, height - 80, 'Flee', () => {
            this.flee();
        }, { width: 80, height: 50, fontSize: 16, bgColor: 0x4a2a2a });
    }

    playerAttack() {
        if (this.turnCooldown || !this.inCombat) return;
        this.turnCooldown = true;

        // Animate player attack
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

        // Damage number
        this.showDamageNumber(this.monsterDisplay.x, this.monsterDisplay.y - 50, finalDamage, isCrit);

        if (this.monsterCurrentHp <= 0) {
            this.onMonsterDefeated();
        } else {
            // Monster turn
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

        // Animate
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

        // Animate
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

        // Rewards
        const leveled = this.player.gainExp(monsterData.exp);
        const goldGain = Math.floor(Math.random() * (monsterData.gold[1] - monsterData.gold[0] + 1)) + monsterData.gold[0];
        this.player.gold += goldGain;
        this.player.killCount++;

        // Drops
        if (monsterData.drops) {
            for (const drop of monsterData.drops) {
                if (Math.random() < drop.chance) {
                    this.player.addItem(drop.item, 1);
                    this.addLog(`Looted: ${ITEMS[drop.item]?.name || drop.item}`);
                }
            }
        }

        // Quest progress
        this.questSystem?.updateQuest('kill', this.monsterId);

        // Victory animation
        this.tweens.add({
            targets: this.monsterDisplay,
            alpha: 0,
            scaleX: 0,
            scaleY: 0,
            duration: 1000,
        });

        this.audio.play('victory');

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

        // Lose some gold
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
