// ============================================
// REALMS OF AETHERIA - ASSET MANIFEST
// ============================================
//
// Single source of truth for every asset the game loads.
//
// This replaced paths that were hard-coded inside PreloadScene, where several
// of them pointed at files that do not exist (e.g. `sounds/attack.ogg` -- the
// real files are numbered `1.ogg` ... `40.ogg`). Every 404 in the old loader
// stalled the queue, which is what made loading feel frozen.
//
// GROUPING MATTERS:
//   'critical' - needed to draw the main menu. Loaded first, blocking.
//   'gameplay' - needed once you enter the world. Loaded after the menu is up,
//                in the background, so the menu appears fast.
//   'audio'    - large (22MB). Deferred until after the menu, never blocking.
// ============================================

// --- Character sprites ---
// The pack provides 10 portraits (1.png .. 10.png), but the avatar selector
// cycles through 11 slots (`avatarIndex % 11`) and save files persist that
// index, so all 11 texture keys have to resolve to something.
//
// Slot 0 therefore reuses portrait 1. Keeping the full 0..10 key range means
// existing save data and every `char_${avatarIndex}` lookup keep working.
// A missing texture here is what previously left the avatar preview as a
// green box in the character creation screen.
const CHARACTER_FILES = [
    '1.png', // slot 0 - reuse portrait 1
    '1.png', // slot 1
    '2.png',
    '3.png',
    '4.png',
    '5.png',
    '6.png',
    '7.png',
    '8.png',
    '9.png',
    '10.png', // slot 10
];

const CHARACTERS = CHARACTER_FILES.map((file, i) => ({
    key: `char_${i}`,
    file: `assets/characters/${file}`,
    group: 'critical',
}));

// --- Monsters ---
// Note: the key is derived without the .png, and 'king skeleton' contains a
// space in its real filename.
const MONSTER_FILES = [
    'bat', 'boar', 'chest', 'cyclop', 'dragon', 'giant', 'goblin',
    'leonard', 'octopus', 'skeleton', 'slim', 'snake', 'yeti', 'Slime_Green',
    'king skeleton',
];

const MONSTERS = MONSTER_FILES.map((name) => ({
    key: `monster_${name.toLowerCase().replace(/ /g, '_')}`,
    file: `assets/monsters/${name}.png`,
    group: 'gameplay',
}));

// --- NPCs ---
const NPC_FILES = [
    'MiniNobleMan', 'MiniNobleWoman', 'MiniOldMan', 'MiniOldWoman',
    'MiniPeasant', 'MiniPrincess', 'MiniQueen', 'MiniVillagerMan',
    'MiniVillagerWoman', 'MiniWorker',
];

const NPCS = NPC_FILES.map((name, i) => ({
    key: `npc_${i + 1}`,
    file: `assets/npcs/${name}.png`,
    group: 'gameplay',
}));

// --- Items (1..19 plus the container sprites the world scene asks for) ---
const ITEM_NUMBERS = Array.from({ length: 19 }, (_, i) => i + 1);

const ITEMS = [
    ...ITEM_NUMBERS.map((n) => ({
        key: `item_${n}`,
        file: `assets/items/${n}.png`,
        group: 'gameplay',
    })),
    { key: 'item_barrel', file: 'assets/items/barrel.png', group: 'gameplay' },
    { key: 'item_crate', file: 'assets/items/crate.png', group: 'gameplay' },
    { key: 'item_chest_wood_closed', file: 'assets/items/wood-chest-close.png', group: 'gameplay' },
    { key: 'item_chest_wood_open', file: 'assets/items/wood-chest-open.png', group: 'gameplay' },
    { key: 'item_chest_gold_closed', file: 'assets/items/gold-chest-close.png', group: 'gameplay' },
    { key: 'item_chest_gold_open', file: 'assets/items/gold-chest-open.png', group: 'gameplay' },
];

