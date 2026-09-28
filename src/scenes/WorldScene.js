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
import { layout, addBetaBadge } from '../ui/Layout.js';
import { SettingsSystem } from '../systems/SettingsSystem.js';
import { COSMETIC_AURAS, formatDisplayName } from '../data/Cosmetics.js';
import { DialogueBox } from '../ui/DialogueBox.js';
import { MONSTERS, ZONE_SPAWNS } from '../data/Monsters.js';
import { NPCS } from '../data/NPCs.js';
import { ITEMS } from '../data/Items.js';

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
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

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
        this.questSystem = new QuestSystem(this.player);
        this.audio = new AudioSystem();
        this.audio.init(this);

        // === WORLD SETUP ===
        this.currentZone = this.player.zone || 'town';
        this.monsters = [];
        this.npcs = [];
        this.droppedItems = [];

        // Create tilemap background
        this.createWorld();

        // === PLAYER SPRITE ===
        const gfx = SettingsSystem.getGraphicsProfile();
        this.playerSprite = this.add.sprite(
            this.player.x * GAME_CONFIG.TILE_SIZE,
            this.player.y * GAME_CONFIG.TILE_SIZE,
            `char_${this.player.avatarIndex}`
        ).setScale(gfx.playerScale || 1.5).setDepth(10);

        // === CAMERA (zoom stays 1 — zoomed cameras break fixed HUD taps) ===
        this.cameras.main.startFollow(this.playerSprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);
        this.applyPlayerCosmetics();

        // === UI SETUP (after camera so scrollFactor 0 binds correctly) ===
        this.createUI();

        // === MOBILE CONTROLS ===
        const joyR = Math.max(48, Math.min(64, this.cameras.main.height * 0.12));
        this.joystick = new VirtualJoystick(
            this,
            Math.max(80, joyR + 28),
            this.cameras.main.height - joyR - 20,
            joyR * 1.5
        );

        this.createActionButtons();

        // === SPAWN ENTITIES ===
        this.spawnNPCs();
        this.spawnMonsters();

        // === KEYBOARD INPUT ===
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,I,K,L,P,SPACE,E');

        // === DIALOGUE ===
        this.dialogueBox = new DialogueBox(this, width / 2 - 300, height - 200, 600, 150);
        this.dialogueBox.onClose = () => {
            this.isInDialogue = false;
        };

        // === PLAY MUSIC ===
        this.audio.playMusic(this.currentZone === 'town' ? 'town' : 'battle');

        // === AUTO-SAVE ===
        this.time.addEvent({
            delay: 30000,
            callback: () => this.saveGame(),
            loop: true,
        });

        // Zone transition check
        this.time.addEvent({
            delay: 1000,
            callback: () => this.checkZoneTransition(),
            loop: true,
        });
    }

    createWorld() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background based on zone
        const bgKey = this.getZoneBackground();
        this.add.image(width / 2, height / 2, bgKey).setDisplaySize(width, height).setDepth(0);

        // Ground tiles
        this.buildGroundLayer();

        // Zone decorations
        this.addZoneDecorations();
    }

    /**
     * The ground, as a single GPU-tiled object.
     *
     * This used to be a nested loop over MAP_WIDTH x MAP_HEIGHT creating one
     * Image per tile -- 4,800 separate Game Objects. Every one of those costs
     * its own draw call and its own transform update on every single frame,
     * which is what was dropping the frame rate on device.
     *
     * A TileSprite repeats one texture on the GPU instead, so the entire
     * ground is a single draw call and a few kilobytes of memory no matter how
     * large the world is. Zone mood comes from tinting, which is free.
     */
    buildGroundLayer() {
        const worldW = GAME_CONFIG.MAP_WIDTH * GAME_CONFIG.TILE_SIZE;
        const worldH = GAME_CONFIG.MAP_HEIGHT * GAME_CONFIG.TILE_SIZE;

        // The 16x16 "middle" tiles are the seamless fillers in this pack, so
        // they are the right thing to repeat. The 48x96 tiles are full scene
        // pieces and would look wrong tiled across the whole world.
        const ground = this.add.tileSprite(0, 0, worldW, worldH, 'tile_Grass_Middle')
            .setOrigin(0, 0)
            .setDepth(1);

        // Dark zones are conveyed by tinting the one object rather than by
        // drawing a second layer.
        const zoneTint = {
            cave: 0x8a8a9a,
            dungeon: 0x6a6a7a,
            abyss: 0x4a4a5a,
            mountain: 0x9a9aaa,
        };
        if (zoneTint[this.currentZone]) {
            ground.setTint(zoneTint[this.currentZone]);
        }

        // Path zones get a second, faint pass so they read as worn ground
        // without costing another 4,800 objects.
        if (this.currentZone === 'ruins' || this.currentZone === 'arena') {
            this.add.tileSprite(0, 0, worldW, worldH, 'tile_Path_Middle')
                .setOrigin(0, 0)
                .setDepth(1)
                .setAlpha(0.35);
        }

        return ground;
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
        // Add some decorative elements based on zone
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

        // === TOP-LEFT: Player Info (below beta badge) ===
        this.uiContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        const infoTop = L.pad + L.font(28);
        this.nameText = this.add.text(L.pad, infoTop, `${this.player.name} Lv.${this.player.level}`, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(15)}px`,
            color: '#c9a84c',
            stroke: '#000',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(100);

        const barW = Math.min(200, width * 0.28);
        this.hpBar = UIComponents.createBar(this, L.pad, infoTop + L.font(24), barW, 16, this.player.hp, this.player.maxHp, GAME_CONFIG.COLORS.HP);
        this.hpBar.setScrollFactor(0).setDepth(100);

        this.mpBar = UIComponents.createBar(this, L.pad, infoTop + L.font(44), barW, 12, this.player.mp, this.player.maxMp, GAME_CONFIG.COLORS.MP);
        this.mpBar.setScrollFactor(0).setDepth(100);

        this.xpBar = UIComponents.createBar(this, L.pad, infoTop + L.font(60), barW, 9, this.player.exp, this.player.expToNext || 100, GAME_CONFIG.COLORS.XP);
        this.xpBar.setScrollFactor(0).setDepth(100);

        this.goldText = this.add.text(L.pad, infoTop + L.font(74), `Gold: ${this.player.gold}`, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 2,
        }).setScrollFactor(0).setDepth(100);

        this.zoneText = this.add.text(width / 2, L.pad, this.getZoneName(), {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(16)}px`,
            color: '#c9a84c',
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

        // === TOP-RIGHT: Menu Buttons (packed so they never spill left) ===
        const btnData = [
            { label: 'Items', scene: 'Inventory' },
            { label: 'Skills', scene: 'Skills' },
            { label: 'Quests', scene: 'QuestLog' },
            { label: 'Stats', scene: 'Stats' },
            { label: 'Save', action: 'save' },
        ];
        const topBtnW = Math.max(58, Math.min(78, (width * 0.42) / btnData.length - 6));
        const topBtnH = Math.max(30, L.font(32));
        btnData.forEach((btn, i) => {
            const x = width - L.pad - topBtnW / 2 - i * (topBtnW + 6);
            const button = UIComponents.createButton(this, x, L.pad + topBtnH / 2, btn.label, () => {
                if (btn.action === 'save') {
                    this.saveGame(false);
                    return;
                }
                this.scene.launch(btn.scene, { player: this.player });
                this.scene.pause();
            }, {
                width: topBtnW,
                height: topBtnH,
                fontSize: L.font(12),
                variant: btn.action === 'save' ? 'primary' : 'ghost',
                bgColor: btn.action === 'save' ? 0x2a3a4a : undefined,
                depth: 300,
            });
            button.pinToHud();
        });

        // === BOTTOM-RIGHT: Action Buttons ===
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

        // === MINIMAP ===
        const mmW = Math.min(140, width * 0.18);
        const mmH = Math.min(100, height * 0.22);
        const mmX = width - L.pad - mmW;
        const mmY = L.pad + topBtnH + 10;
        this.minimap = this.add.graphics().setScrollFactor(0).setDepth(100);
        this.minimap.fillStyle(0x1a1a2e, 0.7);
        this.minimap.fillRoundedRect(mmX, mmY, mmW, mmH, 8);
        this.minimap.lineStyle(1, 0xc9a84c, 0.5);
        this.minimap.strokeRoundedRect(mmX, mmY, mmW, mmH, 8);

        this.minimapDot = this.add.circle(mmX + mmW / 2, mmY + mmH / 2, 4, 0xc9a84c).setScrollFactor(0).setDepth(101);
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
            const sprite = this.add.sprite(
                npc.x * GAME_CONFIG.TILE_SIZE,
                npc.y * GAME_CONFIG.TILE_SIZE,
                npc.sprite
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

            const sprite = this.add.sprite(x, y, `monster_${monsterData.sprite.split('/').pop().replace('.png', '')}`)
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
            zone.on('pointerdown', () => {
                this.startCombat(monsterId, sprite, hpBar);
            });

            this.monsters.push({
                id: monsterId,
                data: monsterData,
                sprite,
                hpBar,
                zone,
                currentHp: monsterData.hp,
            });
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

    startCombat(monsterId, sprite, hpBar) {
        this.scene.launch('Battle', {
            player: this.player,
            monsterId,
            monsterSprite: sprite,
            monsterHpBar: hpBar,
        });
        this.scene.pause();
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
            this.startCombat(nearest.id, nearest.sprite, nearest.hpBar);
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
            color: '#c9a84c',
            backgroundColor: '#1a1a2e',
            padding: { x: 15, y: 8 },
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

        this.tweens.add({
            targets: notif,
            alpha: 0,
            y: 80,
            duration: 2000,
            onComplete: () => notif.destroy(),
        });
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

        // Update player movement
        this.updatePlayerMovement(delta);

        // Update UI
        this.updateUI();

        // Update monsters
        this.updateMonsters(delta);

        // Update buffs
        this.player.updateBuffs();
    }

    updatePlayerMovement(delta) {
        let dx = 0;
        let dy = 0;

        // Joystick input
        const joyDir = this.joystick.getDirection();
        dx = joyDir.x;
        dy = joyDir.y;

        // Keyboard input
        if (this.cursors.left.isDown || this.keys.A.isDown) dx = -1;
        if (this.cursors.right.isDown || this.keys.D.isDown) dx = 1;
        if (this.cursors.up.isDown || this.keys.W.isDown) dy = -1;
        if (this.cursors.down.isDown || this.keys.S.isDown) dy = 1;

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
        this.player.x = Math.floor(this.playerSprite.x / GAME_CONFIG.TILE_SIZE);
        this.player.y = Math.floor(this.playerSprite.y / GAME_CONFIG.TILE_SIZE);

        // Play step sound
        if ((dx !== 0 || dy !== 0) && Math.random() < 0.02) {
            this.audio.play('step');
        }
    }

    updateUI() {
        this.hpBar.updateValue(this.player.hp, this.player.maxHp);
        this.mpBar.updateValue(this.player.mp, this.player.maxMp);
        this.xpBar.updateValue(this.player.exp, this.player.expToNext || 100);
        this.goldText.setText(`Gold: ${this.player.gold}`);
        this.nameText.setText(`${formatDisplayName(this.player)} Lv.${this.player.level}`);
    }

    updateMonsters(delta) {
        for (const m of this.monsters) {
            if (m.currentHp <= 0) {
                m.sprite.setAlpha(0.3);
                continue;
            }

            // Simple AI: move toward player if aggressive
            if (m.data.aggressive) {
                const dist = Phaser.Math.Distance.Between(
                    m.sprite.x, m.sprite.y,
                    this.playerSprite.x, this.playerSprite.y
                );
                if (dist < 300 && dist > 50) {
                    const angle = Phaser.Math.Angle.Between(m.sprite.x, m.sprite.y, this.playerSprite.x, this.playerSprite.y);
                    m.sprite.x += Math.cos(angle) * m.data.spd * 0.5 * (delta / 1000);
                    m.sprite.y += Math.sin(angle) * m.data.spd * 0.5 * (delta / 1000);
                }
            }

            // Update HP bar position
            m.hpBar.x = m.sprite.x - 25;
            m.hpBar.y = m.sprite.y - 40;
        }
    }
}
