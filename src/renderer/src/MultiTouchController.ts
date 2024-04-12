import * as PIXI from 'pixi.js';
import '@pixi/unsafe-eval';

export class MultiTouchController {

    private app: PIXI.Application;
    private touches: { [identifier: number]: { x: number, y: number } }; // Store touch states by identifier

    constructor(app) {
        this.app = app;
        this.touches = {}; // Store touch states by identifier

        // Ensure the application is interactive and can receive touch events
        this.app.renderer.view.style.touchAction = 'auto';
        this.app.stage.interactive = true;

        // Add touch event listeners
        this.app.renderer.view.addEventListener('touchstart', this.onTouchStart.bind(this), false);
        this.app.renderer.view.addEventListener('touchmove', this.onTouchMove.bind(this), false);
        this.app.renderer.view.addEventListener('touchend', this.onTouchEnd.bind(this), false);
        this.app.renderer.view.addEventListener('touchcancel', this.onTouchEnd.bind(this), false);
    }

    onTouchStart(event) {
        for (let touch of event.changedTouches) {
            const identifier = touch.identifier;
            this.touches[identifier] = { x: touch.pageX, y: touch.pageY }; // Initialize touch state
            // Handle touch start for this point (e.g., start drawing, moving a sprite, etc.)
        }
    }

    onTouchMove(event) {
        for (let touch of event.changedTouches) {
            const identifier = touch.identifier;
            if (this.touches[identifier]) {
                // Update touch state
                this.touches[identifier].x = touch.pageX;
                this.touches[identifier].y = touch.pageY;

                // Handle touch move for this point (e.g., continue drawing, moving a sprite)
            }
        }
    }

    onTouchEnd(event) {
        for (let touch of event.changedTouches) {
            const identifier = touch.identifier;
            if (this.touches[identifier]) {
                // Finalize touch action for this point (e.g., end drawing, drop a sprite)
                delete this.touches[identifier]; // Remove touch state
            }
        }
    }
}
