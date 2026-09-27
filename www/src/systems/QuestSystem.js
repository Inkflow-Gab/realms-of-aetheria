// ============================================
// REALMS OF AETHERIA - QUEST SYSTEM
// ============================================

import { QUESTS } from '../data/Quests.js';

export class QuestSystem {
    constructor(player) {
        this.player = player;
    }

    acceptQuest(questId) {
        const quest = QUESTS[questId];
        if (!quest) return false;
        if (this.player.quests[questId]) return false;

        this.player.quests[questId] = {
            id: questId,
            status: 'active',
            objectives: quest.objectives.map(obj => ({
                ...obj,
                current: 0,
                completed: false,
            })),
            startTime: Date.now(),
        };
        return true;
    }

    updateQuest(type, target, count = 1) {
        for (const questId in this.player.quests) {
            const questState = this.player.quests[questId];
            if (questState.status !== 'active') continue;

            const quest = QUESTS[questId];
            if (!quest) continue;

            for (const obj of questState.objectives) {
                if (obj.completed) continue;
                if (obj.type === type && obj.target === target) {
                    obj.current = Math.min(obj.count, obj.current + count);
                    if (obj.current >= obj.count) {
                        obj.completed = true;
                    }
                }
            }

            // Check if all objectives complete
            if (questState.objectives.every(o => o.completed)) {
                this.completeQuest(questId);
            }
        }
    }

    completeQuest(questId) {
        const questState = this.player.quests[questId];
        if (!questState) return false;

        const quest = QUESTS[questId];
        if (!quest) return false;

        questState.status = 'completed';
        questState.completedTime = Date.now();

        // Give rewards
        if (quest.rewards.exp) {
            this.player.gainExp(quest.rewards.exp);
        }
        if (quest.rewards.gold) {
            this.player.gold += quest.rewards.gold;
        }
        if (quest.rewards.items) {
            for (const itemId of quest.rewards.items) {
                this.player.addItem(itemId, 1);
            }
        }

        // Move to completed list
        this.player.completedQuests.push(questId);
        delete this.player.quests[questId];

        // Chain quest
        if (quest.nextQuest) {
            this.acceptQuest(quest.nextQuest);
        }

        return true;
    }

    getActiveQuests() {
        return Object.values(this.player.quests).filter(q => q.status === 'active');
    }

    getCompletedQuests() {
        return this.player.completedQuests;
    }

    getQuestGivers() {
        const givers = [];
        for (const questId in QUESTS) {
            const quest = QUESTS[questId];
            if (this.player.quests[questId]) continue;
            if (this.player.completedQuests.includes(questId) && !quest.repeatable) continue;

            // Find NPC that gives this quest
            for (const obj of quest.objectives) {
                if (obj.type === 'talk') {
                    givers.push({
                        npcId: obj.target,
                        questId: questId,
                        questName: quest.name,
                    });
                    break;
                }
            }
        }
        return givers;
    }
}
