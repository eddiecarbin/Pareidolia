import { CountDownTimer } from "./CountDownTimer";
import { DrawingController, DrawingEnum } from "./DrawingController";
import { ImageMediator } from "./ImageMediator";
import * as PIXI from 'pixi.js';

export class PareidoliaContext {


    private drawingController: DrawingController;
    private imageMediator: ImageMediator;

    protected countDownTimer: CountDownTimer;
    private inUseCountDownTimer: CountDownTimer;
    private firstHit: boolean = false;


    constructor() {
    }

    public initialize(imageDisplay: HTMLImageElement, app: PIXI.Application) {

        this.countDownTimer = new CountDownTimer(15);
        this.countDownTimer.addEventListener('countdownComplete', () => {
            this.drawingController.clearCanvas();
            this.imageMediator.loadNextImage();
        });

        this.drawingController = new DrawingController();
        this.drawingController.initialize(app);

        this.drawingController.addEventListener(DrawingEnum.DRAWING_ENDED, () => { });
        this.drawingController.addEventListener(DrawingEnum.DRAWING_STARTED, () => {
            this.countDownTimer.reset();
            if (this.firstHit == false) {

                this.inUseCountDownTimer.reset();
                this.firstHit = true;
            }
        });

        this.inUseCountDownTimer = new CountDownTimer(60);
        this.inUseCountDownTimer.addEventListener('countdownComplete', () => {
            this.drawingController.clearCanvas();
            this.imageMediator.loadNextImage();
        });

        this.imageMediator = new ImageMediator();
        this.imageMediator.initialize(imageDisplay);
        this.imageMediator.addEventListener('imageLoaded', () => {
            // this.countDownTimer.reset();
            this.firstHit = false;
        });

        this.setupKeyPressListeners();
    }

    public Update() {
        this.countDownTimer.update();
        this.inUseCountDownTimer.update();
        this.drawingController.update();

    }

    private setupKeyPressListeners(): void {
        document.addEventListener('keydown', (event) => {

            if (event.key === 'Escape' || event.keyCode === 27) {
                window.close();
                return;
            }
            else if (event.key === 'c' || event.key === 'C') {
                this.drawingController.clearCanvas();
                this.countDownTimer.reset();
            }
            else if (event.key === 'm' || event.key === 'M') {
                this.drawingController.setMultipleColors(!this.drawingController.getMultipleColors());
            }
            // on arrow left or right key
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                this.drawingController.clearCanvas();
                this.imageMediator.loadNextImage();
                this.countDownTimer.reset();
            }
        });
    }
}