// --- Tiles ---
const TILES = [
    'Grass_Middle', 'Path_Tile', 'Cliff_Tile', 'Water_Tile',
    'Path_Middle', 'Water_Middle', 'Beach_Tile', 'FarmLand_Tile',
].map((name) => ({
    key: `tile_${name}`,
    file: `assets/tiles/${name}.png`,
    group: 'gameplay',
}));

// --- Backgrounds (code uses bg_1 .. bg_16) ---
// The rpg-battle-system pack ships these at 640x480, which is real art at a
// sane size. They were previously taken from a different pack's 137x89
// thumbnails and stretched across 1280x720, which is why the world looked like
// a smeared blur. 1-6 are day scenes; the matching -night versions are kept as
// separate keys so darker zones can switch to them.
const BACKGROUND_FILES = [
    '1.png', '2.png', '3.png', '4.png', '5.png', '6.png',
    '7.png', '8.png', '9.png', '10.png',
    '1-night.png', '2-night.png', '3-night.png',
    '4-night.png', '5-night.png', '6-night.png',
];

const BACKGROUNDS = BACKGROUND_FILES.map((file, i) => ({
    key: `bg_${i + 1}`,
    file: `assets/backgrounds/${file}`,
    group: 'critical',
}));

// --- UI skins ---
const UI = [
    ['ui_medieval', 'MediavelFree.png'],
    ['ui_fantasy', 'freefantasy.png'],
    ['ui_free', 'FreeUI.png'],
    ['ui_cozy', 'UiCozyFree.png'],
    ['ui_pastel', 'PastelUIFree.png'],
].map(([key, file]) => ({
    key,
    file: `assets/ui/${file}`,
    group: 'critical',
}));

// --- HUD ---
const HUD = [
    ['hud_life_box', 'life-box.png'],
    ['hud_life_empty', 'life-box-empty.png'],
    ['hud_heart_full', 'full-heart.png'],
    ['hud_heart_empty', 'empty-heart.png'],
    ['hud_medium_box', 'medium-box.png'],
    ['hud_little_box', 'little-box.png'],
].map(([key, file]) => ({
    key,
    file: `assets/hud/${file}`,
    group: 'critical',
}));

// --- Button / panel art used by UIComponents ---
const UI_CONTROLS = [
    { key: 'btn_yes', file: 'assets/ui/buttons/yes-button.png', group: 'critical' },
    { key: 'btn_no', file: 'assets/ui/buttons/no-button.png', group: 'critical' },
    { key: 'btn_arrow', file: 'assets/ui/buttons/arrow.png', group: 'critical' },
    { key: 'ui_panel_box', file: 'assets/ui/panels/panel-box.png', group: 'critical' },
];

// ============================================
// AUDIO
// ============================================
//
// Background music: only the main menu track blocks the loader. The remaining
// 15 tracks (~13MB) are streamed in afterwards, behind the menu.
//
// Sound effects: the pack ships numbered files (1.ogg ... 40.ogg), not named
// ones. They are loaded under their own numbers, and the names the game asks
// for are resolved through SOUND_ALIASES below.
//
// >>> If a sound plays the wrong effect, edit SOUND_ALIASES to point that name
// >>> at a different number. Nothing else needs to change.
// ============================================

// Menu music used to be critical, but theme-1.ogg is ~900KB and on slower
// devices it held the entire loading screen hostage even after every image
// was already ready. It now loads with the rest of the audio; the menu plays
// it as soon as it lands (see MainMenuScene).
const MENU_MUSIC = [
    { key: 'music_1', file: 'assets/music/theme-1.ogg', group: 'audio' },
];

// Remaining themes, loaded in the background after the menu appears.
const BACKGROUND_MUSIC = Array.from({ length: 16 }, (_, i) => i + 1)
    .filter((n) => n !== 1)
    .map((n) => ({
        key: `music_${n}`,
        file: `assets/music/theme-${n}.ogg`,
        group: 'audio',
    }));

