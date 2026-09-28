// ============================================
// REALMS OF AETHERIA - COSMETICS & TRAITS
// ============================================

import { TRAITS } from '../config/GameConfig.js';
import { UIComponents } from '../ui/UIComponents.js';
import { layout, addBetaBadge } from '../ui/Layout.js';
import { SaveSystem } from '../systems/SaveSystem.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import {
    COSMETIC_AURAS,
    COSMETIC_TITLES,
    COSMETIC_FRAMES,
    isCosmeticUnlocked,
} from '../data/Cosmetics.js';

const TRAIT_RESPEC_COST = 500;

export class CosmeticsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Cosmetics' });
    }

    create() {
        const L = layout(this);
        const saveSystem = new SaveSystem();
        const save = saveSystem.load();

        if (!save?.player) {
            this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 0.95);
            this.add.text(L.cx, L.cy, 'Start a game first to customize your hero.', {
                fontFamily: 'Georgia, serif',
                fontSize: `${L.font(18)}px`,
                color: '#f0e6d3',
                align: 'center',
                wordWrap: { width: L.w * 0.7 },
            }).setOrigin(0.5);
            UIComponents.createButton(this, L.cx, L.bottom(L.pad + 30), 'Back', () => {
                this.scene.start('Settings');
            }, { width: 180, height: 44, fontSize: L.font(16), variant: 'primary' });
            return;
        }

        this.saveSystem = saveSystem;
        this.player = new PlayerSystem(save.player);
        if (!this.player.cosmetics) this.player.cosmetics = { aura: 'gold', title: 'none', frame: 'default', trail: false };

        if (this.textures.exists('bg_3')) {
            this.add.image(L.cx, L.cy, 'bg_3').setDisplaySize(L.w, L.h);
        }
        this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 0.88);
        addBetaBadge(this, 'top-right');

        this.add.text(L.cx, L.pad, 'Cosmetics & Traits', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(28)}px`,
            color: '#c9a84c',
        }).setOrigin(0.5, 0);

        const previewX = L.x(0.78);
        const previewY = L.y(0.38);
        if (this.textures.exists(`char_${this.player.avatarIndex}`)) {
            this.preview = this.add.image(previewX, previewY, `char_${this.player.avatarIndex}`)
                .setScale(Math.min(2.4, L.h / 260));
        }
        this.applyPreviewAura();

        this.statusText = this.add.text(L.x(0.08), L.bottom(L.pad + 52), '', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#aaaaaa',
        });

        let y = L.y(0.16);
        const row = Math.max(38, L.font(40));

        y = this.addCycleRow(y, 'Portrait', () => this.cycleAvatar(-1), () => this.cycleAvatar(1),
            () => `Hero #${this.player.avatarIndex + 1}`);

        y = this.addCycleRow(y, 'Aura', () => this.cycleAura(-1), () => this.cycleAura(1),
            () => COSMETIC_AURAS[this.player.cosmetics.aura]?.name || 'None');

        y = this.addCycleRow(y, 'Title', () => this.cycleTitle(-1), () => this.cycleTitle(1),
            () => COSMETIC_TITLES[this.player.cosmetics.title]?.name || 'None');

        y = this.addCycleRow(y, 'Frame', () => this.cycleFrame(-1), () => this.cycleFrame(1),
            () => COSMETIC_FRAMES[this.player.cosmetics.frame]?.name || 'Default');

        y += 8;
        this.add.text(L.x(0.08), y, `Trait: ${this.player.trait.name} (${this.player.trait.tier || 'common'})`, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(15)}px`, color: '#c9a84c',
        });
        y += L.font(20);
        this.add.text(L.x(0.08), y, this.player.trait.desc, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(12)}px`, color: '#aaa',
            wordWrap: { width: L.w * 0.55 },
        });
        y += row;

        UIComponents.createButton(this, L.x(0.32), y, `Respec Trait (${TRAIT_RESPEC_COST}g)`, () => {
            this.respecTrait();
        }, {
            width: Math.min(260, L.w * 0.42),
            height: Math.max(40, L.font(42)),
            fontSize: L.font(14),
            variant: 'ghost',
        });

        UIComponents.createButton(this, L.x(0.68), y, 'Save Look', () => {
            this.persist();
            this.statusText.setText('Cosmetics saved!');
        }, {
            width: Math.min(200, L.w * 0.32),
            height: Math.max(40, L.font(42)),
            fontSize: L.font(14),
            variant: 'primary',
        });

        UIComponents.createButton(this, L.cx, L.bottom(L.pad + 24), 'Back to Settings', () => {
            this.persist();
            this.scene.start('Settings');
        }, {
            width: Math.min(240, L.w * 0.45),
            height: Math.max(44, L.font(46)),
            fontSize: L.font(16),
            variant: 'primary',
        });
    }

    addCycleRow(y, label, onPrev, onNext, valueFn) {
        const L = layout(this);
        this.add.text(L.x(0.08), y, label, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(15)}px`, color: '#f0e6d3',
        });
        const val = this.add.text(L.x(0.28), y, valueFn(), {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(14)}px`, color: '#c9a84c',
        });
        val.updateValue = () => val.setText(valueFn());

        const sz = Math.max(34, L.font(36));
        UIComponents.createArrowButton(this, L.x(0.58), y + 8, -1, () => { onPrev(); val.updateValue(); }, sz);
        UIComponents.createArrowButton(this, L.x(0.64), y + 8, 1, () => { onNext(); val.updateValue(); }, sz);

        return y + Math.max(38, L.font(40));
    }

    cycleKeys(obj) {
        return Object.keys(obj);
    }

    cycleCosmetic(field, catalog, dir) {
        const keys = this.cycleKeys(catalog);
        const current = this.player.cosmetics[field] || keys[0];
        let i = keys.indexOf(current);
        for (let n = 0; n < keys.length; n++) {
            i = (i + dir + keys.length) % keys.length;
            const entry = catalog[keys[i]];
            if (isCosmeticUnlocked(entry, this.player)) {
                this.player.cosmetics[field] = keys[i];
                if (field === 'aura') this.applyPreviewAura();
                return;
            }
        }
        this.statusText.setText('Requirement not met or not enough gold.');
    }

    cycleAvatar(dir) {
        this.player.avatarIndex = (this.player.avatarIndex + dir + 11) % 11;
        if (this.preview?.setTexture && this.textures.exists(`char_${this.player.avatarIndex}`)) {
            this.preview.setTexture(`char_${this.player.avatarIndex}`);
        }
    }

    cycleAura(dir) { this.cycleCosmetic('aura', COSMETIC_AURAS, dir); }
    cycleTitle(dir) { this.cycleCosmetic('title', COSMETIC_TITLES, dir); }
    cycleFrame(dir) { this.cycleCosmetic('frame', COSMETIC_FRAMES, dir); }

    applyPreviewAura() {
        if (!this.preview?.setTint) return;
        const aura = COSMETIC_AURAS[this.player.cosmetics.aura];
        if (aura?.tint) this.preview.setTint(aura.tint);
        else this.preview.clearTint();
    }

    respecTrait() {
        if (this.player.gold < TRAIT_RESPEC_COST) {
            this.statusText.setText(`Need ${TRAIT_RESPEC_COST} gold to respec trait.`);
            return;
        }
        const keys = Object.keys(TRAITS);
        const currentKey = keys.find((k) => TRAITS[k].id === this.player.trait.id) || keys[0];
        const idx = keys.indexOf(currentKey);
        const nextKey = keys[(idx + 1) % keys.length];
        this.player.gold -= TRAIT_RESPEC_COST;
        this.player.trait = TRAITS[nextKey];
        this.player.recalcStats();
        this.scene.restart();
    }

    persist() {
        this.saveSystem.save(this.player, { zone: this.player.zone });
    }
}
