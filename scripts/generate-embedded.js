#!/usr/bin/env node
/**
 * generate-embedded.js
 *
 * Embeds the critical images into a JS module as base64 data URLs.
 *
 * WHY
 * ---
 * On device the game was stuck with assets that never arrived. The engine
 * loaded fine from vendor/phaser.min.js -- a same-origin script -- which proved
 * the WebView asset server answers for scripts. But <img> and fetch() requests
 * into assets/ were being discarded, so the game booted with no textures.
 *
 * A data URL needs no network at all: the bytes are already in the JavaScript
 * that the WebView demonstrably executes. So the critical art is shipped twice
 * -- once as a file, once inline -- and the loader uses the inline copy first.
 *
 * Only the critical set is inlined. It is what the main menu needs, and it is
 * small: ~450KB of PNG becomes ~600KB of base64, which is nothing next to the
 * 14MB of music. Everything else still streams from assets/.
 *
 * Run via: npm run generate:embedded
 */

const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'src', 'data', 'embeddedAssets.js');

async function main() {
    const { getCriticalAssets } = await import(
        pathToFileURL(path.join(ROOT, 'src', 'data', 'AssetManifest.js')).href
    );

    const critical = getCriticalAssets();

    // Images only. Audio is far too large to inline and is never needed before
    // the menu is up, so it stays on the streaming path.
    const images = critical.filter((a) => !/\.(ogg|mp3|wav|m4a)$/i.test(a.file));

    const entries = [];
    let rawBytes = 0;

    for (const asset of images) {
        const file = path.join(ROOT, 'public', asset.file);
        if (!fs.existsSync(file)) {
            throw new Error(`cannot embed missing file: ${asset.file}`);
        }
        const buf = fs.readFileSync(file);
        if (buf.length === 0) {
            throw new Error(`cannot embed empty file: ${asset.file}`);
        }
        rawBytes += buf.length;
        entries.push(
            `    ${JSON.stringify(asset.key)}: ` +
            `'data:image/png;base64,${buf.toString('base64')}'`
        );
    }

    const body = `// ============================================
// REALMS OF AETHERIA - EMBEDDED CRITICAL IMAGES
// ============================================
//
// GENERATED FILE -- do not edit by hand. Regenerate with:
//     npm run generate:embedded
//
// These are the critical images (main-menu art) inlined as base64 data URLs.
//
// The reason this file exists: on device the game booted with no textures even
// though every asset was present in the APK and the engine loaded correctly
// from vendor/phaser.min.js. Scripts were being served; <img> and fetch()
// requests into assets/ were not. A data URL needs no network, so the art that
// the main menu cannot do without is shipped inside the JavaScript itself and
// cannot fail to arrive.
//
// Only the critical set is inlined, and only images: ~${(rawBytes / 1024).toFixed(0)}KB of PNG.
// Audio is large and not needed until gameplay, so it stays on the streaming
// path in assets/.
// ============================================

export const EMBEDDED_IMAGES = {
${entries.join(',\n')}
};

// Also publish it on window, so the classic (non-module) script in index.html
// can use the art before the module graph has finished loading. This is what
// lets the loading screen show real game art even when the device refuses
// every network transport -- the bytes are already in the page.
if (typeof window !== 'undefined') {
    window.EMBEDDED_IMAGES = EMBEDDED_IMAGES;
}
`;

    fs.writeFileSync(OUT, body);

    const base64Bytes = fs.statSync(OUT).size;
    console.log(
        `[embedded] ${entries.length} images, ` +
        `${(rawBytes / 1024).toFixed(0)}KB raw -> ` +
        `${(base64Bytes / 1024).toFixed(0)}KB base64 -> ${path.relative(ROOT, OUT)}`
    );
}

main().catch((err) => {
    console.error(`[embedded] FAILED: ${err.message}`);
    process.exit(1);
});
