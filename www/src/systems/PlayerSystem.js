// ============================================
// REALMS OF AETHERIA - PLAYER SYSTEM
// ============================================

import { RACES, CLASSES, TRAITS, XP_TABLE, MAX_LEVEL } from '../config/GameConfig.js';
import { ITEMS } from '../data/Items.js';

export class PlayerSystem {
    constructor(data = null) {
        if (data) {
            this.deserialize(data);
        } else {
            this.initNew('Hero', 'human', 'warrior', 'brave', 0);
        }
    }

    initNew(name, raceId, classId, traitId, avatarIndex = 0) {
        this.name = name;
        this.race = RACES[raceId.toUpperCase()] || RACES.HUMAN;
        this.class = CLASSES[classId.toUpperCase()] || CLASSES.WARRIOR;
        this.trait = TRAITS[traitId.toUpperCase()] || TRAITS.BRAVE;
        this.avatarIndex = avatarIndex;

        this.level = 1;
        this.exp = 0;
        this.gold = 100;
        this.skillPoints = 0;

        // Base stats from race
        const base = this.race.baseStats;
        this.baseStats = {
            str: 10 + this.race.bonuses.str,
            dex: 10 + this.race.bonuses.dex,
            int: 10 + this.race.bonuses.int,
            vit: 10 + this.race.bonuses.vit,
            luk: 10 + this.race.bonuses.luk,
        };

        // Current stats (base + equipment + buffs)
        this.stats = { ...this.baseStats };

        // HP/MP
        this.maxHp = base.hp + this.class.statGrowth.hp * this.level;
        this.maxMp = base.mp + this.class.statGrowth.mp * this.level;
        this.hp = this.maxHp;
        this.mp = this.maxMp;

        // Combat stats
        this.atk = base.atk + this.class.statGrowth.atk * this.level;
        this.def = base.def + this.class.statGrowth.def * this.level;
        this.spd = base.spd + this.class.statGrowth.spd * this.level;
        this.luk = base.luk + this.class.statGrowth.luk * this.level;

        // Position
        this.x = 5;
        this.y = 5;
        this.zone = 'town';
        this.facing = 'down';

        // Inventory
        this.inventory = [];
        this.equipment = {
            weapon: null, head: null, chest: null, legs: null,
            feet: null, hands: null, offhand: null, back: null,
            ring: null, neck: null, waist: null
        };

        // Skills
        this.skills = [this.class.startSkill];
        this.skillLevels = {};
        this.skillLevels[this.class.startSkill] = 1;

        // Quests
        this.quests = {};
        this.completedQuests = [];

        // Buffs/Debuffs
        this.buffs = [];
        this.statusEffects = {};

        // Play time
        this.playTime = 0;
        this.killCount = 0;
        this.deathCount = 0;

        // Starting items
        this.addItem('rusty_sword', 1);
        this.addItem('minor_health_potion', 3);
        this.addItem('bread', 2);
        this.equip('rusty_sword');

        this.recalcStats();
    }

