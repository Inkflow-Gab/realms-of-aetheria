// ============================================
// REALMS OF AETHERIA - AUDIO SYSTEM
// ============================================

import { SOUND_ALIASES, MUSIC_ALIASES, NAMED_SOUND_KEYS } from '../data/AssetManifest.js';

export class AudioSystem {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.muted = false;
        this.scene = null;
    }

    init(scene) {
        this.scene = scene;

        // --------------------------------------------------
        // Sound effects
        // --------------------------------------------------
        // The sound pack ships numbered files (1.ogg ... 40.ogg), so the
        // semantic names the game asks for are resolved through
        // SOUND_ALIASES. Names with no loaded file are simply skipped --
        // play() then does nothing instead of throwing.
        for (const [name, index] of Object.entries(SOUND_ALIASES)) {
            const key = `sfx_${index}`;
            if (!scene.cache.audio.exists(key)) continue;
            this.sounds[name] = scene.sound.add(key, { volume: this.sfxVolume });
        }

        // --------------------------------------------------
        // Named effects
        // --------------------------------------------------
        // Bound after the numbered aliases so a name that was recorded
        // specifically (a real victory fanfare, a monster roar) always wins
        // over the same word mapped to a numbered file.
        for (const [name, key] of Object.entries(NAMED_SOUND_KEYS)) {
            if (!scene.cache.audio.exists(key)) continue;
            this.sounds[name] = scene.sound.add(key, { volume: this.sfxVolume });
        }

        // --------------------------------------------------
        // Music
        // --------------------------------------------------
        for (const [name, theme] of Object.entries(MUSIC_ALIASES)) {
            const key = `music_${theme}`;
            if (!scene.cache.audio.exists(key)) continue;
            this.music[name] = scene.sound.add(key, {
                volume: this.musicVolume,
                loop: true,
            });
        }

        console.info(
            `[audio] ${Object.keys(this.sounds).length} sfx, ` +
            `${Object.keys(this.music).length} music tracks ready`
        );
    }

    play(name) {
        if (this.muted) return;
        if (this.sounds[name]) {
            this.sounds[name].play();
        }
    }

    playMusic(name) {
        if (this.currentMusic === name) return;

        this.stopMusic();

        if (this.music[name]) {
            this.music[name].play();
            this.currentMusic = name;
        }
    }

    stopMusic() {
        if (this.currentMusic && this.music[this.currentMusic]) {
            this.music[this.currentMusic].stop();
        }
        this.currentMusic = null;
    }

    setMusicVolume(vol) {
        this.musicVolume = vol;
        for (const name in this.music) {
            this.music[name].setVolume(vol);
        }
    }

    setSfxVolume(vol) {
        this.sfxVolume = vol;
        for (const name in this.sounds) {
            this.sounds[name].setVolume(vol);
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            this.stopMusic();
        } else if (this.scene) {
            // Resume whatever was playing before the mute.
            this.playMusic('menu');
        }
        return this.muted;
    }
}
