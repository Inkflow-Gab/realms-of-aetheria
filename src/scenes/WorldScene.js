// ============================================
// REALMS OF AETHERIA - WORLD SCENE (Main Gameplay)
// ============================================

import { GAME_CONFIG } from '../config/GameConfig.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { QuestSystem } from '../systems/QuestSystem.js';
import { AudioSystem } from '../systems/AudioSystem.js';
import { VirtualJoystick } from '../ui/VirtualJoystick.js';
import { UIComponents } from '../ui/UIComponents.js';
import { layout, addBetaBadge, readableText, HUD_TEXT } from '../ui/Layout.js';
import { SettingsSystem } from '../systems/SettingsSystem.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { COSMETIC_AURAS, formatDisplayName } from '../data/Cosmetics.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { MONSTERS, ZONE_SPAWNS } from '../data/Monsters.js';
import { NPCS } from '../data/NPCs.js';
import { ITEMS } from '../data/Items.js';
import { LootSystem } from '../systems/LootSystem.js';
import { EffectsSystem } from '../systems/EffectsSystem.js';
import { EncounterSystem } from '../systems/EncounterSystem.js';
import { getActiveDestination } from '../data/Quests.js';

export class WorldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'World' });
    }

    init(data) {
        this.loadSave = data?.loadSave || false;
        // CharacterCreation starts World with { player }. Storing it here so
        // create() can actually use it -- previously `data` was out of scope
        // and every New Game silently spawned a blank default hero.
        this.incomingPlayer = data?.player || null;
    }

    create() {
        // Guarantee a visible camera (WorldLoad used to fadeOut and leave black).
        try {
            this.cameras.main.setAlpha(1);
            this.cameras.main.setZoom(1);
            this.cameras.main.fadeIn(350, 10, 10, 26);
        } catch { /* ignore */ }

        const width = this.cameras.main.width || this.scale.width || 1280;
        const height = this.cameras.main.height || this.scale.height || 720;

        try {
            this._bootWorld(width, height);
        } catch (err) {
            console.error('[World] create failed:', err);
            this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a, 1);
            this.add.text(width / 2, height / 2 - 20, 'World failed to load', {
                fontFamily: 'Georgia, serif', fontSize: '22px', color: '#e74c3c',
            }).setOrigin(0.5);
            this.add.text(width / 2, height / 2 + 20, String(err?.message || err).slice(0, 120), {
                fontFamily: 'Georgia, serif', fontSize: '12px', color: '#f0e6d3',
                wordWrap: { width: width * 0.8 },
            }).setOrigin(0.5);
            UIComponents.createButton(this, width / 2, height / 2 + 70, 'Back to Menu', () => {
                this.scene.start('MainMenu');
            }, { width: 200, height: 44, fontSize: 16, variant: 'primary' });
        }
    }

    _bootWorld(width, height) {
        // === LOAD OR CREATE PLAYER ===
        if (this.loadSave) {
            const saveSystem = new SaveSystem();
            const saveData = saveSystem.load();
            if (saveData) {
                this.player = new PlayerSystem(saveData.player);
            } else {
                this.player = new PlayerSystem();
            }
        } else {
            this.player = this.incomingPlayer || new PlayerSystem();
        }

        // === SYSTEMS ===
        this.saveSystem = new SaveSystem();
        this.questSystem = new QuestSystem(this.player, this);
        this.audio = new AudioSystem();
        this.audio.init(this);
        this.achievements = new AchievementSystem(this.player);
        this.achievements.init(this);

        // === WORLD SETUP ===
        this.currentZone = this.player.zone || 'town';
        this.monsters = [];
        this.npcs = [];
        this.droppedItems = [];

        this.createWorld();

        // === PLAYER SPRITE ===
        const gfx = SettingsSystem.getGraphicsProfile();
        const charKey = `char_${this.player.avatarIndex}`;
        const safeChar = this.textures.exists(charKey)
            ? charKey
            : (this.textures.exists('char_0') ? 'char_0' : null);
        const spawnX = (this.player.x || 5) * GAME_CONFIG.TILE_SIZE;
        const spawnY = (this.player.y || 5) * GAME_CONFIG.TILE_SIZE;
        if (safeChar) {
            this.playerSprite = this.add.sprite(spawnX, spawnY, safeChar)
                .setScale(Math.max(1.8, gfx.playerScale || 2.0))
                .setDepth(10);
        } else {
            this.playerSprite = this.add.circle(spawnX, spawnY, 18, 0xc9a84c).setDepth(10);
            this.playerSprite.setFlipX = () => {};
        }

        // Camera locked on the hero — snap first, then smooth follow.
        const mapW = GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE;
        const mapH = GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE;
        this.cameras.main.setBounds(0, 0, mapW, mapH);
        this.cameras.main.setZoom(1);
        this.cameras.main.setRoundPixels(true);
        this.cameras.main.centerOn(spawnX, spawnY);
        this.cameras.main.startFollow(this.playerSprite, true, 0.18, 0.18);
        this.cameras.main.setDeadzone(0, 0);
        this.applyPlayerCosmetics();

        this.createUI();

        const joyR = Math.max(48, Math.min(64, height * 0.12));
        this.joystick = new VirtualJoystick(
            this,
            Math.max(80, joyR + 28),
            height - joyR - 20,
            joyR * 1.5
        );

        this.createActionButtons();
        this.spawnNPCs();
        this.spawnMonsters();

        // Keyboard is often null on Android WebView — never crash the world for it.
        try {
            if (this.input.keyboard) {
                this.cursors = this.input.keyboard.createCursorKeys();
                this.keys = this.input.keyboard.addKeys('W,A,S,D,I,K,L,P,SPACE,E');
            } else {
                this.cursors = { left: {}, right: {}, up: {}, down: {} };
                this.keys = {};
            }
        } catch {
            this.cursors = { left: {}, right: {}, up: {}, down: {} };
            this.keys = {};
        }

        this.dialogueBox = new DialogueBox(this, width / 2 - Math.min(300, width * 0.4), height - 200, Math.min(600, width * 0.8), 150);
        this.dialogueBox.onClose = () => {
            this.isInDialogue = false;
        };

        try {
            this.audio.playMusic(this.currentZone === 'town' ? 'town' : 'battle');
        } catch { /* ignore */ }

        this.showZoneBanner();

        this.input.on('pointerdown', (pointer) => this.spawnTapParticles(pointer));

        if (!this.loadSave && !this.starterKitGiven) {
            this.giveStarterKit();
        }

        this.time.addEvent({
            delay: 30000,
            callback: () => this.saveGame(),
            loop: true,
        });

        this.time.addEvent({
            delay: 1000,
            callback: () => this.checkZoneTransition(),
            loop: true,
        });

        this.chests = [];
        this.spawnWorldChests();
        this.events.on('resume', (_sys, data) => this.onBattleResume(data));
    }

    onBattleResume(data) {
        if (!data?.victory) return;

        // Remove the defeated monster from the overworld
        const idx = this.monsters.findIndex((m) =>
            (data.worldMonsterRef && m === data.worldMonsterRef)
            || (m.id === data.monsterId && m.sprite?.active)
        );
        let dropX = this.playerSprite?.x || 0;
        let dropY = this.playerSprite?.y || 0;
        if (idx >= 0) {
            const m = this.monsters[idx];
            dropX = m.sprite?.x ?? dropX;
            dropY = m.sprite?.y ?? dropY;
            m.sprite?.destroy();
            m.hpBar?.destroy?.();
            m.zone?.destroy?.();
            this.monsters.splice(idx, 1);
        }

        // Extra world loot sparkle even though inventory already got battle loot —
        // spill a visible bag for bonus materials / immersion.
        if (data.loot?.items?.length) {
            this.spawnLootBag(dropX + 20, dropY + 10, {
                gold: Math.floor((data.loot.bonusGold || 0) * 0.5),
                items: Math.random() < 0.35
                    ? [{ id: 'magic_dust', count: 1, name: 'Magic Dust', rarity: 'uncommon' }]
                    : [],
            });
        }

        this.showNotification('Victory!');
        EffectsSystem.ensureAnims(this);
        EffectsSystem.play(this, dropX, dropY, 'burst', { scale: 1.4, depth: 40 });
    }

    createWorld() {
        const L = layout(this);

        // Zone backdrop, fixed to the viewport. It used to be placed at the
        // camera centre in world space, so the moment the camera followed the
        // player the backdrop scrolled away and the world looked empty.
        const bgKey = this.getZoneBackground();
        if (this.textures.exists(bgKey)) {
            this.add.image(L.cx, L.cy, bgKey)
                .setDisplaySize(L.w, L.h)
                .setScrollFactor(0)
                .setDepth(0)
                .setAlpha(0.95);
        } else {
            // Bright fallback so the world never boots into a black void.
            this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x3a5a3a, 1).setScrollFactor(0).setDepth(0);
        }

        // Ground tiles
        this.buildGroundLayer();

        // Zone decorations
        this.addZoneDecorations();
    }

    /**
     * The ground, as a single GPU-tiled object the size of the viewport.
     *
     * Two earlier versions were both broken in different ways:
     *
     *   1. A nested loop over MAP_WIDTH x MAP_HEIGHT created one Image per
     *      tile -- 4,800 Game Objects, each with its own draw call. That
     *      destroyed the frame rate.
     *
     *   2. A single TileSprite covering the whole world fixed the draw calls
     *      but was 5120x3840 px. That exceeds MAX_TEXTURE_SIZE on most mobile
     *      GPUs (2048-4096), so the texture allocation failed and the device
     *      froze on entering the world.
     *
     * This version is viewport-sized and scrolls by writing the camera's
     * scroll offset into tilePosition each frame. One small quad, one draw
     * call, a few kilobytes of memory -- regardless of how large the world is.
     */
    buildGroundLayer() {
        const L = layout(this);
        const w = L.w;
        const h = L.h;

        // Never call tileSprite on a missing key — that used to freeze Capacitor
        // WebViews when gameplay tiles were still deferred.
        const grassKey = this.textures.exists('tile_Grass_Middle')
            ? 'tile_Grass_Middle'
            : null;

        if (grassKey) {
            this.ground = this.add.tileSprite(0, 0, w, h, grassKey)
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(1)
                .setAlpha(0.55);
        } else {
            this.ground = this.add.rectangle(0, 0, w, h, 0x2a4a2a, 0.85)
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(1);
            // Rectangle has no tilePosition — stub so the update loop stays safe.
            this.ground.tilePositionX = 0;
            this.ground.tilePositionY = 0;
        }

        const zoneTint = {
            cave: 0xb0b0c0,
            dungeon: 0x9a9aaa,
            abyss: 0x8a8a9a,
            mountain: 0xc0c0d0,
        };
        if (grassKey && zoneTint[this.currentZone] && this.ground.setTint) {
            this.ground.setTint(zoneTint[this.currentZone]);
        }

        this.groundOverlay = null;
        if (
            (this.currentZone === 'ruins' || this.currentZone === 'arena')
            && this.textures.exists('tile_Path_Middle')
        ) {
            this.groundOverlay = this.add.tileSprite(0, 0, w, h, 'tile_Path_Middle')
                .setOrigin(0, 0)
                .setScrollFactor(0)
                .setDepth(1)
                .setAlpha(0.3);
        }

        return this.ground;
    }

    getZoneBackground() {
        const bgs = {
            town: 'bg_1', meadow: 'bg_2', forest: 'bg_3',
            cave: 'bg_4', ruins: 'bg_5', mountain: 'bg_6',
            dungeon: 'bg_7', abyss: 'bg_8', arena: 'bg_9'
        };
        return bgs[this.currentZone] || 'bg_1';
    }

    getZoneTile() {
        const tiles = {
            town: 'tile_Grass_Middle', meadow: 'tile_Grass_Middle',
            forest: 'tile_Grass_Middle', cave: 'tile_Cliff_Tile',
            ruins: 'tile_Path_Tile', mountain: 'tile_Cliff_Tile',
            dungeon: 'tile_Cliff_Tile', abyss: 'tile_Cliff_Tile',
            arena: 'tile_Path_Tile'
        };
        return tiles[this.currentZone] || 'tile_Grass_Middle';
    }

    addZoneDecorations() {
        if (!this.textures.exists('item_barrel')) return;
        const decorCount = 10;
        for (let i = 0; i < decorCount; i++) {
            const x = Math.random() * GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE;
            const y = Math.random() * GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE;
            const decor = this.add.image(x, y, 'item_barrel').setScale(0.5).setDepth(2);
            decor.setAlpha(0.7);
        }
    }

    createUI() {
        const L = layout(this);
        const width = L.w;
        const height = L.h;

        addBetaBadge(this, 'top-left');

        this.uiContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        const infoTop = L.pad + L.font(28);
        this.nameText = readableText(this, L.pad, infoTop, `${this.player.name} Lv.${this.player.level}`, {
            size: 16, color: HUD_TEXT.gold, depth: 110,
        });

        const barW = Math.min(200, width * 0.28);
        this.hpBar = UIComponents.createBar(this, L.pad, infoTop + L.font(28), barW, 18, this.player.hp, this.player.maxHp, GAME_CONFIG.COLORS.HP);
        this.hpBar.setScrollFactor(0).setDepth(110);

        this.mpBar = UIComponents.createBar(this, L.pad, infoTop + L.font(50), barW, 14, this.player.mp, this.player.maxMp, GAME_CONFIG.COLORS.MP);
        this.mpBar.setScrollFactor(0).setDepth(110);

        this.xpBar = UIComponents.createBar(this, L.pad, infoTop + L.font(68), barW, 10, this.player.exp, this.player.expToNext || 100, GAME_CONFIG.COLORS.XP);
        this.xpBar.setScrollFactor(0).setDepth(110);

        this.goldText = readableText(this, L.pad, infoTop + L.font(84), `Gold: ${this.player.gold}`, {
            size: 14, color: HUD_TEXT.accent, depth: 110,
        });

        this.zoneText = readableText(this, width / 2, L.pad, this.getZoneName(), {
            size: 16, color: HUD_TEXT.gold, depth: 110, originX: 0.5, originY: 0,
        });

        // === TOP-RIGHT: Menu Buttons ===
        const btnData = [
            { label: 'Map', scene: 'Map' },
            { label: 'Items', scene: 'Inventory' },
            { label: 'Skills', scene: 'Skills' },
            { label: 'Quests', scene: 'QuestLog' },
            { label: 'Stats', scene: 'Stats' },
            { label: 'Save', action: 'save' },
        ];
        const topBtnW = Math.max(52, Math.min(72, (width * 0.48) / btnData.length - 5));
        const topBtnH = Math.max(32, L.font(34));
        btnData.forEach((btn, i) => {
            const x = width - L.pad - topBtnW / 2 - i * (topBtnW + 5);
            const button = UIComponents.createButton(this, x, L.pad + topBtnH / 2, btn.label, () => {
                if (btn.action === 'save') {
                    this.saveGame(false);
                    return;
                }
                this.scene.launch(btn.scene, {
                    player: this.player,
                    currentZone: this.currentZone,
                });
                this.scene.pause();
            }, {
                width: topBtnW,
                height: topBtnH,
                fontSize: L.font(12),
                variant: btn.action === 'save' ? 'primary' : (btn.label === 'Map' ? 'primary' : 'ghost'),
                bgColor: btn.action === 'save' ? 0x2a3a4a : (btn.label === 'Map' ? 0x1a3a2a : undefined),
                depth: 300,
            });
            button.pinToHud();
        });

        this.questHud = readableText(this, L.pad, L.h - L.pad - L.font(8), '', {
            size: 13,
            color: HUD_TEXT.accent,
            depth: 120,
            originX: 0,
            originY: 1,
            wrap: width * 0.42,
        });
        this.refreshQuestHud();

        this.stepsSinceEncounter = 0;
        this._encounterLock = false;

        const atk = Math.max(58, L.font(64));
        this.attackBtn = UIComponents.createButton(this, width - L.pad - atk / 2, height - L.pad - atk / 2, 'ATK', () => {
            this.playerAttack();
        }, { width: atk, height: atk, fontSize: L.font(16), bgColor: 0x8b0000, variant: 'danger', depth: 300 });
        this.attackBtn.pinToHud();

        this.skillBtn = UIComponents.createButton(this, width - L.pad - atk * 1.7, height - L.pad - atk * 0.55, 'Skill', () => {
            this.openSkillMenu();
        }, { width: Math.max(56, L.font(60)), height: Math.max(42, L.font(44)), fontSize: L.font(13), bgColor: 0x2a2a6a, depth: 300 });
        this.skillBtn.pinToHud();

        this.interactBtn = UIComponents.createButton(this, width - L.pad - atk / 2, height - L.pad - atk * 1.65, 'Talk', () => {
            this.interact();
        }, { width: Math.max(56, L.font(60)), height: Math.max(42, L.font(44)), fontSize: L.font(13), bgColor: 0x2a4a2a, variant: 'primary', depth: 300 });
        this.interactBtn.pinToHud();

        const mmW = Math.min(140, width * 0.18);
        const mmH = Math.min(100, height * 0.22);
        const mmX = width - L.pad - mmW;
        const mmY = L.pad + topBtnH + 10;
        this.minimap = this.add.graphics().setScrollFactor(0).setDepth(100);
        this.minimap.fillStyle(0x121228, 0.85);
        this.minimap.fillRoundedRect(mmX, mmY, mmW, mmH, 8);
        this.minimap.lineStyle(2, 0xffd700, 0.7);
        this.minimap.strokeRoundedRect(mmX, mmY, mmW, mmH, 8);

        this.minimapDot = this.add.circle(mmX + mmW / 2, mmY + mmH / 2, 4, 0xffd700).setScrollFactor(0).setDepth(101);

        const mmHit = this.add.zone(mmX + mmW / 2, mmY + mmH / 2, mmW, mmH)
            .setScrollFactor(0)
            .setDepth(102)
            .setInteractive();
        mmHit.on('pointerdown', () => {
            this.scene.launch('Map', { player: this.player, currentZone: this.currentZone });
            this.scene.pause();
        });
    }

    refreshQuestHud() {
        if (!this.questHud) return;
        const dest = getActiveDestination(this.player);
        if (!dest) {
            this.questHud.setText('');
            return;
        }
        const here = dest.zone === this.currentZone;
        const arrow = here ? '★ Here' : `→ ${dest.zoneName}`;
        this.questHud.setText(`Quest: ${dest.questName}\n${dest.objective}\n${arrow} · ${dest.label}`);
    }

    createActionButtons() {
        // Already created in createUI
    }

    spawnNPCs() {
        const npcData = Object.values(NPCS).filter(n => {
            // Only spawn NPCs in their designated zones
            if (this.currentZone === 'town' && ['elder_marcus', 'blacksmith_brom', 'potion_seller_luna', 'shopkeeper_gilda', 'armor_smith_thorin', 'innkeeper_rosa', 'wizard_eldrin', 'priest_aurora', 'guard_captain', 'merchant_sam'].includes(n.id)) return true;
            if (this.currentZone === 'dungeon' && ['prisoner_karl', 'ghost_scholar'].includes(n.id)) return true;
            if (this.currentZone === 'abyss' && ['treasure_hunter_zara'].includes(n.id)) return true;
            return false;
        });

        for (const npc of npcData) {
            const key = this.textures.exists(npc.sprite)
                ? npc.sprite
                : (this.textures.exists('npc_1') ? 'npc_1' : null);
            if (!key) continue;

            const sprite = this.add.sprite(
                npc.x * GAME_CONFIG.TILE_SIZE,
                npc.y * GAME_CONFIG.TILE_SIZE,
                key
            ).setScale(1.2).setDepth(5);

            // Name tag
            const nameTag = this.add.text(sprite.x, sprite.y - 40, npc.name, {
                fontFamily: 'Georgia, serif',
                fontSize: '12px',
                color: '#c9a84c',
                stroke: '#000',
                strokeThickness: 2,
            }).setOrigin(0.5).setDepth(6);

            // Interaction zone
            const zone = this.add.zone(sprite.x, sprite.y, 80, 80);
            zone.setInteractive();
            zone.on('pointerdown', () => {
                this.talkToNPC(npc);
            });

            this.npcs.push({ data: npc, sprite, zone });
        }
    }

    spawnMonsters() {
        const spawnTable = ZONE_SPAWNS[this.currentZone];
        if (!spawnTable || spawnTable.length === 0) return;

        const count = 8 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            const monsterId = spawnTable[Math.floor(Math.random() * spawnTable.length)];
            const monsterData = MONSTERS[monsterId];
            if (!monsterData) continue;

            const x = Math.random() * GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE;
            const y = Math.random() * GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE;

            // Don't spawn too close to player
            const px = this.playerSprite.x;
            const py = this.playerSprite.y;
            if (Math.abs(x - px) < 300 && Math.abs(y - py) < 300) continue;

            const mKey = `monster_${monsterData.sprite.split('/').pop().replace('.png', '')}`;
            if (!this.textures.exists(mKey)) continue;

            const sprite = this.add.sprite(x, y, mKey)
                .setScale(monsterData.scale || 1)
                .setDepth(4);

            if (monsterData.tint) {
                sprite.setTint(monsterData.tint);
            }

            // Health bar
            const hpBar = UIComponents.createBar(this, x - 25, y - 40, 50, 6, monsterData.hp, monsterData.hp, 0xe74c3c);
            hpBar.setDepth(6);

            // Interaction
            const zone = this.add.zone(x, y, 60, 60);
            zone.setInteractive();

            const entry = {
                id: monsterId,
                data: monsterData,
                sprite,
                hpBar,
                zone,
                currentHp: monsterData.hp,
            };
            zone.on('pointerdown', () => this.startCombat(monsterId, sprite, hpBar, entry));
            this.monsters.push(entry);
        }
    }

    talkToNPC(npc) {
        this.isInDialogue = true;
        const dialogue = npc.dialogues[Math.floor(Math.random() * npc.dialogues.length)];
        this.dialogueBox.show(npc.name, dialogue);

        // Check for quests
        if (npc.quests) {
            for (const questId of npc.quests) {
                if (!this.player.quests[questId] && !this.player.completedQuests.includes(questId)) {
                    this.time.delayedCall(2000, () => {
                        this.questSystem.acceptQuest(questId);
                        this.showNotification(`New Quest: ${questId}`);
                    });
                }
            }
        }

        // Check for shop
        if (npc.shop) {
            this.time.delayedCall(2000, () => {
                this.scene.launch('Shop', { player: this.player, shopType: npc.shop });
                this.scene.pause();
            });
        }

        // Check for services
        if (npc.service?.heal) {
            if (this.player.gold >= npc.service.heal) {
                this.player.gold -= npc.service.heal;
                this.player.hp = this.player.maxHp;
                this.player.mp = this.player.maxMp;
                this.showNotification('Fully healed!');
            }
        }
    }

    startCombat(monsterId, sprite, hpBar, monsterRef = null) {
        this.scene.launch('Battle', {
            player: this.player,
            monsterId,
            monsterSprite: sprite,
            monsterHpBar: hpBar,
            monsterRef,
        });
        this.scene.pause();
    }

    spawnWorldChests() {
        (this.chests || []).forEach((c) => {
            c.sprite?.destroy();
            c.zone?.destroy();
        });
        this.chests = [];

        const count = this.currentZone === 'town' ? 1 : 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(120, GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE - 120);
            const y = Phaser.Math.Between(120, GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE - 120);
            const kind = Math.random() < 0.22 ? 'gold' : 'wood';
            const key = kind === 'gold'
                ? (this.textures.exists('item_chest_gold_closed') ? 'item_chest_gold_closed' : null)
                : (this.textures.exists('item_chest_wood_closed') ? 'item_chest_wood_closed' : null);
            if (!key) continue;

            const sprite = this.add.image(x, y, key).setScale(0.7).setDepth(3);
            const zone = this.add.zone(x, y, 70, 70).setInteractive();
            const chest = { kind, sprite, zone, opened: false, x, y };
            zone.on('pointerdown', () => this.openChest(chest));
            this.chests.push(chest);
        }
    }

    openChest(chest) {
        if (!chest || chest.opened) return;
        const dist = Phaser.Math.Distance.Between(
            this.playerSprite.x, this.playerSprite.y, chest.x, chest.y
        );
        if (dist > 120) {
            this.showNotification('Move closer to the chest');
            return;
        }

        if (chest.kind === 'gold' && this.player.hasItem('loot_chest_key')) {
            this.player.removeItem('loot_chest_key', 1);
        } else if (chest.kind === 'gold' && !this.player.hasItem('loot_chest_key')) {
            // Gold chests can still open but note the lock — allow with warning for UX
            // unless we want strict keys. Soft: 40% fail without key.
            if (Math.random() < 0.4) {
                this.showNotification('Locked! Need a Bronze Key');
                return;
            }
        }

        chest.opened = true;
        const openKey = chest.kind === 'gold' ? 'item_chest_gold_open' : 'item_chest_wood_open';
        if (this.textures.exists(openKey)) chest.sprite.setTexture(openKey);

        const loot = LootSystem.rollChest(chest.kind, this.player.luk || 0);
        LootSystem.grant(this.player, loot);
        EffectsSystem.ensureAnims(this);
        EffectsSystem.play(this, chest.x, chest.y, 'burst', { scale: 1.6 });
        EffectsSystem.play(this, chest.x, chest.y, 'sparkle', { scale: 1.4 });

        const names = (loot.items || []).map((i) => i.name).slice(0, 3).join(', ');
        this.showNotification(
            `Chest! +${loot.gold}g${names ? ` · ${names}` : ''}`
        );
        this.audio?.play?.('fanfare');
    }

    spawnLootBag(x, y, loot) {
        const key = this.textures.exists('item_crate')
            ? 'item_crate'
            : (this.textures.exists('item_barrel') ? 'item_barrel' : null);
        const sprite = key
            ? this.add.image(x, y, key).setScale(0.55).setDepth(4)
            : this.add.circle(x, y, 10, 0xc9a84c).setDepth(4);

        this.tweens.add({
            targets: sprite,
            y: y - 8,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        const bag = { sprite, loot, x, y, claimed: false };
        this.droppedItems.push(bag);
        return bag;
    }

    tryPickupLoot() {
        if (!this.playerSprite || !this.droppedItems?.length) return;
        for (const bag of this.droppedItems) {
            if (bag.claimed) continue;
            const dist = Phaser.Math.Distance.Between(
                this.playerSprite.x, this.playerSprite.y, bag.x, bag.y
            );
            if (dist > 55) continue;
            bag.claimed = true;
            const granted = LootSystem.grant(this.player, bag.loot);
            bag.sprite?.destroy();
            if (granted.length || bag.loot?.gold) {
                this.showNotification(
                    granted.length
                        ? `Picked up ${granted.map((g) => g.name).join(', ')}`
                        : `Picked up ${bag.loot.gold} gold`
                );
            }
            EffectsSystem.play(this, bag.x, bag.y, 'sparkle', { scale: 1.2 });
        }
        this.droppedItems = this.droppedItems.filter((b) => !b.claimed);
    }

    playerAttack() {
        // Find nearest monster
        let nearest = null;
        let nearestDist = Infinity;

        for (const m of this.monsters) {
            if (m.currentHp <= 0) continue;
            const dist = Phaser.Math.Distance.Between(
                this.playerSprite.x, this.playerSprite.y,
                m.sprite.x, m.sprite.y
            );
            if (dist < nearestDist && dist < 150) {
                nearestDist = dist;
                nearest = m;
            }
        }

        if (nearest) {
            this.startCombat(nearest.id, nearest.sprite, nearest.hpBar, nearest);
        } else {
            this.showNotification('No enemy in range!');
        }
    }

    openSkillMenu() {
        this.scene.launch('Skills', { player: this.player });
        this.scene.pause();
    }

    interact() {
        // Find nearest NPC
        let nearest = null;
        let nearestDist = Infinity;

        for (const n of this.npcs) {
            const dist = Phaser.Math.Distance.Between(
                this.playerSprite.x, this.playerSprite.y,
                n.sprite.x, n.sprite.y
            );
            if (dist < nearestDist && dist < 120) {
                nearestDist = dist;
                nearest = n;
            }
        }

        if (nearest) {
            this.talkToNPC(nearest.data);
        }
    }

    checkZoneTransition() {
        // Simple zone transition based on player position
        const px = this.player.x;
        const py = this.player.y;

        let newZone = this.currentZone;

        if (px < 5 && py < 5) newZone = 'town';
        else if (px > 20 && py < 15) newZone = 'meadow';
        else if (px > 30 && py > 10 && py < 25) newZone = 'forest';
        else if (px > 15 && py > 20) newZone = 'cave';
        else if (px > 25 && py > 30) newZone = 'ruins';
        else if (px > 40 && py > 20) newZone = 'mountain';
        else if (px > 35 && py > 35) newZone = 'dungeon';
        else if (px > 45 && py > 40) newZone = 'abyss';

        if (newZone !== this.currentZone) {
            this.currentZone = newZone;
            this.player.zone = newZone;

            // Track zones visited for the exploration achievements.
            const visited = this.player.stats.zonesVisited || (this.player.stats.zonesVisited = []);
            if (!visited.includes(newZone)) {
                visited.push(newZone);
            }

            this.saveGame(true);
            this.achievements.check();
            this.scene.restart({ player: this.player });
        }
    }

    getZoneName() {
        const names = {
            town: 'Aetheria Village', meadow: 'Greenleaf Meadow',
            forest: 'Darkwood Forest', cave: 'Echoing Caves',
            ruins: 'Ancient Ruins', mountain: 'Ironpeak Mountain',
            dungeon: 'Shadow Dungeon', abyss: 'The Abyss',
            arena: 'Battle Arena'
        };
        return names[this.currentZone] || 'Unknown';
    }

    showNotification(text) {
        const width = this.cameras.main.width;
        const notif = this.add.text(width / 2, 100, text, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: HUD_TEXT.accent,
            stroke: '#000000',
            strokeThickness: 5,
            backgroundColor: HUD_TEXT.plate,
            padding: { x: 16, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(250);

        this.tweens.add({
            targets: notif,
            alpha: 0,
            y: 80,
            duration: 2000,
            onComplete: () => notif.destroy(),
        });
    }

    /**
     * Names the zone the player has just entered.
     *
     * Without this the world looks identical for the first few seconds and
     * there is no sense of arrival after a zone change.
     */
    showZoneBanner() {
        const L = layout(this);
        const name = this.getZoneName();

        const banner = this.add.text(L.cx, L.h * 0.32, name, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(34)}px`,
            color: '#fff8e7',
            stroke: '#000000',
            strokeThickness: 6,
            backgroundColor: 'rgba(8, 8, 20, 0.9)',
            padding: { x: 18, y: 10 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setAlpha(0);

        const sub = this.add.text(L.cx, L.h * 0.32 + L.font(36), 'Realms of Aetheria', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(14)}px`,
            color: '#ffe566',
            stroke: '#000000',
            strokeThickness: 4,
            backgroundColor: 'rgba(8, 8, 20, 0.85)',
            padding: { x: 12, y: 6 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setAlpha(0);

        this.tweens.add({
            targets: [banner, sub],
            alpha: 1,
            duration: 500,
            ease: 'Sine.easeOut',
        });
        this.tweens.add({
            targets: [banner, sub],
            alpha: 0,
            y: '-=24',
            delay: 1900,
            duration: 600,
            ease: 'Sine.easeIn',
            onComplete: () => { banner.destroy(); sub.destroy(); },
        });
    }

    /**
     * A small burst of sparks wherever the player taps.
     *
     * Touchscreens give no hover feedback, so without this a tap that misses
     * every button feels like the game has frozen.
     */
    spawnTapParticles(pointer) {
        const gfx = SettingsSystem.getGraphicsProfile();
        if (!gfx.particles) return;

        const L = layout(this);
        const count = gfx.quality === 'high' ? 10 : 6;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const dist = L.font(10) + Math.random() * L.font(14);
            const px = pointer.worldX + Math.cos(angle) * dist;
            const py = pointer.worldY + Math.sin(angle) * dist;

            const dot = this.add.circle(px, py, L.font(2.2), 0xffd700, 0.9)
                .setDepth(150);

            this.tweens.add({
                targets: dot,
                alpha: 0,
                scale: 0.2,
                x: px + Math.cos(angle) * L.font(16),
                y: py + Math.sin(angle) * L.font(16),
                duration: 380 + Math.random() * 220,
                ease: 'Cubic.easeOut',
                onComplete: () => dot.destroy(),
            });
        }
    }

    /**
     * Footstep dust while moving.
     *
     * Very subtle -- a couple of fading dots under the player -- but it makes
     * movement read as movement rather than a sliding sprite.
     */
    spawnFootstepParticles() {
        const gfx = SettingsSystem.getGraphicsProfile();
        if (!gfx.particles) return;

        const L = layout(this);
        const dot = this.add.circle(
            this.playerSprite.x + (Math.random() - 0.5) * L.font(8),
            this.playerSprite.y + L.font(6),
            L.font(1.8),
            0xc9a84c,
            0.5
        ).setDepth(9);

        this.tweens.add({
            targets: dot,
            alpha: 0,
            scale: 0.3,
            duration: 300,
            onComplete: () => dot.destroy(),
        });
    }

    /**
     * The starter kit every new hero receives.
     *
     * The actual items are chosen by PlayerSystem.applyStarterKit based on the
     * hero's class and race; this method only displays what was given. Keeping
     * the two separate means the kit can change without touching the UI.
     */
    giveStarterKit() {
        this.starterKitGiven = true;

        const L = layout(this);
        const kit = this.player.starterKit;
        if (!kit) return;

        // Header
        const title = this.add.text(L.cx, L.h * 0.24, 'STARTER KIT', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(26)}px`,
            color: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setAlpha(0);

        this.tweens.add({ targets: title, alpha: 1, duration: 400, ease: 'Sine.easeOut' });
        this.tweens.add({
            targets: title, alpha: 0, y: '-=18',
            delay: 2600, duration: 500,
            onComplete: () => title.destroy(),
        });

        // Class items, staggered in one at a time
        kit.classItems.forEach((item, i) => {
            const y = L.h * 0.34 + i * L.font(26);
            const line = this.add.text(L.cx, y, item.desc, {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(14)}px`,
                color: '#f0e6d3',
                stroke: '#000000',
                strokeThickness: 3,
            }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setAlpha(0);

            this.tweens.add({
                targets: line,
                alpha: 1,
                duration: 300,
                delay: 350 + i * 320,
                ease: 'Sine.easeOut',
            });
            this.tweens.add({
                targets: line,
                alpha: 0,
                delay: 2600 + i * 320,
                duration: 400,
                onComplete: () => line.destroy(),
            });
        });

        // Race bonus line, after the class items
        if (kit.raceNote) {
            const y = L.h * 0.34 + kit.classItems.length * L.font(26) + L.font(6);
            const line = this.add.text(L.cx, y, kit.raceNote, {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(13)}px`,
                color: '#c9a84c',
                stroke: '#000000',
                strokeThickness: 3,
            }).setOrigin(0.5).setScrollFactor(0).setDepth(300).setAlpha(0);

            this.tweens.add({
                targets: line,
                alpha: 1,
                duration: 300,
                delay: 350 + kit.classItems.length * 320,
                ease: 'Sine.easeOut',
            });
            this.tweens.add({
                targets: line,
                alpha: 0,
                delay: 2600 + kit.classItems.length * 320,
                duration: 400,
                onComplete: () => line.destroy(),
            });
        }
    }

    applyPlayerCosmetics() {
        if (!this.playerSprite) return;
        const aura = COSMETIC_AURAS[this.player.cosmetics?.aura || 'none'];
        if (aura?.tint) this.playerSprite.setTint(aura.tint);
        else this.playerSprite.clearTint();
    }

    saveGame(silent = true) {
        const ok = this.saveSystem.save(this.player, { zone: this.currentZone });
        if (ok && !silent) {
            this.showNotification('Game Saved');
        }
        return ok;
    }

    update(time, delta) {
        if (this.isInDialogue) return;
        if (!this.player || !this.playerSprite) return;

        this.updatePlayerMovement(delta);
        this.updateUI();
        this.updateMonsters(delta);
        try { this.player.updateBuffs(); } catch { /* ignore */ }
        this.tryPickupLoot();

        const cam = this.cameras.main;
        if (this.ground && this.ground.tilePositionX !== undefined && typeof this.ground.setTexture === 'function') {
            this.ground.tilePositionX = cam.scrollX;
            this.ground.tilePositionY = cam.scrollY;
        }
        if (this.groundOverlay) {
            this.groundOverlay.tilePositionX = cam.scrollX;
            this.groundOverlay.tilePositionY = cam.scrollY;
        }
    }

    updatePlayerMovement(delta) {
        let dx = 0;
        let dy = 0;

        // Joystick input
        const joyDir = this.joystick.getDirection();
        dx = joyDir.x;
        dy = joyDir.y;

        // Keyboard input
        // Keyboard input (safe when keyboard plugin is missing on mobile)
        if (this.cursors?.left?.isDown || this.keys?.A?.isDown) dx = -1;
        if (this.cursors?.right?.isDown || this.keys?.D?.isDown) dx = 1;
        if (this.cursors?.up?.isDown || this.keys?.W?.isDown) dy = -1;
        if (this.cursors?.down?.isDown || this.keys?.S?.isDown) dy = 1;

        // Normalize
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        const speed = GAME_CONFIG.PLAYER_SPEED * (delta / 1000);
        this.playerSprite.x += dx * speed;
        this.playerSprite.y += dy * speed;

        // Update facing
        if (dx < 0) this.playerSprite.setFlipX(true);
        if (dx > 0) this.playerSprite.setFlipX(false);

        // Update player position
        const prevX = this.player.x;
        const prevY = this.player.y;
        this.player.x = Math.floor(this.playerSprite.x / GAME_CONFIG.TILE_SIZE);
        this.player.y = Math.floor(this.playerSprite.y / GAME_CONFIG.TILE_SIZE);

        // Count tiles walked for the travel achievements. Only when the tile
        // actually changes, so standing still against a wall does not farm it.
        if (this.player.x !== prevX || this.player.y !== prevY) {
            this.player.stats.tilesWalked = (this.player.stats.tilesWalked || 0) + 1;
            this.achievements.check();
            this.stepsSinceEncounter = (this.stepsSinceEncounter || 0) + 1;
            this.tryRandomEncounter();
        }

        // Play step sound + dust
        if ((dx !== 0 || dy !== 0) && Math.random() < 0.02) {
            this.audio.play('step');
            this.spawnFootstepParticles();
        }
    }

    updateUI() {
        if (!this.hpBar || !this.player) return;
        this.hpBar.updateValue(this.player.hp, this.player.maxHp);
        this.mpBar?.updateValue(this.player.mp, this.player.maxMp);
        this.xpBar?.updateValue(this.player.exp, this.player.expToNext || 100);
        this.goldText?.setText(`Gold: ${this.player.gold}`);
        this.nameText?.setText(`${formatDisplayName(this.player)} Lv.${this.player.level}`);
        this.refreshQuestHud?.();

        // Keep zoom stable; re-center if the hero drifts wildly off-screen.
        if (this.playerSprite && this.cameras?.main) {
            if (this.cameras.main.zoom !== 1) this.cameras.main.setZoom(1);
            const cam = this.cameras.main;
            const dx = Math.abs(cam.scrollX + cam.width / 2 - this.playerSprite.x);
            const dy = Math.abs(cam.scrollY + cam.height / 2 - this.playerSprite.y);
            if (dx > cam.width || dy > cam.height) {
                cam.centerOn(this.playerSprite.x, this.playerSprite.y);
                cam.startFollow(this.playerSprite, true, 0.18, 0.18);
            }
        }
    }

    tryRandomEncounter() {
        if (this._encounterLock || this.isInDialogue || this.currentZone === 'town') return;
        const roll = EncounterSystem.rollStep(
            this.currentZone,
            this.player.level || 1,
            this.stepsSinceEncounter || 0
        );
        if (!roll) return;

        this.stepsSinceEncounter = 0;
        this._encounterLock = true;
        const m = MONSTERS[roll.monsterId];
        const label = roll.isBoss ? `BOSS AMBUSH: ${m?.name || roll.monsterId}!`
            : roll.isAmbush ? `Ambush! ${m?.name || roll.monsterId}!`
            : `Encounter: ${m?.name || roll.monsterId}`;
        this.showNotification(label);
        EffectsSystem.ensureAnims(this);
        EffectsSystem.play(this, this.playerSprite.x, this.playerSprite.y, roll.isBoss ? 'boom' : 'sparkle', { scale: 1.5 });

        this.time.delayedCall(450, () => {
            this.startCombat(roll.monsterId, null, null, null);
            this._encounterLock = false;
        });
    }

    updateMonsters(delta) {
        for (const m of this.monsters) {
            if (m.currentHp <= 0) {
                m.sprite.setAlpha(0.3);
                continue;
            }

            if (m.data.aggressive) {
                const dist = Phaser.Math.Distance.Between(
                    m.sprite.x, m.sprite.y,
                    this.playerSprite.x, this.playerSprite.y
                );
                if (dist < 300 && dist > 50) {
                    const angle = Phaser.Math.Angle.Between(m.sprite.x, m.sprite.y, this.playerSprite.x, this.playerSprite.y);
                    m.sprite.x += Math.cos(angle) * m.data.spd * 0.5 * (delta / 1000);
                    m.sprite.y += Math.sin(angle) * m.data.spd * 0.5 * (delta / 1000);
                    if (m.zone) {
                        m.zone.x = m.sprite.x;
                        m.zone.y = m.sprite.y;
                    }
                }
                // Auto-engage when they close in
                const engage = EncounterSystem.aggroEngageDistance(m.data);
                if (engage && dist < engage && !this._encounterLock) {
                    this._encounterLock = true;
                    this.showNotification(`${m.data.name} attacks!`);
                    this.time.delayedCall(200, () => {
                        this.startCombat(m.id, m.sprite, m.hpBar, m);
                        this._encounterLock = false;
                    });
                }
            }

            if (m.hpBar) {
                m.hpBar.x = m.sprite.x - 25;
                m.hpBar.y = m.sprite.y - 40;
            }
        }
    }
}
