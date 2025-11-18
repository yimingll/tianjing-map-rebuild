/**
 * 角色属性状态管理
 *
 * 使用 Zustand 管理角色属性数据
 */

import { create } from 'zustand'
import type { CharacterAttributes, CharacterAttributesDisplay } from '../../types/character'

interface CharacterStore {
  // 状态
  attributes: CharacterAttributes | null
  isLoading: boolean
  lastUpdateTime: number | null

  // Actions
  updateAttributes: (attrs: CharacterAttributes) => void
  clearAttributes: () => void
  getDisplayAttributes: () => CharacterAttributesDisplay | null
}

export const useCharacterStore = create<CharacterStore>((set, get) => ({
  // 初始状态
  attributes: null,
  isLoading: false,
  lastUpdateTime: null,

  // 更新角色属性
  updateAttributes: (attrs: CharacterAttributes) => {
    console.log('[CharacterStore] 更新角色属性:', attrs)
    set({
      attributes: attrs,
      isLoading: false,
      lastUpdateTime: Date.now(),
    })
  },

  // 清空角色属性（登出时调用）
  clearAttributes: () => {
    console.log('[CharacterStore] 清空角色属性')
    set({
      attributes: null,
      isLoading: false,
      lastUpdateTime: null,
    })
  },

  // 获取用于显示的属性（包含计算值）
  getDisplayAttributes: (): CharacterAttributesDisplay | null => {
    const { attributes } = get()
    if (!attributes) return null

    // 计算百分比
    const hpPercentage = (attributes.hp / attributes.max_hp) * 100
    const mpPercentage = (attributes.mp / attributes.max_mp) * 100

    // 解析灵根数组
    let spiritRootsList: string[] = []
    try {
      spiritRootsList = JSON.parse(attributes.spirit_roots || '[]')
    } catch (error) {
      console.error('解析灵根数据失败:', error)
      spiritRootsList = []
    }

    return {
      ...attributes,
      hpPercentage,
      mpPercentage,
      spiritRootsList,
    }
  },
}))

/**
 * 辅助函数：从 character_update 消息解析属性
 */
export function parseCharacterUpdate(content: string): CharacterAttributes | null {
  try {
    const attrs = JSON.parse(content) as CharacterAttributes
    console.log('[CharacterStore] 解析角色数据成功:', attrs)
    return attrs
  } catch (error) {
    console.error('[CharacterStore] 解析角色数据失败:', error, content)
    return null
  }
}
