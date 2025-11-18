/**
 * 境界显示组件（小挂件）
 *
 * 显示当前境界、层级和修为进度
 * 点击可打开修炼面板
 */

import React from 'react'
import { useCultivationStore } from './cultivationStore'
import { CultivationProgressBar } from './CultivationProgressBar'

/**
 * 境界显示小挂件组件
 */
export const RealmDisplay: React.FC = () => {
  const {
    realm,
    realmLevel,
    cultivationExp,
    requiredExp,
    isMeditating,
    openPanel,
  } = useCultivationStore()

  // 计算进度百分比
  const percentage = requiredExp === 0 ? 0 : Math.min((cultivationExp / requiredExp) * 100, 100)

  return (
    <div
      className="realm-display-widget"
      onClick={openPanel}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          openPanel()
        }
      }}
    >
      {/* 境界名称和层级 */}
      <div className="realm-info">
        <span className="realm-name">{realm}</span>
        <span className="realm-level">{realmLevel}层</span>
      </div>

      {/* 修为进度条 */}
      <div className="realm-progress">
        <CultivationProgressBar
          current={cultivationExp}
          max={requiredExp}
          showText={false}
          className="realm-progress-bar"
        />
        <span className="realm-progress-text">
          {percentage.toFixed(0)}%
        </span>
      </div>

      {/* 打坐状态指示器 */}
      {isMeditating && (
        <div className="meditation-indicator">
          <span className="meditation-dot" />
          <span className="meditation-text">修炼中</span>
        </div>
      )}

      {/* 提示文本 */}
      <div className="realm-display-hint">点击查看详情</div>
    </div>
  )
}

export default RealmDisplay
