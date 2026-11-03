const { app, BrowserWindow, ipcMain } = require('electron');
const express = require('express');
const expressApp = express();

// Arranca tu servidor Express automáticamente
require('./server.js');
expressApp.use(express.json());

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    title: 'MotoParts POS',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true // Oculta la barra superior de menú de Electron
  });

  // Da 1 segundo de respiro para que Express encienda el puerto 3000 y luego carga la app
  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 1000);
  
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('imprimir-ticket', (event, contenido) => {
  const win = BrowserWindow.getFocusedWindow();
  win.webContents.print({ silent: true, printBackground: true }, (success, failureReason) => {
    if (!success) console.log('Error al imprimir:', failureReason);
  });
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});