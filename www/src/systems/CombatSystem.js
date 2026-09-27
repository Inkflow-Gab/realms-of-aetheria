// ============================================
// REALMS OF AETHERIA - COMBAT SYSTEM
// ============================================

import { MONSTERS, MONSTER_SKILLS } from '../data/Monsters.js';
import { SKILLS } from '../data/Skills.js';

export class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.inCombat = false;
        this.enemies = [];
        this.turnOrder = [];
        this.currentTurn = 0;
        this.combatLog = [];
        this.onCombatEnd = null;
    }

    startCombat(enemyIds) {
        this.inCombat = true;
        this.enemies = enemyIds.map(id => this.createEnemy(id));
        this.turnOrder = ['player', ...this.enemies.map((_, i) => i)];
        this.currentTurn = 0;
        this.combatLog = [];
        this.addLog('Combat started!');
    }

    createEnemy(monsterId) {
        const data = MONSTERS[monsterId];
        if (!data) return null;
        return {
            ...data,
            currentHp: data.hp,
            currentMp: data.mp,
            buffs: [],
            isEnemy: true,
        };
    }

    playerAttack(targetIndex, skillId = null) {
        const player = this.scene.player;
        const target = this.enemies[targetIndex];
        if (!target || target.currentHp <= 0) return null;

        let damage = player.atk;
        let isCrit = false;
        let skill = null;

        if (skillId) {
            skill = SKILLS[skillId];
            if (!skill) return null;
            if (player.mp < skill.mpCost) return null;

            player.mp -= skill.mpCost;
            damage = Math.floor(player.atk * skill.damage);

            // Skill effects
            if (skill.effect) {
                this.applyEffect(target, skill.effect);
            }
        } else {
            // Basic attack
            damage = player.atk;
        }

        // Crit check
        const critChance = 0.05 + player.luk * 0.005;
        if (Math.random() < critChance) {
            damage = Math.floor(damage * 1.5);
            isCrit = true;
        }

        // Apply damage
        const actualDamage = Math.max(1, damage - Math.floor(target.def * 0.3));
        target.currentHp = Math.max(0, target.currentHp - actualDamage);

        // Trait: vampire lifesteal
        if (player.trait?.effect?.lifesteal) {
            const heal = Math.floor(actualDamage * player.trait.effect.lifesteal);
            player.hp = Math.min(player.maxHp, player.hp + heal);
        }

        // Trait: thorns reflect
        if (target.trait?.effect?.thorns) {
            const reflect = Math.floor(actualDamage * target.trait.effect.thorns);
            player.hp = Math.max(0, player.hp - reflect);
        }

        this.addLog(`${player.name} hits ${target.name} for ${actualDamage}${isCrit ? ' CRIT!' : ''}`);

        if (target.currentHp <= 0) {
            this.addLog(`${target.name} defeated!`);
            this.onEnemyKilled(target);
        }

        return { damage: actualDamage, isCrit, skill };
    }

    enemyAttack(enemyIndex) {
        const enemy = this.enemies[enemyIndex];
        const player = this.scene.player;
        if (!enemy || enemy.currentHp <= 0) return null;

        // Choose skill
        let skill = null;
        if (enemy.skills && enemy.skills.length > 0) {
            const availableSkills = enemy.skills.filter(s => {
                const sk = MONSTER_SKILLS[s];
                return sk && enemy.currentMp >= sk.mpCost;
            });
            if (availableSkills.length > 0 && Math.random() < 0.4) {
                const skillId = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                skill = MONSTER_SKILLS[skillId];
                enemy.currentMp -= skill.mpCost;
            }
        }

        let damage = skill ? Math.floor(enemy.atk * skill.damage) : enemy.atk;
        const actualDamage = Math.max(1, damage - Math.floor(player.def * 0.3));

        player.hp = Math.max(0, player.hp - actualDamage);

        if (skill?.effect) {
            this.applyEffect(player, skill.effect);
        }

        if (skill?.drain) {
            const heal = Math.floor(actualDamage * 0.5);
            enemy.currentHp = Math.min(enemy.hp, enemy.currentHp + heal);
        }

        this.addLog(`${enemy.name} hits ${player.name} for ${actualDamage}`);

        if (player.hp <= 0) {
            this.addLog(`${player.name} has fallen!`);
            this.endCombat(false);
        }

        return { damage: actualDamage, skill };
    }

    applyEffect(target, effect) {
        if (effect.stun) {
            target.stunned = true;
            target.stunEndTime = Date.now() + effect.stun;
        }
        if (effect.poison) {
            target.poisoned = true;
            target.poisonEndTime = Date.now() + effect.poison;
            target.poisonDmg = Math.floor(target.hp * 0.05);
        }
        if (effect.slow) {
            target.slowed = true;
            target.slowEndTime = Date.now() + effect.duration;
        }
        if (effect.atkUp) {
            target.buffs.push({ stat: 'atk', mult: effect.atkUp, duration: effect.duration });
        }
        if (effect.defUp) {
            target.buffs.push({ stat: 'def', mult: effect.defUp, duration: effect.duration });
        }
        if (effect.atkDown) {
            target.buffs.push({ stat: 'atk', mult: effect.atkDown, duration: effect.duration });
        }
        if (effect.defDown) {
            target.buffs.push({ stat: 'def', mult: effect.defDown, duration: effect.duration });
        }
        if (effect.heal) {
            if (target.isEnemy) {
                target.currentHp = Math.min(target.hp, target.currentHp + Math.floor(target.hp * effect.heal));
            } else {
                target.hp = Math.min(target.maxHp, target.hp + Math.floor(target.maxHp * effect.heal));
            }
        }
        if (effect.fullHeal) {
            if (target.isEnemy) {
                target.currentHp = target.hp;
            } else {
                target.hp = target.maxHp;
            }
        }
        if (effect.regen) {
            target.regen = effect.regen;
            target.regenEndTime = Date.now() + effect.duration;
        }
        if (effect.invincible) {
            target.invincible = true;
            target.invincibleEndTime = Date.now() + effect.duration;
        }
        if (effect.dodge) {
            target.dodge = effect.dodge;
            target.dodgeEndTime = Date.now() + effect.duration;
        }
    }

    onEnemyKilled(enemy) {
        const player = this.scene.player;
        player.gainExp(enemy.exp);
        player.gold += Math.floor(Math.random() * (enemy.gold[1] - enemy.gold[0] + 1)) + enemy.gold[0];
        player.killCount++;

        // Drop loot
        if (enemy.drops) {
            for (const drop of enemy.drops) {
                if (Math.random() < drop.chance) {
                    player.addItem(drop.item, 1);
                    this.addLog(`Looted: ${drop.item}`);
                }
            }
        }

        // Check if all enemies dead
        if (this.enemies.every(e => e.currentHp <= 0)) {
            this.endCombat(true);
        }
    }

    endCombat(victory) {
        this.inCombat = false;
        if (this.onCombatEnd) {
            this.onCombatEnd(victory);
        }
    }

    addLog(msg) {
        this.combatLog.push(msg);
        if (this.combatLog.length > 50) {
            this.combatLog.shift();
        }
    }

    update(time) {
        if (!this.inCombat) return;

        // Update buffs
        for (const enemy of this.enemies) {
            enemy.buffs = enemy.buffs.filter(b => Date.now() - b.startTime < b.duration);
        }

        // Poison damage
        for (const enemy of this.enemies) {
            if (enemy.poisoned && Date.now() < enemy.poisonEndTime) {
                enemy.currentHp = Math.max(0, enemy.currentHp - enemy.poisonDmg);
            }
        }

        // Player poison
        const player = this.scene.player;
        if (player.statusEffects.poison && Date.now() < player.statusEffects.poisonEndTime) {
            player.hp = Math.max(0, player.hp - player.statusEffects.poisonDmg);
        }
    }
}
