/**
 * 打坐界面组件
 *
 * 显示打坐状态、修为进度、实时修为增长等
 */

import React, { useEffect, useState } from 'react'
import { useCultivationStore } from './cultivationStore'
import { CultivationProgressBar } from './CultivationProgressBar'

/**
 * 打坐界面组件
 */
export const MeditationView: React.FC = () => {
  const {
    isMeditating,
    cultivationExp,
    requiredExp,
    expPerSecond,
    realm,
    realmLevel,
    stability,
    startMeditation,
    stopMeditation,
  } = useCultivationStore()

  // 打坐持续时间（秒）
  const [duration, setDuration] = useState(0)

  // 计时器：更新打坐持续时间
  useEffect(() => {
    if (!isMeditating) {
      setDuration(0)
      return
    }

    const timer = setInterval(() => {
      setDuration((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [isMeditating])

  // 格式化打坐时长
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}时${minutes}分${secs}秒`
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`
    } else {
      return `${secs}秒`
    }
  }

  // 判断是否可以开始打坐
  const canStartMeditation = !isMeditating && cultivationExp < requiredExp

  return (
    <div className="meditation-view">
      {/* 境界信息 */}
      <div className="meditation-realm-info">
        <h3 className="meditation-realm-title">
          {realm} {realmLevel}层
        </h3>
        <div className="meditation-stability">
          稳固度: {stability.toFixed(1)}%
        </div>
      </div>

      {/* 角色动画区域 */}
      <div className="character-animation">
        <div className={`character-pose ${isMeditating ? 'meditating' : 'idle'}`}>
          {/* 简化的角色图标 */}
          <div className="character-icon">
            {isMeditating ? '🧘' : '🚶'}
          </div>

          {/* 打坐光环效果 */}
          {isMeditating && (
            <>
              <div className="meditation-aura aura-1" />
              <div className="meditation-aura aura-2" />
              <div className="meditation-aura aura-3" />
            </>
          )}
        </div>
      </div>

      {/* 修为显示区域 */}
      <div className="exp-display">
        <div className="exp-label">修为进度</div>
        <CultivationProgressBar
          current={cultivationExp}
          max={requiredExp}
          showText={true}
        />
      </div>

      {/* 实时修为增长显示 */}
      {isMeditating && expPerSecond > 0 && (
        <div className="exp-gain-effect">
          <span className="exp-gain-value">+{expPerSecond}</span>
          <span className="exp-gain-unit">/秒</span>
        </div>
      )}

      {/* 打坐时长显示 */}
      {isMeditating && (
        <div className="meditation-duration">
          打坐时长: {formatDuration(duration)}
        </div>
      )}

      {/* 打坐控制按钮 */}
      <div className="meditation-controls">
        {!isMeditating ? (
          <button
            onClick={startMeditation}
            disabled={!canStartMeditation}
            className="meditation-button start-button"
          >
            开始打坐
          </button>
        ) : (
          <button
            onClick={stopMeditation}
            className="meditation-button stop-button"
          >
            停止修炼
          </button>
        )}
      </div>

      {/* 提示信息 */}
      <div className="meditation-hints">
        {cultivationExp >= requiredExp && (
          <div className="hint hint-success">
            修为已圆满，可尝试突破！
          </div>
        )}
        {!isMeditating && cultivationExp < requiredExp && (
          <div className="hint hint-info">
            开始打坐以增长修为
          </div>
        )}
        {isMeditating && (
          <div className="hint hint-warning">
            修炼中请勿分心...
          </div>
        )}
      </div>
    </div>
  )
}

export default MeditationView
