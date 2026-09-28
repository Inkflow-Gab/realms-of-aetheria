// ============================================
// REALMS OF AETHERIA - DIALOGUE BOX
// ============================================

export class DialogueBox {
    constructor(scene, x, y, width, height) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = false;
        this.onClose = null;
        this._typing = null;

        // Container is positioned at the box origin so the hit area matches.
        this.container = scene.add.container(x, y);
        this.container.setVisible(false);
        this.container.setDepth(1000);
        this.container.setScrollFactor(0);

        this.bg = scene.add.graphics();
        this.bg.fillStyle(0x1a1a2e, 0.95);
        this.bg.fillRoundedRect(0, 0, width, height, 12);
        this.bg.lineStyle(2, 0xc9a84c, 1);
        this.bg.strokeRoundedRect(0, 0, width, height, 12);

        this.nameText = scene.add.text(20, 10, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#ffe566',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
        });

        this.dialogueText = scene.add.text(20, 40, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#fff8e7',
            stroke: '#000000',
            strokeThickness: 2,
            wordWrap: { width: width - 40 },
        });

        this.continueText = scene.add.text(width - 30, height - 25, '▼', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#ffd700',
        }).setOrigin(0.5);

        scene.tweens.add({
            targets: this.continueText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        this.hit = scene.add.zone(width / 2, height / 2, width, height)
            .setInteractive({ useHandCursor: true });

        this.container.add([this.bg, this.nameText, this.dialogueText, this.continueText, this.hit]);
        this.container.setSize(width, height);

        this.hit.on('pointerdown', () => this.hide());
    }

    show(speakerName, text) {
        this.nameText.setText(speakerName || '');
        this.dialogueText.setText('');
        this.container.setVisible(true);
        this.visible = true;

        if (this._typing) {
            this._typing.remove(false);
            this._typing = null;
        }

        const full = String(text || '');
        let i = 0;
        this._typing = this.scene.time.addEvent({
            delay: 18,
            repeat: Math.max(0, full.length - 1),
            callback: () => {
                i++;
                this.dialogueText.setText(full.substring(0, i));
            },
        });
    }

    hide() {
        if (this._typing) {
            this._typing.remove(false);
            this._typing = null;
        }
        this.container.setVisible(false);
        this.visible = false;
        if (this.onClose) this.onClose();
    }

    destroy() {
        if (this._typing) this._typing.remove(false);
        this.container.destroy();
    }
}
