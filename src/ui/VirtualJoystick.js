// ============================================
// REALMS OF AETHERIA - VIRTUAL JOYSTICK
// ============================================
//
// MUST stay fixed on screen (scrollFactor 0). Without that, the camera
// follow makes the stick drift into world-space and stop receiving taps
// after the player walks a few tiles -- which is exactly the "buttons
// don't work when playing" bug.
// ============================================

export class VirtualJoystick {
    constructor(scene, x, y, size = 120) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = size / 2;
        this.knobRadius = this.radius * 0.4;
        this.active = false;
        this.direction = { x: 0, y: 0 };
        this.pointerId = null;

        const depth = 250;

        this.base = scene.add.graphics().setScrollFactor(0).setDepth(depth);
        this.base.fillStyle(0x1a1a2e, 0.45);
        this.base.fillCircle(x, y, this.radius);
        this.base.lineStyle(2, 0xc9a84c, 0.55);
        this.base.strokeCircle(x, y, this.radius);

        this.knob = scene.add.graphics().setScrollFactor(0).setDepth(depth + 1);
        this.drawKnob(x, y, 0.6);

        // Hit zone is slightly larger than the visual for fat-finger taps,
        // but not so large that it eats the Attack button on the right.
        const hit = Math.min(size * 1.6, size + 40);
        this.touchArea = scene.add.zone(x, y, hit, hit)
            .setScrollFactor(0)
            .setDepth(depth + 2)
            .setInteractive();

        this.touchArea.on('pointerdown', (pointer) => {
            this.active = true;
            this.pointerId = pointer.id;
            this.updateKnob(pointer);
        });

        this._onMove = (pointer) => {
            if (this.active && pointer.id === this.pointerId) {
                this.updateKnob(pointer);
            }
        };
        this._onUp = (pointer) => {
            if (pointer.id === this.pointerId) {
                this.active = false;
                this.pointerId = null;
                this.direction = { x: 0, y: 0 };
                this.drawKnob(this.x, this.y, 0.6);
            }
        };

        scene.input.on('pointermove', this._onMove);
        scene.input.on('pointerup', this._onUp);
    }

    drawKnob(cx, cy, alpha) {
        this.knob.clear();
        this.knob.fillStyle(0xc9a84c, alpha);
        this.knob.fillCircle(cx, cy, this.knobRadius);
    }

    updateKnob(pointer) {
        // Screen-space pointer coords -- joystick is scrollFactor 0.
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const max = this.radius - this.knobRadius;

        let clampedX = dx;
        let clampedY = dy;
        if (dist > max && max > 0) {
            const angle = Math.atan2(dy, dx);
            clampedX = Math.cos(angle) * max;
            clampedY = Math.sin(angle) * max;
        }

        this.drawKnob(this.x + clampedX, this.y + clampedY, 0.85);
        this.direction.x = max > 0 ? clampedX / max : 0;
        this.direction.y = max > 0 ? clampedY / max : 0;
    }

    getDirection() {
        return this.direction;
    }

    destroy() {
        this.scene.input.off('pointermove', this._onMove);
        this.scene.input.off('pointerup', this._onUp);
        this.base.destroy();
        this.knob.destroy();
        this.touchArea.destroy();
    }
}
