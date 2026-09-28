// ============================================
// REALMS OF AETHERIA - ITEM DATABASE
// ============================================

export const ITEM_CATEGORIES = {
    WEAPON: 'weapon',
    ARMOR: 'armor',
    ACCESSORY: 'accessory',
    CONSUMABLE: 'consumable',
    MATERIAL: 'material',
    QUEST: 'quest'
};

export const ITEM_TYPES = {
    // Weapons
    SWORD: { id: 'sword', name: 'Sword', category: 'weapon', slot: 'weapon', icon: 'items/weapons/sword' },
    GREATSWORD: { id: 'greatsword', name: 'Greatsword', category: 'weapon', slot: 'weapon', icon: 'items/weapons/greatsword' },
    AXE: { id: 'axe', name: 'Axe', category: 'weapon', slot: 'weapon', icon: 'items/weapons/axe' },
    MACE: { id: 'mace', name: 'Mace', category: 'weapon', slot: 'weapon', icon: 'items/weapons/mace' },
    WAND: { id: 'wand', name: 'Wand', category: 'weapon', slot: 'weapon', icon: 'items/weapons/wand' },
    STAFF: { id: 'staff', name: 'Staff', category: 'weapon', slot: 'weapon', icon: 'items/weapons/staff' },
    BOW: { id: 'bow', name: 'Bow', category: 'weapon', slot: 'weapon', icon: 'items/weapons/bow' },
    CROSSBOW: { id: 'crossbow', name: 'Crossbow', category: 'weapon', slot: 'weapon', icon: 'items/weapons/crossbow' },
    DAGGER: { id: 'dagger', name: 'Dagger', category: 'weapon', slot: 'weapon', icon: 'items/weapons/dagger' },
    ORB: { id: 'orb', name: 'Orb', category: 'weapon', slot: 'weapon', icon: 'items/weapons/orb' },

    // Armor
    HELMET: { id: 'helmet', name: 'Helmet', category: 'armor', slot: 'head', icon: 'items/armor/helmet' },
    CHEST: { id: 'chest', name: 'Chestplate', category: 'armor', slot: 'chest', icon: 'items/armor/chest' },
    LEGGINGS: { id: 'leggings', name: 'Leggings', category: 'armor', slot: 'legs', icon: 'items/armor/leggings' },
    BOOTS: { id: 'boots', name: 'Boots', category: 'armor', slot: 'feet', icon: 'items/armor/boots' },
    GLOVES: { id: 'gloves', name: 'Gloves', category: 'armor', slot: 'hands', icon: 'items/armor/gloves' },
    SHIELD: { id: 'shield', name: 'Shield', category: 'armor', slot: 'offhand', icon: 'items/armor/shield' },
    CLOAK: { id: 'cloak', name: 'Cloak', category: 'armor', slot: 'back', icon: 'items/armor/cloak' },

    // Accessories
    RING: { id: 'ring', name: 'Ring', category: 'accessory', slot: 'ring', icon: 'items/accessories/ring' },
    AMULET: { id: 'amulet', name: 'Amulet', category: 'accessory', slot: 'neck', icon: 'items/accessories/amulet' },
    BELT: { id: 'belt', name: 'Belt', category: 'accessory', slot: 'waist', icon: 'items/accessories/belt' },

    // Consumables
    HEALTH_POTION: { id: 'health_potion', name: 'Health Potion', category: 'consumable', slot: null, icon: 'items/potions/health' },
    MANA_POTION: { id: 'mana_potion', name: 'Mana Potion', category: 'consumable', slot: null, icon: 'items/potions/mana' },
    ELIXIR: { id: 'elixir', name: 'Elixir', category: 'consumable', slot: null, icon: 'items/potions/elixir' },
    ANTIDOTE: { id: 'antidote', name: 'Antidote', category: 'consumable', slot: null, icon: 'items/potions/antidote' },
    TOWN_SCROLL: { id: 'town_scroll', name: 'Town Portal Scroll', category: 'consumable', slot: null, icon: 'items/potions/scroll' },
    FOOD: { id: 'food', name: 'Food', category: 'consumable', slot: null, icon: 'items/food/bread' },
};

