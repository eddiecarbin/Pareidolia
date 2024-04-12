export class CountDownTimer extends EventTarget {
    private remainingTime: number;
    private lastUpdateTime: number;
    private timerComplete: boolean;
    private timerID: number | undefined; // To keep track of the interval ID
    private initialTime: number; // Store the initial time for resets

    constructor(initialTime: number = 0) {
        super();
        this.remainingTime = initialTime;
        this.initialTime = initialTime; // Store the initial countdown time
        this.lastUpdateTime = Date.now();
        this.timerComplete = false;
    }

    public start(): void {
        if (this.timerID !== undefined) {
            clearInterval(this.timerID); // Clear existing timer if running
        }
        this.timerComplete = false;
        this.lastUpdateTime = Date.now(); // Reset the last update time
        // this.timerID = window.setInterval(() => this.update(), 1000); // Update every second
    }

    public stop(): void {
        if (this.timerID !== undefined) {
            clearInterval(this.timerID);
            this.timerID = undefined;
        }
    }

    public reset(): void {
        this.stop(); // Stop any existing timer
        this.remainingTime = this.initialTime; // Reset remaining time to initial
        this.timerComplete = false; // Reset the complete flag
        this.start(); // Restart the timer
    }

    private updateDisplay(): void {
        const hours = Math.floor(this.remainingTime / 3600);
        const minutes = Math.floor((this.remainingTime % 3600) / 60);
        const seconds = Math.floor(this.remainingTime % 60);

        let timeStr = '';
        if (hours > 0) {
            timeStr += `${hours.toString().padStart(2, '0')}:`;
        }
        timeStr += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        // this.display.text = timeStr;
    }

    // Modify the update method to call reset() when countdown completes
    public update(): void {
        const now = Date.now();
        const deltaTime = (now - this.lastUpdateTime) / 1000;

        if (deltaTime >= 1) {
            this.remainingTime -= deltaTime;
            this.lastUpdateTime = now;

            if (this.remainingTime <= 0) {
                this.remainingTime = 0;
                this.updateDisplay();
                if (!this.timerComplete) {
                    this.timerComplete = true;
                    this.dispatchEvent(new Event('countdownComplete'));
                    this.reset(); // Automatically reset and restart the timer
                }
                return;
            }

            this.updateDisplay();
        }
    }
}
