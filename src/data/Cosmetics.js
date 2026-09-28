// ============================================
// REALMS OF AETHERIA - COSMETICS
// ============================================

export const COSMETIC_AURAS = {
    none: { id: 'none', name: 'None', tint: null, unlockLevel: 1, cost: 0 },
    gold: { id: 'gold', name: 'Golden Aura', tint: 0xffd700, unlockLevel: 1, cost: 0 },
    azure: { id: 'azure', name: 'Azure Mist', tint: 0x66ccff, unlockLevel: 5, cost: 250 },
    crimson: { id: 'crimson', name: 'Crimson Flame', tint: 0xff4444, unlockLevel: 10, cost: 500 },
    emerald: { id: 'emerald', name: 'Emerald Ward', tint: 0x44ff88, unlockLevel: 15, cost: 800 },
    violet: { id: 'violet', name: 'Void Shimmer', tint: 0xaa66ff, unlockLevel: 20, cost: 1200 },
};

export const COSMETIC_TITLES = {
    none: { id: 'none', name: 'No Title', prefix: '', unlockLevel: 1, cost: 0 },
    wanderer: { id: 'wanderer', name: 'Wanderer', prefix: 'Wanderer', unlockLevel: 3, cost: 100 },
    slayer: { id: 'slayer', name: 'Monster Slayer', prefix: 'Slayer', unlockLevel: 8, cost: 400 },
    champion: { id: 'champion', name: 'Champion', prefix: 'Champion', unlockLevel: 15, cost: 900 },
    legend: { id: 'legend', name: 'Living Legend', prefix: 'Legend', unlockLevel: 25, cost: 2000 },
};

export const COSMETIC_FRAMES = {
    default: { id: 'default', name: 'Standard Frame', unlockLevel: 1, cost: 0 },
    gold: { id: 'gold', name: 'Royal Frame', unlockLevel: 12, cost: 600 },
};

export const DEFAULT_COSMETICS = {
    aura: 'gold',
    title: 'none',
    frame: 'default',
    trail: false,
};

export function isCosmeticUnlocked(entry, player) {
    if (!entry) return false;
    if (player.level >= (entry.unlockLevel || 1)) return true;
    return false;
}

export function formatDisplayName(player) {
    const titleId = player.cosmetics?.title || 'none';
    const title = COSMETIC_TITLES[titleId]?.prefix;
    if (title) return `${title} ${player.name}`;
    return player.name;
}
