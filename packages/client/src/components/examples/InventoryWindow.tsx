/**
 * 背包窗口示例
 * 演示如何使用 WindowTemplate 快速创建新窗口
 */

import { useState } from 'react'
import { WindowTemplate } from '../WindowTemplate'
import './InventoryWindow.css'

interface InventoryWindowProps {
  onClose: () => void
}

// 示例：背包物品数据
interface Item {
  id: number
  name: string
  icon: string
  count: number
  description: string
}

export function InventoryWindow({ onClose }: InventoryWindowProps) {
  // 示例数据
  const [items] = useState<Item[]>([
    { id: 1, name: '回灵丹', icon: '💊', count: 99, description: '恢复100点灵力' },
    { id: 2, name: '疗伤药', icon: '🩹', count: 50, description: '恢复150点生命' },
    { id: 3, name: '聚气丹', icon: '✨', count: 20, description: '提升修炼速度' },
    { id: 4, name: '法宝碎片', icon: '💎', count: 5, description: '炼制法宝的材料' },
    { id: 5, name: '灵石', icon: '💰', count: 9999, description: '修仙世界的通用货币' },
  ])

  return (
    <WindowTemplate
      title="【玄鉴仙录·储物袋】"
      subtitle="背包管理"
      onClose={onClose}
      footerHintLeft="ESC 或 点击空白处关闭"
      footerHintRight="点击物品查看详情"
      footerIconLeft="💡"
      footerIconRight="🎒"
    >
      <div className="inventory-content">
        <div className="inventory-header">
          <div className="inventory-stats">
            <span className="stat-item">
              <span className="stat-label">物品数量:</span>
              <span className="stat-value">{items.length} / 100</span>
            </span>
            <span className="stat-divider">|</span>
            <span className="stat-item">
              <span className="stat-label">负重:</span>
              <span className="stat-value">85 / 200</span>
            </span>
          </div>
        </div>

        <div className="inventory-grid">
          {items.map(item => (
            <div key={item.id} className="inventory-item" title={item.description}>
              <div className="item-icon">{item.icon}</div>
              <div className="item-info">
                <div className="item-name">{item.name}</div>
                <div className="item-count">x{item.count}</div>
              </div>
            </div>
          ))}

          {/* 空槽位 */}
          {Array.from({ length: 12 - items.length }).map((_, index) => (
            <div key={`empty-${index}`} className="inventory-item empty">
              <div className="empty-slot">+</div>
            </div>
          ))}
        </div>

        <div className="inventory-footer">
          <button className="mud-btn">整理背包</button>
          <button className="mud-btn mud-btn-primary">使用物品</button>
          <button className="mud-btn mud-btn-danger">丢弃物品</button>
        </div>
      </div>
    </WindowTemplate>
  )
}
