// ============================================
// REALMS OF AETHERIA - QUEST DATABASE
// ============================================

/** Human-readable zone atlas used by Map + quest compass. */
export const ZONE_INFO = {
    town:     { id: 'town',     name: 'Aetheria Village',  hint: 'Shops · Elders · Rest',        color: '#c9a84c', mapX: 0.28, mapY: 0.55 },
    meadow:   { id: 'meadow',   name: 'Greenleaf Meadow',  hint: 'Slimes · Beginner hunts',      color: '#2ecc71', mapX: 0.48, mapY: 0.42 },
    forest:   { id: 'forest',   name: 'Darkwood Forest',   hint: 'Goblins · Wolves · Spiders',   color: '#1e8449', mapX: 0.62, mapY: 0.38 },
    cave:     { id: 'cave',     name: 'Echoing Caves',     hint: 'Bats · Skeletons · Ghosts',    color: '#7f8c8d', mapX: 0.55, mapY: 0.62 },
    ruins:    { id: 'ruins',    name: 'Ancient Ruins',     hint: 'Undead · Cultists',            color: '#a569bd', mapX: 0.72, mapY: 0.58 },
    mountain: { id: 'mountain', name: 'Ironpeak Mountain', hint: 'Cyclops · Dragon Whelps',      color: '#85929e', mapX: 0.78, mapY: 0.28 },
    dungeon:  { id: 'dungeon',  name: 'Shadow Dungeon',    hint: 'Knights · Lich · Prisoners',   color: '#5d6d7e', mapX: 0.38, mapY: 0.72 },
    abyss:    { id: 'abyss',    name: 'The Abyss',         hint: 'Bosses · World Dragon',        color: '#922b21', mapX: 0.55, mapY: 0.82 },
    arena:    { id: 'arena',    name: 'Battle Arena',      hint: 'Mixed foes · Ranked fights',   color: '#e67e22', mapX: 0.22, mapY: 0.32 },
};

/** Where each quest NPC lives. */
export const NPC_LOCATIONS = {
    elder_marcus:         { zone: 'town',    label: 'Village Hall' },
    blacksmith_brom:      { zone: 'town',    label: 'Brom\'s Forge' },
    potion_seller_luna:   { zone: 'town',    label: 'Potion Stall' },
    shopkeeper_gilda:     { zone: 'town',    label: 'General Store' },
    armor_smith_thorin:   { zone: 'town',    label: 'Armory' },
    innkeeper_rosa:       { zone: 'town',    label: 'Rosa\'s Inn' },
    wizard_eldrin:        { zone: 'town',    label: 'Wizard Tower' },
    priest_aurora:        { zone: 'town',    label: 'Temple' },
    guard_captain:        { zone: 'town',    label: 'Guard Barracks' },
    merchant_sam:         { zone: 'town',    label: 'Market Row' },
    prisoner_karl:        { zone: 'dungeon', label: 'Dungeon Cells' },
    ghost_scholar:        { zone: 'dungeon', label: 'Deep Archives' },
    treasure_hunter_zara: { zone: 'abyss',   label: 'Dragon\'s Approach' },
};

/** Best zone to farm each monster for kill/collect objectives. */
export const MOB_DESTINATIONS = {
    slime_green: 'meadow', slime_blue: 'meadow', snake: 'meadow', mushroom: 'meadow',
    bat: 'cave', goblin: 'forest', wolf: 'forest', spider: 'forest', boar: 'forest',
    skeleton: 'cave', skeleton_archer: 'cave', ghost: 'cave', mimic: 'cave',
    zombie: 'ruins', dark_knight: 'dungeon', mage_cultist: 'ruins',
    cyclops: 'mountain', stone_golem: 'mountain', dragon_whelp: 'mountain',
    vampire: 'dungeon', lich: 'dungeon', demon: 'abyss', dragon: 'arena',
    blood_monster: 'abyss', ancient_lich: 'abyss', shadow_lord: 'abyss',
    titan: 'abyss', aetheria_dragon: 'abyss',
};

