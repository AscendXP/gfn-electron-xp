# Geforce NOW for Linux
Go to the [latest release](https://github.com/AscendXP/gfn-electron-xp/releases/latest).
![Geforce-now](https://github.com/user-attachments/assets/5968ad3b-fabc-40cc-ab86-1f39eda7a8fa)

## 🆕 Latest Changes
🎹 Added support for switching between up to 5 user accounts using Ctrl+Shift+Alt+[1–5]

✅ Hardware Acceleration enabled by default  

🛠️ Fixed: Discord RPC, ESC key behavior, and Google account login  

🛎️ Notifications when the game is ready  

🧪 Experimental: arm64, Windows .exe, .deb & .rpm builds  (untested)

♻️ Auto-builds with latest Electron + Auto-update support (in builds labeled GeForce_NOW_Auto-Update)

## About
Unofficial client for Nvidia's GeForce NOW game streaming service, providing a native Linux desktop experience and some additional features such as Discord rich presence.

## Disclaimer

This project and its contributors are not affiliated with Nvidia, nor its GeForce NOW product. This repository does not contain any Nvidia / GeForce NOW software. It is simply an Electron wrapper that loads the official GFN web application page, just as it would in a regular web browser.


## Manual Installation

 - Go to the [latest release](https://github.com/AscendXP/gfn-electron-xp/releases/latest).
 - Download the specific file that best fits your distro.


# Building from source

## Requirements

You will need to install [npm](https://www.npmjs.com/), the Node.js package manager. On most distributions, the package is simply called `npm`.

## Cloning the source code

Once you have npm, clone the wrapper to a convenient location:

```bash
git clone https://github.com/AscendXP/gfn-electron-xp.git
```

## Building

```bash
npm install
npm start
```

On subsequent runs, `npm start` will be all that's required.

## Updating the source code

Simply pull the latest version of master and install any changed dependencies:

```bash
git checkout master
git pull
npm install
```

# Links
 - [GeForce NOW](https://nvidia.com/en-eu/geforce-now)
 - [Troubleshooting](https://github.com/hmlendea/gfn-electron/wiki/Troubleshooting)
