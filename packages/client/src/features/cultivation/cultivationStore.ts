/**
 * 修炼系统状态管理
 *
 * 使用 Zustand 管理修炼数据、打坐状态、突破状态等
 */

import { create } from 'zustand'
import type { CultivationData, MeditationState, BreakthroughState } from './types'

/**
 * 修炼系统 Store 状态接口
 */
interface CultivationStore extends CultivationData, MeditationState, BreakthroughState {
  // UI 状态
  isPanelOpen: boolean

  // Actions
  openPanel: () => void
  closePanel: () => void
  startMeditation: () => void
  stopMeditation: () => void
  attemptBreakthrough: (useItems?: number[]) => void
  updateCultivationData: (data: Partial<CultivationStore>) => void
  resetStore: () => void
}

/**
 * 初始状态
 */
const initialState = {
  // 修炼数据
  realm: '练气期',
  realmLevel: 1,
  cultivationExp: 0,
  requiredExp: 1000,
  stability: 100,
  lifespan: 120,
  maxLifespan: 120,
  daoHeart: 50,

  // 打坐状态
  isMeditating: false,
  meditationStartTime: null,
  expPerSecond: 0,

  // 突破状态
  isBreakthroughInProgress: false,
  breakthroughProgress: 0,

  // UI 状态
  isPanelOpen: false,
}

/**
 * 修炼系统状态管理 Store
 */
export const useCultivationStore = create<CultivationStore>((set) => ({
  ...initialState,

  // UI Actions
  openPanel: () => {
    console.log('[CultivationStore] 打开修炼面板')
    set({ isPanelOpen: true })
  },

  closePanel: () => {
    console.log('[CultivationStore] 关闭修炼面板')
    set({ isPanelOpen: false })
  },

  // 打坐 Actions
  startMeditation: () => {
    console.log('[CultivationStore] 发送打坐命令')
    // 注意：这里只是发送命令，实际状态更新由 WebSocket 监听器处理
    // 需要通过 gameClient 发送命令（在 WebSocket 监听器文件中处理）
    set({
      isMeditating: true,
      meditationStartTime: Date.now(),
    })
  },

  stopMeditation: () => {
    console.log('[CultivationStore] 发送停止打坐命令')
    // 注意：这里只是发送命令，实际状态更新由 WebSocket 监听器处理
    set({
      isMeditating: false,
      meditationStartTime: null,
      expPerSecond: 0,
    })
  },

  // 突破 Actions
  attemptBreakthrough: (useItems: number[] = []) => {
    console.log('[CultivationStore] 尝试突破，使用物品:', useItems)
    // 注意：这里只是更新本地状态，实际突破请求由 WebSocket 监听器处理
    set({
      isBreakthroughInProgress: true,
      breakthroughProgress: 0,
    })
  },

  // 数据更新
  updateCultivationData: (data: Partial<CultivationStore>) => {
    console.log('[CultivationStore] 更新修炼数据:', data)
    set(data)
  },

  // 重置状态（登出时调用）
  resetStore: () => {
    console.log('[CultivationStore] 重置修炼状态')
    set(initialState)
  },
}))

/**
 * 辅助函数：获取修炼进度百分比
 */
export function getCultivationProgress(): number {
  const { cultivationExp, requiredExp } = useCultivationStore.getState()
  if (requiredExp === 0) return 0
  return Math.min((cultivationExp / requiredExp) * 100, 100)
}

/**
 * 辅助函数：获取打坐持续时间（秒）
 */
export function getMeditationDuration(): number {
  const { isMeditating, meditationStartTime } = useCultivationStore.getState()
  if (!isMeditating || !meditationStartTime) return 0
  return Math.floor((Date.now() - meditationStartTime) / 1000)
}

/**
 * 辅助函数：格式化境界显示
 */
export function formatRealmDisplay(): string {
  const { realm, realmLevel } = useCultivationStore.getState()
  return `${realm} ${realmLevel}层`
}

/**
 * 辅助函数：格式化寿命显示
 */
export function formatLifespanDisplay(): string {
  const { lifespan, maxLifespan } = useCultivationStore.getState()
  return `${lifespan}/${maxLifespan}年`
}
