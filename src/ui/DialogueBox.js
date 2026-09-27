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

        this.container = scene.add.container(0, 0);
        this.container.setVisible(false);
        this.container.setDepth(1000);

        // Background
        this.bg = scene.add.graphics();
        this.bg.fillStyle(0x1a1a2e, 0.95);
        this.bg.fillRoundedRect(x, y, width, height, 12);
        this.bg.lineStyle(2, 0xc9a84c, 1);
        this.bg.strokeRoundedRect(x, y, width, height, 12);

        // Speaker name
        this.nameText = scene.add.text(x + 20, y + 10, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '18px',
            color: '#c9a84c',
            fontStyle: 'bold',
        });

        // Dialogue text
        this.dialogueText = scene.add.text(x + 20, y + 40, '', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#f0e6d3',
            wordWrap: { width: width - 40 },
        });

        // Continue indicator
        this.continueText = scene.add.text(x + width - 30, y + height - 25, '▼', {
            fontFamily: 'Georgia, serif',
            fontSize: '16px',
            color: '#c9a84c',
        }).setOrigin(0.5);

        scene.tweens.add({
            targets: this.continueText,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1,
        });

        // Click to continue
        this.container.add([this.bg, this.nameText, this.dialogueText, this.continueText]);
        this.container.setSize(width, height);
        this.container.setInteractive();

        this.container.on('pointerdown', () => {
            this.hide();
        });
    }

    show(speakerName, text) {
        this.nameText.setText(speakerName);
        this.dialogueText.setText(text);
        this.container.setVisible(true);
        this.visible = true;

        // Typewriter effect
        this.scene.tweens.add({
            targets: this.dialogueText,
            duration: text.length * 20,
            onUpdate: (tween) => {
                const progress = tween.progress;
                const chars = Math.floor(text.length * progress);
                this.dialogueText.setText(text.substring(0, chars));
            },
        });
    }

    hide() {
        this.container.setVisible(false);
        this.visible = false;
        if (this.onClose) {
            this.onClose();
        }
    }

    destroy() {
        this.container.destroy();
    }
}
