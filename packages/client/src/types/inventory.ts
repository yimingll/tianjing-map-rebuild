/**
 * 背包系统类型定义
 */

export interface InventoryItemData {
  instance_id: number
  item_id: number
  item_name: string
  item_type: 'equipment' | 'consumable' | 'material' | 'quest' | 'other'
  quantity: number
  quality?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  icon_url?: string
  description?: string
  attributes?: string // JSON字符串
  slot_type?: string // 装备专用:槽位类型
  level_requirement?: number
  created_at: string
}

export interface InventoryState {
  items: InventoryItemData[]
  capacity: number
  isLoading: boolean
  error: string | null

  // 操作
  setItems: (items: InventoryItemData[]) => void
  setCapacity: (capacity: number) => void
  addItem: (item: InventoryItemData) => void
  removeItem: (instanceId: number) => void
  updateItem: (instanceId: number, updates: Partial<InventoryItemData>) => void
  clearItems: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // 查询
  getItem: (instanceId: number) => InventoryItemData | undefined
  getItemsByType: (type: InventoryItemData['item_type']) => InventoryItemData[]
  getTotalWeight: () => number
}
