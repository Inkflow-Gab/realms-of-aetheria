// ============================================
// REALMS OF AETHERIA - MONSTER DATABASE
// ============================================

export const MONSTERS = {
    // === TIER 1: Level 1-5 (Starting Area) ===
    slime_green: {
        id: 'slime_green', name: 'Green Slime', level: 1, tier: 1,
        hp: 30, mp: 0, atk: 6, def: 2, spd: 4, exp: 12, gold: [3, 8],
        sprite: 'monsters/slime', scale: 1.0, aggressive: false,
        drops: [
            { item: 'minor_health_potion', chance: 0.22 },
            { item: 'bread', chance: 0.28 },
            { item: 'slime_gel', chance: 0.4 },
        ],
        skills: [],
        desc: 'A weak slime. Good for beginners.'
    },
    slime_blue: {
        id: 'slime_blue', name: 'Blue Slime', level: 3, tier: 1,
        hp: 50, mp: 10, atk: 9, def: 4, spd: 5, exp: 20, gold: [5, 12],
        sprite: 'monsters/slime', scale: 1.1, aggressive: false, tint: 0x3498db,
        drops: [
            { item: 'minor_mana_potion', chance: 0.15 },
            { item: 'minor_health_potion', chance: 0.2 },
        ],
        skills: ['spit'],
        desc: 'Slightly tougher slime.'
    },
    bat: {
        id: 'bat', name: 'Cave Bat', level: 2, tier: 1,
        hp: 25, mp: 0, atk: 8, def: 1, spd: 14, exp: 15, gold: [2, 6],
        sprite: 'monsters/bat', scale: 0.9, aggressive: true,
        drops: [
            { item: 'minor_health_potion', chance: 0.1 },
        ],
        skills: ['bite', 'screech'],
        desc: 'Fast and aggressive.'
    },
    goblin: {
        id: 'goblin', name: 'Goblin', level: 3, tier: 1,
        hp: 45, mp: 0, atk: 11, def: 3, spd: 10, exp: 22, gold: [8, 18],
        sprite: 'monsters/goblin', scale: 1.0, aggressive: true,
        drops: [
            { item: 'rusty_sword', chance: 0.18 },
            { item: 'copper_ring', chance: 0.1 },
            { item: 'bread', chance: 0.3 },
            { item: 'goblin_ear', chance: 0.45 },
            { item: 'loot_chest_key', chance: 0.06 },
        ],
        skills: ['stab', 'throw_rock'],
        desc: 'A sneaky goblin with a rusty blade.'
    },
    snake: {
        id: 'snake', name: 'Viper', level: 4, tier: 1,
        hp: 35, mp: 0, atk: 13, def: 2, spd: 16, exp: 25, gold: [5, 10],
        sprite: 'monsters/snake', scale: 1.0, aggressive: true,
        drops: [
            { item: 'antidote', chance: 0.2 },
            { item: 'minor_health_potion', chance: 0.15 },
        ],
        skills: ['bite', 'poison_fang'],
        desc: 'Its venom can be deadly.'
    },
    skeleton: {
        id: 'skeleton', name: 'Skeleton', level: 5, tier: 1,
        hp: 55, mp: 0, atk: 14, def: 5, spd: 8, exp: 35, gold: [10, 20],
        sprite: 'monsters/skeleton', scale: 1.1, aggressive: true,
        drops: [
            { item: 'iron_sword', chance: 0.05 },
            { item: 'wooden_shield', chance: 0.06 },
            { item: 'minor_health_potion', chance: 0.2 },
        ],
        skills: ['slash', 'bone_throw'],
        desc: 'Risen from the grave.'
    },
    mushroom: {
        id: 'mushroom', name: 'Toxic Mushroom', level: 4, tier: 1,
        hp: 40, mp: 20, atk: 10, def: 3, spd: 3, exp: 28, gold: [5, 12],
        sprite: 'monsters/mushroom', scale: 1.0, aggressive: false,
        drops: [
            { item: 'antidote', chance: 0.25 },
            { item: 'minor_mana_potion', chance: 0.15 },
        ],
        skills: ['spore_cloud', 'poison_touch'],
        desc: 'Releases toxic spores.'
    },

    // === TIER 2: Level 6-15 (Forest/Mines) ===
    wolf: {
        id: 'wolf', name: 'Dire Wolf', level: 8, tier: 2,
        hp: 90, mp: 0, atk: 20, def: 8, spd: 18, exp: 55, gold: [15, 30],
        sprite: 'monsters/wolf', scale: 1.2, aggressive: true,
        drops: [
            { item: 'hunters_bow', chance: 0.06 },
            { item: 'meat', chance: 0.3 },
            { item: 'leather_belt', chance: 0.08 },
        ],
        skills: ['bite', 'howl', 'pounce'],
        desc: 'A fierce predator of the dark forest.'
    },
    spider: {
        id: 'spider', name: 'Giant Spider', level: 9, tier: 2,
        hp: 75, mp: 10, atk: 22, def: 6, spd: 20, exp: 60, gold: [12, 25],
        sprite: 'monsters/spider', scale: 1.1, aggressive: true,
        drops: [
            { item: 'antidote', chance: 0.2 },
            { item: 'minor_mana_potion', chance: 0.15 },
        ],
        skills: ['bite', 'web', 'poison_fang'],
        desc: 'Its web traps the unwary.'
    },
    zombie: {
        id: 'zombie', name: 'Zombie', level: 10, tier: 2,
        hp: 120, mp: 0, atk: 18, def: 10, spd: 5, exp: 65, gold: [10, 25],
        sprite: 'monsters/zombie', scale: 1.15, aggressive: true,
        drops: [
            { item: 'cloth_robe', chance: 0.06 },
            { item: 'minor_health_potion', chance: 0.2 },
        ],
        skills: ['slash', 'grab'],
        desc: 'Slow but relentless.'
    },
    ghost: {
        id: 'ghost', name: 'Ghost', level: 11, tier: 2,
        hp: 60, mp: 60, atk: 25, def: 4, spd: 14, exp: 75, gold: [20, 40],
        sprite: 'monsters/ghost', scale: 1.0, aggressive: true, ghostly: true,
        drops: [
            { item: 'minor_mana_potion', chance: 0.2 },
            { item: 'silver_ring', chance: 0.04 },
        ],
        skills: ['life_drain', 'terror_wail', 'phase'],
        desc: 'Incorporeal and deadly.'
    },
    mimic: {
        id: 'mimic', name: 'Mimic', level: 12, tier: 2,
        hp: 100, mp: 0, atk: 22, def: 15, spd: 6, exp: 85, gold: [50, 120],
        sprite: 'monsters/mimic', scale: 1.2, aggressive: false, disguised: true,
        drops: [
            { item: 'iron_sword', chance: 0.1 },
            { item: 'health_potion', chance: 0.2 },
            { item: 'silver_ring', chance: 0.06 },
        ],
        skills: ['bite', 'swallow'],
        desc: 'Looks like a chest... until it bites.'
    },
    cyclops: {
        id: 'cyclops', name: 'Cyclops', level: 14, tier: 2,
        hp: 200, mp: 0, atk: 30, def: 12, spd: 6, exp: 100, gold: [30, 60],
        sprite: 'monsters/cyclop', scale: 1.6, aggressive: true,
        drops: [
            { item: 'battle_axe', chance: 0.08 },
            { item: 'iron_helmet', chance: 0.07 },
            { item: 'leather_armor', chance: 0.08 },
        ],
        skills: ['smash', 'throw_boulder', 'rage'],
        desc: 'A giant with one eye and immense strength.'
    },
    skeleton_archer: {
        id: 'skeleton_archer', name: 'Skeleton Archer', level: 12, tier: 2,
        hp: 70, mp: 0, atk: 28, def: 5, spd: 12, exp: 80, gold: [18, 35],
        sprite: 'monsters/skeleton', scale: 1.1, aggressive: true, tint: 0xaaddaa,
        drops: [
            { item: 'hunters_bow', chance: 0.08 },
            { item: 'iron_helmet', chance: 0.05 },
        ],
        skills: ['arrow_shot', 'multi_arrow'],
        desc: 'Ranged undead attacker.'
    },
    boar: {
        id: 'boar', name: 'Wild Boar', level: 7, tier: 2,
        hp: 80, mp: 0, atk: 18, def: 10, spd: 14, exp: 48, gold: [10, 20],
        sprite: 'monsters/boar', scale: 1.1, aggressive: true,
        drops: [
            { item: 'meat', chance: 0.4 },
            { item: 'leather_armor', chance: 0.06 },
        ],
        skills: ['charge', 'gore'],
        desc: 'Charges at anything that moves.'
    },

    // === TIER 3: Level 16-25 (Dungeon/Cave) ===
    dark_knight: {
        id: 'dark_knight', name: 'Dark Knight', level: 18, tier: 3,
        hp: 250, mp: 30, atk: 38, def: 25, spd: 10, exp: 150, gold: [50, 100],
        sprite: 'monsters/dark_knight', scale: 1.3, aggressive: true,
        drops: [
            { item: 'steel_longsword', chance: 0.08 },
            { item: 'chainmail', chance: 0.08 },
            { item: 'iron_shield', chance: 0.06 },
        ],
        skills: ['slash', 'dark_slash', 'shield_bash', 'war_cry'],
        desc: 'A corrupted warrior in dark armor.'
    },
    mage_cultist: {
        id: 'mage_cultist', name: 'Cultist Mage', level: 17, tier: 3,
        hp: 100, mp: 120, atk: 40, def: 8, spd: 12, exp: 140, gold: [40, 80],
        sprite: 'monsters/cultist', scale: 1.2, aggressive: true,
        drops: [
            { item: 'crystal_wand', chance: 0.06 },
            { item: 'oak_staff', chance: 0.08 },
            { item: 'mana_potion', chance: 0.25 },
        ],
        skills: ['fireball', 'ice_shard', 'arcane_bolt', 'curse'],
        desc: 'Dark magic user.'
    },
    stone_golem: {
        id: 'stone_golem', name: 'Stone Golem', level: 20, tier: 3,
        hp: 400, mp: 0, atk: 35, def: 40, spd: 4, exp: 200, gold: [40, 80],
        sprite: 'monsters/golem', scale: 1.8, aggressive: false,
        drops: [
            { item: 'iron_shield', chance: 0.1 },
            { item: 'health_potion', chance: 0.2 },
        ],
        skills: ['smash', 'rock_throw', 'fortify'],
        desc: 'Nearly indestructible.'
    },
    vampire: {
        id: 'vampire', name: 'Vampire', level: 22, tier: 3,
        hp: 200, mp: 80, atk: 42, def: 15, spd: 18, exp: 220, gold: [80, 150],
        sprite: 'monsters/vampire', scale: 1.3, aggressive: true,
        drops: [
            { item: 'shadow_dagger', chance: 0.06 },
            { item: 'shadow_cloak', chance: 0.05 },
            { item: 'greater_health_potion', chance: 0.15 },
        ],
        skills: ['life_drain', 'bat_swarm', 'charm', 'blood_bolt'],
        desc: 'Drains the life of its victims.'
    },
    dragon_whelp: {
        id: 'dragon_whelp', name: 'Dragon Whelp', level: 24, tier: 3,
        hp: 300, mp: 50, atk: 45, def: 25, spd: 14, exp: 280, gold: [100, 200],
        sprite: 'monsters/dragon', scale: 1.4, aggressive: true,
        drops: [
            { item: 'dragon_slayer', chance: 0.03 },
            { item: 'greater_health_potion', chance: 0.2 },
        ],
        skills: ['fire_breath', 'tail_sweep', 'claw', 'wing_gust'],
        desc: 'Young but already dangerous.'
    },

    // === TIER 4: Level 26-35 (Hard Dungeon) ===
    lich: {
        id: 'lich', name: 'Lich', level: 30, tier: 4,
        hp: 400, mp: 300, atk: 55, def: 20, spd: 12, exp: 500, gold: [200, 400],
        sprite: 'monsters/lich', scale: 1.5, aggressive: true,
        drops: [
            { item: 'staff_of_archmagi', chance: 0.04 },
            { item: 'orb_of_power', chance: 0.05 },
            { item: 'greater_mana_potion', chance: 0.25 },
        ],
        skills: ['fireball', 'ice_storm', 'lightning', 'summon_undead', 'death_nova'],
        desc: 'An undead master of dark magic.'
    },
    demon: {
        id: 'demon', name: 'Demon', level: 32, tier: 4,
        hp: 600, mp: 100, atk: 60, def: 30, spd: 16, exp: 600, gold: [250, 500],
        sprite: 'monsters/demon', scale: 1.7, aggressive: true,
        drops: [
            { item: 'dragon_slayer', chance: 0.05 },
            { item: 'elixir_of_life', chance: 0.1 },
        ],
        skills: ['hellfire', 'claw', 'terror', 'summon_demon'],
        desc: 'A powerful fiend from the abyss.'
    },
    dragon: {
        id: 'dragon', name: 'Elder Dragon', level: 35, tier: 4,
        hp: 1000, mp: 200, atk: 70, def: 40, spd: 12, exp: 1000, gold: [500, 1000],
        sprite: 'monsters/dragon', scale: 2.2, aggressive: true, boss: true,
        drops: [
            { item: 'excalibur', chance: 0.05 },
            { item: 'dragon_scale_armor', chance: 0.1 },
            { item: 'elixir_of_life', chance: 0.35 },
            { item: 'boss_trophy', chance: 0.55 },
            { item: 'magic_dust', chance: 0.7, count: 3 },
            { item: 'loot_chest_key', chance: 0.3 },
        ],
        skills: ['fire_breath', 'tail_sweep', 'claw', 'wing_gust', 'dragon_fury'],
        desc: 'An ancient and terrible dragon.'
    },

    // === TIER 5: Level 36-50 (Endgame) ===
    blood_monster: {
        id: 'blood_monster', name: 'Blood Monster', level: 38, tier: 5,
        hp: 800, mp: 150, atk: 75, def: 35, spd: 18, exp: 1200, gold: [400, 800],
        sprite: 'monsters/blood_monster', scale: 1.8, aggressive: true,
        drops: [
            { item: 'dragon_slayer', chance: 0.06 },
            { item: 'elixir_of_life', chance: 0.15 },
        ],
        skills: ['blood_drain', 'blood_explosion', 'regenerate', 'frenzy'],
        desc: 'A horrifying abomination.'
    },
    ancient_lich: {
        id: 'ancient_lich', name: 'Ancient Lich', level: 42, tier: 5,
        hp: 700, mp: 500, atk: 85, def: 25, spd: 14, exp: 2000, gold: [600, 1200],
        sprite: 'monsters/lich', scale: 1.8, aggressive: true, boss: true,
        drops: [
            { item: 'staff_of_archmagi', chance: 0.06 },
            { item: 'ring_of_power', chance: 0.04 },
        ],
        skills: ['fireball', 'ice_storm', 'lightning', 'summon_undead', 'death_nova', 'time_stop'],
        desc: 'Master of undeath.'
    },
    shadow_lord: {
        id: 'shadow_lord', name: 'Shadow Lord', level: 45, tier: 5,
        hp: 1200, mp: 300, atk: 90, def: 40, spd: 20, exp: 3000, gold: [800, 1600],
        sprite: 'monsters/shadow_lord', scale: 2.0, aggressive: true, boss: true,
        drops: [
            { item: 'assassins_blade', chance: 0.05 },
            { item: 'shadow_cloak', chance: 0.06 },
        ],
        skills: ['shadow_strike', 'smoke_bomb', 'assassinate', 'shadow_step', 'death_mark'],
        desc: 'Ruler of shadows.'
    },
    titan: {
        id: 'titan', name: 'Titan', level: 48, tier: 5,
        hp: 2000, mp: 0, atk: 100, def: 60, spd: 6, exp: 5000, gold: [1000, 2000],
        sprite: 'monsters/giant', scale: 2.5, aggressive: true, boss: true,
        drops: [
            { item: 'belt_of_giants', chance: 0.05 },
            { item: 'excalibur', chance: 0.03 },
        ],
        skills: ['smash', 'earthquake', 'rage', 'fortify', 'meteor'],
        desc: 'A colossal being of destruction.'
    },
    aetheria_dragon: {
        id: 'aetheria_dragon', name: 'Aetheria, the World Dragon', level: 50, tier: 5,
        hp: 5000, mp: 1000, atk: 120, def: 60, spd: 16, exp: 10000, gold: [5000, 10000],
        sprite: 'monsters/dragon', scale: 3.0, aggressive: true, boss: true, finalBoss: true,
        drops: [
            { item: 'excalibur', chance: 0.1 },
            { item: 'dragon_scale_armor', chance: 0.08 },
            { item: 'ring_of_power', chance: 0.06 },
        ],
        skills: ['fire_breath', 'ice_breath', 'lightning_breath', 'tail_sweep', 'claw', 'wing_gust', 'dragon_fury', 'apocalypse'],
        desc: 'The final boss. The World Dragon of Aetheria.'
    }
};

