

export class ImageMediator {

    private imageDisplay: HTMLImageElement;

    constructor() {
    }
    public initialize(display: HTMLImageElement): void {
        this.imageDisplay = display;
        this.loadNextImage();
    }

    public loadNextImage(): void {
        window.electronAPI.loadNextImage().then(dataUrl => {
            if (dataUrl.startsWith('data:image')) {
                this.imageDisplay.src = dataUrl;
            } else {
                alert(dataUrl);
            }
        });
    }
}
