/**
 * 功法卡片组件
 *
 * 显示单个功法的详细信息，包括品质、属性加成和特殊效果
 */

import React from 'react'
import './technique.css'

/**
 * 功法品质类型
 */
export type TechniqueQuality = '凡品' | '灵品' | '地品' | '天品' | '仙品' | '神品'

/**
 * 功法类型
 */
export type TechniqueType = '修炼' | '战斗' | '辅助' | '身法' | '炼丹' | '炼器'

/**
 * 属性加成
 */
export interface AttributeBonus {
  constitution?: number   // 体质
  strength?: number       // 力量
  agility?: number        // 敏捷
  spirit_root?: number    // 灵根
  comprehension?: number  // 悟性
  luck?: number          // 气运
}

/**
 * 特殊效果
 */
export interface SpecialEffect {
  name: string
  description: string
  value: number
  type: string
}

/**
 * 功法接口
 */
export interface Technique {
  id: number
  name: string
  quality: TechniqueQuality
  type: TechniqueType
  description: string
  cultivation_speed: number
  attribute_bonus?: AttributeBonus
  special_effects?: SpecialEffect[]
  required_realm: string
  cost: number
  level?: number              // 当前等级
  is_learned?: boolean        // 是否已学习
  is_current?: boolean        // 是否为当前功法
  switch_cooldown?: number    // 切换冷却（天）
}

/**
 * TechniqueCard 组件属性
 */
interface TechniqueCardProps {
  technique: Technique
  onLearn?: (id: number) => void
  onSwitch?: (id: number) => void
  onUpgrade?: (id: number) => void
  disabled?: boolean
}

/**
 * 根据品质获取颜色类名
 */
const getQualityClass = (quality: TechniqueQuality): string => {
  switch (quality) {
    case '凡品': return 'quality-mortal'
    case '灵品': return 'quality-spirit'
    case '地品': return 'quality-earth'
    case '天品': return 'quality-heaven'
    case '仙品': return 'quality-immortal'
    case '神品': return 'quality-divine'
    default: return 'quality-mortal'
  }
}

/**
 * 格式化属性加成显示
 */
const formatAttributeBonus = (bonus?: AttributeBonus): string[] => {
  if (!bonus) return []

  const result: string[] = []
  if (bonus.constitution) result.push(`体质 +${bonus.constitution}`)
  if (bonus.strength) result.push(`力量 +${bonus.strength}`)
  if (bonus.agility) result.push(`敏捷 +${bonus.agility}`)
  if (bonus.spirit_root) result.push(`灵根 +${bonus.spirit_root}`)
  if (bonus.comprehension) result.push(`悟性 +${bonus.comprehension}`)
  if (bonus.luck) result.push(`气运 +${bonus.luck}`)

  return result
}

/**
 * 功法卡片组件
 */
export const TechniqueCard: React.FC<TechniqueCardProps> = ({
  technique,
  onLearn,
  onSwitch,
  onUpgrade,
  disabled = false
}) => {
  const qualityClass = getQualityClass(technique.quality)
  const attributeBonuses = formatAttributeBonus(technique.attribute_bonus)

  return (
    <div className={`technique-card ${qualityClass} ${technique.is_current ? 'current' : ''} ${disabled ? 'disabled' : ''}`}>
      {/* 功法头部 */}
      <div className="technique-card-header">
        <div className="technique-name-row">
          <h3 className="technique-name">{technique.name}</h3>
          {technique.is_current && (
            <span className="current-badge">当前</span>
          )}
        </div>
        <div className="technique-meta">
          <span className={`technique-quality ${qualityClass}`}>{technique.quality}</span>
          <span className="technique-type">{technique.type}</span>
          {technique.level && technique.level > 1 && (
            <span className="technique-level">Lv.{technique.level}</span>
          )}
        </div>
      </div>

      {/* 修炼速度 */}
      <div className="technique-speed">
        <span className="speed-label">修炼速度:</span>
        <span className="speed-value">{technique.cultivation_speed.toFixed(1)}x</span>
        {technique.level && technique.level > 1 && (
          <span className="speed-bonus">
            (+{((technique.level - 1) * 5).toFixed(0)}%)
          </span>
        )}
      </div>

      {/* 功法描述 */}
      <p className="technique-description">{technique.description}</p>

      {/* 属性加成 */}
      {attributeBonuses.length > 0 && (
        <div className="technique-attributes">
          <div className="attribute-label">属性加成:</div>
          <div className="attribute-list">
            {attributeBonuses.map((bonus, index) => (
              <span key={index} className="attribute-item">{bonus}</span>
            ))}
          </div>
        </div>
      )}

      {/* 特殊效果 */}
      {technique.special_effects && technique.special_effects.length > 0 && (
        <div className="technique-effects">
          <div className="effects-label">特殊效果:</div>
          <ul className="effects-list">
            {technique.special_effects.map((effect, index) => (
              <li key={index} className="effect-item">
                <span className="effect-name">{effect.name}:</span>
                <span className="effect-description">{effect.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 需求信息 */}
      <div className="technique-requirements">
        <div className="requirement-item">
          <span className="requirement-label">需求境界:</span>
          <span className="requirement-value">{technique.required_realm}</span>
        </div>
        {technique.cost > 0 && (
          <div className="requirement-item">
            <span className="requirement-label">消耗:</span>
            <span className="requirement-value cost">{technique.cost} 灵石</span>
          </div>
        )}
        {technique.switch_cooldown !== undefined && technique.switch_cooldown > 0 && (
          <div className="requirement-item cooldown">
            <span className="requirement-label">切换冷却:</span>
            <span className="requirement-value">{technique.switch_cooldown.toFixed(1)} 天</span>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="technique-actions">
        {!technique.is_learned && onLearn && (
          <button
            className="technique-button learn"
            onClick={() => onLearn(technique.id)}
            disabled={disabled}
          >
            学习功法
          </button>
        )}

        {technique.is_learned && !technique.is_current && onSwitch && (
          <button
            className="technique-button switch"
            onClick={() => onSwitch(technique.id)}
            disabled={disabled || (technique.switch_cooldown !== undefined && technique.switch_cooldown > 0)}
          >
            {technique.switch_cooldown !== undefined && technique.switch_cooldown > 0
              ? `冷却中 (${technique.switch_cooldown.toFixed(1)}天)`
              : '切换功法'}
          </button>
        )}

        {technique.is_current && onUpgrade && (
          <button
            className="technique-button upgrade"
            onClick={() => onUpgrade(technique.id)}
            disabled={disabled}
          >
            升级功法
          </button>
        )}
      </div>
    </div>
  )
}
