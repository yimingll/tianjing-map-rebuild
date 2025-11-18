/**
 * NPC交互状态管理
 */

import { create } from 'zustand';
import type {
  NpcInfo,
  DialogueNode,
  TradeItem,
} from './types';

interface NpcStore {
  // 当前房间的NPC列表
  npcsInRoom: NpcInfo[];

  // 当前正在交互的NPC
  currentNpc: NpcInfo | null;

  // 当前对话节点
  currentDialogue: DialogueNode | null;

  // 商店商品列表
  merchantItems: TradeItem[];

  // UI状态
  isDialogueOpen: boolean;
  isShopOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setNpcsInRoom: (npcs: NpcInfo[]) => void;
  setCurrentNpc: (npc: NpcInfo | null) => void;
  setCurrentDialogue: (dialogue: DialogueNode | null) => void;
  setMerchantItems: (items: TradeItem[]) => void;
  openDialogue: () => void;
  closeDialogue: () => void;
  openShop: () => void;
  closeShop: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useNpcStore = create<NpcStore>((set) => ({
  // 初始状态
  npcsInRoom: [],
  currentNpc: null,
  currentDialogue: null,
  merchantItems: [],
  isDialogueOpen: false,
  isShopOpen: false,
  isLoading: false,
  error: null,

  // Actions
  setNpcsInRoom: (npcs) => {
    console.log('[NpcStore] 设置房间NPC列表:', npcs);
    set({ npcsInRoom: npcs });
  },

  setCurrentNpc: (npc) => {
    console.log('[NpcStore] 设置当前NPC:', npc);
    set({ currentNpc: npc });
  },

  setCurrentDialogue: (dialogue) => {
    console.log('[NpcStore] 设置当前对话:', dialogue);
    set({ currentDialogue: dialogue });
  },

  setMerchantItems: (items) => {
    console.log('[NpcStore] 设置商人物品:', items);
    set({ merchantItems: items });
  },

  openDialogue: () => {
    console.log('[NpcStore] 打开对话面板');
    set({ isDialogueOpen: true, isShopOpen: false });
  },

  closeDialogue: () => {
    console.log('[NpcStore] 关闭对话面板');
    set({
      isDialogueOpen: false,
      currentDialogue: null,
      currentNpc: null,
    });
  },

  openShop: () => {
    console.log('[NpcStore] 打开商店面板');
    set({ isShopOpen: true, isDialogueOpen: false });
  },

  closeShop: () => {
    console.log('[NpcStore] 关闭商店面板');
    set({
      isShopOpen: false,
      merchantItems: [],
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    console.error('[NpcStore] 错误:', error);
    set({ error });
  },

  reset: () => {
    console.log('[NpcStore] 重置状态');
    set({
      npcsInRoom: [],
      currentNpc: null,
      currentDialogue: null,
      merchantItems: [],
      isDialogueOpen: false,
      isShopOpen: false,
      isLoading: false,
      error: null,
    });
  },
}));