    recalcStats() {
        // Start from base
        const oldMaxHp = this.maxHp;
        const oldMaxMp = this.maxMp;

        this.stats = { ...this.baseStats };

        // Add equipment stats
        for (const slot in this.equipment) {
            const item = this.equipment[slot];
            if (item && item.stats) {
                for (const stat in item.stats) {
                    if (this.stats[stat] !== undefined) {
                        this.stats[stat] += item.stats[stat];
                    }
                }
            }
        }

        // Apply trait effects
        if (this.trait && this.trait.effect) {
            const eff = this.trait.effect;
            if (eff.atkMult) this.stats.str = Math.floor(this.stats.str * eff.atkMult);
            if (eff.defMult) this.stats.vit = Math.floor(this.stats.vit * eff.defMult);
            if (eff.spdMult) this.stats.dex = Math.floor(this.stats.dex * eff.spdMult);
            if (eff.hpMult) this.stats.vit = Math.floor(this.stats.vit * eff.hpMult);
            if (eff.mpMult) this.stats.int = Math.floor(this.stats.int * eff.mpMult);
            if (eff.critMult) this.stats.luk = Math.floor(this.stats.luk * eff.critMult);
        }

        // Recalc derived stats
        const hpGain = this.maxHp - oldMaxHp;
        const mpGain = this.maxMp - oldMaxMp;

        this.maxHp = Math.floor((this.race.baseStats.hp + this.class.statGrowth.hp * this.level) * (this.trait?.effect?.hpMult || 1) + this.stats.vit * 5);
        this.maxMp = Math.floor((this.race.baseStats.mp + this.class.statGrowth.mp * this.level) * (this.trait?.effect?.mpMult || 1) + this.stats.int * 3);

        this.atk = Math.floor((this.race.baseStats.atk + this.class.statGrowth.atk * this.level) + this.stats.str * 2);
        this.def = Math.floor((this.race.baseStats.def + this.class.statGrowth.def * this.level) + this.stats.vit * 1.5);
        this.spd = Math.floor((this.race.baseStats.spd + this.class.statGrowth.spd * this.level) + this.stats.dex * 1.5);
        this.luk = Math.floor((this.race.baseStats.luk + this.class.statGrowth.luk * this.level) + this.stats.luk);

        // Buffs
        for (const buff of this.buffs) {
            if (buff.stat === 'atk') this.atk = Math.floor(this.atk * buff.mult);
            if (buff.stat === 'def') this.def = Math.floor(this.def * buff.mult);
            if (buff.stat === 'spd') this.spd = Math.floor(this.spd * buff.mult);
        }

        // Clamp HP/MP
        this.hp = Math.min(this.hp, this.maxHp);
        this.mp = Math.min(this.mp, this.maxMp);
    }

    gainExp(amount) {
        this.exp += amount;
        let leveled = false;
        while (this.level < MAX_LEVEL && this.exp >= XP_TABLE(this.level)) {
            this.exp -= XP_TABLE(this.level);
            this.levelUp();
            leveled = true;
        }
        if (this.level >= MAX_LEVEL) {
            this.exp = 0;
        }
        return leveled;
    }

    levelUp() {
        this.level++;
        this.skillPoints += 2;

        // Increase base stats
        this.baseStats.str += 1;
        this.baseStats.dex += 1;
        this.baseStats.int += 1;
        this.baseStats.vit += 1;
        this.baseStats.luk += 1;

        // Class-specific growth
        const growth = this.class.statGrowth;
        this.maxHp += growth.hp;
        this.maxMp += growth.mp;
        this.hp = this.maxHp;
        this.mp = this.maxMp;

        this.recalcStats();
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }

    addItem(itemId, count = 1) {
        const existing = this.inventory.find(i => i.id === itemId);
        if (existing) {
            existing.count += count;
        } else {
            this.inventory.push({ id: itemId, count });
        }
    }

    removeItem(itemId, count = 1) {
        const idx = this.inventory.findIndex(i => i.id === itemId);
        if (idx === -1) return false;
        this.inventory[idx].count -= count;
        if (this.inventory[idx].count <= 0) {
            this.inventory.splice(idx, 1);
        }
        return true;
    }

    hasItem(itemId, count = 1) {
        const item = this.inventory.find(i => i.id === itemId);
        return item && item.count >= count;
    }

    equip(itemId) {
        const invIdx = this.inventory.findIndex(i => i.id === itemId);
        if (invIdx === -1) return false;

        const itemData = ITEMS[itemId];
        if (!itemData) return false;

        const slot = itemData.type;
        const currentEquipped = this.equipment[slot];

        // Remove from inventory
        this.removeItem(itemId, 1);

        // Unequip current
        if (currentEquipped) {
            this.addItem(currentEquipped.id, 1);
        }

        // Equip new
        this.equipment[slot] = { id: itemId, ...itemData };
        this.recalcStats();
        return true;
    }

    unequip(slot) {
        const item = this.equipment[slot];
        if (!item) return false;
        this.addItem(item.id, 1);
        this.equipment[slot] = null;
        this.recalcStats();
        return true;
    }