const SLOT_BY_TYPE = Object.fromEntries(
    Object.values(ITEM_TYPES).map((t) => [t.id, t.slot])
);
const CATEGORY_BY_TYPE = Object.fromEntries(
    Object.values(ITEM_TYPES).map((t) => [t.id, t.category])
);

/** Resolve equipment slot (weapon items used to land in `equipment.sword`). */
export function getEquipSlot(itemData) {
    if (!itemData) return null;
    if (itemData.slot) return itemData.slot;
    return SLOT_BY_TYPE[itemData.type] || null;
}

export function getItemCategory(itemData) {
    if (!itemData) return null;
    if (itemData.category) return itemData.category;
    return CATEGORY_BY_TYPE[itemData.type] || null;
}

export function canClassEquipWeapon(playerClass, weaponType) {
    if (!playerClass?.weaponTypes || !weaponType) return true;
    return playerClass.weaponTypes.includes(weaponType);
}

export function describeWeaponPerk(perk) {
    if (!perk) return '';
    const parts = [];
    if (perk.critBonus) parts.push(`+${Math.round(perk.critBonus * 100)}% crit`);
    if (perk.lifesteal) parts.push(`${Math.round(perk.lifesteal * 100)}% lifesteal`);
    if (perk.mpOnHit) parts.push(`+${perk.mpOnHit} MP on hit`);
    if (perk.bonusVsBoss) parts.push('Bonus vs bosses');
    if (perk.element) parts.push(`${perk.element} element`);
    return parts.join(' · ');
}

