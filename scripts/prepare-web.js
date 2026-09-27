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
const { pathToFileURL } = require('url');

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

async function main() {
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

    // The game engine, bundled locally.
    //
    // index.html loads `vendor/phaser.min.js`. If this directory is missing
    // the page has no engine, main.js bails, and the app is stuck on the
    // loading screen with no way to recover -- so it is verified, not assumed.
    const vendorSrc = path.join(ROOT, 'public', 'vendor');
    if (!fs.existsSync(path.join(vendorSrc, 'phaser.min.js'))) {
        throw new Error(
            'public/vendor/phaser.min.js is missing. The game engine must be ' +
            'bundled with the app -- see README "Bundling the game engine".'
        );
    }
    copy(vendorSrc, path.join(WWW, 'vendor'));

    // Fail loudly here rather than shipping a broken APK: every asset the
    // manifest names must actually be in the bundle.
    const engine = path.join(WWW, 'vendor', 'phaser.min.js');
    if (fs.statSync(engine).size < 500_000) {
        throw new Error(
            `vendor/phaser.min.js is only ${fs.statSync(engine).size} bytes. ` +
            'That is not the Phaser build -- the download was truncated.'
        );
    }

    const total = countFiles(WWW);
    console.log(`[prepare-web] www/ rebuilt (${total} files)`);

    await verifyManifest();
}

/**
 * Assert that every asset the game asks for is actually in the bundle.
 *
 * This is the check that stops the whole class of "stuck on 0/31" bugs at the
 * source. A manifest entry pointing at a file that is not in www/ is a 404 on
 * device, and 404s inside a load queue are what used to freeze the game with
 * no error and no progress. Catching it here means CI fails with a filename
 * instead of shipping an APK that hangs.
 */
async function verifyManifest() {
    const manifestPath = path.join(ROOT, 'src', 'data', 'AssetManifest.js');
    if (!fs.existsSync(manifestPath)) {
        console.warn('[prepare-web] AssetManifest.js not found, skipping verification');
        return;
    }

    // Imported rather than required: the manifest is an ES module, and
    // `require()` of ESM is only available from Node 22. CI runs Node 20.
    const mod = await import(pathToFileURL(manifestPath).href);
    const entries = mod.ASSET_MANIFEST || [];

    const missing = [];
    const empty = [];
    const seenKeys = new Map();

    for (const asset of entries) {
        const target = path.join(WWW, asset.file);

        if (!fs.existsSync(target)) {
            missing.push(`${asset.key} -> ${asset.file}`);
            continue;
        }
        if (fs.statSync(target).size === 0) {
            empty.push(`${asset.key} -> ${asset.file}`);
        }

        // Two assets sharing a key means one silently overwrites the other,
        // which is just as confusing as a missing file.
        if (seenKeys.has(asset.key)) {
            missing.push(
                `DUPLICATE KEY "${asset.key}": ` +
                `${seenKeys.get(asset.key)} and ${asset.file}`
            );
        } else {
            seenKeys.set(asset.key, asset.file);
        }
    }

    if (missing.length || empty.length) {
        const detail = [
            missing.length ? `missing/duplicated (${missing.length}):\n  - ${missing.join('\n  - ')}` : '',
            empty.length ? `zero-byte (${empty.length}):\n  - ${empty.join('\n  - ')}` : '',
        ].filter(Boolean).join('\n');
        throw new Error(
            `Asset manifest does not match the bundle:\n${detail}\n\n` +
            'Fix the manifest or add the file, then rebuild.'
        );
    }

    const critical = mod.getCriticalAssets().length;
    const deferred = mod.getDeferredAssets().length;
    console.log(
        `[prepare-web] manifest verified: ${entries.length} assets ` +
        `(${critical} critical, ${deferred} deferred), all present`
    );
}

main().catch((err) => {
    console.error(`[prepare-web] FAILED: ${err.message}`);
    process.exit(1);
});
