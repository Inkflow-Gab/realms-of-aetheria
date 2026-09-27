// ============================================
// REALMS OF AETHERIA - SKILLS DATABASE
// ============================================

export const SKILLS = {
    // === WARRIOR SKILLS ===
    power_strike: {
        id: 'power_strike', name: 'Power Strike', class: 'warrior', level: 1,
        desc: 'A powerful melee strike dealing 150% damage.',
        mpCost: 10, cooldown: 3000, damage: 1.5, type: 'physical', range: 1,
        icon: 'skills/power_strike', animation: 'attack',
    },
    whirlwind: {
        id: 'whirlwind', name: 'Whirlwind', class: 'warrior', level: 5,
        desc: 'Spin attack hitting all nearby enemies for 120% damage.',
        mpCost: 20, cooldown: 6000, damage: 1.2, type: 'physical', range: 2, aoe: true,
        icon: 'skills/whirlwind', animation: 'spin',
    },
    shield_bash: {
        id: 'shield_bash', name: 'Shield Bash', class: 'warrior', level: 8,
        desc: 'Bash with shield, dealing 100% damage and stunning for 1.5s.',
        mpCost: 15, cooldown: 5000, damage: 1.0, type: 'physical', range: 1,
        effect: { stun: 1500 }, icon: 'skills/shield_bash', animation: 'bash',
    },
    berserker_rage: {
        id: 'berserker_rage', name: 'Berserker Rage', class: 'warrior', level: 12,
        desc: 'Enter rage: +50% ATK, +20% SPD for 8s.',
        mpCost: 30, cooldown: 15000, damage: 0, type: 'buff',
        effect: { atkUp: 1.5, spdUp: 1.2, duration: 8000 }, icon: 'skills/berserker', animation: 'rage',
    },
    warcry: {
        id: 'warcry', name: 'Warcry', class: 'warrior', level: 16,
        desc: 'Intimidate enemies: -30% enemy ATK for 6s.',
        mpCost: 25, cooldown: 12000, damage: 0, type: 'debuff', aoe: true,
        effect: { atkDown: 0.7, duration: 6000 }, icon: 'skills/warcry', animation: 'warcry',
    },

    // === MAGE SKILLS ===
    fireball: {
        id: 'fireball', name: 'Fireball', class: 'mage', level: 1,
        desc: 'Hurl a fireball dealing 160% magic damage.',
        mpCost: 15, cooldown: 3000, damage: 1.6, type: 'magic', range: 4,
        icon: 'skills/fireball', animation: 'cast', projectile: 'fireball',
    },
    ice_shard: {
        id: 'ice_shard', name: 'Ice Shard', class: 'mage', level: 4,
        desc: 'Pierce enemy with ice dealing 130% damage and slowing.',
        mpCost: 18, cooldown: 4000, damage: 1.3, type: 'magic', range: 4,
        effect: { slow: 0.4, duration: 3000 }, icon: 'skills/ice_shard', animation: 'cast', projectile: 'ice',
    },
    lightning_bolt: {
        id: 'lightning_bolt', name: 'Lightning Bolt', class: 'mage', level: 8,
        desc: 'Strike with lightning for 180% magic damage.',
        mpCost: 25, cooldown: 5000, damage: 1.8, type: 'magic', range: 5,
        icon: 'skills/lightning', animation: 'cast', projectile: 'lightning',
    },
    arcane_missile: {
        id: 'arcane_missile', name: 'Arcane Missile', class: 'mage', level: 12,
        desc: 'Fire 3 homing missiles each dealing 80% damage.',
        mpCost: 30, cooldown: 6000, damage: 0.8, type: 'magic', range: 5, multi: 3,
        icon: 'skills/arcane', animation: 'cast', projectile: 'arcane',
    },
    meteor_storm: {
        id: 'meteor_storm', name: 'Meteor Storm', class: 'mage', level: 18,
        desc: 'Rain meteors dealing 250% AoE magic damage.',
        mpCost: 60, cooldown: 15000, damage: 2.5, type: 'magic', range: 5, aoe: true,
        icon: 'skills/meteor', animation: 'cast', projectile: 'meteor',
    },

    // === ARCHER SKILLS ===
    power_shot: {
        id: 'power_shot', name: 'Power Shot', class: 'archer', level: 1,
        desc: 'A powerful arrow dealing 160% damage.',
        mpCost: 10, cooldown: 3000, damage: 1.6, type: 'physical', range: 6,
        icon: 'skills/power_shot', animation: 'shoot', projectile: 'arrow',
    },
    multishot: {
        id: 'multishot', name: 'Multishot', class: 'archer', level: 5,
        desc: 'Fire 5 arrows at once, each dealing 70% damage.',
        mpCost: 20, cooldown: 5000, damage: 0.7, type: 'physical', range: 6, multi: 5,
        icon: 'skills/multishot', animation: 'shoot', projectile: 'arrow',
    },
    poison_arrow: {
        id: 'poison_arrow', name: 'Poison Arrow', class: 'archer', level: 9,
        desc: 'Arrow that poisons for 100% damage over 5s.',
        mpCost: 15, cooldown: 4000, damage: 1.0, type: 'physical', range: 6,
        effect: { poison: 5000 }, icon: 'skills/poison_arrow', animation: 'shoot', projectile: 'arrow',
    },
    eagle_eye: {
        id: 'eagle_eye', name: 'Eagle Eye', class: 'archer', level: 13,
        desc: '+20% crit chance and +15% damage for 10s.',
        mpCost: 25, cooldown: 15000, damage: 0, type: 'buff',
        effect: { critUp: 0.2, atkUp: 1.15, duration: 10000 }, icon: 'skills/eagle_eye', animation: 'aim',
    },
    arrow_rain: {
        id: 'arrow_rain', name: 'Arrow Rain', class: 'archer', level: 17,
        desc: 'Rain arrows on an area dealing 200% AoE damage.',
        mpCost: 45, cooldown: 12000, damage: 2.0, type: 'physical', range: 6, aoe: true,
        icon: 'skills/arrow_rain', animation: 'shoot', projectile: 'arrow',
    },

    // === PALADIN SKILLS ===
    holy_smite: {
        id: 'holy_smite', name: 'Holy Smite', class: 'paladin', level: 1,
        desc: 'Holy attack dealing 150% damage.',
        mpCost: 12, cooldown: 3000, damage: 1.5, type: 'magic', range: 1,
        icon: 'skills/holy_smite', animation: 'cast',
    },
    divine_shield: {
        id: 'divine_shield', name: 'Divine Shield', class: 'paladin', level: 6,
        desc: 'Block all damage for 3s.',
        mpCost: 30, cooldown: 15000, damage: 0, type: 'buff',
        effect: { invincible: true, duration: 3000 }, icon: 'skills/divine_shield', animation: 'shield',
    },
    heal: {
        id: 'heal', name: 'Heal', class: 'paladin', level: 8,
        desc: 'Restore 20% of max HP.',
        mpCost: 25, cooldown: 8000, damage: 0, type: 'heal',
        effect: { heal: 0.2 }, icon: 'skills/heal', animation: 'cast',
    },
    lay_on_hands: {
        id: 'lay_on_hands', name: 'Lay on Hands', class: 'paladin', level: 14,
        desc: 'Fully restore HP.',
        mpCost: 60, cooldown: 30000, damage: 0, type: 'heal',
        effect: { fullHeal: true }, icon: 'skills/lay_on_hands', animation: 'cast',
    },
    judgment: {
        id: 'judgment', name: 'Judgment', class: 'paladin', level: 18,
        desc: 'Holy judgment dealing 220% AoE damage.',
        mpCost: 50, cooldown: 12000, damage: 2.2, type: 'magic', range: 3, aoe: true,
        icon: 'skills/judgment', animation: 'cast',
    },

    // === ROGUE SKILLS ===
    backstab: {
        id: 'backstab', name: 'Backstab', class: 'rogue', level: 1,
        desc: 'Strike from behind dealing 180% damage.',
        mpCost: 12, cooldown: 4000, damage: 1.8, type: 'physical', range: 1,
        icon: 'skills/backstab', animation: 'attack',
    },
    smoke_bomb: {
        id: 'smoke_bomb', name: 'Smoke Bomb', class: 'rogue', level: 6,
        desc: 'Vanish into smoke, +80% dodge for 4s.',
        mpCost: 20, cooldown: 10000, damage: 0, type: 'buff',
        effect: { dodge: 0.8, duration: 4000 }, icon: 'skills/smoke_bomb', animation: 'smoke',
    },
    poison_blade: {
        id: 'poison_blade', name: 'Poison Blade', class: 'rogue', level: 10,
        desc: 'Enchant blade with poison, +50% damage over 5s.',
        mpCost: 18, cooldown: 5000, damage: 1.2, type: 'physical', range: 1,
        effect: { poison: 5000 }, icon: 'skills/poison_blade', animation: 'attack',
    },
    assassinate: {
        id: 'assassinate', name: 'Assassinate', class: 'rogue', level: 15,
        desc: 'Devastating strike dealing 300% damage.',
        mpCost: 40, cooldown: 10000, damage: 3.0, type: 'physical', range: 1,
        icon: 'skills/assassinate', animation: 'attack',
    },
    shadow_step: {
        id: 'shadow_step', name: 'Shadow Step', class: 'rogue', level: 12,
        desc: 'Teleport behind enemy, +100% crit for next attack.',
        mpCost: 25, cooldown: 8000, damage: 0, type: 'buff',
        effect: { critUp: 1.0, duration: 3000 }, icon: 'skills/shadow_step', animation: 'vanish',
    },

    // === NECROMANCER SKILLS ===
    summon_skeleton: {
        id: 'summon_skeleton', name: 'Summon Skeleton', class: 'necromancer', level: 1,
        desc: 'Summon a skeleton to fight for you.',
        mpCost: 20, cooldown: 8000, damage: 0, type: 'summon',
        summons: ['skeleton'], icon: 'skills/summon', animation: 'cast',
    },
    life_drain: {
        id: 'life_drain', name: 'Life Drain', class: 'necromancer', level: 5,
        desc: 'Drain 120% damage as HP from enemy.',
        mpCost: 20, cooldown: 5000, damage: 1.2, type: 'magic', range: 3, drain: true,
        icon: 'skills/life_drain', animation: 'cast',
    },
    bone_spear: {
        id: 'bone_spear', name: 'Bone Spear', class: 'necromancer', level: 9,
        desc: 'Pierce enemy with bone for 150% damage.',
        mpCost: 18, cooldown: 3500, damage: 1.5, type: 'magic', range: 4,
        icon: 'skills/bone_spear', animation: 'cast', projectile: 'bone',
    },
    corpse_explosion: {
        id: 'corpse_explosion', name: 'Corpse Explosion', class: 'necromancer', level: 13,
        desc: 'Explode a corpse dealing 200% AoE damage.',
        mpCost: 35, cooldown: 8000, damage: 2.0, type: 'magic', range: 3, aoe: true,
        icon: 'skills/corpse_explosion', animation: 'cast',
    },
    army_of_dead: {
        id: 'army_of_dead', name: 'Army of the Dead', class: 'necromancer', level: 18,
        desc: 'Summon 3 skeletons and a zombie.',
        mpCost: 70, cooldown: 20000, damage: 0, type: 'summon',
        summons: ['skeleton', 'skeleton', 'skeleton', 'zombie'], icon: 'skills/army_dead', animation: 'cast',
    },

    // === UNIVERSAL SKILLS (learned via scrolls) ===
    dash: {
        id: 'dash', name: 'Dash', class: 'universal', level: 1,
        desc: 'Quick dash forward, avoiding attacks.',
        mpCost: 8, cooldown: 3000, damage: 0, type: 'movement',
        icon: 'skills/dash', animation: 'dash',
    },
    meditate: {
        id: 'meditate', name: 'Meditate', class: 'universal', level: 1,
        desc: 'Restore 10% MP instantly.',
        mpCost: 0, cooldown: 10000, damage: 0, type: 'heal',
        effect: { mpRestore: 0.1 }, icon: 'skills/meditate', animation: 'meditate',
    },
    warcry_universal: {
        id: 'warcry_universal', name: 'Warcry', class: 'universal', level: 1,
        desc: '+20% ATK for 8s.',
        mpCost: 20, cooldown: 15000, damage: 0, type: 'buff',
        effect: { atkUp: 1.2, duration: 8000 }, icon: 'skills/warcry', animation: 'warcry',
    },
};

// Get skills for a class
export const getClassSkills = (classId) => {
    return Object.values(SKILLS).filter(s => s.class === classId);
};

// Get skill by id
export const getSkill = (skillId) => SKILLS[skillId];
