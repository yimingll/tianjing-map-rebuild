/**
 * 功法面板组件
 *
 * 显示已学习和可学习的功法，支持学习、切换和升级操作
 */

import React, { useState, useEffect } from 'react'
import { TechniqueCard, Technique } from './TechniqueCard'
import { useCultivationStore } from './cultivationStore'
import './technique.css'

/**
 * Tab 类型
 */
type TechniqueTabType = 'current' | 'available' | 'all'

/**
 * 功法面板组件
 */
export const TechniquePanel: React.FC = () => {
  const { realm } = useCultivationStore()

  // 当前激活的 Tab
  const [activeTab, setActiveTab] = useState<TechniqueTabType>('current')

  // 功法列表（这里使用模拟数据，实际应该从后端API获取）
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [currentTechnique, setCurrentTechnique] = useState<Technique | null>(null)

  // 模拟从后端加载功法数据
  useEffect(() => {
    loadTechniques()
  }, [realm])

  /**
   * 加载功法列表
   */
  const loadTechniques = () => {
    // 这里应该调用 API 获取功法列表
    // 临时使用模拟数据
    const mockTechniques: Technique[] = [
      {
        id: 1,
        name: '《基础吐纳术》',
        quality: '凡品',
        type: '修炼',
        description: '最基础的修炼功法，新手村长赠送。虽然平凡，但也是踏入修仙之路的第一步。',
        cultivation_speed: 1.0,
        attribute_bonus: {
          constitution: 5,
          strength: 5,
          agility: 5,
          spirit_root: 5,
          comprehension: 5,
          luck: 5
        },
        required_realm: '练气期',
        cost: 0,
        is_learned: true,
        is_current: true,
        level: 1
      },
      {
        id: 2,
        name: '《青木长生功》',
        quality: '灵品',
        type: '修炼',
        description: '木属性功法，注重生命力和恢复能力。修炼此功法者寿元绵长，境界稳固。',
        cultivation_speed: 1.5,
        attribute_bonus: {
          constitution: 15,
          spirit_root: 10,
          comprehension: 10,
          luck: 5
        },
        special_effects: [
          { name: '生命恢复', description: '每小时恢复5%最大生命值', value: 0.05, type: 'regeneration' },
          { name: '寿元加成', description: '最大寿元+10%', value: 0.10, type: 'lifespan' }
        ],
        required_realm: '练气期',
        cost: 1000,
        is_learned: false
      },
      {
        id: 6,
        name: '《玄天真经》',
        quality: '天品',
        type: '修炼',
        description: '玄天宗传承千年的核心功法，包罗万象，阴阳调和。修炼此功法者进境神速，根基稳固。',
        cultivation_speed: 2.5,
        attribute_bonus: {
          constitution: 30,
          spirit_root: 40,
          comprehension: 30,
          luck: 20
        },
        special_effects: [
          { name: '突破加成', description: '突破成功率+10%', value: 0.10, type: 'breakthrough' },
          { name: '境界稳固', description: '稳定度每日额外恢复15点', value: 15, type: 'stability' },
          { name: '悟性提升', description: '领悟技能速度+20%', value: 0.20, type: 'comprehension' }
        ],
        required_realm: '筑基期',
        cost: 10000,
        is_learned: false
      },
      {
        id: 9,
        name: '《无极剑典》',
        quality: '仙品',
        type: '战斗',
        description: '剑仙传承，万剑之源。修炼此功法者，人剑合一，一剑破万法。据传修至圆满可御剑飞行，剑气纵横三万里。',
        cultivation_speed: 2.8,
        attribute_bonus: {
          spirit_root: 50,
          agility: 40,
          comprehension: 40,
          strength: 30,
          luck: 20
        },
        special_effects: [
          { name: '剑意加持', description: '剑类武器攻击力+60%', value: 0.60, type: 'weapon_bonus' },
          { name: '人剑合一', description: '战斗中有20%概率进入剑意状态，伤害翻倍', value: 0.20, type: 'sword_intent' },
          { name: '破法', description: '无视敌人30%防御', value: 0.30, type: 'penetration' },
          { name: '御剑飞行', description: '可以御剑飞行，移动速度+100%', value: 1.00, type: 'flight' }
        ],
        required_realm: '元婴期',
        cost: 30000,
        is_learned: false
      }
    ]

    setTechniques(mockTechniques)
    setCurrentTechnique(mockTechniques.find(t => t.is_current) || null)
  }

  /**
   * 学习功法
   */
  const handleLearnTechnique = (id: number) => {
    console.log('学习功法:', id)
    // TODO: 调用后端 API
    // await api.learnTechnique(id)
    // loadTechniques()
  }

  /**
   * 切换功法
   */
  const handleSwitchTechnique = (id: number) => {
    console.log('切换功法:', id)
    // TODO: 调用后端 API
    // await api.switchTechnique(id)
    // loadTechniques()
  }

  /**
   * 升级功法
   */
  const handleUpgradeTechnique = (id: number) => {
    console.log('升级功法:', id)
    // TODO: 调用后端 API
    // await api.upgradeTechnique(id)
    // loadTechniques()
  }

  /**
   * 过滤功法列表
   */
  const getFilteredTechniques = (): Technique[] => {
    switch (activeTab) {
      case 'current':
        return currentTechnique ? [currentTechnique] : []
      case 'available':
        return techniques.filter(t => !t.is_learned)
      case 'all':
        return techniques
      default:
        return []
    }
  }

  const filteredTechniques = getFilteredTechniques()

  return (
    <div className="technique-panel">
      {/* 面板头部 */}
      <div className="technique-panel-header">
        <h2 className="panel-title">
          <span className="title-icon">📖</span>
          功法系统
        </h2>
        <div className="panel-subtitle">
          修炼速度决定你的进境快慢
        </div>
      </div>

      {/* Tab 切换栏 */}
      <div className="technique-panel-tabs">
        <button
          className={`tab-button ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          <span className="tab-icon">⭐</span>
          <span className="tab-label">当前功法</span>
        </button>

        <button
          className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          <span className="tab-icon">📚</span>
          <span className="tab-label">可学习</span>
          {techniques.filter(t => !t.is_learned).length > 0 && (
            <span className="tab-badge">{techniques.filter(t => !t.is_learned).length}</span>
          )}
        </button>

        <button
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <span className="tab-icon">📜</span>
          <span className="tab-label">全部功法</span>
        </button>
      </div>

      {/* 功法列表 */}
      <div className="technique-panel-content">
        {filteredTechniques.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌟</div>
            <div className="empty-text">
              {activeTab === 'current' && '尚未学习任何功法'}
              {activeTab === 'available' && '暂无可学习的功法'}
              {activeTab === 'all' && '功法列表为空'}
            </div>
            {activeTab === 'current' && (
              <button
                className="empty-action"
                onClick={() => setActiveTab('available')}
              >
                查看可学习功法
              </button>
            )}
          </div>
        ) : (
          <div className="technique-grid">
            {filteredTechniques.map(technique => (
              <TechniqueCard
                key={technique.id}
                technique={technique}
                onLearn={handleLearnTechnique}
                onSwitch={handleSwitchTechnique}
                onUpgrade={handleUpgradeTechnique}
              />
            ))}
          </div>
        )}
      </div>

      {/* 面板底部信息 */}
      <div className="technique-panel-footer">
        <div className="footer-info">
          <div className="info-item">
            <span className="info-icon">⚠️</span>
            <span className="info-text">切换功法将损失5%修为，稳定度-10%</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⏰</span>
            <span className="info-text">切换功法后需等待7天才能再次切换</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⬆️</span>
            <span className="info-text">升级功法可获得额外修炼速度加成（每级+5%）</span>
          </div>
        </div>
      </div>
    </div>
  )
}
