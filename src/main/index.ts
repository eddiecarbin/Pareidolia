import { app, shell, BrowserWindow, ipcMain, nativeImage, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import * as fs from 'fs';
import path from 'path';


let imagePaths = []; // To store image paths
let currentIndex = 0; // To track the current image index

// Function to preload image paths from the folder
function preloadImagePaths(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error("Failed to read directory:", err);
      return;
    }
    imagePaths = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => path.join(folderPath, file));
    currentIndex = 0; // Reset index whenever folder is reloaded
  });
}



ipcMain.handle('load-next-image', async (): Promise<string> => {
  if (imagePaths.length === 0 || currentIndex >= imagePaths.length) {
    currentIndex = 0;
  }

  const imagePath = imagePaths[currentIndex++];
  const image = nativeImage.createFromPath(imagePath);
  return image.toDataURL();
});

function createWindow(): void {
  // Create the browser window.
  // const mainWindow = new BrowserWindow({
  //   width: 900,
  //   height: 670,
  //   show: false,
  //   // fullscreen: true,
  //   autoHideMenuBar: true,
  //   ...(process.platform === 'linux' ? { icon } : {}),
  //   webPreferences: {
  //     preload: join(__dirname, '../preload/index.js'),
  //     sandbox: false
  //   }
  // })
  const displays = screen.getAllDisplays();

  const { x, y, width, height } = displays[0].bounds;
  const mainWindow = new BrowserWindow({
    x,
    y,
    autoHideMenuBar: true,
    fullscreen: true,
    width,
    height,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.openDevTools();

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const folderPath = path.join(app.getPath('desktop'), 'ParedioliaImages');
  preloadImagePaths(folderPath);


  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
