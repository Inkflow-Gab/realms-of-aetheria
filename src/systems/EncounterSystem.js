// ============================================
// REALMS OF AETHERIA - ENCOUNTER SYSTEM
// ============================================
// Random overworld encounters, boss rarity rolls, aggro chase thresholds.
// ============================================

import { MONSTERS, ZONE_SPAWNS } from '../data/Monsters.js';

/** Zone → rare boss ids that can ambush while exploring. */
export const ZONE_BOSSES = {
    meadow: [],
    forest: ['goblin'],
    cave: ['mimic'],
    ruins: ['dark_knight'],
    mountain: ['cyclops', 'dragon_whelp'],
    dungeon: ['lich', 'vampire'],
    abyss: ['ancient_lich', 'shadow_lord', 'titan', 'aetheria_dragon'],
    arena: ['dragon', 'demon'],
    town: [],
};

/** Base chance per tile step to trigger a random fight (outside town). */
const BASE_ENCOUNTER = {
    meadow: 0.04,
    forest: 0.055,
    cave: 0.06,
    ruins: 0.065,
    mountain: 0.07,
    dungeon: 0.08,
    abyss: 0.09,
    arena: 0.1,
    town: 0,
};

export class EncounterSystem {
    /**
     * Roll a random encounter after the player walks a tile.
     * @returns {{ monsterId:string, isBoss:boolean, isAmbush:boolean }|null}
     */
    static rollStep(zone, playerLevel = 1, stepsSinceLast = 0) {
        if (zone === 'town') return null;
        const table = ZONE_SPAWNS[zone];
        if (!table?.length) return null;

        // Soft pity: longer walks without a fight raise the odds.
        const base = BASE_ENCOUNTER[zone] ?? 0.05;
        const pity = Math.min(0.12, stepsSinceLast * 0.004);
        const chance = Math.min(0.28, base + pity);
        if (Math.random() > chance) return null;

        // Rare boss ambush (~4–9% when an encounter fires, higher in abyss).
        const bosses = (ZONE_BOSSES[zone] || []).filter((id) => {
            const m = MONSTERS[id];
            if (!m) return false;
            // Don't ambush with something 12+ levels above the hero.
            return m.level <= playerLevel + 12;
        });
        const bossChance = zone === 'abyss' ? 0.09 : zone === 'arena' ? 0.08 : 0.04;
        if (bosses.length && Math.random() < bossChance) {
            const monsterId = bosses[Math.floor(Math.random() * bosses.length)];
            return { monsterId, isBoss: !!MONSTERS[monsterId]?.boss, isAmbush: true };
        }

        // Weighted toward nearer-level mobs.
        const scored = table.map((id) => {
            const m = MONSTERS[id];
            const diff = Math.abs((m?.level || 1) - playerLevel);
            const weight = Math.max(1, 12 - diff);
            return { id, weight };
        });
        const total = scored.reduce((s, r) => s + r.weight, 0);
        let roll = Math.random() * total;
        let monsterId = scored[0].id;
        for (const row of scored) {
            roll -= row.weight;
            if (roll <= 0) {
                monsterId = row.id;
                break;
            }
        }

        return {
            monsterId,
            isBoss: !!MONSTERS[monsterId]?.boss,
            isAmbush: Math.random() < 0.18,
        };
    }

    /** Aggressive mobs auto-start combat when they get this close. */
    static aggroEngageDistance(monster) {
        if (!monster) return 48;
        if (monster.boss || monster.finalBoss) return 70;
        if (monster.aggressive) return 55;
        return 0;
    }
}
