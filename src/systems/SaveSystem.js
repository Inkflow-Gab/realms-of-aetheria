// ============================================
// REALMS OF AETHERIA - SAVE/LOAD SYSTEM
// ============================================

const SAVE_KEY = 'aetheria_save';
const SETTINGS_KEY = 'aetheria_settings';

export class SaveSystem {
    constructor() {
        this.hasSave = this.checkSave();
    }

    checkSave() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            return data !== null;
        } catch (e) {
            return false;
        }
    }

    save(player, worldState = {}) {
        try {
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                player: player.serialize(),
                world: worldState,
            };
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            this.hasSave = true;
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            return false;
        }
    }

    load() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            console.error('Load failed:', e);
            return null;
        }
    }

    deleteSave() {
        try {
            localStorage.removeItem(SAVE_KEY);
            this.hasSave = false;
            return true;
        } catch (e) {
            return false;
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Settings save failed:', e);
        }
    }

    loadSettings() {
        try {
            const data = localStorage.getItem(SETTINGS_KEY);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }

    static getSaveInfo() {
        try {
            const data = localStorage.getItem(SAVE_KEY);
            if (!data) return null;
            const save = JSON.parse(data);
            return {
                level: save.player?.level || 1,
                name: save.player?.name || 'Unknown',
                class: save.player?.class || 'Unknown',
                playTime: save.player?.playTime || 0,
                timestamp: save.timestamp,
            };
        } catch (e) {
            return null;
        }
    }
}
