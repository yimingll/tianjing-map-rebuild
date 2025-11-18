/**
 * 突破面板组件
 *
 * 显示突破条件、成功率、道具选择和突破进度
 */

import React, { useState, useMemo } from 'react'
import { useCultivationStore } from './cultivationStore'

/**
 * 突破面板组件
 */
export const BreakthroughPanel: React.FC = () => {
  const {
    cultivationExp,
    requiredExp,
    stability,
    lifespan,
    daoHeart,
    realm,
    realmLevel,
    isBreakthroughInProgress,
    breakthroughProgress,
    attemptBreakthrough,
  } = useCultivationStore()

  // 选中的道具ID列表
  const [selectedItems, setSelectedItems] = useState<number[]>([])

  // 计算突破条件
  const conditions = useMemo(() => ({
    expReached: cultivationExp >= requiredExp,
    stabilityEnough: stability >= 80,
    lifespanSufficient: lifespan > 180, // 3分钟（180秒）
    daoHeartStable: daoHeart >= 30,
  }), [cultivationExp, requiredExp, stability, lifespan, daoHeart])

  // 检查是否满足所有条件
  const canBreakthrough = useMemo(() =>
    Object.values(conditions).every(Boolean),
    [conditions]
  )

  // 计算基础成功率
  const baseSuccessRate = useMemo(() => {
    if (!canBreakthrough) return 0

    let rate = 50 // 基础成功率 50%

    // 稳固度影响：每超过80的1点增加0.5%成功率
    if (stability > 80) {
      rate += (stability - 80) * 0.5
    }

    // 道心影响：每超过30的1点增加0.3%成功率
    if (daoHeart > 30) {
      rate += (daoHeart - 30) * 0.3
    }

    // 修为超出影响：每超过需求10%增加2%成功率
    const expExcess = ((cultivationExp - requiredExp) / requiredExp) * 100
    if (expExcess > 0) {
      rate += Math.floor(expExcess / 10) * 2
    }

    return Math.min(rate, 95) // 最高95%
  }, [canBreakthrough, stability, daoHeart, cultivationExp, requiredExp])

  // 处理突破按钮点击
  const handleBreakthrough = () => {
    if (!canBreakthrough || isBreakthroughInProgress) return
    attemptBreakthrough(selectedItems)
  }

  return (
    <div className="breakthrough-panel">
      {/* 当前境界信息 */}
      <div className="breakthrough-header">
        <h3 className="breakthrough-title">境界突破</h3>
        <div className="current-realm">
          当前: {realm} {realmLevel}层
        </div>
        <div className="next-realm">
          下一层: {realm} {realmLevel + 1}层
        </div>
      </div>

      {/* 突破条件检查 */}
      <div className="breakthrough-conditions">
        <h4 className="conditions-title">突破条件</h4>
        <div className="conditions-list">
          <div className={`condition-item ${conditions.expReached ? 'met' : 'unmet'}`}>
            <span className="condition-icon">
              {conditions.expReached ? '✅' : '❌'}
            </span>
            <span className="condition-label">修为圆满</span>
            <span className="condition-detail">
              {cultivationExp}/{requiredExp}
            </span>
          </div>

          <div className={`condition-item ${conditions.stabilityEnough ? 'met' : 'unmet'}`}>
            <span className="condition-icon">
              {conditions.stabilityEnough ? '✅' : '❌'}
            </span>
            <span className="condition-label">稳固度充足</span>
            <span className="condition-detail">
              {stability.toFixed(1)}% (需≥80%)
            </span>
          </div>

          <div className={`condition-item ${conditions.lifespanSufficient ? 'met' : 'unmet'}`}>
            <span className="condition-icon">
              {conditions.lifespanSufficient ? '✅' : '❌'}
            </span>
            <span className="condition-label">寿元充足</span>
            <span className="condition-detail">
              {lifespan}秒 (需&gt;180秒)
            </span>
          </div>

          <div className={`condition-item ${conditions.daoHeartStable ? 'met' : 'unmet'}`}>
            <span className="condition-icon">
              {conditions.daoHeartStable ? '✅' : '❌'}
            </span>
            <span className="condition-label">道心稳固</span>
            <span className="condition-detail">
              {daoHeart} (需≥30)
            </span>
          </div>
        </div>
      </div>

      {/* 成功率显示 */}
      <div className="success-rate-section">
        <div className="success-rate-label">突破成功率</div>
        <div className={`success-rate-value ${
          baseSuccessRate >= 70 ? 'high' :
          baseSuccessRate >= 50 ? 'medium' : 'low'
        }`}>
          {baseSuccessRate.toFixed(1)}%
        </div>
        {!canBreakthrough && (
          <div className="success-rate-warning">
            未满足突破条件
          </div>
        )}
      </div>

      {/* 辅助道具选择区域（暂时留空，后续可扩展） */}
      <div className="breakthrough-items">
        <h4 className="items-title">辅助道具（可选）</h4>
        <div className="items-placeholder">
          暂无可用道具
        </div>
      </div>

      {/* 突破按钮 */}
      <div className="breakthrough-action">
        <button
          onClick={handleBreakthrough}
          disabled={!canBreakthrough || isBreakthroughInProgress}
          className={`breakthrough-button ${
            isBreakthroughInProgress ? 'in-progress' : ''
          }`}
        >
          {isBreakthroughInProgress ? '突破中...' : '开始突破'}
        </button>
      </div>

      {/* 突破进度条 */}
      {isBreakthroughInProgress && (
        <div className="breakthrough-progress-section">
          <div className="breakthrough-progress-label">
            突破进度
          </div>
          <div className="breakthrough-progress-bar">
            <div
              className="breakthrough-progress-fill"
              style={{ width: `${breakthroughProgress}%` }}
            >
              <div className="breakthrough-progress-glow" />
            </div>
          </div>
          <div className="breakthrough-progress-text">
            {breakthroughProgress.toFixed(0)}%
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <div className="breakthrough-hints">
        {!canBreakthrough && (
          <div className="hint hint-warning">
            请先满足所有突破条件
          </div>
        )}
        {canBreakthrough && !isBreakthroughInProgress && (
          <div className="hint hint-info">
            准备充分，可以尝试突破
          </div>
        )}
        {isBreakthroughInProgress && (
          <div className="hint hint-progress">
            突破中，请勿打扰...
          </div>
        )}
      </div>
    </div>
  )
}

export default BreakthroughPanel