// Monster spawn tables by zone
export const ZONE_SPAWNS = {
    town: [],
    meadow: ['slime_green', 'slime_blue', 'snake', 'mushroom', 'bat'],
    forest: ['wolf', 'spider', 'goblin', 'boar', 'skeleton', 'mushroom'],
    cave: ['bat', 'spider', 'skeleton', 'skeleton_archer', 'ghost', 'mimic'],
    ruins: ['zombie', 'ghost', 'skeleton', 'dark_knight', 'mage_cultist'],
    mountain: ['cyclops', 'stone_golem', 'dragon_whelp', 'dark_knight'],
    dungeon: ['dark_knight', 'mage_cultist', 'stone_golem', 'vampire', 'lich'],
    abyss: ['demon', 'blood_monster', 'ancient_lich', 'shadow_lord', 'titan'],
    arena: ['slime_green', 'goblin', 'skeleton', 'wolf', 'spider', 'dark_knight', 'demon', 'dragon'],
};

// Skills that monsters can use
export const MONSTER_SKILLS = {
    bite: { name: 'Bite', damage: 1.0, type: 'physical', mpCost: 0, cooldown: 2000 },
    poison_fang: { name: 'Poison Fang', damage: 0.8, type: 'physical', mpCost: 0, cooldown: 3000, effect: { poison: 3000 } },
    spit: { name: 'Spit', damage: 0.7, type: 'physical', mpCost: 0, cooldown: 2500 },
    screech: { name: 'Screech', damage: 0.3, type: 'physical', mpCost: 0, cooldown: 5000, effect: { defDown: 0.5, duration: 3000 } },
    stab: { name: 'Stab', damage: 1.1, type: 'physical', mpCost: 0, cooldown: 2000 },
    throw_rock: { name: 'Throw Rock', damage: 1.2, type: 'physical', mpCost: 0, cooldown: 3000 },
    slash: { name: 'Slash', damage: 1.1, type: 'physical', mpCost: 0, cooldown: 2000 },
    bone_throw: { name: 'Bone Throw', damage: 1.0, type: 'physical', mpCost: 0, cooldown: 3000 },
    spore_cloud: { name: 'Spore Cloud', damage: 0.5, type: 'magic', mpCost: 10, cooldown: 4000, aoe: true, effect: { poison: 3000 } },
    poison_touch: { name: 'Poison Touch', damage: 0.6, type: 'physical', mpCost: 0, cooldown: 3000, effect: { poison: 2000 } },
    howl: { name: 'Howl', damage: 0, type: 'buff', mpCost: 0, cooldown: 8000, effect: { atkUp: 1.3, duration: 5000 } },
    pounce: { name: 'Pounce', damage: 1.3, type: 'physical', mpCost: 0, cooldown: 3500 },
    web: { name: 'Web', damage: 0.3, type: 'physical', mpCost: 0, cooldown: 4000, effect: { slow: 0.5, duration: 3000 } },
    grab: { name: 'Grab', damage: 0.8, type: 'physical', mpCost: 0, cooldown: 3000, effect: { stun: 1500 } },
    life_drain: { name: 'Life Drain', damage: 0.8, type: 'magic', mpCost: 15, cooldown: 3000, drain: true },
    terror_wail: { name: 'Terror Wail', damage: 0.5, type: 'magic', mpCost: 20, cooldown: 6000, effect: { atkDown: 0.7, duration: 4000 } },
    phase: { name: 'Phase', damage: 0, type: 'buff', mpCost: 10, cooldown: 5000, effect: { dodge: 1.0, duration: 2000 } },
    swallow: { name: 'Swallow', damage: 1.5, type: 'physical', mpCost: 0, cooldown: 5000 },
    smash: { name: 'Smash', damage: 1.4, type: 'physical', mpCost: 0, cooldown: 2500 },
    throw_boulder: { name: 'Throw Boulder', damage: 1.5, type: 'physical', mpCost: 0, cooldown: 4000 },
    rage: { name: 'Rage', damage: 0, type: 'buff', mpCost: 0, cooldown: 10000, effect: { atkUp: 1.5, duration: 6000 } },
    arrow_shot: { name: 'Arrow Shot', damage: 1.2, type: 'physical', mpCost: 0, cooldown: 2500 },
    multi_arrow: { name: 'Multi Arrow', damage: 0.7, type: 'physical', mpCost: 10, cooldown: 4000, aoe: true },
    charge: { name: 'Charge', damage: 1.3, type: 'physical', mpCost: 0, cooldown: 3500 },
    gore: { name: 'Gore', damage: 1.2, type: 'physical', mpCost: 0, cooldown: 2500 },
    dark_slash: { name: 'Dark Slash', damage: 1.3, type: 'physical', mpCost: 10, cooldown: 3000 },
    shield_bash: { name: 'Shield Bash', damage: 0.9, type: 'physical', mpCost: 0, cooldown: 3000, effect: { stun: 1000 } },
    war_cry: { name: 'War Cry', damage: 0, type: 'buff', mpCost: 0, cooldown: 8000, effect: { atkUp: 1.2, duration: 5000 } },
    fireball: { name: 'Fireball', damage: 1.3, type: 'magic', mpCost: 15, cooldown: 3000 },
    ice_shard: { name: 'Ice Shard', damage: 1.1, type: 'magic', mpCost: 12, cooldown: 2500, effect: { slow: 0.3, duration: 2000 } },
    arcane_bolt: { name: 'Arcane Bolt', damage: 1.2, type: 'magic', mpCost: 10, cooldown: 2000 },
    curse: { name: 'Curse', damage: 0.3, type: 'magic', mpCost: 20, cooldown: 6000, effect: { defDown: 0.6, duration: 5000 } },
    rock_throw: { name: 'Rock Throw', damage: 1.3, type: 'physical', mpCost: 0, cooldown: 3500 },
    fortify: { name: 'Fortify', damage: 0, type: 'buff', mpCost: 0, cooldown: 8000, effect: { defUp: 1.5, duration: 5000 } },
    bat_swarm: { name: 'Bat Swarm', damage: 0.8, type: 'physical', mpCost: 15, cooldown: 4000, aoe: true },
    charm: { name: 'Charm', damage: 0.2, type: 'magic', mpCost: 25, cooldown: 8000, effect: { stun: 2000 } },
    blood_bolt: { name: 'Blood Bolt', damage: 1.2, type: 'magic', mpCost: 12, cooldown: 2500 },
    fire_breath: { name: 'Fire Breath', damage: 1.5, type: 'magic', mpCost: 20, cooldown: 4000, aoe: true },
    tail_sweep: { name: 'Tail Sweep', damage: 1.2, type: 'physical', mpCost: 0, cooldown: 3000, aoe: true },
    claw: { name: 'Claw', damage: 1.3, type: 'physical', mpCost: 0, cooldown: 2000 },
    wing_gust: { name: 'Wing Gust', damage: 0.7, type: 'physical', mpCost: 0, cooldown: 3500, aoe: true, effect: { slow: 0.3, duration: 2000 } },
    dragon_fury: { name: 'Dragon Fury', damage: 1.8, type: 'magic', mpCost: 40, cooldown: 8000, aoe: true },
    ice_storm: { name: 'Ice Storm', damage: 1.4, type: 'magic', mpCost: 30, cooldown: 5000, aoe: true, effect: { slow: 0.4, duration: 3000 } },
    lightning: { name: 'Lightning', damage: 1.5, type: 'magic', mpCost: 25, cooldown: 4000 },
    summon_undead: { name: 'Summon Undead', damage: 0, type: 'summon', mpCost: 30, cooldown: 10000, summons: ['skeleton', 'zombie'] },
    death_nova: { name: 'Death Nova', damage: 1.6, type: 'magic', mpCost: 50, cooldown: 8000, aoe: true },
    hellfire: { name: 'Hellfire', damage: 1.5, type: 'magic', mpCost: 25, cooldown: 4000, aoe: true },
    terror: { name: 'Terror', damage: 0.5, type: 'magic', mpCost: 20, cooldown: 6000, effect: { atkDown: 0.6, defDown: 0.6, duration: 4000 } },
    summon_demon: { name: 'Summon Demon', damage: 0, type: 'summon', mpCost: 50, cooldown: 12000, summons: ['demon'] },
    blood_drain: { name: 'Blood Drain', damage: 1.0, type: 'magic', mpCost: 20, cooldown: 3000, drain: true },
    blood_explosion: { name: 'Blood Explosion', damage: 1.5, type: 'magic', mpCost: 30, cooldown: 5000, aoe: true },
    regenerate: { name: 'Regenerate', damage: 0, type: 'buff', mpCost: 20, cooldown: 8000, effect: { regen: 0.05, duration: 5000 } },
    frenzy: { name: 'Frenzy', damage: 0, type: 'buff', mpCost: 0, cooldown: 10000, effect: { atkUp: 1.8, spdUp: 1.5, duration: 5000 } },
    time_stop: { name: 'Time Stop', damage: 0.5, type: 'magic', mpCost: 60, cooldown: 10000, aoe: true, effect: { stun: 3000 } },
    shadow_strike: { name: 'Shadow Strike', damage: 1.4, type: 'physical', mpCost: 15, cooldown: 3000 },
    smoke_bomb: { name: 'Smoke Bomb', damage: 0, type: 'buff', mpCost: 20, cooldown: 6000, effect: { dodge: 0.8, duration: 3000 } },
    assassinate: { name: 'Assassinate', damage: 2.0, type: 'physical', mpCost: 30, cooldown: 5000 },
    shadow_step: { name: 'Shadow Step', damage: 0, type: 'buff', mpCost: 15, cooldown: 4000, effect: { spdUp: 2.0, duration: 2000 } },
    death_mark: { name: 'Death Mark', damage: 0.8, type: 'magic', mpCost: 25, cooldown: 6000, effect: { defDown: 0.8, duration: 5000 } },
    earthquake: { name: 'Earthquake', damage: 1.5, type: 'physical', mpCost: 40, cooldown: 8000, aoe: true, effect: { stun: 2000 } },
    meteor: { name: 'Meteor', damage: 2.0, type: 'magic', mpCost: 60, cooldown: 10000, aoe: true },
    ice_breath: { name: 'Ice Breath', damage: 1.5, type: 'magic', mpCost: 25, cooldown: 4000, aoe: true, effect: { slow: 0.5, duration: 3000 } },
    lightning_breath: { name: 'Lightning Breath', damage: 1.6, type: 'magic', mpCost: 30, cooldown: 4500, aoe: true },
    apocalypse: { name: 'Apocalypse', damage: 2.5, type: 'magic', mpCost: 100, cooldown: 15000, aoe: true, effect: { stun: 3000, defDown: 0.5, duration: 5000 } },
};
