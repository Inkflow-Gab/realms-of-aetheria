// ============================================
// REALMS OF AETHERIA - AUDIO SYSTEM
// ============================================

export class AudioSystem {
    constructor() {
        this.sounds = {};
        this.music = {};
        this.currentMusic = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.muted = false;
    }

    init(scene) {
        this.scene = scene;

        // Load sounds
        const soundFiles = [
            'attack', 'hit', 'crit', 'heal', 'levelup', 'death',
            'coin', 'potion', 'equip', 'quest', 'click', 'step',
            'fireball', 'ice', 'lightning', 'arrow', 'magic',
            'monster_die', 'player_hurt', 'victory', 'defeat'
        ];

        for (const name of soundFiles) {
            try {
                this.sounds[name] = scene.sound.add(`sfx_${name}`, { volume: this.sfxVolume });
            } catch (e) {
                // Sound file not found, skip
            }
        }

        // Load music
        const musicFiles = ['town', 'battle', 'dungeon', 'boss', 'menu'];
        for (const name of musicFiles) {
            try {
                this.music[name] = scene.sound.add(`music_${name}`, {
                    volume: this.musicVolume,
                    loop: true,
                });
            } catch (e) {
                // Music file not found, skip
            }
        }
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
        }
        return this.muted;
    }
}
