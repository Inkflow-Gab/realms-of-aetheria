// ============================================
// REALMS OF AETHERIA - VIRTUAL JOYSTICK
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

        // Base
        this.base = scene.add.graphics();
        this.base.fillStyle(0x1a1a2e, 0.4);
        this.base.fillCircle(x, y, this.radius);
        this.base.lineStyle(2, 0xc9a84c, 0.5);
        this.base.strokeCircle(x, y, this.radius);

        // Knob
        this.knob = scene.add.graphics();
        this.knob.fillStyle(0xc9a84c, 0.6);
        this.knob.fillCircle(x, y, this.knobRadius);

        // Touch area
        this.touchArea = scene.add.zone(x, y, size * 2, size * 2);
        this.touchArea.setInteractive();

        this.touchArea.on('pointerdown', (pointer) => {
            this.active = true;
            this.pointerId = pointer.id;
            this.updateKnob(pointer);
        });

        scene.input.on('pointermove', (pointer) => {
            if (this.active && pointer.id === this.pointerId) {
                this.updateKnob(pointer);
            }
        });

        scene.input.on('pointerup', (pointer) => {
            if (pointer.id === this.pointerId) {
                this.active = false;
                this.pointerId = null;
                this.direction = { x: 0, y: 0 };
                this.knob.clear();
                this.knob.fillStyle(0xc9a84c, 0.6);
                this.knob.fillCircle(x, y, this.knobRadius);
            }
        });
    }

    updateKnob(pointer) {
        const dx = pointer.x - this.x;
        const dy = pointer.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let clampedX = dx;
        let clampedY = dy;

        if (dist > this.radius - this.knobRadius) {
            const angle = Math.atan2(dy, dx);
            clampedX = Math.cos(angle) * (this.radius - this.knobRadius);
            clampedY = Math.sin(angle) * (this.radius - this.knobRadius);
        }

        this.knob.clear();
        this.knob.fillStyle(0xc9a84c, 0.8);
        this.knob.fillCircle(this.x + clampedX, this.y + clampedY, this.knobRadius);

        this.direction.x = clampedX / (this.radius - this.knobRadius);
        this.direction.y = clampedY / (this.radius - this.knobRadius);
    }

    getDirection() {
        return this.direction;
    }

    destroy() {
        this.base.destroy();
        this.knob.destroy();
        this.touchArea.destroy();
    }
}
