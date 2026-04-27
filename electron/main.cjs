const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;
let backendServer;

async function createWindow() {
  const serverPath = isDev
    ? path.join(__dirname, '../server/index.js')
    : path.join(__dirname, '../server/index.js').replace('app.asar', 'app.asar.unpacked');

  console.log('Loading server from:', serverPath);
  
  try {
    const { runServer } = require(serverPath);
    // Start backend server
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'db_new');
    console.log('Starting backend with DB at:', dbPath);
    backendServer = await runServer(dbPath);
  } catch (err) {
    console.error('Failed to start backend server:', err);
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, '../dist/logo.png') // Use dist/logo.png which is always included
  });

  mainWindow.setMenuBarVisibility(false);

  // Allow file:// to talk to localhost:3000 in production
  const { session } = require('electron');
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['http://localhost:3000/*', 'http://127.0.0.1:3000/*'] },
    (details, callback) => {
      details.requestHeaders['Origin'] = 'file://';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    // Keep DevTools enabled in production for now to debug "Failed to fetch"
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (backendServer && backendServer.close) {
    backendServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
