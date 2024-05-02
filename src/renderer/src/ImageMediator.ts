

export class ImageMediator extends EventTarget{

    private imageDisplay: HTMLImageElement;

    constructor() {
        super();
    }

    public initialize(display: HTMLImageElement): void {
        this.imageDisplay = display;
        this.loadNextImage();
    }

    public loadNextImage(): void {
        window.electronAPI.loadNextImage().then(dataUrl => {
            if (dataUrl.startsWith('data:image')) {
                this.imageDisplay.src = dataUrl;
                this.dispatchEvent(new Event('imageLoaded'));
                
            } else {
                alert(dataUrl);
            }
        });
    }
}
