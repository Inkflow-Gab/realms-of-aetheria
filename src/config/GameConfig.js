// ============================================
// REALMS OF AETHERIA - GAME CONFIGURATION
// ============================================

export const GAME_CONFIG = {
    WIDTH: 1280,
    HEIGHT: 720,
    TILE_SIZE: 64,

    // Shown on the main menu. Keep in sync with versionName in
    // android/app/build.gradle and package.json.
    VERSION: '1.0.6',

    // Physics
    GRAVITY: 800,
    PLAYER_SPEED: 220,
    PLAYER_SPRINT_SPEED: 340,
    JUMP_VELOCITY: -450,

    // Combat
    COMBAT_COOLDOWN: 800,
    INVULN_TIME: 500,
    LOOT_DROP_CHANCE: 0.45,

    // World
    MAP_WIDTH: 80,
    MAP_HEIGHT: 60,

    // Colors
    COLORS: {
        HP: 0xe74c3c,
        MP: 0x3498db,
        XP: 0xf1c40f,
        GOLD: 0xffd700,
        HEAL: 0x2ecc71,
        DAMAGE: 0xe74c3c,
        CRIT: 0xff6b35,
        RARE: 0x9b59b6,
        EPIC: 0xe67e22,
        LEGENDARY: 0xffd700,
        UI_BG: 0x1a1a2e,
        UI_BORDER: 0xc9a84c,
        UI_TEXT: 0xf0e6d3,
        UI_ACCENT: 0xc9a84c,
    },

    // Rarity tiers
    RARITY: {
        COMMON: { color: 0xaaaaaa, name: 'Common', mult: 1.0 },
        UNCOMMON: { color: 0x2ecc71, name: 'Uncommon', mult: 1.3 },
        RARE: { color: 0x3498db, name: 'Rare', mult: 1.6 },
        EPIC: { color: 0x9b59b6, name: 'Epic', mult: 2.0 },
        LEGENDARY: { color: 0xffd700, name: 'Legendary', mult: 2.5 },
    }
};

// Character Races
export const RACES = {
    HUMAN: {
        id: 'human', name: 'Human', desc: 'Versatile and ambitious',
        bonuses: { str: 2, dex: 2, int: 2, vit: 2, luk: 2 },
        baseStats: { hp: 100, mp: 60, atk: 15, def: 10, spd: 12, luk: 10 },
        color: 0xf5cba7,
        sprite: 'human'
    },
    ELF: {
        id: 'elf', name: 'Elf', desc: 'Graceful and wise',
        bonuses: { str: 0, dex: 4, int: 4, vit: 0, luk: 2 },
        baseStats: { hp: 80, mp: 90, atk: 12, def: 8, spd: 16, luk: 14 },
        color: 0xa8e6cf,
        sprite: 'elf'
    },
    DWARF: {
        id: 'dwarf', name: 'Dwarf', desc: 'Stout and resilient',
        bonuses: { str: 4, dex: 0, int: 0, vit: 4, luk: 2 },
        baseStats: { hp: 130, mp: 40, atk: 18, def: 14, spd: 8, luk: 8 },
        color: 0xd4a574,
        sprite: 'dwarf'
    },
    ORC: {
        id: 'orc', name: 'Orc', desc: 'Powerful and fierce',
        bonuses: { str: 5, dex: 1, int: 0, vit: 3, luk: 1 },
        baseStats: { hp: 140, mp: 30, atk: 22, def: 12, spd: 10, luk: 6 },
        color: 0x8bc34a,
        sprite: 'orc'
    },
    UNDEAD: {
        id: 'undead', name: 'Undead', desc: 'Cursed but enduring',
        bonuses: { str: 3, dex: 1, int: 2, vit: 4, luk: 0 },
        baseStats: { hp: 120, mp: 50, atk: 16, def: 10, spd: 10, luk: 4 },
        color: 0xb0bec5,
        sprite: 'undead'
    },
    ANGEL: {
        id: 'angel', name: 'Angel', desc: 'Blessed with divine power',
        bonuses: { str: 1, dex: 2, int: 5, vit: 2, luk: 2 },
        baseStats: { hp: 90, mp: 110, atk: 14, def: 10, spd: 12, luk: 12 },
        color: 0xfff9c4,
        sprite: 'angel'
    }
};

