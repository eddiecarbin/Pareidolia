import * as PIXI from 'pixi.js';
import { FederatedPointerEvent } from '@pixi/events';
import { InteractionEvent } from '@pixi/interaction';
import { DropShadowFilter } from '@pixi/filter-drop-shadow';

import '@pixi/unsafe-eval';


interface TouchPathInfo {
    graphics: PIXI.Graphics;
    lastPosition: { x: number; y: number };
}

export enum DrawingEnum {
    DRAWING_STARTED = 'drawingStarted',
    DRAWING_ENDED = 'drawingEnded'
}

export class DrawingController extends EventTarget {
    private app: PIXI.Application;
    private isDrawing: boolean = false;
    private currentPath: PIXI.Graphics;
    private lastPosition: { x: number; y: number } | null = null; // Store the last position
    private touchPaths: Map<number, TouchPathInfo> = new Map();
    private colors: number[] = [0xFF0000, 0xFFA500, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];

    constructor() {
        super();
    }

    public initialize(app: PIXI.Application): void {
        this.app = app;

        // Ensure the canvas is interactive and supports events
        this.app.renderer.view.style.touchAction = 'none';
        this.app.stage.eventMode = 'dynamic'; // Assuming dynamic interaction with the stage

        app.stage.hitArea = new PIXI.Rectangle(0, 0, app.screen.width, app.screen.height);
        // app.stage.interactive = true;
        app.stage.eventMode = 'dynamic';

        this.app.renderer.view.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.app.renderer.view.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

        // Mouse down event
        this.app.stage.on('pointerdown', (event: FederatedPointerEvent) => this.startDrawing(event));
        // Mouse move event
        this.app.stage.on('pointermove', (event: FederatedPointerEvent) => this.drawLine(event));

        // Mouse up & mouse out events
        this.app.stage.on('pointerup', (event: FederatedPointerEvent) => this.stopDrawing(event));
        this.app.stage.on('pointerupoutside', (event: FederatedPointerEvent) => this.stopDrawing(event));
    }

    private startDrawing(event: FederatedPointerEvent): void {
        if (event.pointerType === 'touch') {
            const identifier = event.pointerId;

            const randomColor = this.colors[Math.floor(Math.random() * this.colors.length)];

            const graphics = new PIXI.Graphics();
            this.app.stage.addChild(graphics);
            graphics.lineStyle(5, randomColor, 1);
            // graphics.interactive = false;
            graphics.eventMode = 'none';

            const dropShadow = new DropShadowFilter();
            dropShadow.blur = 4;
            dropShadow.alpha = 0.8;
            dropShadow.offset = { x: 5, y: 5 };
            graphics.filters = [dropShadow];

            const startPosition = { x: event.global.x, y: event.global.y };
            graphics.moveTo(startPosition.x, startPosition.y);

            this.touchPaths.set(identifier, { graphics, lastPosition: startPosition });
            this.dispatchEvent(new CustomEvent(DrawingEnum.DRAWING_STARTED, { detail: { identifier } }));
        }
    }

    private drawLine(event: FederatedPointerEvent): void {

        if (event.pointerType === 'touch') {
            const identifier = event.pointerId;
            const touchInfo = this.touchPaths.get(identifier);

            if (!touchInfo) return;


            const currentPosition = { x: event.global.x, y: event.global.y };

            touchInfo.graphics.moveTo(touchInfo.lastPosition.x, touchInfo.lastPosition.y);
            touchInfo.graphics.lineTo(currentPosition.x, currentPosition.y);

            this.interpolatePoints(touchInfo.lastPosition, currentPosition).forEach(point => {
                touchInfo.graphics.lineTo(point.x, point.y);
            });

            touchInfo.lastPosition = currentPosition; // Update the last position for continuity
        }
    }

    private stopDrawing(event: FederatedPointerEvent): void {
        if (event.pointerType === 'touch') {
            const identifier = event.pointerId;
            if (this.touchPaths.has(identifier)) {
                this.touchPaths.delete(identifier);
                this.dispatchEvent(new CustomEvent(DrawingEnum.DRAWING_ENDED, { detail: { identifier } }));
            }
        }
    }

    private interpolatePoints(start, end) {
        const points = [];
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = distance / 2; // Adjust the denominator to change the density of interpolation points
        const stepX = dx / steps;
        const stepY = dy / steps;

        for (let i = 0; i <= steps; i++) {
            points.push({ x: start.x + (stepX * i), y: start.y + (stepY * i) });
        }

        return points;
    }

    public update(): void {
        // Update logic, if any, for each frame
        // This can include things like smoothing out the line drawn by the user
    }

    public clearCanvas(): void {
        this.app.stage.removeChildren();
        this.touchPaths.clear();
    }
}
