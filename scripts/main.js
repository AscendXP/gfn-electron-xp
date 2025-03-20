const { app, BrowserWindow, session } = require('electron');
const electronLocalshortcut = require('electron-localshortcut');
const fs = require('fs');
const path = require('path');
const { DiscordRPC } = require('./rpc.js');
const { switchFullscreenState } = require('./windowManager.js');

var homePage = 'https://play.geforcenow.com';
var userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

console.log('Using user agent: ' + userAgent);
console.log('Process arguments: ' + process.argv);

app.commandLine.appendSwitch('enable-features', 'AcceleratedVideoDecodeLinuxGL,VaapiVideoDecoder,VaapiIgnoreDriverChecks,RawDraw');
app.commandLine.appendSwitch('log-level', '3');

app.commandLine.appendSwitch(
  'disable-features',
  'UseChromeOSDirectVideoDecoder'
);
app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode');
app.commandLine.appendSwitch('enable-accelerated-video');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-gpu-memory-buffer-video-frames');

const configPath = path.join(app.getPath('userData'), 'config.json');
const config = fs.existsSync(configPath) ?
JSON.parse(fs.readFileSync(configPath, 'utf-8')) :
{ crashCount: 0 };

switch(config.crashCount) {
  case 0:
    app.commandLine.appendSwitch('use-gl', 'angle');
    break;
  case 1:
    app.commandLine.appendSwitch('use-gl', 'egl');
    break;
  default:
    app.disableHardwareAcceleration();
}

async function createWindow() {
  const mainWindow = new BrowserWindow({
    fullscreenable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
                                       contextIsolation: false,
                                       userAgent: userAgent,
    },
  });

  if (process.argv.includes('--direct-start')) {
    mainWindow.loadURL('https://play.geforcenow.com/mall/#/streamer?launchSource=GeForceNOW&cmsId=' + process.argv[process.argv.indexOf('--direct-start') + 1]);
  } else {
    mainWindow.loadURL(homePage);
  }
}

let discordIsRunning = false;

app.whenReady().then(async () => {
  discordIsRunning = await isDiscordRunning();

  createWindow();

  if (discordIsRunning) {
    DiscordRPC('GeForce NOW');
  }

  app.on('activate', async function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  electronLocalshortcut.register('Super+F', async () => {
    switchFullscreenState();
  });

  electronLocalshortcut.register('F11', async () => {
    switchFullscreenState();
  });

  electronLocalshortcut.register('Alt+F4', async () => {
    app.quit();
  });

  electronLocalshortcut.register('Alt+Home', async () => {
    BrowserWindow.getAllWindows()[0].loadURL(homePage);
  });

  electronLocalshortcut.register('F4', async () => {
    app.quit();
  });

  electronLocalshortcut.register('Control+Shift+I', () => {
    BrowserWindow.getAllWindows()[0].webContents.toggleDevTools();
  });
});

app.on('browser-window-created', async function (e, window) {
  window.setBackgroundColor('#1A1D1F');
  window.setMenu(null);

  window.webContents.setUserAgent(userAgent);

  window.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    BrowserWindow.getAllWindows()[0].loadURL(url);
  });

  if (discordIsRunning) {
    window.on('page-title-updated', async function (e, title) {
      DiscordRPC(title);
    });
  }
});

app.on('child-process-gone', (event, details) => {
  if (details.type === 'GPU' && details.reason === 'crashed') {
    config.crashCount++;
    fs.writeFileSync(configPath, JSON.stringify(config));

    console.log("Initiating application restart with an alternative 'use-gl' switch implementation or with hardware acceleration disabled, aiming to improve stability or performance based on prior execution outcomes.");

    app.relaunch();
    app.exit(0);
  }
});

app.on('will-quit', async () => {
  electronLocalshortcut.unregisterAll();
});

app.on('window-all-closed', async function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (err) => {
  console.error('Ignoring uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Ignoring unhandled promise rejection:', reason);
});

function isDiscordRunning() {
  return new Promise(resolve => {
    resolve(true);
  });
}
