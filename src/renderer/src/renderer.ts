import { PareidoliaContext } from './PareidoliaContext';
import * as PIXI from 'pixi.js';


var context: PareidoliaContext;

function init(): void {
  window.addEventListener('DOMContentLoaded', () => {
    initialize()
  })
}

function initialize(): void {


  const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;

  // Initialize a PIXI Application with that canvas
  const app = new PIXI.Application({
    view: canvas,
    width:1920, // Consider using screen dimensions for fullscreen
    height: 1080,
    backgroundAlpha: 0,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    resizeTo: window,
    antialias: true,
    // transparent: true, // Example transparent background
    // backgroundColor: 0x1099bb, // Example background color
  });

  const imageDisplay = document.getElementById('myImage') as HTMLImageElement;

  context = new PareidoliaContext();
  context.initialize(imageDisplay, app);

  PIXI.Ticker.shared.maxFPS = 15;
  PIXI.Ticker.shared.add((delta) => {
    context.Update();
  });
}

init()
