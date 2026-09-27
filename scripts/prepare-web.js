#!/usr/bin/env node
/**
 * prepare-web.js
 *
 * Generates the Capacitor `webDir` (www/) from the project root.
 *
 * This exists because www/ was previously copied by hand, which let it drift
 * out of sync with the real source. A stale www/index.html shipped to devices
 * that has no loading-screen hooks, so the progress bar never moved.
 *
 * Run via: npm run build   (or automatically through `npm run cap:sync`)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');

/** Recursively copy a file or directory. */
function copy(src, dest) {
    const stat = fs.statSync(src);

    if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
            copy(path.join(src, entry), path.join(dest, entry));
        }
        return;
    }

    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}

/** Remove a path if it exists. */
function remove(target) {
    if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true });
    }
}

function countFiles(dir) {
    let total = 0;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        total += entry.isDirectory() ? countFiles(full) : 1;
    }
    return total;
}

function main() {
    // Rebuild www/ from scratch so nothing stale can survive.
    remove(WWW);
    fs.mkdirSync(WWW, { recursive: true });

    // index.html
    copy(path.join(ROOT, 'index.html'), path.join(WWW, 'index.html'));

    // Game source
    copy(path.join(ROOT, 'src'), path.join(WWW, 'src'));

    // Assets.
    //
    // Game code loads assets as `assets/...` (relative to index.html), so the
    // contents of public/assets/ are placed at www/assets/ -- NOT
    // www/public/assets/, which is where they used to land and 404 on device.
    copy(path.join(ROOT, 'public', 'assets'), path.join(WWW, 'assets'));

    const total = countFiles(WWW);
    console.log(`[prepare-web] www/ rebuilt (${total} files)`);
}

main();
