// ============================================
// REALMS OF AETHERIA - NPC DATABASE
// ============================================

export const NPCS = {
    // === TOWN NPCs ===
    elder_marcus: {
        id: 'elder_marcus', name: 'Elder Marcus', role: 'Elder',
        sprite: 'npc_3', x: 5, y: 5,
        dialogues: [
            "Welcome to Aetheria, young one. Our village has stood for a thousand years.",
            "The darkness grows in the east. We need heroes like you.",
            "Speak to the blacksmith for weapons. The potion seller has supplies.",
        ],
        quests: ['quest_main_1'],
        shop: null,
        color: 0xd4a574
    },
    blacksmith_brom: {
        id: 'blacksmith_brom', name: 'Blacksmith Brom', role: 'Blacksmith',
        sprite: 'npc_10', x: 3, y: 4,
        dialogues: [
            "Finest steel in the realm! What do you need?",
            "Bring me iron ore and I'll forge you something special.",
            "My blades have slain many a beast.",
        ],
        quests: [],
        shop: 'weapons',
        color: 0xb0bec5
    },
    potion_seller_luna: {
        id: 'potion_seller_luna', name: 'Luna the Alchemist', role: 'Potion Seller',
        sprite: 'npc_9', x: 7, y: 4,
        dialogues: [
            "Potions, elixirs, and brews! Get them here!",
            "This one here will bring you back from the brink of death.",
            "Careful with the purple ones, they're... volatile.",
        ],
        quests: [],
        shop: 'potions',
        color: 0xce93d8
    },
    shopkeeper_gilda: {
        id: 'shopkeeper_gilda', name: 'Gilda', role: 'General Store',
        sprite: 'npc_5', x: 6, y: 3,
        dialogues: [
            "Welcome to Gilda's General Store!",
            "I've got everything an adventurer needs.",
            "Special discount for heroes!",
        ],
        quests: [],
        shop: 'general',
        color: 0xffcc80
    },
    armor_smith_thorin: {
        id: 'armor_smith_thorin', name: 'Thorin the Armorsmith', role: 'Armorsmith',
        sprite: 'npc_1', x: 4, y: 6,
        dialogues: [
            "Armor that saves lives! Browse my collection.",
            "Dragon scale armor? For the right price, anything is possible.",
            "A warrior without armor is just a target.",
        ],
        quests: [],
        shop: 'armor',
        color: 0x90a4ae
    },
    innkeeper_rosa: {
        id: 'innkeeper_rosa', name: 'Rosa', role: 'Innkeeper',
        sprite: 'npc_6', x: 8, y: 5,
        dialogues: [
            "Welcome to the Restful Dragon Inn!",
            "A room for the night? Only 20 gold.",
            "Heard any good gossip? They say a dragon was spotted in the mountains.",
        ],
        quests: ['quest_side_inn'],
        shop: null,
        color: 0xf48fb1,
        service: { rest: 20 }
    },
    wizard_eldrin: {
        id: 'wizard_eldrin', name: 'Wizard Eldrin', role: 'Mage Trainer',
        sprite: 'npc_2', x: 2, y: 7,
        dialogues: [
            "Ah, a seeker of arcane knowledge.",
            "Magic is not just power, it's understanding.",
            "I can teach you the ways of magic... for a price.",
        ],
        quests: ['quest_side_wizard'],
        shop: 'accessories',
        color: 0x9575cd
    },
    priest_aurora: {
        id: 'priest_aurora', name: 'Priest Aurora', role: 'Healer',
        sprite: 'npc_7', x: 9, y: 6,
        dialogues: [
            "Blessings of the light upon you.",
            "I can heal your wounds, for a small donation.",
            "The light protects those who protect others.",
        ],
        quests: [],
        shop: null,
        color: 0xfff59d,
        service: { heal: 10 }
    },
    guard_captain: {
        id: 'guard_captain', name: 'Captain Aldric', role: 'Guard Captain',
        sprite: 'npc_8', x: 5, y: 8,
        dialogues: [
            "Halt! ...Oh, it's you. Keep the streets safe.",
            "Monsters have been spotted near the forest. Be careful.",
            "The village walls will hold... for now.",
        ],
        quests: ['quest_main_1'],
        shop: null,
        color: 0x78909c
    },
    merchant_sam: {
        id: 'merchant_sam', name: 'Sam the Merchant', role: 'Traveling Merchant',
        sprite: 'npc_4', x: 10, y: 7,
        dialogues: [
            "Rare goods from distant lands!",
            "I've traveled the whole realm. Trust me, these prices are fair.",
            "Looking for something special? I might have it.",
        ],
        quests: [],
        shop: 'accessories',
        color: 0xa5d6a7
    },

    // === DUNGEON NPCs ===
    prisoner_karl: {
        id: 'prisoner_karl', name: 'Prisoner Karl', role: 'Prisoner',
        sprite: 'npc_5', x: 15, y: 20,
        dialogues: [
            "Help! I've been locked down here for days!",
            "There's a key on the guard's desk. Please, free me!",
            "I know a secret passage out of here. I'll show you if you free me.",
        ],
        quests: ['quest_dungeon_rescue'],
        shop: null,
        color: 0xbcaaa4
    },
    ghost_scholar: {
        id: 'ghost_scholar', name: 'Ghost of Scholar', role: 'Ghost',
        sprite: 'npc_3', x: 30, y: 35,
        dialogues: [
            "I was a scholar in life, studying the ancient ruins.",
            "The lich's phylactery is hidden in the deepest chamber.",
            "Take this knowledge. You'll need it.",
        ],
        quests: ['quest_dungeon_lich'],
        shop: null,
        color: 0xb3e5fc,
        ghostly: true
    },
    treasure_hunter_zara: {
        id: 'treasure_hunter_zara', name: 'Zara the Treasure Hunter', role: 'Adventurer',
        sprite: 'npc_10', x: 45, y: 40,
        dialogues: [
            "Shhh! I found the dragon's lair. Want in?",
            "We split the treasure 50/50. Deal?",
            "The World Dragon sleeps... but not for long.",
        ],
        quests: ['quest_final_dragon'],
        shop: null,
        color: 0xffab91
    },
};

// NPC schedule (time-based behavior)
export const NPC_SCHEDULES = {
    default: {
        morning: { x: null, y: null, activity: 'working' },
        afternoon: { x: null, y: null, activity: 'working' },
        evening: { x: null, y: null, activity: 'resting' },
        night: { x: null, y: null, activity: 'sleeping' },
    },
    innkeeper: {
        morning: { x: 8, y: 5, activity: 'working' },
        afternoon: { x: 8, y: 5, activity: 'working' },
        evening: { x: 8, y: 6, activity: 'resting' },
        night: { x: 9, y: 7, activity: 'sleeping' },
    },
    guard: {
        morning: { x: 5, y: 8, activity: 'patrolling' },
        afternoon: { x: 6, y: 8, activity: 'patrolling' },
        evening: { x: 5, y: 9, activity: 'guarding' },
        night: { x: 5, y: 8, activity: 'guarding' },
    },
};