export const QUESTS = {
    quest_main_1: {
        id: 'quest_main_1', name: 'The Darkness Rises',
        desc: 'Investigate the monster attacks near the village.',
        type: 'main', level: 1,
        destination: { zone: 'meadow', label: 'Greenleaf Meadow' },
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'elder_marcus', desc: 'Speak with Elder Marcus', destination: { zone: 'town', label: 'Village Hall' } },
            { id: 'obj_2', type: 'kill', target: 'slime_green', count: 5, desc: 'Slay 5 Green Slimes', destination: { zone: 'meadow', label: 'Greenleaf Meadow' } },
            { id: 'obj_3', type: 'report', target: 'elder_marcus', desc: 'Report back to Elder Marcus', destination: { zone: 'town', label: 'Village Hall' } },
        ],
        rewards: { exp: 100, gold: 50, items: ['iron_sword'] },
        repeatable: false,
        nextQuest: 'quest_main_2',
    },
    quest_main_2: {
        id: 'quest_main_2', name: 'The Goblin Threat',
        desc: 'Goblins are raiding travelers on the forest road.',
        type: 'main', level: 3,
        destination: { zone: 'forest', label: 'Darkwood Forest' },
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'guard_captain', desc: 'Speak with Captain Aldric', destination: { zone: 'town', label: 'Guard Barracks' } },
            { id: 'obj_2', type: 'kill', target: 'goblin', count: 8, desc: 'Slay 8 Goblins', destination: { zone: 'forest', label: 'Darkwood Forest' } },
            { id: 'obj_3', type: 'collect', target: 'rusty_sword', count: 3, desc: 'Collect 3 Rusty Swords from goblins', destination: { zone: 'forest', label: 'Darkwood Forest' } },
            { id: 'obj_4', type: 'report', target: 'guard_captain', desc: 'Report to Captain Aldric', destination: { zone: 'town', label: 'Guard Barracks' } },
        ],
        rewards: { exp: 250, gold: 100, items: ['leather_armor'] },
        repeatable: false,
        nextQuest: 'quest_main_3',
    },
    quest_main_3: {
        id: 'quest_main_3', name: 'Echoes in the Cave',
        desc: 'Strange sounds echo from the abandoned mine.',
        type: 'main', level: 6,
        destination: { zone: 'cave', label: 'Echoing Caves' },
        objectives: [
            { id: 'obj_1', type: 'kill', target: 'skeleton', count: 10, desc: 'Slay 10 Skeletons', destination: { zone: 'cave', label: 'Echoing Caves' } },
            { id: 'obj_2', type: 'kill', target: 'bat', count: 8, desc: 'Slay 8 Cave Bats', destination: { zone: 'cave', label: 'Echoing Caves' } },
            { id: 'obj_3', type: 'kill', target: 'ghost', count: 3, desc: 'Banish 3 Ghosts', destination: { zone: 'cave', label: 'Echoing Caves' } },
        ],
        rewards: { exp: 500, gold: 200, items: ['steel_longsword', 'health_potion'] },
        repeatable: false,
        nextQuest: 'quest_main_4',
    },
    quest_main_4: {
        id: 'quest_main_4', name: 'The Lich\'s Shadow',
        desc: 'A lich has taken residence in the deep dungeon.',
        type: 'main', level: 25,
        destination: { zone: 'dungeon', label: 'Shadow Dungeon' },
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'ghost_scholar', desc: 'Find the Ghost Scholar', destination: { zone: 'dungeon', label: 'Deep Archives' } },
            { id: 'obj_2', type: 'kill', target: 'lich', count: 1, desc: 'Defeat the Lich', destination: { zone: 'dungeon', label: 'Shadow Dungeon' } },
        ],
        rewards: { exp: 2000, gold: 1000, items: ['staff_of_archmagi'] },
        repeatable: false,
        nextQuest: 'quest_main_5',
    },
    quest_main_5: {
        id: 'quest_main_5', name: 'The World Dragon',
        desc: 'Face Aetheria, the World Dragon, in the Abyss.',
        type: 'main', level: 45,
        destination: { zone: 'abyss', label: 'The Abyss' },
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'treasure_hunter_zara', desc: 'Meet Zara at the dragon\'s lair', destination: { zone: 'abyss', label: 'Dragon\'s Approach' } },
            { id: 'obj_2', type: 'kill', target: 'aetheria_dragon', count: 1, desc: 'Defeat Aetheria, the World Dragon', destination: { zone: 'abyss', label: 'The Abyss' } },
        ],
        rewards: { exp: 10000, gold: 10000, items: ['excalibur'] },
        repeatable: false,
        nextQuest: null,
    },

    quest_side_inn: {
        id: 'quest_side_inn', name: 'Rosa\'s Recipe',
        desc: 'Rosa needs ingredients for her special stew.',
        type: 'side', level: 2,
        destination: { zone: 'town', label: 'Rosa\'s Inn' },
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'innkeeper_rosa', desc: 'Speak with Rosa', destination: { zone: 'town', label: 'Rosa\'s Inn' } },
            { id: 'obj_2', type: 'collect', target: 'meat', count: 5, desc: 'Collect 5 Cooked Meat', destination: { zone: 'forest', label: 'Darkwood Forest' } },
            { id: 'obj_3', type: 'report', target: 'innkeeper_rosa', desc: 'Return to Rosa', destination: { zone: 'town', label: 'Rosa\'s Inn' } },
        ],
        rewards: { exp: 80, gold: 30, items: ['bread'] },
        repeatable: true,
    },
    quest_side_wizard: {
        id: 'quest_side_wizard', name: 'Arcane Studies',
        desc: 'Wizard Eldrin needs help with his research.',
        type: 'side', level: 5,
        destination: { zone: 'town', label: 'Wizard Tower' },
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'wizard_eldrin', desc: 'Speak with Wizard Eldrin', destination: { zone: 'town', label: 'Wizard Tower' } },
            { id: 'obj_2', type: 'collect', target: 'minor_mana_potion', count: 3, desc: 'Collect 3 Minor Mana Potions', destination: { zone: 'town', label: 'Potion Stall' } },
            { id: 'obj_3', type: 'report', target: 'wizard_eldrin', desc: 'Report to Wizard Eldrin', destination: { zone: 'town', label: 'Wizard Tower' } },
        ],
        rewards: { exp: 150, gold: 60, items: ['crystal_wand'] },
        repeatable: true,
    },
    quest_dungeon_rescue: {
        id: 'quest_dungeon_rescue', name: 'Prisoner in the Dark',
        desc: 'Free Karl from the dungeon.',
        type: 'side', level: 15,
        destination: { zone: 'dungeon', label: 'Dungeon Cells' },
        objectives: [
            { id: 'obj_1', type: 'find', target: 'prisoner_karl', desc: 'Find Karl in the dungeon', destination: { zone: 'dungeon', label: 'Dungeon Cells' } },
            { id: 'obj_2', type: 'kill', target: 'dark_knight', count: 3, desc: 'Defeat the guards (3 Dark Knights)', destination: { zone: 'dungeon', label: 'Shadow Dungeon' } },
            { id: 'obj_3', type: 'report', target: 'prisoner_karl', desc: 'Free Karl', destination: { zone: 'dungeon', label: 'Dungeon Cells' } },
        ],
        rewards: { exp: 600, gold: 300, items: ['shadow_dagger'] },
        repeatable: false,
    },
    quest_dungeon_lich: {
        id: 'quest_dungeon_lich', name: 'The Lich\'s Phylactery',
        desc: 'Destroy the Lich\'s phylactery.',
        type: 'side', level: 28,
        destination: { zone: 'dungeon', label: 'Deep Archives' },
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'ghost_scholar', desc: 'Speak with the Ghost Scholar', destination: { zone: 'dungeon', label: 'Deep Archives' } },
            { id: 'obj_2', type: 'collect', target: 'ancient_lich', count: 1, desc: 'Find the Phylactery', destination: { zone: 'abyss', label: 'The Abyss' } },
            { id: 'obj_3', type: 'kill', target: 'ancient_lich', count: 1, desc: 'Defeat the Ancient Lich', destination: { zone: 'abyss', label: 'The Abyss' } },
        ],
        rewards: { exp: 2500, gold: 1200, items: ['ring_of_power'] },
        repeatable: false,
    },
    quest_final_dragon: {
        id: 'quest_final_dragon', name: 'Preparing for the Dragon',
        desc: 'Gather supplies before facing the World Dragon.',
        type: 'side', level: 44,
        destination: { zone: 'abyss', label: 'Dragon\'s Approach' },
        objectives: [
            { id: 'obj_1', type: 'collect', target: 'elixir_of_life', count: 2, desc: 'Collect 2 Elixirs of Life', destination: { zone: 'town', label: 'Potion Stall' } },
            { id: 'obj_2', type: 'collect', target: 'super_health_potion', count: 5, desc: 'Collect 5 Super Health Potions', destination: { zone: 'town', label: 'Potion Stall' } },
            { id: 'obj_3', type: 'report', target: 'treasure_hunter_zara', desc: 'Report to Zara', destination: { zone: 'abyss', label: 'Dragon\'s Approach' } },
        ],
        rewards: { exp: 3000, gold: 2000, items: ['dragon_scale_armor'] },
        repeatable: false,
    },

    quest_daily_slime: {
        id: 'quest_daily_slime', name: 'Slime Cleanup',
        desc: 'Clear the slimes from the meadow.',
        type: 'daily', level: 1,
        destination: { zone: 'meadow', label: 'Greenleaf Meadow' },
        objectives: [
            { id: 'obj_1', type: 'kill', target: 'slime_green', count: 10, desc: 'Slay 10 Green Slimes', destination: { zone: 'meadow', label: 'Greenleaf Meadow' } },
            { id: 'obj_2', type: 'kill', target: 'slime_blue', count: 5, desc: 'Slay 5 Blue Slimes', destination: { zone: 'meadow', label: 'Greenleaf Meadow' } },
        ],
        rewards: { exp: 150, gold: 80, items: ['health_potion'] },
        repeatable: true, cooldown: 86400000,
    },
    quest_daily_goblin: {
        id: 'quest_daily_goblin', name: 'Goblin Extermination',
        desc: 'Thin the goblin population.',
        type: 'daily', level: 5,
        destination: { zone: 'forest', label: 'Darkwood Forest' },
        objectives: [
            { id: 'obj_1', type: 'kill', target: 'goblin', count: 15, desc: 'Slay 15 Goblins', destination: { zone: 'forest', label: 'Darkwood Forest' } },
        ],
        rewards: { exp: 300, gold: 150, items: ['mana_potion'] },
        repeatable: true, cooldown: 86400000,
    },
    quest_daily_dungeon: {
        id: 'quest_daily_dungeon', name: 'Dungeon Delver',
        desc: 'Clear monsters in the dungeon.',
        type: 'daily', level: 15,
        destination: { zone: 'dungeon', label: 'Shadow Dungeon' },
        objectives: [
            { id: 'obj_1', type: 'kill', target: 'dark_knight', count: 5, desc: 'Slay 5 Dark Knights', destination: { zone: 'dungeon', label: 'Shadow Dungeon' } },
            { id: 'obj_2', type: 'kill', target: 'mage_cultist', count: 5, desc: 'Slay 5 Cultist Mages', destination: { zone: 'ruins', label: 'Ancient Ruins' } },
        ],
        rewards: { exp: 800, gold: 400, items: ['greater_health_potion'] },
        repeatable: true, cooldown: 86400000,
    },
};

