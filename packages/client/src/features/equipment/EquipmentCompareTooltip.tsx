/**
 * 装备对比 Tooltip 组件
 * 显示背包装备与当前已穿戴装备的属性对比
 */

import React from 'react'
import { InventoryItemData } from '@/types/inventory'
import { EquippedItem } from '@/types/equipment'
import './EquipmentCompareTooltip.css'

interface EquipmentCompareTooltipProps {
  newItem: InventoryItemData
  currentItem: EquippedItem
}

export const EquipmentCompareTooltip: React.FC<EquipmentCompareTooltipProps> = ({
  newItem,
  currentItem,
}) => {
  // 解析新装备属性(从Item.Attributes JSON)
  const newAttrs = parseEquipmentAttributes(newItem.attributes || '{}')
  const currentAttrs = currentItem.attributes

  // 获取所有属性的并集
  const allAttrs = new Set([...Object.keys(newAttrs), ...Object.keys(currentAttrs)])

  return (
    <div className="equipment-compare-tooltip">
      {/* 新装备 */}
      <div className="compare-section new-item">
        <h4 className={`quality-${newItem.quality || 'common'}`}>
          {newItem.item_name}
          <span className="quality-badge">{formatQuality(newItem.quality || 'common')}</span>
        </h4>
        <div className="attributes">
          {Array.from(allAttrs).map((attr) => {
            const newValue = newAttrs[attr] || 0
            const currentValue = currentAttrs[attr] || 0
            const diff = newValue - currentValue

            return (
              <div key={attr} className="attribute-line">
                <span className="attr-name">{formatAttributeName(attr)}</span>
                <span className="attr-value">
                  +{newValue}
                  {diff !== 0 && (
                    <span className={diff > 0 ? 'diff-positive' : 'diff-negative'}>
                      ({diff > 0 ? '+' : ''}{diff})
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="compare-divider">⚔</div>

      {/* 当前装备 */}
      <div className="compare-section current-item">
        <h4 className={`quality-${currentItem.quality}`}>
          {currentItem.item_name}
          <span className="quality-badge">{formatQuality(currentItem.quality)}</span>
        </h4>
        <div className="attributes">
          {Array.from(allAttrs).map((attr) => {
            const value = currentAttrs[attr] || 0
            return (
              <div key={attr} className="attribute-line">
                <span className="attr-name">{formatAttributeName(attr)}</span>
                <span className="attr-value">+{value}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function parseEquipmentAttributes(attributesJson: string): Record<string, number> {
  try {
    const parsed = JSON.parse(attributesJson)
    return parsed.equipment?.base_attributes || {}
  } catch {
    return {}
  }
}

function formatAttributeName(attr: string): string {
  const nameMap: Record<string, string> = {
    physical_attack: '物理攻击',
    physical_defense: '物理防御',
    magic_attack: '法术攻击',
    magic_defense: '法术防御',
    max_hp: '生命上限',
    max_mp: '真元上限',
    critical_rate: '暴击率',
    critical_damage: '暴击伤害',
    dodge_rate: '闪避率',
    hit_rate: '命中率',
    attack_speed: '攻击速度',
    move_speed: '移动速度',
  }
  return nameMap[attr] || attr
}

function formatQuality(quality: string): string {
  const qualityMap: Record<string, string> = {
    common: '普通',
    uncommon: '优秀',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  }
  return qualityMap[quality] || quality
}
