/**
 * Harness test for ResilientLoader.
 *
 * Runs the real loader against the real www/ bundle over real HTTP, with a
 * mock Phaser scene, to prove the three behaviours that matter on device:
 *   1. progress always advances (no frozen "0 / 31")
 *   2. a file that never responds cannot wedge the queue
 *   3. a missing file is recorded, not fatal
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const TYPES = {
    '.png': 'image/png',
    '.ogg': 'audio/ogg',
    '.wav': 'audio/wav',
    '.js': 'text/javascript',
};

// A path that never responds, to prove the timeout works.
const BLACKHOLE = '/__blackhole__';

const server = http.createServer((req, res) => {
    if (req.url === BLACKHOLE) return; // hang forever

    const file = path.join(WWW, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(WWW) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404).end('not found');
        return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
});

// ---------------------------------------------------------------
// Mock browser surface
// ---------------------------------------------------------------
// `imgFails` simulates the reported device behaviour: direct network <img>
// loads are refused while fetch still works, so the loader has to route around
// them. It deliberately does NOT block blob: URLs -- those never touch the
// network stack, which is the whole reason that fallback exists.
let imgFails = false;

const nativeFetch = global.fetch;

// Faithful enough to catch the `img.src = ''` class of bug: an empty src
// resolves to the page URL and fails to decode, exactly as a browser does.
global.Image = class {
    constructor() {
        this.onload = null;
        this.onerror = null;
        this._src = '';
    }
    set src(v) {
        this._src = v;
        if (v === '') {
            setTimeout(() => this.onerror && this.onerror(), 0);
            return;
        }
        const settle = () => setTimeout(() => this.onload && this.onload(), 0);
        const fail = () => setTimeout(() => this.onerror && this.onerror(), 0);
        if (imgFails && !v.startsWith('blob:')) return fail();
        nativeFetch(v)
            .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`HTTP ${r.status}`))))
            .then(settle)
            .catch(fail);
    }
    get src() { return this._src; }
};

// Minimal XHR built on the *native* fetch, so test 8 can block global fetch
// and prove the XHR transport is genuinely independent of it.
global.XMLHttpRequest = class {
    open(_method, url) { this.url = url; this.status = 0; this.response = null; }
    set responseType(_t) { /* arraybuffer only */ }
    send() {
        nativeFetch(this.url)
            .then(async (r) => {
                this.status = r.status;
                this.response = await r.arrayBuffer();
            })
            .then(() => this.onload && this.onload())
            .catch(() => this.onerror && this.onerror());
    }
};

// createImageBitmap is deliberately left undefined: the bitmap transport must
// degrade gracefully when the WebView lacks it, which is part of what is tested.


const textures = new Map();
const audio = new Map();
const scene = {
    textures: {
        exists: (k) => textures.has(k),
        addImage: (k, img) => textures.set(k, img),
    },
    cache: {
        audio: {
            exists: (k) => audio.has(k),
            add: (k, buf) => audio.set(k, buf),
        },
    },
};

