export {};

declare global {
  interface Window {
    electronAPI: {
      loadNextImage(): Promise<string>;
    }
  }
}