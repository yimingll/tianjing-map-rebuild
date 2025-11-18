/**
 * 任务状态管理
 */

import { create } from 'zustand';
import type { QuestDefinition, PlayerQuest } from './types';

interface QuestStore {
  // 所有任务定义
  allQuests: QuestDefinition[];

  // 玩家当前任务
  playerQuests: PlayerQuest[];

  // 可接任务列表
  availableQuests: QuestDefinition[];

  // NPC提供的任务
  npcQuests: QuestDefinition[];

  // 当前选中的任务
  selectedQuest: QuestDefinition | null;

  // UI状态
  isQuestPanelOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAllQuests: (quests: QuestDefinition[]) => void;
  setPlayerQuests: (quests: PlayerQuest[]) => void;
  setAvailableQuests: (quests: QuestDefinition[]) => void;
  setNpcQuests: (quests: QuestDefinition[]) => void;
  setSelectedQuest: (quest: QuestDefinition | null) => void;
  openQuestPanel: () => void;
  closeQuestPanel: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addPlayerQuest: (quest: PlayerQuest) => void;
  updatePlayerQuest: (questId: string, updates: Partial<PlayerQuest>) => void;
  removePlayerQuest: (questId: string) => void;
  reset: () => void;
}

export const useQuestStore = create<QuestStore>((set) => ({
  // 初始状态
  allQuests: [],
  playerQuests: [],
  availableQuests: [],
  npcQuests: [],
  selectedQuest: null,
  isQuestPanelOpen: false,
  isLoading: false,
  error: null,

  // Actions
  setAllQuests: (quests) => {
    console.log('[QuestStore] 设置所有任务:', quests.length);
    set({ allQuests: quests });
  },

  setPlayerQuests: (quests) => {
    console.log('[QuestStore] 设置玩家任务:', quests.length);
    set({ playerQuests: quests });
  },

  setAvailableQuests: (quests) => {
    console.log('[QuestStore] 设置可接任务:', quests.length);
    set({ availableQuests: quests });
  },

  setNpcQuests: (quests) => {
    console.log('[QuestStore] 设置NPC任务:', quests.length);
    set({ npcQuests: quests });
  },

  setSelectedQuest: (quest) => {
    console.log('[QuestStore] 选中任务:', quest?.name);
    set({ selectedQuest: quest });
  },

  openQuestPanel: () => {
    console.log('[QuestStore] 打开任务面板');
    set({ isQuestPanelOpen: true });
  },

  closeQuestPanel: () => {
    console.log('[QuestStore] 关闭任务面板');
    set({ isQuestPanelOpen: false, selectedQuest: null });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    console.error('[QuestStore] 错误:', error);
    set({ error });
  },

  addPlayerQuest: (quest) => {
    console.log('[QuestStore] 添加玩家任务:', quest.questId);
    set((state) => ({
      playerQuests: [...state.playerQuests, quest],
    }));
  },

  updatePlayerQuest: (questId, updates) => {
    console.log('[QuestStore] 更新玩家任务:', questId);
    set((state) => ({
      playerQuests: state.playerQuests.map((q) =>
        q.questId === questId ? { ...q, ...updates } : q
      ),
    }));
  },

  removePlayerQuest: (questId) => {
    console.log('[QuestStore] 移除玩家任务:', questId);
    set((state) => ({
      playerQuests: state.playerQuests.filter((q) => q.questId !== questId),
    }));
  },

  reset: () => {
    console.log('[QuestStore] 重置状态');
    set({
      allQuests: [],
      playerQuests: [],
      availableQuests: [],
      npcQuests: [],
      selectedQuest: null,
      isQuestPanelOpen: false,
      isLoading: false,
      error: null,
    });
  },
}));
