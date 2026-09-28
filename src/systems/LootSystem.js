// ============================================
// REALMS OF AETHERIA - LOOT SYSTEM
// ============================================

import { ITEMS } from '../data/Items.js';
import { MONSTERS } from '../data/Monsters.js';

const RARITY_WEIGHT = {
    common: 1, uncommon: 1.15, rare: 1.35, epic: 1.6, legendary: 2,
};

const MATERIAL_TABLE = [
    { match: /slime/i, item: 'slime_gel', chance: 0.55 },
    { match: /bat/i, item: 'bat_wing', chance: 0.48 },
    { match: /goblin/i, item: 'goblin_ear', chance: 0.42 },
    { match: /skeleton|undead|ghost|zombie|lich/i, item: 'bone_shard', chance: 0.48 },
    { match: /dragon|demon|titan|shadow|boss|king|yeti|cyclop|giant|blood/i, item: 'boss_trophy', chance: 0.35 },
    { match: /./, item: 'monster_hide', chance: 0.28 },
    { match: /./, item: 'magic_dust', chance: 0.16 },
];

/** Guaranteed / boosted boss extras on top of table drops. */
const BOSS_BONUS = [
    { item: 'boss_trophy', chance: 0.75, count: [1, 2] },
    { item: 'magic_dust', chance: 0.85, count: [2, 5] },
    { item: 'loot_chest_key', chance: 0.45, count: [1, 2] },
    { item: 'greater_health_potion', chance: 0.4, count: [1, 2] },
    { item: 'elixir_of_life', chance: 0.12, count: [1, 1] },
];

const FINAL_BOSS_BONUS = [
    { item: 'excalibur', chance: 0.35, count: 1 },
    { item: 'dragon_scale_armor', chance: 0.3, count: 1 },
    { item: 'ring_of_power', chance: 0.4, count: 1 },
    { item: 'boss_trophy', chance: 1, count: [3, 5] },
    { item: 'magic_dust', chance: 1, count: [5, 10] },
];

const CHEST_TABLES = {
    wood: [
        { item: 'minor_health_potion', chance: 0.75, count: [1, 2] },
        { item: 'bread', chance: 0.6, count: [1, 3] },
        { item: 'copper_ring', chance: 0.14, count: 1 },
        { item: 'slime_gel', chance: 0.35, count: [1, 2] },
        { item: 'loot_chest_key', chance: 0.08, count: 1 },
        { gold: [15, 55], chance: 1 },
    ],
    gold: [
        { item: 'health_potion', chance: 0.65, count: [1, 2] },
        { item: 'mana_potion', chance: 0.5, count: [1, 2] },
        { item: 'iron_sword', chance: 0.22, count: 1 },
        { item: 'leather_armor', chance: 0.18, count: 1 },
        { item: 'magic_dust', chance: 0.5, count: [1, 4] },
        { item: 'silver_ring', chance: 0.14, count: 1 },
        { item: 'loot_chest_key', chance: 0.25, count: 1 },
        { gold: [80, 200], chance: 1 },
    ],
};

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollCount(range) {
    if (!range) return 1;
    if (typeof range === 'number') return range;
    return randInt(range[0], range[1]);
}

/** Multi-roll: rare items get a second chance at half odds (double-dip RNG). */
function rollChance(chance, luckBonus = 1) {
    const c = Math.min(0.97, chance * luckBonus);
    if (Math.random() < c) return true;
    // Second chance for anything under 25% base (boss uniques feel less brick-walled)
    if (chance < 0.25 && Math.random() < c * 0.45) return true;
    return false;
}