// Character Classes
export const CLASSES = {
    WARRIOR: {
        id: 'warrior', name: 'Warrior', desc: 'Master of melee combat',
        primaryStat: 'str', secondaryStat: 'vit',
        statGrowth: { hp: 20, mp: 5, atk: 4, def: 3, spd: 1, luk: 1 },
        weaponTypes: ['sword', 'axe', 'mace', 'greatsword'],
        armorTypes: ['heavy', 'medium'],
        color: 0xe74c3c,
        sprite: 'warrior',
        startSkill: 'power_strike',
        skills: ['power_strike', 'whirlwind', 'shield_bash', 'berserker_rage', 'warcry']
    },
    MAGE: {
        id: 'mage', name: 'Mage', desc: 'Wielder of arcane magic',
        primaryStat: 'int', secondaryStat: 'dex',
        statGrowth: { hp: 10, mp: 15, atk: 2, def: 1, spd: 2, luk: 2 },
        weaponTypes: ['wand', 'staff', 'orb'],
        armorTypes: ['cloth'],
        color: 0x9b59b6,
        sprite: 'mage',
        startSkill: 'fireball',
        skills: ['fireball', 'ice_shard', 'lightning_bolt', 'arcane_missile', 'meteor_storm']
    },
    ARCHER: {
        id: 'archer', name: 'Archer', desc: 'Deadly precision from afar',
        primaryStat: 'dex', secondaryStat: 'str',
        statGrowth: { hp: 14, mp: 8, atk: 3, def: 2, spd: 4, luk: 2 },
        weaponTypes: ['bow', 'crossbow', 'dagger'],
        armorTypes: ['light', 'medium'],
        color: 0x2ecc71,
        sprite: 'archer',
        startSkill: 'power_shot',
        skills: ['power_shot', 'multishot', 'poison_arrow', 'eagle_eye', 'arrow_rain']
    },
    PALADIN: {
        id: 'paladin', name: 'Paladin', desc: 'Holy knight of light',
        primaryStat: 'str', secondaryStat: 'int',
        statGrowth: { hp: 18, mp: 10, atk: 3, def: 4, spd: 1, luk: 1 },
        weaponTypes: ['sword', 'mace', 'holy_symbol'],
        armorTypes: ['heavy', 'medium'],
        color: 0xf1c40f,
        sprite: 'paladin',
        startSkill: 'holy_smite',
        skills: ['holy_smite', 'divine_shield', 'heal', 'lay_on_hands', 'judgment']
    },
    ROGUE: {
        id: 'rogue', name: 'Rogue', desc: 'Shadow assassin',
        primaryStat: 'dex', secondaryStat: 'luk',
        statGrowth: { hp: 12, mp: 8, atk: 4, def: 1, spd: 5, luk: 3 },
        weaponTypes: ['dagger', 'shortsword', 'throwing_knife'],
        armorTypes: ['light'],
        color: 0x34495e,
        sprite: 'rogue',
        startSkill: 'backstab',
        skills: ['backstab', 'smoke_bomb', 'poison_blade', 'assassinate', 'shadow_step']
    },
    NECROMANCER: {
        id: 'necromancer', name: 'Necromancer', desc: 'Commander of the dead',
        primaryStat: 'int', secondaryStat: 'vit',
        statGrowth: { hp: 10, mp: 14, atk: 2, def: 1, spd: 1, luk: 3 },
        weaponTypes: ['staff', 'wand', 'skull_orb'],
        armorTypes: ['cloth'],
        color: 0x8e44ad,
        sprite: 'necromancer',
        startSkill: 'summon_skeleton',
        skills: ['summon_skeleton', 'life_drain', 'bone_spear', 'corpse_explosion', 'army_of_dead']
    }
};