// ---------------------------------------------------------------
// Load the module under test
// ---------------------------------------------------------------
(async () => {
    await new Promise((r) => server.listen(0, r));
    const base = `http://127.0.0.1:${server.address().port}`;

    const { ResilientLoader } = await import(
        'file://' + path.join(ROOT, 'src/systems/ResilientLoader.js')
    );
    const { getCriticalAssets, getDeferredAssets } = await import(
        'file://' + path.join(ROOT, 'src/data/AssetManifest.js')
    );

    let failures = 0;
    const check = (name, ok, extra = '') => {
        console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${extra ? '  ' + extra : ''}`);
        if (!ok) failures++;
    };

    // ===============================================================
    console.log('\n[1] Critical assets load over HTTP, and progress never stalls');
    // ===============================================================
    // Prefixed keys, so the embedded-data-URL path is skipped and this test
    // exercises the real network transport against real files. Embedded
    // delivery has its own check in section 8.
    const critical = getCriticalAssets().map((a) => ({
        key: `http_${a.key}`,
        file: base + '/' + a.file,
    }));
    console.log(`      critical set: ${critical.length} files`);

    const seen = [];
    const loader = new ResilientLoader(scene, { concurrency: 6, deadline: 25000, retries: 1 });

    const t0 = Date.now();
    const result = await loader.loadAll(critical, (s) => seen.push(s));
    const elapsed = Date.now() - t0;

    check('all critical files resolved', result.failed.length === 0,
        `loaded=${result.loaded}/${critical.length} failed=${result.failed.length}`);
    if (result.failed.length) console.log('      failures:', result.failed);
    check('progress was reported', seen.length === critical.length + 1,
        `events=${seen.length} (1 initial report + ${critical.length} files)`);
    check('progress is strictly increasing',
        seen.every((s, i) => i === 0 || s.done > seen[i - 1].done));
    check('loader did not hang', elapsed < 30000, `took ${elapsed}ms`);
    // Menu music was moved out of the critical set so a ~900KB ogg cannot
    // hold the loading screen hostage. Critical is now images only.
    check('textures registered', textures.size === critical.length,
        `textures=${textures.size} (critical set is images-only)`);
    check('critical set has no audio', audio.size === 0, `audio=${audio.size}`);

    // ===============================================================
    console.log('\n[2] A request that never responds cannot wedge the queue');
    // ===============================================================
    const before = textures.size;
    const t1 = Date.now();
    const hard = new ResilientLoader(scene, {
        concurrency: 4, deadline: 12000, retries: 0,
    });
    // Fresh keys, so nothing short-circuits on an already-cached texture.
    const hardResult = await hard.loadAll([
        { key: 'hard_good_1', file: base + '/assets/backgrounds/3.png' },
        { key: 'hard_hang_1', file: base + BLACKHOLE },   // never responds
        { key: 'hard_good_2', file: base + '/assets/characters/3.png' },
        { key: 'hard_hang_2', file: base + BLACKHOLE },   // never responds
    ]);
    const hardElapsed = Date.now() - t1;

    check('survives black-holed requests', hardResult.loaded === 2,
        `loaded=${hardResult.loaded} failed=${hardResult.failed.length}`);
    check('timeout is bounded', hardElapsed < 15000, `took ${hardElapsed}ms`);
    check('good files still arrived', textures.size === before + 2,
        `textures grew by ${textures.size - before} (expected 2)`);

    // ===============================================================
    console.log('\n[3] Missing files are recorded, never fatal');
    // ===============================================================
    const t2 = Date.now();
    const miss = new ResilientLoader(scene, { concurrency: 3, deadline: 8000, retries: 0 });
    const missResult = await miss.loadAll([
        { key: 'miss_gone', file: base + '/assets/does-not-exist.png' },
        { key: 'miss_ok', file: base + '/assets/characters/4.png' },
    ]);
    check('missing file reported', missResult.failed.length === 1,
        `failed=${JSON.stringify(missResult.failed)}`);
    check('sibling still loaded', missResult.loaded === 1, `loaded=${missResult.loaded}`);
    check('did not hang on the miss', Date.now() - t2 < 8000);

    // ===============================================================
    console.log('\n[4] Overall deadline caps a long queue');
    // ===============================================================
    const t3 = Date.now();
    const deadline = new ResilientLoader(scene, { concurrency: 2, deadline: 3000, retries: 0 });
    const many = Array.from({ length: 24 }, (_, i) => ({
        key: `bulk_${i}`,
        file: base + BLACKHOLE, // every one hangs
    }));
    const deadlineResult = await deadline.loadAll(many);
    check('deadline stops the run', Date.now() - t3 < 12000,
        `took ${Date.now() - t3}ms, loaded=${deadlineResult.loaded}`);

    // ===============================================================
    console.log('\n[5] Background mode returns immediately (menu stays live)');
    // ===============================================================
    const bg = new ResilientLoader(scene, { concurrency: 4, deadline: 4000, retries: 0 });
    const t4 = Date.now();
    const deferred = getDeferredAssets().slice(0, 40)
        .map((a) => ({ ...a, file: base + '/' + a.file }));
    await bg.loadAll(deferred, undefined, { background: true });
    const bgElapsed = Date.now() - t4;
    check('background call does not block', bgElapsed < 200, `took ${bgElapsed}ms`);
    check('deferred set is non-trivial', deferred.length === 40, `n=${deferred.length}`);

    // ===============================================================
    console.log('\n[6] Falls back to another transport when <img> is blocked');
    // ===============================================================
    // This is the reported failure mode: the device refuses the <img> path.
    // The loader must still deliver the asset through fetch rather than
    // calling it missing.
    imgFails = true;
    const fbTextures = new Map();
    const fbScene = {
        textures: {
            exists: (k) => fbTextures.has(k),
            addImage: (k, img) => fbTextures.set(k, img),
            addCanvas: (k, c) => fbTextures.set(k, c),
        },
        cache: { audio: { exists: () => false, add: () => true } },
    };
    const fb = new ResilientLoader(fbScene, { concurrency: 4, deadline: 25000, retries: 0 });
    const fbResult = await fb.loadAll([
        { key: 'fb_1', file: base + '/assets/backgrounds/5.png' },
        { key: 'fb_2', file: base + '/assets/characters/5.png' },
    ]);
    check('assets survive a blocked <img> path', fbResult.loaded === 2,
        `loaded=${fbResult.loaded} failed=${fbResult.failed.length}`);
    check('fallback used fetch, not <img>', fb.used.image.has('fetch+blob'),
        `transports: ${[...fb.used.image].join(', ') || 'none'}`);
    check('transport summary is reportable', /img: fetch\+blob/.test(fb.describeTransports()),
        fb.describeTransports());
    imgFails = false;

    // ===============================================================
    console.log('\n[7] Bitmap transport skipped cleanly when unavailable');
    // ===============================================================
    check('createImageBitmap genuinely absent in harness',
        typeof createImageBitmap === 'undefined');
    const noBm = new ResilientLoader(scene, { concurrency: 2, deadline: 8000, retries: 0 });
    const noBmResult = await noBm.loadAll([
        { key: 'nbm_1', file: base + '/assets/items/1.png' },
    ]);
    check('asset still loads without the bitmap transport', noBmResult.loaded === 1,
        `loaded=${noBmResult.loaded}`);

    // ===============================================================
    console.log('\n[8] Embedded data URLs need no network at all');
    // ===============================================================
    // This is the copy that arrives even when the WebView refuses every
    // network transport, so it gets its own check with fetch disabled.
    const { EMBEDDED_IMAGES } = await import(
        'file://' + path.join(ROOT, 'src', 'data', 'embeddedAssets.js')
    );
    check('embedded registry is populated', Object.keys(EMBEDDED_IMAGES).length > 0,
        `${Object.keys(EMBEDDED_IMAGES).length} entries`);
    check('embedded entries are data URLs',
        Object.values(EMBEDDED_IMAGES).every((v) => v.startsWith('data:image/png;base64,')));

    const blockedFetch = global.fetch;
    global.fetch = () => Promise.reject(new TypeError('network down'));
    const embeddedTextures = new Map();
    const embeddedScene = {
        textures: {
            exists: (k) => embeddedTextures.has(k),
            addImage: (k, i) => embeddedTextures.set(k, i),
            addCanvas: (k, c) => embeddedTextures.set(k, c),
        },
        cache: { audio: { exists: () => false, add: () => true } },
    };
    const embeddedLoader = new ResilientLoader(embeddedScene, {
        concurrency: 6, deadline: 25000, retries: 0,
    });
    const embeds = Object.entries(EMBEDDED_IMAGES)
        .slice(0, 8)
        .map(([key, dataUrl]) => ({ key, file: dataUrl }));
    const embeddedResult = await embeddedLoader.loadAll(embeds);
    global.fetch = blockedFetch;

    check('images load with the network fully down', embeddedResult.loaded === embeds.length,
        `loaded=${embeddedResult.loaded}/${embeds.length}`);
    check('embedded transport was recorded', embeddedLoader.used.image.has('embedded'),
        `transports: ${[...embeddedLoader.used.image].join(', ') || 'none'}`);

    // ===============================================================
    console.log('\n[9] Audio falls back to XHR when fetch is unavailable');
    // ===============================================================
    const realFetch = global.fetch;
    global.fetch = () => Promise.reject(new TypeError('fetch blocked'));
    // The XHR mock deliberately uses the native fetch, not global.fetch, so
    // blocking fetch below only disables the fetch transports.
    const xhrAudio = new Map();
    const xhrScene = {
        textures: { exists: () => false, addImage: () => true, addCanvas: () => true },
        cache: {
            audio: { exists: (k) => xhrAudio.has(k), add: (k, b) => xhrAudio.set(k, b) },
        },
    };
    const xhrLoader = new ResilientLoader(xhrScene, {
        concurrency: 2, deadline: 20000, retries: 0,
    });
    const xhrResult = await xhrLoader.loadAll([
        { key: 'music_1', file: base + '/assets/music/theme-1.ogg' },
    ]);
    global.fetch = realFetch;
    check('audio survives a blocked fetch', xhrResult.loaded === 1,
        `loaded=${xhrResult.loaded} failed=${xhrResult.failed.length}`);
    check('XHR transport was used', xhrLoader.used.audio.has('xhr'),
        `transports: ${[...xhrLoader.used.audio].join(', ') || 'none'}`);

    server.close();
    console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
    process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
    console.error('HARNESS ERROR:', e);
    server.close();
    process.exit(1);
});
