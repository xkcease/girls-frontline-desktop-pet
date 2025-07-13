import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from './model/const.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function initIPC () {
  ipcMain.on('set-window-position', (event, x, y) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    win.setPosition(x, y);
  });

  ipcMain.handle('get-window-position', async (event, data) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    return win.getPosition();
  });

  ipcMain.handle('get-display-nearest-point', async (event, data) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const position = win.getPosition();

    return screen.getDisplayNearestPoint({
      x: position[0],
      y: position[1]
    });
  });

  ipcMain.handle('is-reach-screen-edge', async (event, data) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const [x, y] = win.getPosition();

    const display = screen.getDisplayNearestPoint({ x, y });
    const max_x = display.size.width - WINDOW_WIDTH;
    const max_y = display.size.height - WINDOW_HEIGHT;

    const result = {
      x: false,
      y: false,
      is_left_edge: false,
      is_top_edge: false,
    };

    if (x <= 0) {
      result.x = true;
      result.is_left_edge = true;
    }
    if (x >= max_x) {
      result.x = true;
      result.is_left_edge = false;
    }

    if (y <= 0) {
      result.y = true;
      result.is_top_edge = true;
    }
    if (y >= max_y) {
      result.y = true;
      result.is_top_edge = false;
    }

    return result;
  });
}

function createWindow () {
  const mainWindow = new BrowserWindow({

    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    frame: false,
    transparent: true,
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  console.log(path.join(__dirname, 'preload.mjs'))

  const [x, y] = mainWindow.getPosition();
  const display = screen.getDisplayNearestPoint({ x, y });
  mainWindow.setPosition(x, display.size.height - WINDOW_HEIGHT);

  mainWindow.loadFile('src/index.html')

  initIPC();
}

app.dock.setIcon(path.join(__dirname, 'assets/icons/favicon.png'))

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