/** Active objective destination for compass / map markers. */
export function getActiveDestination(player) {
    if (!player?.quests) return null;
    for (const state of Object.values(player.quests)) {
        if (state.status !== 'active') continue;
        const quest = QUESTS[state.id];
        if (!quest) continue;
        const objs = state.objectives || [];
        for (let i = 0; i < objs.length; i++) {
            if (objs[i].completed) continue;
            const def = quest.objectives?.[i];
            const dest = def?.destination || quest.destination;
            if (!dest) continue;
            return {
                questId: quest.id,
                questName: quest.name,
                objective: objs[i].desc || def?.desc || '',
                zone: dest.zone,
                label: dest.label || ZONE_INFO[dest.zone]?.name || dest.zone,
                zoneName: ZONE_INFO[dest.zone]?.name || dest.zone,
            };
        }
        if (quest.destination) {
            return {
                questId: quest.id,
                questName: quest.name,
                objective: quest.desc,
                zone: quest.destination.zone,
                label: quest.destination.label,
                zoneName: ZONE_INFO[quest.destination.zone]?.name || quest.destination.zone,
            };
        }
    }
    return null;
}

/** Zones that currently have an incomplete quest objective. */
export function getQuestMarkedZones(player) {
    const marks = {};
    if (!player?.quests) return marks;
    for (const state of Object.values(player.quests)) {
        if (state.status !== 'active') continue;
        const quest = QUESTS[state.id];
        if (!quest) continue;
        (quest.objectives || []).forEach((def, i) => {
            if (state.objectives?.[i]?.completed) return;
            const z = def.destination?.zone || quest.destination?.zone;
            if (!z) return;
            if (!marks[z]) marks[z] = [];
            marks[z].push({ quest: quest.name, obj: def.desc, type: quest.type });
        });
    }
    return marks;
}

export const getQuest = (questId) => QUESTS[questId];
export const getQuestsByType = (type) => Object.values(QUESTS).filter((q) => q.type === type);
export const getAvailableQuests = (level) => Object.values(QUESTS).filter((q) => q.level <= level);
