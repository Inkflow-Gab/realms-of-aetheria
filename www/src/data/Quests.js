// ============================================
// REALMS OF AETHERIA - QUEST DATABASE
// ============================================

export const QUESTS = {
    // === MAIN QUESTS ===
    quest_main_1: {
        id: 'quest_main_1', name: 'The Darkness Rises',
        desc: 'Investigate the monster attacks near the village.',
        type: 'main', level: 1,
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'elder_marcus', desc: 'Speak with Elder Marcus' },
            { id: 'obj_2', type: 'kill', target: 'slime_green', count: 5, desc: 'Slay 5 Green Slimes' },
            { id: 'obj_3', type: 'report', target: 'elder_marcus', desc: 'Report back to Elder Marcus' },
        ],
        rewards: { exp: 100, gold: 50, items: ['iron_sword'] },
        repeatable: false,
        nextQuest: 'quest_main_2'
    },
    quest_main_2: {
        id: 'quest_main_2', name: 'The Goblin Threat',
        desc: 'Goblins are raiding travelers on the forest road.',
        type: 'main', level: 3,
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'guard_captain', desc: 'Speak with Captain Aldric' },
            { id: 'obj_2', type: 'kill', target: 'goblin', count: 8, desc: 'Slay 8 Goblins' },
            { id: 'obj_3', type: 'collect', target: 'rusty_sword', count: 3, desc: 'Collect 3 Rusty Swords from goblins' },
            { id: 'obj_4', type: 'report', target: 'guard_captain', desc: 'Report to Captain Aldric' },
        ],
        rewards: { exp: 250, gold: 100, items: ['leather_armor'] },
        repeatable: false,
        nextQuest: 'quest_main_3'
    },
    quest_main_3: {
        id: 'quest_main_3', name: 'Echoes in the Cave',
        desc: 'Strange sounds echo from the abandoned mine.',
        type: 'main', level: 6,
        objectives: [
            { id: 'obj_1', type: 'kill', target: 'skeleton', count: 10, desc: 'Slay 10 Skeletons' },
            { id: 'obj_2', type: 'kill', target: 'bat', count: 8, desc: 'Slay 8 Cave Bats' },
            { id: 'obj_3', type: 'kill', target: 'ghost', count: 3, desc: 'Banish 3 Ghosts' },
        ],
        rewards: { exp: 500, gold: 200, items: ['steel_longsword', 'health_potion'] },
        repeatable: false,
        nextQuest: 'quest_main_4'
    },
    quest_main_4: {
        id: 'quest_main_4', name: 'The Lich\'s Shadow',
        desc: 'A lich has taken residence in the deep dungeon.',
        type: 'main', level: 25,
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'ghost_scholar', desc: 'Find the Ghost Scholar' },
            { id: 'obj_2', type: 'kill', target: 'lich', count: 1, desc: 'Defeat the Lich' },
        ],
        rewards: { exp: 2000, gold: 1000, items: ['staff_of_archmagi'] },
        repeatable: false,
        nextQuest: 'quest_main_5'
    },
    quest_main_5: {
        id: 'quest_main_5', name: 'The World Dragon',
        desc: 'Face Aetheria, the World Dragon, in the Abyss.',
        type: 'main', level: 45,
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'treasure_hunter_zara', desc: 'Meet Zara at the dragon\'s lair' },
            { id: 'obj_2', type: 'kill', target: 'aetheria_dragon', count: 1, desc: 'Defeat Aetheria, the World Dragon' },
        ],
        rewards: { exp: 10000, gold: 10000, items: ['excalibur'] },
        repeatable: false,
        nextQuest: null
    },

    // === SIDE QUESTS ===
    quest_side_inn: {
        id: 'quest_side_inn', name: 'Rosa\'s Recipe',
        desc: 'Rosa needs ingredients for her special stew.',
        type: 'side', level: 2,
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'innkeeper_rosa', desc: 'Speak with Rosa' },
            { id: 'obj_2', type: 'collect', target: 'meat', count: 5, desc: 'Collect 5 Cooked Meat' },
            { id: 'obj_3', type: 'report', target: 'innkeeper_rosa', desc: 'Return to Rosa' },
        ],
        rewards: { exp: 80, gold: 30, items: ['bread'] },
        repeatable: true
    },
    quest_side_wizard: {
        id: 'quest_side_wizard', name: 'Arcane Studies',
        desc: 'Wizard Eldrin needs help with his research.',
        type: 'side', level: 5,
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'wizard_eldrin', desc: 'Speak with Wizard Eldrin' },
            { id: 'obj_2', type: 'collect', target: 'minor_mana_potion', count: 3, desc: 'Collect 3 Minor Mana Potions' },
            { id: 'obj_3', type: 'report', target: 'wizard_eldrin', desc: 'Report to Wizard Eldrin' },
        ],
        rewards: { exp: 150, gold: 60, items: ['crystal_wand'] },
        repeatable: true
    },
    quest_dungeon_rescue: {
        id: 'quest_dungeon_rescue', name: 'Prisoner in the Dark',
        desc: 'Free Karl from the dungeon.',
        type: 'side', level: 15,
        objectives: [
            { id: 'obj_1', type: 'find', target: 'prisoner_karl', desc: 'Find Karl in the dungeon' },
            { id: 'obj_2', type: 'kill', target: 'dark_knight', count: 3, desc: 'Defeat the guards (3 Dark Knights)' },
            { id: 'obj_3', type: 'report', target: 'prisoner_karl', desc: 'Free Karl' },
        ],
        rewards: { exp: 600, gold: 300, items: ['shadow_dagger'] },
        repeatable: false
    },
    quest_dungeon_lich: {
        id: 'quest_dungeon_lich', name: 'The Lich\'s Phylactery',
        desc: 'Destroy the Lich\'s phylactery.',
        type: 'side', level: 28,
        objectives: [
            { id: 'obj_1', type: 'talk', target: 'ghost_scholar', desc: 'Speak with the Ghost Scholar' },
            { id: 'obj_2', type: 'collect', target: 'ancient_lich', count: 1, desc: 'Find the Phylactery' },
            { id: 'obj_3', type: 'kill', target: 'ancient_lich', count: 1, desc: 'Defeat the Ancient Lich' },
        ],
        rewards: { exp: 2500, gold: 1200, items: ['ring_of_power'] },
        repeatable: false
    },
    quest_final_dragon: {
        id: 'quest_final_dragon', name: 'Preparing for the Dragon',
        desc: 'Gather supplies before facing the World Dragon.',
        type: 'side', level: 44,
        objectives: [
            { id: 'obj_1', type: 'collect', target: 'elixir_of_life', count: 2, desc: 'Collect 2 Elixirs of Life' },
            { id: 'obj_2', type: 'collect', target: 'super_health_potion', count: 5, desc: 'Collect 5 Super Health Potions' },
            { id: 'obj_3', type: 'report', target: 'treasure_hunter_zara', desc: 'Report to Zara' },
        ],
        rewards: { exp: 3000, gold: 2000, items: ['dragon_scale_armor'] },
        repeatable: false
    },

    // === DAILY QUESTS ===
    quest_daily_slime: {
        id: 'quest_daily_slime', name: 'Slime Cleanup',
        desc: 'Clear the slimes from the meadow.',
        type: 'daily', level: 1,
        objectives: [
            { id: 'obj_1', type: 'kill', target: 'slime_green', count: 10, desc: 'Slay 10 Green Slimes' },
            { id: 'obj_2', type: 'kill', target: 'slime_blue', count: 5, desc: 'Slay 5 Blue Slimes' },
        ],
        rewards: { exp: 150, gold: 80, items: ['health_potion'] },
        repeatable: true, cooldown: 86400000
    },
    quest_daily_goblin: {
        id: 'quest_daily_goblin', name: 'Goblin Extermination',
        desc: 'Thin the goblin population.',
        type: 'daily', level: 5,
        objectives: [
            { id: 'obj_1', type: 'kill', target: 'goblin', count: 15, desc: 'Slay 15 Goblins' },
        ],
        rewards: { exp: 300, gold: 150, items: ['mana_potion'] },
        repeatable: true, cooldown: 86400000
    },
    quest_daily_dungeon: {
        id: 'quest_daily_dungeon', name: 'Dungeon Delver',
        desc: 'Clear monsters in the dungeon.',
        type: 'daily', level: 15,
        objectives: [
            { id: 'obj_1', type: 'kill', target: 'dark_knight', count: 5, desc: 'Slay 5 Dark Knights' },
            { id: 'obj_2', type: 'kill', target: 'mage_cultist', count: 5, desc: 'Slay 5 Cultist Mages' },
        ],
        rewards: { exp: 800, gold: 400, items: ['greater_health_potion'] },
        repeatable: true, cooldown: 86400000
    },
};

// Quest helpers
export const getQuest = (questId) => QUESTS[questId];
export const getQuestsByType = (type) => Object.values(QUESTS).filter(q => q.type === type);
export const getAvailableQuests = (level) => Object.values(QUESTS).filter(q => q.level <= level);
