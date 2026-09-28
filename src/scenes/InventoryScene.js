// ============================================
// REALMS OF AETHERIA - INVENTORY SCENE
// ============================================

import { ITEMS, getItemCategory, describeWeaponPerk, canClassEquipWeapon } from '../data/Items.js';
import { UIComponents } from '../ui/UIComponents.js';

export class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Inventory' });
    }

    init(data) {
        this.player = data.player;
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.image(width / 2, height / 2, 'bg_1').setDisplaySize(width, height);
        const overlay = this.add.graphics();
        overlay.fillStyle(0x0a0a1a, 0.9);
        overlay.fillRect(0, 0, width, height);

        // Title
        this.add.text(width / 2, 30, 'Inventory', {
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        // Gold
        this.add.text(width - 200, 30, `Gold: ${this.player.gold}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#ffd700',
        });

        // === EQUIPMENT SLOTS ===
        this.add.text(50, 80, 'Equipment:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c9a84c',
        });

        const equipSlots = ['weapon', 'head', 'chest', 'legs', 'feet', 'hands', 'offhand', 'back', 'ring', 'neck', 'waist'];
        equipSlots.forEach((slot, i) => {
            const x = 80 + (i % 6) * 90;
            const y = 120 + Math.floor(i / 6) * 90;
            const item = this.player.equipment[slot];
            const slotUI = UIComponents.createSlot(this, x, y, 70, item, 1);
            slotUI.setInteractive({ useHandCursor: true });
            slotUI.on('pointerdown', () => {
                if (item) {
                    this.player.unequip(slot);
                    this.scene.restart({ player: this.player });
                }
            });

            // Slot label
            this.add.text(x, y + 40, slot, {
                fontFamily: 'Georgia, serif',
                fontSize: '10px',
                color: '#888',
            }).setOrigin(0.5);
        });

        // === INVENTORY GRID ===
        this.add.text(50, 320, 'Items:', {
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            color: '#c9a84c',
        });

        this.inventoryContainer = this.add.container(0, 0);
        this.renderInventory();

        // === ITEM DETAILS ===
        this.detailPanel = UIComponents.createPanel(this, width - 350, 80, 300, 400);
        this.detailText = this.add.text(width - 330, 100, 'Select an item', {
            fontFamily: 'Georgia, serif',
            fontSize: '14px',
            color: '#f0e6d3',
            wordWrap: { width: 260 },
            lineSpacing: 4,
        });

        // === CLOSE BUTTON ===
        UIComponents.createButton(this, width / 2, height - 40, 'Close (I)', () => {
            this.scene.stop();
            this.scene.resume('World');
        }, { width: 150, height: 40, fontSize: 16 });

        // Keyboard
        this.input.keyboard.on('keydown-I', () => {
            this.scene.stop();
            this.scene.resume('World');
        });
    }

    renderInventory() {
        this.inventoryContainer.removeAll(true);

        const startX = 80;
        const startY = 360;
        const slotSize = 70;
        const cols = 8;

        this.player.inventory.forEach((invItem, i) => {
            const x = startX + (i % cols) * (slotSize + 10);
            const y = startY + Math.floor(i / cols) * (slotSize + 10);

            const itemData = ITEMS[invItem.id];
            if (!itemData) return;

            const slot = UIComponents.createSlot(this, x, y, slotSize, itemData, invItem.count);
            slot.setInteractive({ useHandCursor: true });

            slot.on('pointerover', () => {
                this.showItemDetails(itemData);
            });

            slot.on('pointerdown', () => {
                this.showItemActions(itemData, invItem);
            });

            this.inventoryContainer.add(slot);
        });
    }

    showItemDetails(item) {
        const rarityColors = {
            common: '#aaaaaa', uncommon: '#2ecc71', rare: '#3498db',
            epic: '#9b59b6', legendary: '#ffd700'
        };
        const color = rarityColors[item.rarity] || '#ffffff';

        let text = `${item.name}\n`;
        text += `Rarity: ${item.rarity}\n`;
        text += `Type: ${item.type}\n`;
        const cat = getItemCategory(item);
        if (cat) text += `Category: ${cat}\n`;
        if (item.perk) {
            text += `\nWeapon perk: ${describeWeaponPerk(item.perk)}\n`;
        }
        if (cat === 'weapon' && this.player?.class) {
            const ok = canClassEquipWeapon(this.player.class, item.type);
            text += ok ? '\nClass: can equip\n' : '\nClass: wrong weapon type\n';
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
        text += `\n${item.desc || ''}`;
        text += `\n\nValue: ${item.price || 0} gold`;

        this.detailText.setText(text);
    }

    showItemActions(item, invItem) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Action menu
        const menuBg = this.add.graphics();
        menuBg.fillStyle(0x1a1a2e, 0.95);
        menuBg.fillRoundedRect(width / 2 - 100, height / 2 - 80, 200, 160, 10);
        menuBg.lineStyle(2, 0xc9a84c, 1);
        menuBg.strokeRoundedRect(width / 2 - 100, height / 2 - 80, 200, 160, 10);

        const actions = [];
        const cat = getItemCategory(item);
        if (cat === 'weapon' || cat === 'armor' || cat === 'accessory') {
            actions.push({
                label: 'Equip',
                callback: () => {
                    const ok = this.player.equip(item.id);
                    if (!ok) this.showItemDetails({ ...item, desc: (item.desc || '') + '\n\n(Could not equip — check class or slot.)' });
                    else this.scene.restart({ player: this.player });
                },
            });
        }
        if (item.category === 'consumable') {
            actions.push({ label: 'Use', callback: () => { this.player.useItem(item.id); this.scene.restart({ player: this.player }); } });
        }
        actions.push({ label: 'Drop', callback: () => { this.player.removeItem(item.id, 1); this.scene.restart({ player: this.player }); } });
        actions.push({ label: 'Cancel', callback: () => {} });

        actions.forEach((action, i) => {
            const btn = UIComponents.createButton(this, width / 2, height / 2 - 50 + i * 35, action.label, action.callback, {
                width: 150, height: 30, fontSize: 14,
            });
            btn.on('pointerdown', () => {
                menuBg.destroy();
            });
        });
    }
}