// Full item database
export const ITEMS = {
    // === WEAPONS ===
    rusty_sword: {
        id: 'rusty_sword', name: 'Rusty Sword', type: 'sword', rarity: 'common',
        stats: { atk: 5, spd: -1 }, level: 1, price: 15, desc: 'A worn blade, better than nothing.',
        icon: 'items/weapons/sword_rusty'
    },
    iron_sword: {
        id: 'iron_sword', name: 'Iron Sword', type: 'sword', rarity: 'common',
        stats: { atk: 10, def: 1 }, level: 3, price: 50, desc: 'A sturdy iron blade.',
        icon: 'items/weapons/sword_iron'
    },
    steel_longsword: {
        id: 'steel_longsword', name: 'Steel Longsword', type: 'sword', rarity: 'uncommon',
        stats: { atk: 18, spd: 2, luk: 3 }, level: 8, price: 180, desc: 'Fine steel, well balanced.',
        icon: 'items/weapons/sword_steel'
    },
    elven_blade: {
        id: 'elven_blade', name: 'Elven Blade', type: 'sword', rarity: 'rare',
        stats: { atk: 28, spd: 5, dex: 5 }, level: 15, price: 500, desc: 'Crafted by ancient elves.',
        icon: 'items/weapons/sword_elven'
    },
    dragon_slayer: {
        id: 'dragon_slayer', name: 'Dragon Slayer', type: 'greatsword', rarity: 'epic',
        stats: { atk: 55, str: 10, luk: 5, spd: -3 }, level: 25, price: 2500,
        desc: 'Forged to slay dragons.',
        perk: { bonusVsBoss: true, critBonus: 0.06 },
        icon: 'items/weapons/greatsword_dragon'
    },
    excalibur: {
        id: 'excalibur', name: 'Excalibur', type: 'sword', rarity: 'legendary',
        stats: { atk: 80, str: 15, dex: 10, luk: 10, spd: 5 }, level: 40, price: 10000,
        desc: 'The sword of kings.',
        perk: { critBonus: 0.08, lifesteal: 0.05, element: 'holy' },
        icon: 'items/weapons/sword_excalibur'
    },
    frostbrand: {
        id: 'frostbrand', name: 'Frostbrand', type: 'sword', rarity: 'rare',
        stats: { atk: 26, int: 6, spd: 3 }, level: 14, price: 550,
        desc: 'Blade rimed with eternal ice.',
        perk: { critBonus: 0.04, element: 'ice' },
        icon: 'items/weapons/sword_steel'
    },
    flamebrand: {
        id: 'flamebrand', name: 'Flamebrand', type: 'axe', rarity: 'rare',
        stats: { atk: 34, str: 8, spd: -1 }, level: 17, price: 650,
        desc: 'Each swing leaves embers in the air.',
        perk: { critBonus: 0.05, element: 'fire' },
        icon: 'items/weapons/axe_berserker'
    },
    void_dagger: {
        id: 'void_dagger', name: 'Void Dagger', type: 'dagger', rarity: 'epic',
        stats: { atk: 42, dex: 14, luk: 12, spd: 8 }, level: 24, price: 2200,
        desc: 'Cuts through shadow itself.',
        perk: { critBonus: 0.1, lifesteal: 0.04, element: 'dark' },
        icon: 'items/weapons/dagger_assassin'
    },
    celestial_bow: {
        id: 'celestial_bow', name: 'Celestial Bow', type: 'bow', rarity: 'legendary',
        stats: { atk: 58, dex: 18, spd: 10, luk: 8 }, level: 35, price: 5500,
        desc: 'Arrows guided by starlight.',
        perk: { critBonus: 0.07, bonusVsBoss: true, element: 'light' },
        icon: 'items/weapons/bow_wind'
    },
    apprentice_wand: {
        id: 'apprentice_wand', name: 'Apprentice Wand', type: 'wand', rarity: 'common',
        stats: { atk: 4, int: 3, mp: 10 }, level: 1, price: 12, desc: 'A simple wand for beginners.',
        icon: 'items/weapons/wand_apprentice'
    },
    oak_staff: {
        id: 'oak_staff', name: 'Oak Staff', type: 'staff', rarity: 'common',
        stats: { atk: 8, int: 5, mp: 20 }, level: 4, price: 60, desc: 'Carved from ancient oak.',
        icon: 'items/weapons/staff_oak'
    },
    crystal_wand: {
        id: 'crystal_wand', name: 'Crystal Wand', type: 'wand', rarity: 'uncommon',
        stats: { atk: 15, int: 10, mp: 35, spd: 1 }, level: 10, price: 250, desc: 'Crystal focuses magical energy.',
        icon: 'items/weapons/wand_crystal'
    },
    staff_of_archmagi: {
        id: 'staff_of_archmagi', name: 'Staff of the Archmagi', type: 'staff', rarity: 'epic',
        stats: { atk: 35, int: 25, mp: 80, spd: 3 }, level: 28, price: 3500,
        desc: 'Powerful beyond measure.',
        perk: { mpOnHit: 3, element: 'arcane' },
        icon: 'items/weapons/staff_archmagi'
    },
    hunters_bow: {
        id: 'hunters_bow', name: "Hunter's Bow", type: 'bow', rarity: 'common',
        stats: { atk: 8, dex: 4, spd: 2 }, level: 3, price: 45, desc: 'A reliable hunting bow.',
        icon: 'items/weapons/bow_hunter'
    },
    windforce_bow: {
        id: 'windforce_bow', name: 'Windforce Bow', type: 'bow', rarity: 'rare',
        stats: { atk: 30, dex: 12, spd: 8 }, level: 18, price: 700, desc: 'Arrows fly with the wind.',
        icon: 'items/weapons/bow_wind'
    },
    shadow_dagger: {
        id: 'shadow_dagger', name: 'Shadow Dagger', type: 'dagger', rarity: 'uncommon',
        stats: { atk: 14, dex: 8, luk: 5, spd: 4 }, level: 9, price: 200, desc: 'Strikes from the shadows.',
        icon: 'items/weapons/dagger_shadow'
    },
    assassins_blade: {
        id: 'assassins_blade', name: "Assassin's Blade", type: 'dagger', rarity: 'epic',
        stats: { atk: 38, dex: 18, luk: 15, spd: 6 }, level: 26, price: 3000, desc: 'Silent and deadly.',
        icon: 'items/weapons/dagger_assassin'
    },
    battle_axe: {
        id: 'battle_axe', name: 'Battle Axe', type: 'axe', rarity: 'common',
        stats: { atk: 12, str: 3, spd: -2 }, level: 5, price: 80, desc: 'Heavy and brutal.',
        icon: 'items/weapons/axe_battle'
    },
    berserker_axe: {
        id: 'berserker_axe', name: 'Berserker Axe', type: 'axe', rarity: 'rare',
        stats: { atk: 32, str: 10, luk: 8, spd: -1 }, level: 20, price: 800, desc: 'Fueled by rage.',
        icon: 'items/weapons/axe_berserker'
    },
    war_mace: {
        id: 'war_mace', name: 'War Mace', type: 'mace', rarity: 'uncommon',
        stats: { atk: 20, str: 5, def: 3 }, level: 11, price: 300, desc: 'Crushes armor with ease.',
        icon: 'items/weapons/mace_war'
    },
    orb_of_power: {
        id: 'orb_of_power', name: 'Orb of Power', type: 'orb', rarity: 'rare',
        stats: { atk: 22, int: 15, mp: 50 }, level: 16, price: 600, desc: 'Crackling with energy.',
        icon: 'items/weapons/orb_power'
    },

    // === ARMOR ===
    cloth_robe: {
        id: 'cloth_robe', name: 'Cloth Robe', type: 'chest', rarity: 'common',
        stats: { def: 3, mp: 15, int: 2 }, level: 1, price: 10, desc: 'Simple cloth robes.',
        icon: 'items/armor/robe_cloth'
    },
    leather_armor: {
        id: 'leather_armor', name: 'Leather Armor', type: 'chest', rarity: 'common',
        stats: { def: 8, spd: 2, hp: 20 }, level: 3, price: 40, desc: 'Light leather protection.',
        icon: 'items/armor/leather'
    },
    chainmail: {
        id: 'chainmail', name: 'Chainmail', type: 'chest', rarity: 'uncommon',
        stats: { def: 15, hp: 40, spd: -1 }, level: 8, price: 150, desc: 'Interlocking metal rings.',
        icon: 'items/armor/chainmail'
    },
    plate_armor: {
        id: 'plate_armor', name: 'Plate Armor', type: 'chest', rarity: 'rare',
        stats: { def: 28, hp: 80, spd: -3, str: 3 }, level: 18, price: 650, desc: 'Heavy plate armor.',
        icon: 'items/armor/plate'
    },
    dragon_scale_armor: {
        id: 'dragon_scale_armor', name: 'Dragon Scale Armor', type: 'chest', rarity: 'epic',
        stats: { def: 45, hp: 150, str: 5, fireResist: 20 }, level: 30, price: 4000, desc: 'Made from dragon scales.',
        icon: 'items/armor/dragon_scale'
    },
    iron_helmet: {
        id: 'iron_helmet', name: 'Iron Helmet', type: 'helmet', rarity: 'common',
        stats: { def: 5, hp: 15 }, level: 3, price: 30, desc: 'Basic head protection.',
        icon: 'items/armor/helmet_iron'
    },
    elven_circlet: {
        id: 'elven_circlet', name: 'Elven Circlet', type: 'helmet', rarity: 'uncommon',
        stats: { def: 8, mp: 30, int: 5 }, level: 10, price: 200, desc: 'Elegant elven craftsmanship.',
        icon: 'items/armor/circlet_elven'
    },
    leather_boots: {
        id: 'leather_boots', name: 'Leather Boots', type: 'boots', rarity: 'common',
        stats: { def: 3, spd: 3 }, level: 2, price: 20, desc: 'Comfortable leather boots.',
        icon: 'items/armor/boots_leather'
    },
    iron_boots: {
        id: 'iron_boots', name: 'Iron Boots', type: 'boots', rarity: 'common',
        stats: { def: 8, hp: 20, spd: -1 }, level: 6, price: 70, desc: 'Sturdy iron boots.',
        icon: 'items/armor/boots_iron'
    },
    leather_gloves: {
        id: 'leather_gloves', name: 'Leather Gloves', type: 'gloves', rarity: 'common',
        stats: { def: 2, dex: 2 }, level: 2, price: 15, desc: 'Simple leather gloves.',
        icon: 'items/armor/gloves_leather'
    },
    wooden_shield: {
        id: 'wooden_shield', name: 'Wooden Shield', type: 'shield', rarity: 'common',
        stats: { def: 6, hp: 10 }, level: 2, price: 25, desc: 'A basic wooden shield.',
        icon: 'items/armor/shield_wood'
    },
    iron_shield: {
        id: 'iron_shield', name: 'Iron Shield', type: 'shield', rarity: 'uncommon',
        stats: { def: 14, hp: 30, str: 2 }, level: 9, price: 180, desc: 'A solid iron shield.',
        icon: 'items/armor/shield_iron'
    },
    tower_shield: {
        id: 'tower_shield', name: 'Tower Shield', type: 'shield', rarity: 'rare',
        stats: { def: 25, hp: 60, spd: -2, vit: 3 }, level: 20, price: 750, desc: 'Massive protective shield.',
        icon: 'items/armor/shield_tower'
    },
    travelers_cloak: {
        id: 'travelers_cloak', name: "Traveler's Cloak", type: 'cloak', rarity: 'common',
        stats: { def: 4, spd: 2, luk: 2 }, level: 4, price: 50, desc: 'A weathered travel cloak.',
        icon: 'items/armor/cloak_traveler'
    },
    shadow_cloak: {
        id: 'shadow_cloak', name: 'Shadow Cloak', type: 'cloak', rarity: 'rare',
        stats: { def: 12, spd: 6, luk: 8, dex: 5 }, level: 17, price: 600, desc: 'Woven from shadows.',
        icon: 'items/armor/cloak_shadow'
    },

    // === ACCESSORIES ===
    copper_ring: {
        id: 'copper_ring', name: 'Copper Ring', type: 'ring', rarity: 'common',
        stats: { atk: 2, def: 1 }, level: 1, price: 10, desc: 'A simple copper band.',
        icon: 'items/accessories/ring_copper'
    },
    silver_ring: {
        id: 'silver_ring', name: 'Silver Ring', type: 'ring', rarity: 'uncommon',
        stats: { atk: 5, int: 5, luk: 3 }, level: 10, price: 150, desc: 'A polished silver ring.',
        icon: 'items/accessories/ring_silver'
    },
    ring_of_power: {
        id: 'ring_of_power', name: 'Ring of Power', type: 'ring', rarity: 'epic',
        stats: { atk: 15, int: 10, str: 5, dex: 5 }, level: 25, price: 2800, desc: 'Pulses with arcane energy.',
        icon: 'items/accessories/ring_power'
    },
    gold_amulet: {
        id: 'gold_amulet', name: 'Gold Amulet', type: 'amulet', rarity: 'uncommon',
        stats: { hp: 30, mp: 20, def: 3 }, level: 12, price: 250, desc: 'A shiny gold amulet.',
        icon: 'items/accessories/amulet_gold'
    },
    amulet_of_guardian: {
        id: 'amulet_of_guardian', name: 'Amulet of the Guardian', type: 'amulet', rarity: 'rare',
        stats: { def: 10, hp: 60, vit: 5 }, level: 20, price: 800, desc: 'Protects its wearer.',
        icon: 'items/accessories/amulet_guardian'
    },
    leather_belt: {
        id: 'leather_belt', name: 'Leather Belt', type: 'belt', rarity: 'common',
        stats: { def: 2, hp: 10 }, level: 2, price: 15, desc: 'A sturdy leather belt.',
        icon: 'items/accessories/belt_leather'
    },
    belt_of_giants: {
        id: 'belt_of_giants', name: 'Belt of Giants', type: 'belt', rarity: 'rare',
        stats: { str: 8, hp: 50, def: 5 }, level: 22, price: 900, desc: 'Grants strength of giants.',
        icon: 'items/accessories/belt_giants'
    },

    // === CONSUMABLES ===
    minor_health_potion: {
        id: 'minor_health_potion', name: 'Minor Health Potion', type: 'health_potion', rarity: 'common',
        effect: { heal: 50 }, level: 1, price: 25, desc: 'Restores 50 HP.',
        icon: 'items/potions/health_minor'
    },
    health_potion: {
        id: 'health_potion', name: 'Health Potion', type: 'health_potion', rarity: 'common',
        effect: { heal: 150 }, level: 5, price: 75, desc: 'Restores 150 HP.',
        icon: 'items/potions/health'
    },
    greater_health_potion: {
        id: 'greater_health_potion', name: 'Greater Health Potion', type: 'health_potion', rarity: 'uncommon',
        effect: { heal: 400 }, level: 15, price: 250, desc: 'Restores 400 HP.',
        icon: 'items/potions/health_greater'
    },
    super_health_potion: {
        id: 'super_health_potion', name: 'Super Health Potion', type: 'health_potion', rarity: 'rare',
        effect: { heal: 1000 }, level: 25, price: 800, desc: 'Restores 1000 HP.',
        icon: 'items/potions/health_super'
    },
    minor_mana_potion: {
        id: 'minor_mana_potion', name: 'Minor Mana Potion', type: 'mana_potion', rarity: 'common',
        effect: { mp: 30 }, level: 1, price: 25, desc: 'Restores 30 MP.',
        icon: 'items/potions/mana_minor'
    },
    mana_potion: {
        id: 'mana_potion', name: 'Mana Potion', type: 'mana_potion', rarity: 'common',
        effect: { mp: 100 }, level: 5, price: 75, desc: 'Restores 100 MP.',
        icon: 'items/potions/mana'
    },
    greater_mana_potion: {
        id: 'greater_mana_potion', name: 'Greater Mana Potion', type: 'mana_potion', rarity: 'uncommon',
        effect: { mp: 300 }, level: 15, price: 250, desc: 'Restores 300 MP.',
        icon: 'items/potions/mana_greater'
    },
    elixir_of_life: {
        id: 'elixir_of_life', name: 'Elixir of Life', type: 'elixir', rarity: 'epic',
        effect: { fullHeal: true, buff: { stat: 'all', val: 10, duration: 300 } }, level: 30, price: 2000, desc: 'Full heal + all stats +10 for 5 min.',
        icon: 'items/potions/elixir_life'
    },
    antidote: {
        id: 'antidote', name: 'Antidote', type: 'antidote', rarity: 'common',
        effect: { curePoison: true }, level: 1, price: 30, desc: 'Cures poison.',
        icon: 'items/potions/antidote'
    },
    town_portal_scroll: {
        id: 'town_portal_scroll', name: 'Town Portal Scroll', type: 'town_scroll', rarity: 'uncommon',
        effect: { teleport: 'town' }, level: 1, price: 50, desc: 'Teleports to nearest town.',
        icon: 'items/potions/scroll_town'
    },
    bread: {
        id: 'bread', name: 'Bread', type: 'food', rarity: 'common',
        effect: { heal: 20, duration: 30 }, level: 1, price: 5, desc: 'Restores 20 HP over 30 sec.',
        icon: 'items/food/bread'
    },
    meat: {
        id: 'meat', name: 'Cooked Meat', type: 'food', rarity: 'common',
        effect: { heal: 50, duration: 60 }, level: 1, price: 15, desc: 'Restores 50 HP over 60 sec.',
        icon: 'items/food/meat'
    },
};

