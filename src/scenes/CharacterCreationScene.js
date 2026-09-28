// ============================================
// REALMS OF AETHERIA - CHARACTER CREATION
// ============================================
// Large hero preview, punchy race/class/trait copy, always-visible footer.
// ============================================

import { RACES, CLASSES, TRAITS } from '../config/GameConfig.js';
import { UIComponents } from '../ui/UIComponents.js';
import { layout, addBetaBadge } from '../ui/Layout.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

const RACE_FLAVOR = {
    human: 'Balanced all-rounder · best for first runs',
    elf: 'Swift mage-archer · high MP & critical flair',
    dwarf: 'Iron wall · huge HP & crushing defense',
    orc: 'Raw power · hardest hitting melee brawler',
    undead: 'Relentless · tanky with dark magic lean',
    angel: 'Divine caster · strongest MP & holy edge',
};

const CLASS_FLAVOR = {
    warrior: 'Frontline steel · Power Strike starter',
    mage: 'Glass cannon spells · Fireball opener',
    archer: 'Safe range DPS · Power Shot opener',
    paladin: 'Heal + smash · Holy Smite opener',
    rogue: 'Burst assassin · Backstab opener',
    necromancer: 'Summon & drain · Skeleton opener',
};

export class CharacterCreationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterCreation' });
    }

    create() {
        const L = layout(this);
        this.cameras.main.setBackgroundColor('#0a0a1a');
        this.cameras.main.setAlpha(1);
        this.cameras.main.setZoom(1);

        if (this.textures.exists('bg_2')) {
            this.add.image(L.cx, L.cy, 'bg_2').setDisplaySize(L.w, L.h).setAlpha(0.55);
        }
        this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 0.55);

        addBetaBadge(this, 'top-right');

        this.add.text(L.cx, L.pad + 4, 'FORGE YOUR HERO', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(28)}px`,
            color: '#f0e6d3',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5, 0);

        this.add.text(L.cx, L.pad + L.font(32), 'Pick a look · race · class · trait — then begin', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#c9a84c',
        }).setOrigin(0.5, 0);

        const footerH = Math.max(52, L.font(56));
        const footerY = L.h - L.pad - footerH / 2;
        const contentBottom = footerY - footerH / 2 - L.pad;
        const contentTop = L.pad + L.font(48);

        this.raceIndex = 0;
        this.classIndex = 0;
        this.traitIndex = 0;
        this.avatarIndex = 0;
        this.raceKeys = Object.keys(RACES);
        this.classKeys = Object.keys(CLASSES);
        this.traitKeys = Object.keys(TRAITS);
        this.heroName = 'Hero';

        // === LEFT: big portrait stage ===
        const stageW = Math.min(L.w * 0.38, 320);
        const stageH = Math.min(contentBottom - contentTop, L.h * 0.62);
        const stageX = L.x(0.04);
        const stageY = contentTop;

        const stage = this.add.graphics().setDepth(2);
        stage.fillStyle(0x141428, 0.92);
        stage.fillRoundedRect(stageX, stageY, stageW, stageH, 14);
        stage.lineStyle(2, 0xc9a84c, 0.7);
        stage.strokeRoundedRect(stageX, stageY, stageW, stageH, 14);

        const previewCx = stageX + stageW / 2;
        const previewCy = stageY + stageH * 0.42;

        // Glow behind hero
        this.add.ellipse(previewCx, previewCy + 20, stageW * 0.7, stageH * 0.2, 0xc9a84c, 0.15).setDepth(3);

        const previewScale = Math.min(4.2, Math.max(2.8, stageH / 140));
        if (this.textures.exists('char_0')) {
            this.avatarPreview = this.add.image(previewCx, previewCy, 'char_0')
                .setScale(previewScale)
                .setDepth(5);
        } else {
            this.avatarPreview = this.add.circle(previewCx, previewCy, 48, 0xc9a84c).setDepth(5);
        }

        this.tweens.add({
            targets: this.avatarPreview,
            y: previewCy - 6,
            duration: 1600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.lookLabel = this.add.text(previewCx, stageY + L.font(12), 'LOOK 1 / 10', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(14)}px`,
            color: '#c9a84c',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5, 0).setDepth(6);

        const arrowSize = Math.max(44, L.font(48));
        UIComponents.createArrowButton(this, previewCx - stageW * 0.32, previewCy + stageH * 0.32, -1, () => this.cycleAvatar(-1), arrowSize);
        UIComponents.createArrowButton(this, previewCx + stageW * 0.32, previewCy + stageH * 0.32, 1, () => this.cycleAvatar(1), arrowSize);

        this.add.text(previewCx, stageY + stageH - L.font(28), 'Tap arrows to change appearance', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(11)}px`,
            color: '#8a7a5a',
        }).setOrigin(0.5).setDepth(6);

        // === RIGHT: options ===
        const rightX = stageX + stageW + L.font(18);
        const rightW = L.w - rightX - L.pad;
        let rowY = contentTop + L.font(4);
        const rowGap = Math.max(L.font(58), (contentBottom - contentTop - L.font(80)) / 4.2);

        this.add.text(rightX, rowY, 'NAME', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(13)}px`, color: '#c9a84c',
        });
        this.nameText = this.add.text(rightX + L.font(70), rowY - 2, this.heroName, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(20)}px`,
            color: '#f0e6d3',
            backgroundColor: '#1a1a2e',
            padding: { x: 12, y: 8 },
        }).setInteractive({ useHandCursor: true });
        this.nameText.on('pointerdown', () => this.promptName());

        rowY += rowGap;
        ({ label: this.raceText, desc: this.raceDesc } = this.buildCycleRow(
            rightX, rowY, rightW, 'RACE', () => this.cycleRace(-1), () => this.cycleRace(1)
        ));

        rowY += rowGap;
        ({ label: this.classText, desc: this.classDesc } = this.buildCycleRow(
            rightX, rowY, rightW, 'CLASS', () => this.cycleClass(-1), () => this.cycleClass(1)
        ));

        rowY += rowGap;
        ({ label: this.traitText, desc: this.traitDesc } = this.buildCycleRow(
            rightX, rowY, rightW, 'TRAIT', () => this.cycleTrait(-1), () => this.cycleTrait(1)
        ));

        // Stats card at bottom of right column
        const statsH = Math.max(88, L.font(100));
        const statsY = Math.min(rowY + rowGap * 0.85, contentBottom - statsH);
        UIComponents.createPanel(this, rightX, statsY, Math.min(rightW, 340), statsH, 0.9);
        this.statsText = this.add.text(rightX + 14, statsY + 10, '', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(13)}px`,
            color: '#f0e6d3',
            lineSpacing: 3,
        });

        // Footer
        const btnH = Math.max(46, L.font(48));
        UIComponents.createButton(this, L.x(0.28), footerY, 'Back', () => {
            this.scene.start('MainMenu');
        }, {
            width: Math.min(160, L.w * 0.28),
            height: btnH,
            fontSize: L.font(18),
            variant: 'ghost',
        });

        UIComponents.createButton(this, L.x(0.68), footerY, 'Begin Journey', () => {
            this.startGame();
        }, {
            width: Math.min(240, L.w * 0.42),
            height: btnH,
            fontSize: L.font(18),
            variant: 'primary',
        });

        this.refreshDisplay();
    }

    buildCycleRow(x, y, width, title, onPrev, onNext) {
        const L = layout(this);
        this.add.text(x, y, title, {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(12)}px`,
            color: '#c9a84c',
        });

        const arrow = Math.max(40, L.font(42));
        const labelX = x + L.font(70);
        UIComponents.createArrowButton(this, x + arrow / 2, y + L.font(28), -1, onPrev, arrow);
        UIComponents.createArrowButton(this, x + Math.min(width - arrow / 2, L.font(280)), y + L.font(28), 1, onNext, arrow);

        const label = this.add.text(labelX, y + L.font(18), '', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(20)}px`,
            color: '#f0e6d3',
            stroke: '#000',
            strokeThickness: 3,
        });

        const desc = this.add.text(x, y + L.font(42), '', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(12)}px`,
            color: '#b8a878',
            wordWrap: { width: Math.min(width - 8, L.w * 0.48) },
        });

        return { label, desc };
    }

    promptName() {
        const entered = window.prompt('Hero name', this.heroName || 'Hero');
        if (entered && entered.trim()) {
            this.heroName = entered.trim().slice(0, 16);
            this.nameText.setText(this.heroName);
        }
    }

    cycleAvatar(dir) {
        this.avatarIndex = (this.avatarIndex + dir + 10) % 10;
        const key = `char_${this.avatarIndex}`;
        if (this.avatarPreview?.setTexture && this.textures.exists(key)) {
            this.avatarPreview.setTexture(key);
        }
        this.lookLabel?.setText(`LOOK ${this.avatarIndex + 1} / 10`);
    }

    cycleRace(dir) {
        this.raceIndex = (this.raceIndex + dir + this.raceKeys.length) % this.raceKeys.length;
        this.refreshDisplay();
    }

    cycleClass(dir) {
        this.classIndex = (this.classIndex + dir + this.classKeys.length) % this.classKeys.length;
        this.refreshDisplay();
    }

    cycleTrait(dir) {
        this.traitIndex = (this.traitIndex + dir + this.traitKeys.length) % this.traitKeys.length;
        this.refreshDisplay();
    }

    refreshDisplay() {
        const race = RACES[this.raceKeys[this.raceIndex]];
        const cls = CLASSES[this.classKeys[this.classIndex]];
        const trait = TRAITS[this.traitKeys[this.traitIndex]];

        this.raceText.setText(race.name);
        this.raceDesc.setText(RACE_FLAVOR[race.id] || race.desc);

        this.classText.setText(cls.name);
        this.classDesc.setText(CLASS_FLAVOR[cls.id] || `${cls.desc} · ${cls.primaryStat.toUpperCase()} focus`);

        const tier = (trait.tier || 'common').toUpperCase();
        this.traitText.setText(`${trait.name}  ·  ${tier}`);
        this.traitDesc.setText(`${trait.desc}`);

        const base = race.baseStats;
        const growth = cls.statGrowth;
        this.statsText.setText([
            `HP ${base.hp + growth.hp}   MP ${base.mp + growth.mp}   ATK ${base.atk + growth.atk}`,
            `DEF ${base.def + growth.def}   SPD ${base.spd + growth.spd}   LUK ${base.luk + growth.luk}`,
            `Bonuses  STR+${race.bonuses.str}  DEX+${race.bonuses.dex}  INT+${race.bonuses.int}  VIT+${race.bonuses.vit}`,
        ].join('\n'));

        this.lookLabel?.setText(`LOOK ${this.avatarIndex + 1} / 10`);
    }

    startGame() {
        const player = new PlayerSystem();
        player.initNew(
            this.heroName || this.nameText.text || 'Hero',
            this.raceKeys[this.raceIndex],
            this.classKeys[this.classIndex],
            this.traitKeys[this.traitIndex],
            this.avatarIndex
        );

        new SaveSystem().save(player);
        this.scene.start('WorldLoad', { player });
    }
}