// Numbered effect files that actually exist. These are small (~700KB total).
const SFX = Array.from({ length: 40 }, (_, i) => i + 1).map((n) => ({
    key: `sfx_${n}`,
    file: `assets/sounds/${n}.ogg`,
    group: 'audio',
}));

// The pack also ships clearly named effects. They were left unused while the
// game leaned entirely on the numbered files, which is a shame -- a victory
// fanfare and a monster roar are far more expressive than `27.ogg`.
//
// Keys here are semantic, so AudioSystem can look them up by name directly.
const NAMED_SFX = [
    ['sfx_ambience_forest', 'forest-ambience.wav'],
    ['sfx_monster_roar_1', 'monster-1.wav'],
    ['sfx_monster_roar_2', 'monster-2.wav'],
    ['sfx_victory_1', 'victory-1.wav'],
    ['sfx_victory_2', 'victory-2.wav'],
    ['sfx_victory_3', 'victory-3.wav'],
    ['sfx_whoosh_1', 'woosh-1.wav'],
    ['sfx_whoosh_2', 'woosh-2.wav'],
].map(([key, file]) => ({
    key,
    file: `assets/sounds/${file}`,
    group: 'audio',
    loop: key === 'sfx_ambience_forest',
}));

/**
 * Maps the sound names used throughout the game to real numbered files.
 * Names with no entry simply play nothing -- AudioSystem stays silent rather
 * than throwing.
 */
export const SOUND_ALIASES = {
    attack: 1,
    hit: 3,
    crit: 4,
    hurt: 5,
    heal: 6,
    step: 7,
    click: 8,
    swing: 9,
    potion: 10,
    cast: 11,
    fire: 12,
    ice: 13,
    lightning: 14,
    magic: 15,
    arrow: 16,
    bow: 17,
    block: 18,
    miss: 19,
    levelup: 20,
    coin: 21,
    quest: 22,
    equip: 23,
    chest: 24,
    door: 25,
    monster_die: 26,
    player_hurt: 27,
    victory: 28,
    defeat: 29,
    death: 30,
};

/** Music track names requested by AudioSystem, resolved to real themes. */
export const MUSIC_ALIASES = {
    menu: 1,
    town: 1,
    battle: 2,
    dungeon: 3,
    boss: 4,
    victory: 6,
};

/**
 * Friendly name -> audio key, for the clearly named effects.
 *
 * These take precedence over the numbered SOUND_ALIASES: a name listed here is
 * bound to the effect that was actually recorded for it, rather than to a
 * number guessed by position.
 */
export const NAMED_SOUND_KEYS = {
    ambience: 'sfx_ambience_forest',
    roar: 'sfx_monster_roar_1',
    roar_alt: 'sfx_monster_roar_2',
    fanfare: 'sfx_victory_1',
    whoosh: 'sfx_whoosh_1',
};

// Combat VFX sheets (spritesheets, loaded via Phaser after images land).
// Listed here so prepare-web verifies they ship in the APK; the EffectsSystem
// registers the frame sizes when the deferred loader finishes.
import { FX_MANIFEST } from '../systems/EffectsSystem.js';

const FX_ASSETS = FX_MANIFEST.map(({ key, file, group }) => ({ key, file, group }));

export const ASSET_MANIFEST = [
    ...CHARACTERS,
    ...BACKGROUNDS,
    ...UI,
    ...HUD,
    ...UI_CONTROLS,
    ...MONSTERS,
    ...NPCS,
    ...ITEMS,
    ...TILES,
    ...FX_ASSETS,
    ...MENU_MUSIC,
    ...BACKGROUND_MUSIC,
    ...SFX,
    ...NAMED_SFX,
];

/** Assets needed before the main menu can be drawn. */
export function getCriticalAssets() {
    return ASSET_MANIFEST.filter((a) => a.group === 'critical');
}

/** Everything else, loaded after the menu is visible. */
export function getDeferredAssets() {
    return ASSET_MANIFEST.filter((a) => a.group !== 'critical');
}
