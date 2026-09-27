// ============================================
// REALMS OF AETHERIA - SHOP SCENE
// ============================================

import { ITEMS, SHOP_INVENTORIES } from '../data/Items.js';
import { UIComponents } from '../ui/UIComponents.js';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Shop' });
    }

    init(data) {
        this.player = data.player;
        this.shopType = data.shopType || 'general';
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
        const shopNames = {
            general: "Gilda's General Store", weapons: "Brom's Weapon Shop",
            armor: "Thorin's Armor Shop", potions: "Luna's Potions",
            accessories: 'Accessories Shop'
        };
        this.add.text(width / 2, 30, shopNames[this.shopType] || 'Shop', {
            fontFamily: 'Georgia, serif',
            fontSize: '32px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        // Gold
        this.goldText = this.add.text(width - 200, 30, `Gold: ${this.player.gold}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#ffd700',
        });

        // Items for sale
        const inventory = SHOP_INVENTORIES[this.shopType] || SHOP_INVENTORIES.general;

        inventory.forEach((itemId, i) => {
            const item = ITEMS[itemId];
            if (!item) return;

            const y = 80 + i * 55;

            // Item background
            const bg = this.add.graphics();
            bg.fillStyle(0x1a1a2e, 0.8);
            bg.fillRoundedRect(50, y, width - 100, 45, 6);
            bg.lineStyle(1, 0xc9a84c, 0.5);
            bg.strokeRoundedRect(50, y, width - 100, 45, 6);

            // Item name
            this.add.text(70, y + 5, item.name, {
                fontFamily: 'Georgia, serif',
                fontSize: '16px',
                color: '#f0e6d3',
            });

            // Item stats
            let statText = '';
            if (item.stats) {
                statText = Object.entries(item.stats).map(([k, v]) => `${k.toUpperCase()}: +${v}`).join(', ');
            }
            if (item.effect) {
                if (item.effect.heal) statText = `Heals ${item.effect.heal} HP`;
                if (item.effect.mp) statText = `Restores ${item.effect.mp} MP`;
            }
            this.add.text(70, y + 25, statText, {
                fontFamily: 'Georgia, serif',
                fontSize: '12px',
                color: '#888888',
            });

            // Price
            this.add.text(width - 250, y + 12, `${item.price} gold`, {
                fontFamily: 'Georgia, serif',
                fontSize: '14px',
                color: '#ffd700',
            });

            // Buy button
            UIComponents.createButton(this, width - 120, y + 22, 'Buy', () => {
                this.buyItem(item);
            }, { width: 70, height: 30, fontSize: 12, bgColor: 0x2a4a2a });
        });

        // Sell section
        this.add.text(50, height - 120, 'Sell Items:', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#c9a84c',
        });

        this.sellContainer = this.add.container(0, 0);
        this.renderSellItems();

        // Close button
        UIComponents.createButton(this, width / 2, height - 40, 'Leave Shop', () => {
            this.scene.stop();
            this.scene.resume('World');
        }, { width: 150, height: 40, fontSize: 16 });
    }

    buyItem(item) {
        if (this.player.gold >= item.price) {
            this.player.gold -= item.price;
            this.player.addItem(item.id, 1);
            this.goldText.setText(`Gold: ${this.player.gold}`);
            this.audio.play('coin');
        } else {
            this.showNotification('Not enough gold!');
        }
    }

    renderSellItems() {
        this.sellContainer.removeAll(true);

        const startX = 80;
        const startY = this.cameras.main.height - 90;

        this.player.inventory.slice(0, 10).forEach((invItem, i) => {
            const item = ITEMS[invItem.id];
            if (!item) return;

            const x = startX + i * 100;
            const sellPrice = Math.floor((item.price || 10) * 0.5);

            const slot = UIComponents.createSlot(this, x, startY, 60, item, invItem.count);
            slot.setInteractive({ useHandCursor: true });
            slot.on('pointerdown', () => {
                this.sellItem(item, sellPrice);
            });

            this.add.text(x, startY + 35, `${sellPrice}g`, {
                fontFamily: 'Georgia, serif',
                fontSize: '10px',
                color: '#ffd700',
            }).setOrigin(0.5);

            this.sellContainer.add(slot);
        });
    }

    sellItem(item, price) {
        this.player.removeItem(item.id, 1);
        this.player.gold += price;
        this.goldText.setText(`Gold: ${this.player.gold}`);
        this.audio.play('coin');
        this.renderSellItems();
    }

    showNotification(text) {
        const width = this.cameras.main.width;
        const notif = this.add.text(width / 2, 100, text, {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#e74c3c',
            backgroundColor: '#1a1a2e',
            padding: { x: 15, y: 8 },
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: notif,
            alpha: 0,
            duration: 2000,
            onComplete: () => notif.destroy(),
        });
    }
}