// Shop inventory by vendor type
export const SHOP_INVENTORIES = {
    general: ['rusty_sword', 'iron_sword', 'leather_armor', 'minor_health_potion', 'minor_mana_potion', 'bread', 'town_portal_scroll', 'antidote', 'copper_ring', 'leather_belt'],
    weapons: ['rusty_sword', 'iron_sword', 'steel_longsword', 'elven_blade', 'frostbrand', 'flamebrand', 'hunters_bow', 'windforce_bow', 'celestial_bow', 'apprentice_wand', 'oak_staff', 'crystal_wand', 'staff_of_archmagi', 'battle_axe', 'berserker_axe', 'dragon_slayer', 'war_mace', 'shadow_dagger', 'assassins_blade', 'void_dagger', 'orb_of_power'],
    armor: ['cloth_robe', 'leather_armor', 'chainmail', 'plate_armor', 'iron_helmet', 'elven_circlet', 'iron_boots', 'leather_gloves', 'wooden_shield', 'iron_shield', 'tower_shield', 'travelers_cloak', 'shadow_cloak'],
    potions: ['minor_health_potion', 'health_potion', 'greater_health_potion', 'super_health_potion', 'minor_mana_potion', 'mana_potion', 'greater_mana_potion', 'elixir_of_life', 'antidote', 'town_portal_scroll', 'bread', 'meat'],
    accessories: ['copper_ring', 'silver_ring', 'ring_of_power', 'gold_amulet', 'amulet_of_guardian', 'leather_belt', 'belt_of_giants'],
};
