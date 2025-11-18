/**
 * 背包状态管理 - Zustand Store
 */

import { create } from 'zustand'
import { InventoryState, InventoryItemData } from '@/types/inventory'
import { gameClient } from '@/lib/gameClient'

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // 初始状态
  items: [],
  capacity: 20, // 默认容量,会被后端数据覆盖
  isLoading: false,
  error: null,

  // 设置背包物品
  setItems: (items: InventoryItemData[]) => {
    set({ items, error: null })
  },

  // 设置背包容量
  setCapacity: (capacity: number) => {
    set({ capacity })
  },

  // 添加物品
  addItem: (item: InventoryItemData) => {
    set((state) => ({
      items: [...state.items, item],
    }))
  },

  // 移除物品
  removeItem: (instanceId: number) => {
    set((state) => ({
      items: state.items.filter((item) => item.instance_id !== instanceId),
    }))
  },

  // 更新物品
  updateItem: (instanceId: number, updates: Partial<InventoryItemData>) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.instance_id === instanceId ? { ...item, ...updates } : item
      ),
    }))
  },

  // 清空背包
  clearItems: () => {
    set({ items: [] })
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  // 设置错误
  setError: (error: string | null) => {
    set({ error, isLoading: false })
  },

  // 获取指定物品
  getItem: (instanceId: number) => {
    return get().items.find((item) => item.instance_id === instanceId)
  },

  // 按类型获取物品
  getItemsByType: (type: InventoryItemData['item_type']) => {
    return get().items.filter((item) => item.item_type === type)
  },

  // 计算总重量
  getTotalWeight: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0)
  },
}))

// WebSocket消息监听器
export function setupInventoryListeners() {
  console.log('[inventoryStore] 设置背包系统WebSocket监听器')

  // 监听所有消息并处理背包相关的消息
  gameClient.监听消息((消息) => {
    try {
      const content = 消息.内容

      // 检查是否是背包数据消息
      if (消息.类型 === 'inventory_data') {
        console.log('[inventoryStore] 收到背包数据:', content)
        try {
          const data = typeof content === 'string' ? JSON.parse(content) : content
          // 更新物品列表
          useInventoryStore.getState().setItems(data.items || [])
          // 更新容量(如果后端提供了)
          if (data.capacity !== undefined) {
            useInventoryStore.getState().setCapacity(data.capacity)
          }
          useInventoryStore.getState().setLoading(false)
        } catch (error) {
          console.error('[inventoryStore] 解析背包数据失败:', error)
        }
      }

      // 背包更新消息
      if (消息.类型 === 'inventory_updated') {
        console.log('[inventoryStore] 背包更新:', content)
        // 刷新背包数据
        gameClient.发送命令('inventory')
      }

      // 物品添加消息
      if (消息.类型 === 'item_added') {
        console.log('[inventoryStore] 物品添加:', content)
        try {
          const data = typeof content === 'string' ? JSON.parse(content) : content
          if (data.item) {
            useInventoryStore.getState().addItem(data.item)
          }
        } catch (error) {
          console.error('[inventoryStore] 解析物品添加数据失败:', error)
        }
      }

      // 物品移除消息
      if (消息.类型 === 'item_removed') {
        console.log('[inventoryStore] 物品移除:', content)
        try {
          const data = typeof content === 'string' ? JSON.parse(content) : content
          if (data.instance_id) {
            useInventoryStore.getState().removeItem(data.instance_id)
          }
        } catch (error) {
          console.error('[inventoryStore] 解析物品移除数据失败:', error)
        }
      }
    } catch (error) {
      console.error('[inventoryStore] 处理消息时出错:', error)
    }
  })
}
