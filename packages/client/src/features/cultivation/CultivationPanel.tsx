/**
 * 修炼主面板组件
 *
 * 集成打坐界面和突破面板，提供 Tab 切换
 */

import React, { useState } from 'react'
import { useCultivationStore } from './cultivationStore'
import { MeditationView } from './MeditationView'
import { BreakthroughPanel } from './BreakthroughPanel'
import './cultivation.css'

/**
 * Tab 类型
 */
type TabType = 'meditation' | 'breakthrough'

/**
 * 修炼主面板组件
 */
export const CultivationPanel: React.FC = () => {
  const { isPanelOpen, closePanel, realm, realmLevel } = useCultivationStore()

  // 当前激活的 Tab
  const [activeTab, setActiveTab] = useState<TabType>('meditation')

  // 如果面板未打开，不渲染
  if (!isPanelOpen) {
    return null
  }

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="cultivation-panel-overlay"
        onClick={closePanel}
      />

      {/* 主面板 */}
      <div className="cultivation-panel">
        {/* 面板头部 */}
        <div className="cultivation-panel-header">
          <div className="panel-header-title">
            <h2 className="panel-title">修炼系统</h2>
            <div className="panel-subtitle">
              {realm} {realmLevel}层
            </div>
          </div>

          {/* 关闭按钮 */}
          <button
            className="panel-close-button"
            onClick={closePanel}
            aria-label="关闭面板"
          >
            ✕
          </button>
        </div>

        {/* Tab 切换栏 */}
        <div className="cultivation-panel-tabs">
          <button
            className={`tab-button ${activeTab === 'meditation' ? 'active' : ''}`}
            onClick={() => setActiveTab('meditation')}
          >
            <span className="tab-icon">🧘</span>
            <span className="tab-label">打坐修炼</span>
          </button>

          <button
            className={`tab-button ${activeTab === 'breakthrough' ? 'active' : ''}`}
            onClick={() => setActiveTab('breakthrough')}
          >
            <span className="tab-icon">⚡</span>
            <span className="tab-label">境界突破</span>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="cultivation-panel-content">
          {activeTab === 'meditation' && <MeditationView />}
          {activeTab === 'breakthrough' && <BreakthroughPanel />}
        </div>

        {/* 面板底部装饰 */}
        <div className="cultivation-panel-footer">
          <div className="panel-footer-decoration" />
        </div>
      </div>
    </>
  )
}

export default CultivationPanel
