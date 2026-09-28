// ============================================
// REALMS OF AETHERIA - INVENTORY SCENE
// ============================================
//
// Filtered bag, sell materials, equip/use, rarity colours.
// ============================================

import { ITEMS, getItemCategory, describeWeaponPerk, canClassEquipWeapon } from '../data/Items.js';
import { UIComponents } from '../ui/UIComponents.js';
import { layout } from '../ui/Layout.js';
import { LootSystem } from '../systems/LootSystem.js';

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'weapon', label: 'Weapons' },
    { id: 'armor', label: 'Armor' },
    { id: 'consumable', label: 'Items' },
    { id: 'material', label: 'Mats' },
    { id: 'accessory', label: 'Acc' },
];

const RARITY_COLORS = {
    common: '#aaaaaa', uncommon: '#2ecc71', rare: '#3498db',
    epic: '#9b59b6', legendary: '#ffd700',
};

export class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Inventory' });
    }

    init(data) {
        this.player = data.player;
        this.filter = data.filter || 'all';
        this.selected = null;
    }

    create() {
        const L = layout(this);
        const width = L.w;
        const height = L.h;

        if (this.textures.exists('bg_1')) {
            this.add.image(L.cx, L.cy, 'bg_1').setDisplaySize(width, height).setAlpha(0.45);
        }
        this.add.rectangle(L.cx, L.cy, width, height, 0x0a0a1a, 0.88);

        this.add.text(L.cx, L.pad + L.font(8), 'INVENTORY', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(28)}px`,
            color: '#f0e6d3',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        this.goldText = this.add.text(width - L.pad, L.pad + L.font(8), `Gold: ${this.player.gold}`, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(16)}px`,
            color: '#ffd700',
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(1, 0);

        // Equipment row
        this.add.text(L.pad, L.y(0.14), 'Equipment', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(16)}px`,
            color: '#c9a84c',
        });

        const equipSlots = ['weapon', 'head', 'chest', 'legs', 'feet', 'hands', 'offhand', 'back', 'ring', 'neck', 'waist'];
        const slotSize = Math.max(48, Math.min(64, width / 10));
        equipSlots.forEach((slot, i) => {
            const cols = width < 700 ? 6 : 11;
            const x = L.pad + slotSize / 2 + (i % cols) * (slotSize + 8);
            const y = L.y(0.22) + Math.floor(i / cols) * (slotSize + 18);
            const item = this.player.equipment[slot];
            const slotUI = UIComponents.createSlot(this, x, y, slotSize, item, 1);
            const hit = slotUI.hitZone || slotUI;
            hit.on('pointerdown', () => {
                if (item) {
                    this.player.unequip(slot);
                    this.scene.restart({ player: this.player, filter: this.filter });
                }
            });
            this.add.text(x, y + slotSize / 2 + 2, slot.slice(0, 4), {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(9)}px`,
                color: '#777',
            }).setOrigin(0.5, 0);
        });

        // Filters
        const filterY = L.y(0.42);
        FILTERS.forEach((f, i) => {
            const x = L.pad + 36 + i * Math.min(78, width / 7);
            UIComponents.createButton(this, x, filterY, f.label, () => {
                this.scene.restart({ player: this.player, filter: f.id });
            }, {
                width: Math.min(70, width / 7.5),
                height: Math.max(30, L.font(32)),
                fontSize: L.font(11),
                variant: this.filter === f.id ? 'primary' : 'ghost',
                bgColor: this.filter === f.id ? 0x3a2a10 : undefined,
            });
        });

        // Sell all materials shortcut
        UIComponents.createButton(this, width - L.pad - 70, filterY, 'Sell Mats', () => {
            this.sellAllMaterials();
        }, {
            width: 120,
            height: Math.max(30, L.font(32)),
            fontSize: L.font(12),
            variant: 'ghost',
            bgColor: 0x3a2a1a,
        });

        this.add.text(L.pad, L.y(0.50), 'Bag', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(16)}px`,
            color: '#c9a84c',
        });

        this.inventoryContainer = this.add.container(0, 0);
        this.renderInventory();

        // Detail panel
        const panelW = Math.min(300, width * 0.32);
        const panelX = width - panelW - L.pad;
        this.detailPanel = UIComponents.createPanel(this, panelX, L.y(0.48), panelW, height * 0.38);
        this.detailText = this.add.text(panelX + 14, L.y(0.50), 'Select an item', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#f0e6d3',
            wordWrap: { width: panelW - 28 },
            lineSpacing: 3,
        }).setDepth(50);

        UIComponents.createButton(this, L.cx, height - L.pad - 22, 'Close', () => {
            this.scene.stop();
            this.scene.resume('World');
        }, {
            width: Math.min(160, width * 0.3),
            height: Math.max(40, L.font(42)),
            fontSize: L.font(16),
            variant: 'primary',
        });

        this.input.keyboard?.on('keydown-I', () => {
            this.scene.stop();
            this.scene.resume('World');
        });
    }

    matchesFilter(item) {
        if (this.filter === 'all') return true;
        const cat = getItemCategory(item);
        if (this.filter === 'armor') return cat === 'armor';
        if (this.filter === 'weapon') return cat === 'weapon';
        if (this.filter === 'consumable') return cat === 'consumable';
        if (this.filter === 'material') return cat === 'material' || item.type === 'material' || item.type === 'key';
        if (this.filter === 'accessory') return cat === 'accessory';
        return true;
    }

    renderInventory() {
        this.inventoryContainer.removeAll(true);
        const L = layout(this);
        const startX = L.pad + 36;
        const startY = L.y(0.56);
        const slotSize = Math.max(52, Math.min(68, L.w / 12));
        const cols = L.w < 700 ? 5 : 7;

        const list = this.player.inventory
            .map((inv, idx) => ({ inv, idx, data: ITEMS[inv.id] }))
            .filter((row) => row.data && this.matchesFilter(row.data));

        // Sort: rarity then name
        const rarityRank = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
        list.sort((a, b) => {
            const ra = rarityRank[a.data.rarity] ?? 5;
            const rb = rarityRank[b.data.rarity] ?? 5;
            if (ra !== rb) return ra - rb;
            return (a.data.name || '').localeCompare(b.data.name || '');
        });

        list.forEach((row, i) => {
            const x = startX + (i % cols) * (slotSize + 10);
            const y = startY + Math.floor(i / cols) * (slotSize + 10);
            const slot = UIComponents.createSlot(this, x, y, slotSize, row.data, row.inv.count);
            const hit = slot.hitZone || slot;

            // Rarity rim
            const rim = this.add.rectangle(x, y, slotSize + 4, slotSize + 4)
                .setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(RARITY_COLORS[row.data.rarity] || '#888').color, 0.9)
                .setFillStyle(0x000000, 0);
            this.inventoryContainer.add(rim);

            hit.on('pointerover', () => this.showItemDetails(row.data));
            hit.on('pointerdown', () => this.showItemActions(row.data, row.inv));
            this.inventoryContainer.add(slot);
        });

        if (!list.length) {
            const empty = this.add.text(startX, startY, 'Nothing in this tab.', {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(14)}px`,
                color: '#666',
            });
            this.inventoryContainer.add(empty);
        }
    }

    showItemDetails(item) {
        const color = RARITY_COLORS[item.rarity] || '#ffffff';
        let text = `${item.name}\n`;
        text += `Rarity: ${item.rarity}\n`;
        text += `Type: ${item.type}\n`;
        const cat = getItemCategory(item);
        if (cat) text += `Category: ${cat}\n`;
        if (item.perk) text += `\nPerk: ${describeWeaponPerk(item.perk)}\n`;
        if (cat === 'weapon' && this.player?.class) {
            text += canClassEquipWeapon(this.player.class, item.type)
                ? '\nClass: can equip\n'
                : '\nClass: wrong weapon type\n';
        }
        if (item.stats) {
            text += '\nStats:\n';
            for (const [stat, val] of Object.entries(item.stats)) {
                text += `  ${stat.toUpperCase()}: +${val}\n`;
            }
        }
        if (item.effect) {
            text += '\nEffect:\n';
            if (item.effect.heal) text += `  Heals ${item.effect.heal} HP\n`;
            if (item.effect.mp) text += `  Restores ${item.effect.mp} MP\n`;
            if (item.effect.fullHeal) text += `  Full heal\n`;
        }
        const sell = LootSystem.sellValue(item.id, 1);
        text += `\n${item.desc || ''}`;
        text += `\n\nSell: ${sell}g  ·  Shop: ${item.price || 0}g`;
        this.detailText.setColor(color);
        this.detailText.setText(text);
    }

    showItemActions(item, invItem) {
        const L = layout(this);
        const width = L.w;
        const height = L.h;

        if (this._actionMenu) {
            this._actionMenu.destroy(true);
            this._actionMenu = null;
        }

        const menu = this.add.container(0, 0).setDepth(500);
        this._actionMenu = menu;

        const menuBg = this.add.rectangle(L.cx, L.cy, width, height, 0x000000, 0.5)
            .setInteractive();
        menuBg.on('pointerdown', () => {
            menu.destroy(true);
            this._actionMenu = null;
        });
        menu.add(menuBg);

        const panel = this.add.rectangle(L.cx, L.cy, 240, 220, 0x1a1a2e, 0.98)
            .setStrokeStyle(2, 0xc9a84c);
        menu.add(panel);

        const actions = [];
        const cat = getItemCategory(item);
        if (cat === 'weapon' || cat === 'armor' || cat === 'accessory') {
            actions.push({
                label: 'Equip',
                callback: () => {
                    const ok = this.player.equip(item.id);
                    if (ok) this.scene.restart({ player: this.player, filter: this.filter });
                    else this.showItemDetails({ ...item, desc: `${item.desc || ''}\n\n(Could not equip.)` });
                },
            });
        }
        if (cat === 'consumable') {
            actions.push({
                label: 'Use',
                callback: () => {
                    this.player.useItem(item.id);
                    this.scene.restart({ player: this.player, filter: this.filter });
                },
            });
        }
        actions.push({
            label: `Sell (${LootSystem.sellValue(item.id, 1)}g)`,
            callback: () => {
                this.player.removeItem(item.id, 1);
                this.player.gold += LootSystem.sellValue(item.id, 1);
                this.scene.restart({ player: this.player, filter: this.filter });
            },
        });
        if ((invItem.count || 1) > 1 && (cat === 'material' || item.type === 'material')) {
            actions.push({
                label: `Sell All (${LootSystem.sellValue(item.id, invItem.count)}g)`,
                callback: () => {
                    const n = invItem.count;
                    this.player.removeItem(item.id, n);
                    this.player.gold += LootSystem.sellValue(item.id, n);
                    this.scene.restart({ player: this.player, filter: this.filter });
                },
            });
        }
        actions.push({
            label: 'Drop 1',
            callback: () => {
                this.player.removeItem(item.id, 1);
                this.scene.restart({ player: this.player, filter: this.filter });
            },
        });
        actions.push({ label: 'Cancel', callback: () => {} });

        actions.forEach((action, i) => {
            const btn = UIComponents.createButton(
                this,
                L.cx,
                L.cy - 80 + i * 36,
                action.label,
                () => {
                    menu.destroy(true);
                    this._actionMenu = null;
                    action.callback();
                },
                { width: 190, height: 32, fontSize: L.font(13), depth: 510 }
            );
            menu.add(btn);
        });
    }

    sellAllMaterials() {
        let earned = 0;
        const toSell = [...this.player.inventory];
        for (const inv of toSell) {
            const data = ITEMS[inv.id];
            if (!data) continue;
            const cat = getItemCategory(data);
            if (cat !== 'material' && data.type !== 'material' && data.type !== 'key') continue;
            earned += LootSystem.sellValue(inv.id, inv.count);
            this.player.removeItem(inv.id, inv.count);
        }
        this.player.gold += earned;
        if (earned > 0) {
            this.scene.restart({ player: this.player, filter: this.filter });
        }
    }
}
