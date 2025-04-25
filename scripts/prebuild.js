const fs = require('fs');
const path = require('path');

// Read the current Electron version
const electronVersion = require('electron/package.json').version;
console.log('Using Electron version:', electronVersion);

// Load package.json
const pkgPath = path.resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

// Replace placeholder with actual Electron version
if (pkg.build && pkg.build.linux && pkg.build.linux.artifactName) {
    pkg.build.linux.artifactName = pkg.build.linux.artifactName.replace('electron-VERSION', `electron-${electronVersion}`);
}

// Save updated package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log('Updated artifactName in package.json');