    useItem(itemId) {
        const itemData = ITEMS[itemId];
        if (!itemData || !itemData.effect) return false;

        const effect = itemData.effect;
        if (effect.heal) {
            this.hp = Math.min(this.maxHp, this.hp + effect.heal);
        }
        if (effect.mp) {
            this.mp = Math.min(this.maxMp, this.mp + effect.mp);
        }
        if (effect.fullHeal) {
            this.hp = this.maxHp;
            this.mp = this.maxMp;
        }
        if (effect.curePoison) {
            delete this.statusEffects.poison;
        }
        if (effect.mpRestore) {
            this.mp = Math.min(this.maxMp, this.mp + Math.floor(this.maxMp * effect.mpRestore));
        }

        this.removeItem(itemId, 1);
        return true;
    }

    learnSkill(skillId) {
        if (this.skills.includes(skillId)) return false;
        this.skills.push(skillId);
        this.skillLevels[skillId] = 1;
        return true;
    }

    upgradeSkill(skillId) {
        if (!this.skills.includes(skillId)) return false;
        if (this.skillPoints <= 0) return false;
        this.skillLevels[skillId] = (this.skillLevels[skillId] || 1) + 1;
        this.skillPoints--;
        return true;
    }

    addBuff(buff) {
        this.buffs.push({
            ...buff,
            startTime: Date.now(),
        });
        this.recalcStats();
    }

    updateBuffs() {
        const now = Date.now();
        this.buffs = this.buffs.filter(b => now - b.startTime < b.duration);
        this.recalcStats();
    }

    takeDamage(amount) {
        // Apply defense
        const dmg = Math.max(1, Math.floor(amount - this.def * 0.5));
        this.hp = Math.max(0, this.hp - dmg);

        // Trait: thorns
        if (this.trait?.effect?.thorns) {
            return Math.floor(dmg * this.trait.effect.thorns);
        }
        return 0;
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    restoreMp(amount) {
        this.mp = Math.min(this.maxMp, this.mp + amount);
    }

    serialize() {
        return {
            name: this.name,
            race: this.race.id,
            class: this.class.id,
            trait: this.trait.id,
            avatarIndex: this.avatarIndex,
            level: this.level,
            exp: this.exp,
            gold: this.gold,
            skillPoints: this.skillPoints,
            baseStats: this.baseStats,
            hp: this.hp,
            mp: this.mp,
            x: this.x,
            y: this.y,
            zone: this.zone,
            facing: this.facing,
            inventory: this.inventory,
            equipment: this.equipment,
            skills: this.skills,
            skillLevels: this.skillLevels,
            quests: this.quests,
            completedQuests: this.completedQuests,
            playTime: this.playTime,
            killCount: this.killCount,
            deathCount: this.deathCount,
        };
    }

    deserialize(data) {
        this.name = data.name;
        this.race = Object.values(RACES).find(r => r.id === data.race) || RACES.HUMAN;
        this.class = Object.values(CLASSES).find(c => c.id === data.class) || CLASSES.WARRIOR;
        this.trait = Object.values(TRAITS).find(t => t.id === data.trait) || TRAITS.BRAVE;
        this.avatarIndex = data.avatarIndex || 0;
        this.level = data.level;
        this.exp = data.exp;
        this.gold = data.gold;
        this.skillPoints = data.skillPoints || 0;
        this.baseStats = data.baseStats;
        this.hp = data.hp;
        this.mp = data.mp;
        this.x = data.x;
        this.y = data.y;
        this.zone = data.zone;
        this.facing = data.facing;
        this.inventory = data.inventory || [];
        this.equipment = data.equipment || {};
        this.skills = data.skills || [this.class.startSkill];
        this.skillLevels = data.skillLevels || {};
        this.quests = data.quests || {};
        this.completedQuests = data.completedQuests || [];
        this.playTime = data.playTime || 0;
        this.killCount = data.killCount || 0;
        this.deathCount = data.deathCount || 0;
        this.buffs = [];
        this.statusEffects = {};
        this.recalcStats();
    }
}
