/**
 * 背包物品组件
 * 支持装备拖拽、右键菜单、品质显示、装备对比
 */

import React, { useState, useRef, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { InventoryItemData } from '@/types/inventory'
import { useEquipmentStore } from '@/features/equipment/equipmentStore'
import { EquipmentCompareTooltip } from '@/features/equipment/EquipmentCompareTooltip'
import { SlotType } from '@/types/equipment'
import './InventoryItem.css'

interface InventoryItemProps {
  item: InventoryItemData
  onUse?: (itemId: number) => void
  onDrop?: (itemId: number) => void
}

export const InventoryItem: React.FC<InventoryItemProps> = ({
  item,
  onUse,
  onDrop
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const { equipItem, getEquippedItem } = useEquipmentStore()
  const menuRef = useRef<HTMLDivElement>(null)

  // 拖拽源
  const [{ isDragging }, drag] = useDrag({
    type: 'INVENTORY_ITEM',
    item: () => ({
      instance_id: item.instance_id,
      item_type: item.item_type,
      slot_type: item.slot_type, // 装备才有此字段
      item_name: item.item_name,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowContextMenu(true)
  }

  const handleEquip = () => {
    if (item.item_type === 'equipment') {
      equipItem(item.instance_id)
    }
    setShowContextMenu(false)
  }

  const handleUse = () => {
    onUse?.(item.instance_id)
    setShowContextMenu(false)
  }

  const handleDrop = () => {
    onDrop?.(item.instance_id)
    setShowContextMenu(false)
  }

  const qualityClass = item.quality || 'common'
  const isEquipment = item.item_type === 'equipment'

  // 获取当前槽位的装备(用于对比)
  const currentEquipped = isEquipment && item.slot_type
    ? getEquippedItem(item.slot_type as SlotType)
    : undefined

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowContextMenu(false)
      }
    }

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showContextMenu])

  return (
    <div
      ref={drag}
      className={`inventory-item quality-${qualityClass} ${isDragging ? 'dragging' : ''}`}
      onContextMenu={handleRightClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="item-icon">
        {item.icon_url ? (
          <img src={item.icon_url} alt={item.item_name} />
        ) : (
          <div className="item-icon-text">{getItemIcon(item.item_type)}</div>
        )}
      </div>

      <div className="item-info">
        <div className="item-name">{item.item_name}</div>
        {item.quantity > 1 && (
          <div className="item-quantity">x{item.quantity}</div>
        )}
      </div>

      <div className="quality-indicator" />

      {/* 右键菜单 */}
      {showContextMenu && (
        <div ref={menuRef} className="context-menu">
          {isEquipment && (
            <button className="menu-item equip" onClick={handleEquip}>
              穿戴
            </button>
          )}
          {onUse && !isEquipment && (
            <button className="menu-item use" onClick={handleUse}>
              使用
            </button>
          )}
          {onDrop && (
            <button className="menu-item drop" onClick={handleDrop}>
              丢弃
            </button>
          )}
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="item-tooltip">
          {isEquipment && currentEquipped ? (
            <EquipmentCompareTooltip
              newItem={item}
              currentItem={currentEquipped}
            />
          ) : (
            <div className="simple-tooltip">
              <h4 className={`quality-${qualityClass}`}>{item.item_name}</h4>
              {item.description && <p className="description">{item.description}</p>}
              {item.level_requirement && (
                <p className="requirement">需求等级: {item.level_requirement}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getItemIcon(type: string): string {
  const iconMap: Record<string, string> = {
    equipment: '⚔️',
    consumable: '💊',
    material: '📦',
    quest: '📜',
    other: '❓',
  }
  return iconMap[type] || '❓'
}
