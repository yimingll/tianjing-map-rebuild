/**
 * 修炼进度条组件
 *
 * 显示当前修为进度，带有流畅动画效果和中国风样式
 */

import React from 'react'

interface CultivationProgressBarProps {
  /** 当前修为值 */
  current: number
  /** 最大修为值（突破所需） */
  max: number
  /** 是否显示数值文本 */
  showText?: boolean
  /** 自定义类名 */
  className?: string
}

/**
 * 修炼进度条组件
 */
export const CultivationProgressBar: React.FC<CultivationProgressBarProps> = ({
  current,
  max,
  showText = true,
  className = '',
}) => {
  // 计算进度百分比
  const percentage = max === 0 ? 0 : Math.min((current / max) * 100, 100)

  return (
    <div className={`cultivation-progress-bar ${className}`}>
      {/* 进度条容器 */}
      <div className="progress-bar-container">
        {/* 进度条背景 */}
        <div className="progress-bar-background">
          {/* 进度条填充 */}
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          >
            {/* 光晕效果 */}
            <div className="progress-bar-glow" />
          </div>
        </div>

        {/* 进度文本 */}
        {showText && (
          <div className="progress-bar-text">
            <span className="progress-value">
              {current.toLocaleString()} / {max.toLocaleString()}
            </span>
            <span className="progress-percentage">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CultivationProgressBar
