// ============================================
// REALMS OF AETHERIA - CHARACTER CREATION
// ============================================

import { RACES, CLASSES, TRAITS } from '../config/GameConfig.js';
import { UIComponents } from '../ui/UIComponents.js';
import { layout, addBetaBadge } from '../ui/Layout.js';
import { PlayerSystem } from '../systems/PlayerSystem.js';
import { SaveSystem } from '../systems/SaveSystem.js';

export class CharacterCreationScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterCreation' });
    }

    create() {
        const L = layout(this);

        if (this.textures.exists('bg_2')) {
            this.add.image(L.cx, L.cy, 'bg_2').setDisplaySize(L.w, L.h);
        }
        this.add.rectangle(L.cx, L.cy, L.w, L.h, 0x0a0a1a, 0.72);

        addBetaBadge(this, 'top-right');

        this.add.text(L.cx, L.pad + L.font(8), 'Create Your Hero', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(30)}px`,
            color: '#c9a84c',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5, 0);

        // Footer always stays on-screen -- this is what made "Begin Adventure"
        // unreachable on phones when it was hard-coded at y=620.
        const footerH = Math.max(52, L.font(56));
        const footerY = L.h - L.pad - footerH / 2;
        const contentBottom = footerY - footerH / 2 - L.pad;
        const contentTop = L.pad + L.font(42);

        const leftX = L.x(0.06);
        const colW = L.w * 0.52;
        const rightCx = L.x(0.78);
        let rowY = contentTop + L.font(8);
        const rowGap = Math.max(L.font(52), (contentBottom - contentTop) / 5.2);

        // --- Name ---
        this.add.text(leftX, rowY, 'Name', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(16)}px`, color: '#f0e6d3',
        });
        this.nameText = this.add.text(leftX + L.font(70), rowY, 'Hero', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(18)}px`,
            color: '#c9a84c',
            backgroundColor: '#1a1a2e',
            padding: { x: 10, y: 6 },
        }).setInteractive({ useHandCursor: true });
        this.nameText.on('pointerdown', () => this.promptName());

        // --- Race / Class / Trait rows ---
        this.raceIndex = 0;
        this.classIndex = 0;
        this.traitIndex = 0;
        this.avatarIndex = 0;
        this.raceKeys = Object.keys(RACES);
        this.classKeys = Object.keys(CLASSES);
        this.traitKeys = Object.keys(TRAITS);

        rowY += rowGap;
        ({ label: this.raceText, desc: this.raceDesc } = this.buildCycleRow(
            leftX, rowY, colW, 'Race', () => this.cycleRace(-1), () => this.cycleRace(1)
        ));

        rowY += rowGap;
        ({ label: this.classText, desc: this.classDesc } = this.buildCycleRow(
            leftX, rowY, colW, 'Class', () => this.cycleClass(-1), () => this.cycleClass(1)
        ));

        rowY += rowGap;
        ({ label: this.traitText, desc: this.traitDesc } = this.buildCycleRow(
            leftX, rowY, colW, 'Trait', () => this.cycleTrait(-1), () => this.cycleTrait(1)
        ));

        // --- Preview column ---
        this.add.text(rightCx, contentTop, 'Preview', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(16)}px`, color: '#f0e6d3',
        }).setOrigin(0.5, 0);

        const previewY = contentTop + L.font(90);
        if (this.textures.exists('char_0')) {
            this.avatarPreview = this.add.image(rightCx, previewY, 'char_0')
                .setScale(Math.min(2.2, L.h / 280));
        } else {
            this.avatarPreview = this.add.rectangle(rightCx, previewY, 72, 72, 0xc9a84c);
        }

        const arrowSize = Math.max(36, L.font(40));
        UIComponents.createArrowButton(this, rightCx - L.font(70), previewY + L.font(90), -1, () => this.cycleAvatar(-1), arrowSize);
        UIComponents.createArrowButton(this, rightCx + L.font(70), previewY + L.font(90), 1, () => this.cycleAvatar(1), arrowSize);

        const statsW = Math.min(260, L.w * 0.28);
        const statsH = Math.min(170, contentBottom - (previewY + L.font(110)));
        const statsX = rightCx - statsW / 2;
        const statsY = Math.min(previewY + L.font(120), contentBottom - statsH);
        UIComponents.createPanel(this, statsX, statsY, statsW, Math.max(90, statsH), 0.88);
        this.statsText = this.add.text(statsX + 12, statsY + 10, '', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(12)}px`,
            color: '#f0e6d3',
            lineSpacing: 2,
        });

        // --- Footer actions (always visible) ---
        const btnH = Math.max(44, L.font(46));
        UIComponents.createButton(this, L.x(0.28), footerY, 'Back', () => {
            this.scene.start('MainMenu');
        }, {
            width: Math.min(160, L.w * 0.28),
            height: btnH,
            fontSize: L.font(18),
            variant: 'ghost',
        });

        UIComponents.createButton(this, L.x(0.68), footerY, 'Begin Adventure', () => {
            this.startGame();
        }, {
            width: Math.min(280, L.w * 0.42),
            height: btnH,
            fontSize: L.font(20),
            variant: 'primary',
            bgColor: 0x2a4a2a,
        });

        this.updateDisplay();
    }

    buildCycleRow(x, y, colW, title, onPrev, onNext) {
        const L = layout(this);
        this.add.text(x, y, title, {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(16)}px`, color: '#f0e6d3',
        });

        const arrowSize = Math.max(34, L.font(36));
        const valueX = x + L.font(70);
        const label = this.add.text(valueX, y, '', {
            fontFamily: 'Georgia, serif', fontSize: `${L.font(17)}px`, color: '#c9a84c',
        });

        const arrowsX = x + Math.min(colW - arrowSize * 2 - 8, L.font(280));
        UIComponents.createArrowButton(this, arrowsX, y + 8, -1, onPrev, arrowSize);
        UIComponents.createArrowButton(this, arrowsX + arrowSize + 10, y + 8, 1, onNext, arrowSize);

        const desc = this.add.text(valueX, y + L.font(22), '', {
            fontFamily: 'Georgia, serif',
            fontSize: `${L.font(12)}px`,
            color: '#aaaaaa',
            wordWrap: { width: colW - L.font(80) },
        });

        return { label, desc };
    }

    promptName() {
        const currentName = this.nameText.text;
        const newName = prompt('Enter your hero name:', currentName);
        if (newName && newName.trim().length > 0) {
            this.nameText.setText(newName.trim().substring(0, 16));
        }
    }

    cycleRace(dir) {
        this.raceIndex = (this.raceIndex + dir + this.raceKeys.length) % this.raceKeys.length;
        this.updateDisplay();
    }

    cycleClass(dir) {
        this.classIndex = (this.classIndex + dir + this.classKeys.length) % this.classKeys.length;
        this.updateDisplay();
    }

    cycleTrait(dir) {
        this.traitIndex = (this.traitIndex + dir + this.traitKeys.length) % this.traitKeys.length;
        this.updateDisplay();
    }

    cycleAvatar(dir) {
        this.avatarIndex = (this.avatarIndex + dir + 11) % 11;
        if (this.avatarPreview.setTexture && this.textures.exists(`char_${this.avatarIndex}`)) {
            this.avatarPreview.setTexture(`char_${this.avatarIndex}`);
        }
    }

    updateDisplay() {
        const race = RACES[this.raceKeys[this.raceIndex]];
        const cls = CLASSES[this.classKeys[this.classIndex]];
        const trait = TRAITS[this.traitKeys[this.traitIndex]];

        this.raceText.setText(race.name);
        this.raceDesc.setText(`${race.desc}  ·  HP ${race.baseStats.hp}  ATK ${race.baseStats.atk}  DEF ${race.baseStats.def}`);

        this.classText.setText(cls.name);
        this.classDesc.setText(`${cls.desc}  ·  ${cls.primaryStat.toUpperCase()} focus`);

        this.traitText.setText(`${trait.name}${trait.tier ? ` · ${trait.tier}` : ''}`);
        this.traitDesc.setText(
            `${trait.category ? `[${trait.category}] ` : ''}${trait.desc}`
        );

        const base = race.baseStats;
        const growth = cls.statGrowth;
        this.statsText.setText([
            `HP  ${base.hp + growth.hp}    MP  ${base.mp + growth.mp}`,
            `ATK ${base.atk + growth.atk}    DEF ${base.def + growth.def}`,
            `SPD ${base.spd + growth.spd}    LUK ${base.luk + growth.luk}`,
            '',
            `STR ${10 + race.bonuses.str}  DEX ${10 + race.bonuses.dex}`,
            `INT ${10 + race.bonuses.int}  VIT ${10 + race.bonuses.vit}`,
        ].join('\n'));
    }

    startGame() {
        const player = new PlayerSystem();
        player.initNew(
            this.nameText.text,
            this.raceKeys[this.raceIndex],
            this.classKeys[this.classIndex],
            this.traitKeys[this.traitIndex],
            this.avatarIndex
        );

        new SaveSystem().save(player);
        this.scene.start('WorldLoad', { player });
    }
}
