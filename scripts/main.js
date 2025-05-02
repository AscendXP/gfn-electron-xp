const { app, BrowserWindow, session, Notification } = require('electron');
const fs = require('fs');
const path = require('path');
const { DiscordRPC } = require('./rpc.js');
// const { switchFullscreenState } = require('./windowManager.js'); // let electron handle the fullscreen and not manually setting it

var homePage = 'https://play.geforcenow.com/mall/';
var userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0  Safari/537.36';

console.log('Using user agent: ' + userAgent);
console.log('Process arguments: ' + process.argv);

app.commandLine.appendSwitch('log-level', '3');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiIgnoreDriverChecks,AcceleratedVideoDecodeLinuxGL,UseOzonePlatform,UseOzonePlatform,TouchpadOverscrollHistoryNavigation,VaapiVideoDecodeLinuxGL');
app.commandLine.appendSwitch("ozone-platform-hint", "auto");
app.commandLine.appendSwitch("enable-wayland-ime");
app.commandLine.appendSwitch("wayland-text-input-version", "2");
app.commandLine.appendSwitch('enable-accelerated-video');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

process.on('uncaughtException', (err) => {
  console.error('Ignoring uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Ignoring unhandled promise rejection:', reason);
});

// Config file
const configPath = path.join(app.getPath('userData'), 'config.json');
const config = fs.existsSync(configPath) ?
JSON.parse(fs.readFileSync(configPath, 'utf-8')) :
{ crashCount: 0 };

let discordIsRunning = false;
let notified = false; // flag to prevent multiple notifications

function isDiscordRunning() {
  return new Promise(resolve => {
    resolve(true);
  });
}


app.whenReady().then(async () => {
  discordIsRunning = await isDiscordRunning();

  const mainWindow = await createWindow();

  session.defaultSession.webRequest.onBeforeRequest(
    { urls: ["wss://*/*"] },   // Thanks AstralVixen for this part of the code.
    async (details, callback) => {
   const url = details.url;
     const isNvidiaRequest = new URL(url).hostname.endsWith("nvidiagrid.net") && url.includes("/sign_in") && url.includes("peer_id");
      if (isNvidiaRequest) {
        console.log("Detected Nvidia Cloudmatch WebSocket upgrade request.");

        const window = BrowserWindow.getAllWindows()[0];
        if (window) {
          const title = await window.webContents.getTitle();
          console.log(`[GeForce NOW] Current title: "${title}"`);
          if (!notified) {
            console.log("Detected a game! showing notification.");

            new Notification({
              title: "GeForce NOW",
              body: `${title.replace(' on GeForce NOW', '')} is ready to play`,
                             icon: path.join(__dirname, "icon.png")
            }).show();

            notified = true;
          } else {
            console.log('Skipping notification: Title does not include "on GeForce NOW".');
          }
        }
      }

      callback({ cancel: false });
    }
  );

  if (discordIsRunning) {
    DiscordRPC('GeForce NOW');
  }
  mainWindow.on('page-title-updated', async (e, title) => {
    if (title.includes(" on GeForce NOW")) {
      console.log('Detected game title, maximizing window.');
      mainWindow.maximize();
      notified = false;

    }
  });

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

  window.on('keydown', (event) => {
    if (event.key === 'F11') {
      // Toggle fullscreen if needed
    }
  });
});

app.on('window-all-closed', async function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function createWindow() {
  const mainWindow = new BrowserWindow({
    fullscreenable: true,
    show: false,
    icon: path.join(__dirname, "icon.png"),
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

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  return mainWindow;
}
