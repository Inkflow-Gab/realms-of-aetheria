// ============================================
// REALMS OF AETHERIA - ACHIEVEMENTS
// ============================================
//
// Each achievement has a test that is evaluated against the player and the
// running stats. Rewards are granted once, the first time the test passes.
//
// test(player, stats) is called from AchievementSystem.check() after any
// event that could have moved a number: combat, looting, levelling, zone
// changes, spending. Keep the tests cheap -- they run on those events only,
// never per frame.
// ============================================

export const ACHIEVEMENTS = [
    // --- Progression ---
    {
        id: 'first_steps',
        name: 'First Steps',
        desc: 'Travel 100 tiles',
        reward: { gold: 25, exp: 10 },
        test: (p) => (p.stats?.tilesWalked || 0) >= 100,
    },
    {
        id: 'seasoned_traveller',
        name: 'Seasoned Traveller',
        desc: 'Travel 1,000 tiles',
        reward: { gold: 100, exp: 50 },
        test: (p) => (p.stats?.tilesWalked || 0) >= 1000,
    },
    {
        id: 'level_5',
        name: 'Coming Into Power',
        desc: 'Reach level 5',
        reward: { gold: 50, exp: 0 },
        test: (p) => p.level >= 5,
    },
    {
        id: 'level_10',
        name: 'Seasoned Hero',
        desc: 'Reach level 10',
        reward: { gold: 150, exp: 0, item: 'health_potion' },
        test: (p) => p.level >= 10,
    },
    {
        id: 'level_25',
        name: 'Living Legend',
        desc: 'Reach level 25',
        reward: { gold: 500, exp: 0, item: 'elixir_of_life' },
        test: (p) => p.level >= 25,
    },

    // --- Combat ---
    {
        id: 'first_blood',
        name: 'First Blood',
        desc: 'Defeat your first monster',
        reward: { gold: 25, exp: 15 },
        test: (p) => (p.killCount || 0) >= 1,
    },
    {
        id: 'slayer_10',
        name: 'Monster Slayer',
        desc: 'Defeat 10 monsters',
        reward: { gold: 100, exp: 60 },
        test: (p) => (p.killCount || 0) >= 10,
    },
    {
        id: 'slayer_50',
        name: 'Monster Hunter',
        desc: 'Defeat 50 monsters',
        reward: { gold: 400, exp: 250, item: 'copper_ring' },
        test: (p) => (p.killCount || 0) >= 50,
    },
    {
        id: 'survivor',
        name: 'Survivor',
        desc: 'Reach level 10 without dying',
        reward: { gold: 200, exp: 0 },
        test: (p) => p.level >= 10 && (p.deathCount || 0) === 0,
    },

    // --- Wealth ---
    {
        id: 'first_hoard',
        name: 'First Hoard',
        desc: 'Hold 500 gold at once',
        reward: { gold: 0, exp: 40 },
        test: (p) => p.gold >= 500,
    },
    {
        id: 'rich',
        name: 'Treasurer',
        desc: 'Hold 2,500 gold at once',
        reward: { gold: 0, exp: 200, item: 'silver_ring' },
        test: (p) => p.gold >= 2500,
    },

    // --- Collection / equipment ---
    {
        id: 'collector',
        name: 'Collector',
        desc: 'Carry 10 different items',
        reward: { gold: 75, exp: 40 },
        test: (p) => new Set(p.inventory.map((i) => i.id)).size >= 10,
    },
    {
        id: 'fully_equipped',
        name: 'Fully Equipped',
        desc: 'Fill every equipment slot',
        reward: { gold: 150, exp: 100 },
        test: (p) => Object.values(p.equipment).filter(Boolean).length >= 10,
    },

    // --- Exploration ---
    {
        id: 'zone_explorer',
        name: 'Explorer',
        desc: 'Visit 5 different zones',
        reward: { gold: 100, exp: 80 },
        test: (p) => new Set(p.stats?.zonesVisited || []).size >= 5,
    },
    {
        id: 'zone_master',
        name: 'Master of Aetheria',
        desc: 'Visit all 9 zones',
        reward: { gold: 500, exp: 400, item: 'town_portal_scroll' },
        test: (p) => new Set(p.stats?.zonesVisited || []).size >= 9,
    },

    // --- Quests ---
    {
        id: 'first_quest',
        name: 'A Promise Made',
        desc: 'Complete your first quest',
        reward: { gold: 50, exp: 30 },
        test: (p) => (p.completedQuests?.length || 0) >= 1,
    },
    {
        id: 'quest_master',
        name: 'Promise Keeper',
        desc: 'Complete 5 quests',
        reward: { gold: 250, exp: 150 },
        test: (p) => (p.completedQuests?.length || 0) >= 5,
    },
];

export const ACHIEVEMENT_COUNT = ACHIEVEMENTS.length;
