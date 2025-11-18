/**
 * 战斗系统 Zustand 状态管理
 */

import { create } from 'zustand';
import type { CombatState, MonsterDefinition } from './types';

interface CombatStore {
  // 当前战斗状态
  currentCombat: CombatState | null;

  // 是否打开战斗面板
  isCombatPanelOpen: boolean;

  // 怪物列表
  monsters: MonsterDefinition[];

  // 战斗日志
  combatLog: string[];

  // 行动方法
  setCurrentCombat: (combat: CombatState | null) => void;
  openCombatPanel: () => void;
  closeCombatPanel: () => void;
  addCombatLog: (log: string) => void;
  clearCombatLog: () => void;
  setMonsters: (monsters: MonsterDefinition[]) => void;
}

export const useCombatStore = create<CombatStore>((set) => ({
  currentCombat: null,
  isCombatPanelOpen: false,
  monsters: [],
  combatLog: [],

  setCurrentCombat: (combat) => set({ currentCombat: combat }),

  openCombatPanel: () => set({ isCombatPanelOpen: true }),

  closeCombatPanel: () => set({
    isCombatPanelOpen: false,
    currentCombat: null,
    combatLog: [],
  }),

  addCombatLog: (log) => set((state) => ({
    combatLog: [...state.combatLog, log],
  })),

  clearCombatLog: () => set({ combatLog: [] }),

  setMonsters: (monsters) => set({ monsters }),
}));