export class LootSystem {
    static rollMonsterLoot(monsterId, opts = {}) {
        const monster = MONSTERS[monsterId];
        if (!monster) return { gold: 0, exp: 0, items: [], bonusGold: 0, isBoss: false };

        const isBoss = !!(monster.boss || monster.finalBoss);
        const luck = opts.luck || 0;
        const combo = Math.min(10, opts.combo || 0);
        const perfectHits = opts.perfectHits || 0;
        const luckBonus = 1
            + luck * 0.012
            + combo * 0.035
            + perfectHits * 0.055
            + (isBoss ? 0.15 : 0);

        const goldMult = isBoss ? 1.35 : 1;
        const goldBase = randInt(monster.gold[0], monster.gold[1]);
        const gold = Math.floor(goldBase * luckBonus * goldMult);
        const bonusGold = Math.floor(goldBase * (combo * 0.025 + perfectHits * 0.05 + (isBoss ? 0.1 : 0)));

        const expMult = isBoss ? 1.25 : 1;
        const items = [];

        // Table drops — bosses get +25% table chance
        const tableBoost = isBoss ? 1.25 : 1;
        if (monster.drops) {
            for (const drop of monster.drops) {
                if (rollChance(drop.chance * tableBoost, luckBonus)) {
                    items.push(LootSystem._pack(drop.item, drop.count || 1));
                }
            }
        }

        // Materials
        for (const row of MATERIAL_TABLE) {
            if (row.match.source === '.') continue;
            if (!row.match.test(monster.name || monsterId)) continue;
            if (rollChance(row.chance, Math.min(1.5, luckBonus))) {
                items.push(LootSystem._pack(row.item, isBoss ? randInt(1, 2) : 1));
            }
            break;
        }
        for (const row of MATERIAL_TABLE) {
            if (row.match.source !== '.') continue;
            const c = isBoss ? row.chance * 1.4 : row.chance;
            if (rollChance(c, Math.min(1.5, luckBonus))) {
                items.push(LootSystem._pack(row.item, isBoss ? randInt(1, 3) : 1));
            }
        }

        // Tier lucky rolls
        if (monster.tier >= 2 && rollChance(0.1, luckBonus)) {
            items.push(LootSystem._pack('magic_dust', randInt(1, 2)));
        }
        if (monster.tier >= 3 && rollChance(0.12, luckBonus)) {
            items.push(LootSystem._pack('magic_dust', randInt(1, 3)));
        }
        if (monster.tier >= 4 && rollChance(0.1, luckBonus)) {
            items.push(LootSystem._pack('boss_trophy', 1));
        }
        if (rollChance(isBoss ? 0.2 : 0.07, luckBonus)) {
            items.push(LootSystem._pack('loot_chest_key', 1));
        }

        // Boss / final boss bonus tables
        if (monster.finalBoss) {
            for (const row of FINAL_BOSS_BONUS) {
                if (rollChance(row.chance, luckBonus)) {
                    items.push(LootSystem._pack(row.item, rollCount(row.count)));
                }
            }
        } else if (isBoss) {
            for (const row of BOSS_BONUS) {
                if (rollChance(row.chance, luckBonus)) {
                    items.push(LootSystem._pack(row.item, rollCount(row.count)));
                }
            }
        }

        // Deduplicate stacks of the same id
        const merged = new Map();
        for (const it of items.filter(Boolean)) {
            const prev = merged.get(it.id);
            if (prev) prev.count += it.count;
            else merged.set(it.id, { ...it });
        }

        return {
            gold: gold + bonusGold,
            exp: Math.floor(monster.exp * expMult),
            items: [...merged.values()],
            bonusGold,
            isBoss,
        };
    }

    static rollChest(kind = 'wood', luck = 0) {
        const table = CHEST_TABLES[kind] || CHEST_TABLES.wood;
        const luckBonus = 1 + luck * 0.012;
        const items = [];
        let gold = 0;
        for (const row of table) {
            if (!rollChance(row.chance || 0, luckBonus)) continue;
            if (row.gold) gold += randInt(row.gold[0], row.gold[1]);
            if (row.item) items.push(LootSystem._pack(row.item, rollCount(row.count)));
        }
        return { gold, items: items.filter(Boolean) };
    }

    static grant(player, loot) {
        if (!player || !loot) return [];
        if (loot.gold) player.gold += loot.gold;
        const granted = [];
        for (const row of loot.items || []) {
            if (!row?.id || !ITEMS[row.id]) continue;
            player.addItem(row.id, row.count || 1);
            granted.push({
                id: row.id,
                count: row.count || 1,
                name: ITEMS[row.id].name,
                rarity: ITEMS[row.id].rarity || 'common',
            });
        }
        return granted;
    }

    static sellValue(itemId, count = 1) {
        const item = ITEMS[itemId];
        if (!item) return 0;
        const rarity = RARITY_WEIGHT[item.rarity] || 1;
        return Math.max(1, Math.floor((item.price || 5) * 0.4 * rarity)) * count;
    }

    static _pack(itemId, count = 1) {
        const item = ITEMS[itemId];
        if (!item) return null;
        return {
            id: itemId,
            count,
            name: item.name,
            rarity: item.rarity || 'common',
        };
    }
}
