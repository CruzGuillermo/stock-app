const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

const isDev = !app.isPackaged;
let mainWindow;
let backendProcess;

function startBackend() {
  const backendEntry = path.join(__dirname, 'backend', 'index.js');
  backendProcess = spawn(process.execPath, [backendEntry], {
    stdio: 'inherit',
    shell: false,
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend finalizó con código ${code}`);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    console.log('Modo desarrollo: cargando http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const filePath = path.join(__dirname, 'frontend', 'dist', 'index.html');
    console.log('Modo producción: cargando archivo:', filePath);
    mainWindow.loadFile(filePath);
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('before-quit', () => {
    stopBackend();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
