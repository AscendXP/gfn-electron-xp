const { app, BrowserWindow, session } = require('electron');
const fs = require('fs');
const path = require('path');
const { DiscordRPC } = require('./rpc.js');
const { switchFullscreenState } = require('./windowManager.js');
var homePage = 'https://play.geforcenow.com/mall/';
var userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

console.log('Using user agent: ' + userAgent);
console.log('Process arguments: ' + process.argv);

app.commandLine.appendSwitch('log-level', '3');
process.on('uncaughtException', (err) => {
  console.error('Ignoring uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Ignoring unhandled promise rejection:', reason);
});

app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiIgnoreDriverChecks,AcceleratedVideoDecodeLinuxGL,UseOzonePlatform,UseOzonePlatform,TouchpadOverscrollHistoryNavigation,VaapiVideoDecodeLinuxGL');
app.commandLine.appendSwitch("ozone-platform-hint", "auto");
app.commandLine.appendSwitch("enable-wayland-ime");
app.commandLine.appendSwitch("wayland-text-input-version", "2");
app.commandLine.appendSwitch('enable-accelerated-video');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

const configPath = path.join(app.getPath('userData'), 'config.json');
const config = fs.existsSync(configPath) ?
JSON.parse(fs.readFileSync(configPath, 'utf-8')) :
{ crashCount: 0 };

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
});

app.on('browser-window-created', async function (e, window) {
  window.setBackgroundColor('#1A1D1F');
  window.setMenu(null);

  window.webContents.setUserAgent(userAgent);

  window.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    BrowserWindow.getAllWindows()[0]?.loadURL(url);
  });

  if (discordIsRunning) {
    window.on('page-title-updated', async function (e, title) {
      DiscordRPC(title);
    });
  }
});

app.on('window-all-closed', async function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function isDiscordRunning() {
  return new Promise(resolve => {
    resolve(true);
  });
}