// Traits
export const TRAITS = {
    BRAVE: { id: 'brave', name: 'Brave', category: 'Combat', tier: 'common', desc: '+15% damage, -10% defense', effect: { atkMult: 1.15, defMult: 0.9 } },
    TOUGH: { id: 'tough', name: 'Tough', category: 'Defense', tier: 'common', desc: '+25% HP, -10% speed', effect: { hpMult: 1.25, spdMult: 0.9 } },
    SWIFT: { id: 'swift', name: 'Swift', category: 'Combat', tier: 'common', desc: '+20% speed, -5% defense', effect: { spdMult: 1.2, defMult: 0.95 } },
    WISE: { id: 'wise', name: 'Wise', category: 'Magic', tier: 'common', desc: '+30% MP, +10% magic damage', effect: { mpMult: 1.3, magicMult: 1.1 } },
    LUCKY: { id: 'lucky', name: 'Lucky', category: 'Utility', tier: 'common', desc: '+15% crit, +10% gold find', effect: { critMult: 1.15, goldMult: 1.1 } },
    VAMPIRE: { id: 'vampire', name: 'Vampire', category: 'Combat', tier: 'rare', desc: 'Lifesteal 8% of damage dealt', effect: { lifesteal: 0.08 } },
    THORNS: { id: 'thorns', name: 'Thorns', category: 'Defense', tier: 'rare', desc: 'Reflect 15% damage taken', effect: { thorns: 0.15 } },
    EAGLE_EYE: { id: 'eagle_eye', name: 'Eagle Eye', category: 'Combat', tier: 'common', desc: '+10% hit rate, +5% crit', effect: { hitMult: 1.1, critMult: 1.05 } },
    IRON_WILL: { id: 'iron_will', name: 'Iron Will', category: 'Defense', tier: 'rare', desc: 'Stun resist +50%, +10% defense', effect: { stunResist: 0.5, defMult: 1.1 } },
    ARCANE_MIND: { id: 'arcane_mind', name: 'Arcane Mind', category: 'Magic', tier: 'rare', desc: 'Skills cost 15% less MP', effect: { mpCostMult: 0.85 } },
    BERSERK: { id: 'berserk', name: 'Berserk', category: 'Combat', tier: 'epic', desc: '+25% damage when HP < 30%', effect: { berserkThreshold: 0.3, berserkMult: 1.25 } },
    GUARDIAN: { id: 'guardian', name: 'Guardian', category: 'Defense', tier: 'common', desc: '+20% defense, -5% speed', effect: { defMult: 1.2, spdMult: 0.95 } },
    GOLD_DIGGER: { id: 'gold_digger', name: 'Gold Digger', category: 'Utility', tier: 'common', desc: '+30% gold from all sources', effect: { goldMult: 1.3 } },
    LOOTER: { id: 'looter', name: 'Looter', category: 'Utility', tier: 'common', desc: '+15% item drop chance', effect: { dropMult: 1.15 } },
    REGENERATOR: { id: 'regenerator', name: 'Regenerator', category: 'Defense', tier: 'rare', desc: 'Regen 2% max HP per second in combat', effect: { regen: 0.02 } },
    MANA_SHIELD: { id: 'mana_shield', name: 'Mana Shield', category: 'Magic', tier: 'epic', desc: '30% chance to negate magic damage', effect: { magicResist: 0.3 } },
    PHOENIX: { id: 'phoenix', name: 'Phoenix', category: 'Defense', tier: 'legendary', desc: 'Once per battle survive a killing blow at 1 HP', effect: { cheatDeath: 1 } },
    SHADOW: { id: 'shadow', name: 'Shadow', category: 'Combat', tier: 'epic', desc: '+12% dodge, +8% crit from stealth', effect: { dodgeMult: 1.12, critMult: 1.08 } },
    CHAMPION: { id: 'champion', name: 'Champion', category: 'Combat', tier: 'rare', desc: '+10% damage and +10% defense', effect: { atkMult: 1.1, defMult: 1.1 } },
    ALCHEMIST: { id: 'alchemist', name: 'Alchemist', category: 'Utility', tier: 'rare', desc: 'Potions heal 25% more', effect: { potionMult: 1.25 } },
};

// XP curve
export const XP_TABLE = (level) => Math.floor(100 * Math.pow(level, 1.8) + 50 * level);

// Level cap
export const MAX_LEVEL = 50;
