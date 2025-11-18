import { useCharacterStore } from '@features/character'
import './LeftPanel.css'

interface LeftPanelProps {
  快捷命令: (命令: string) => void
  已连接: boolean
}

function LeftPanel({ 快捷命令, 已连接 }: LeftPanelProps) {
  // 从Store获取角色属性
  const displayAttrs = useCharacterStore((state) => state.getDisplayAttributes())

  // 调试信息
  console.log('[LeftPanel] displayAttrs:', displayAttrs)

  // 如果没有属性数据，显示占位符
  if (!displayAttrs) {
    return (
      <div className="left-panel-container">
        <div className="panel-section">
          <div className="section-title">[ 角色状态 ]</div>
          <div className="player-stats">
            <div className="stat-info">
              <span>未登录</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="left-panel-container">
      {/* 角色状态面板 */}
      <div className="panel-section">
        <div className="section-title">[ 角色状态 ]</div>
        <div className="player-stats">
          <div className="stat-row">
            <span className="stat-label">气血:</span>
            <div className="stat-bar-container">
              <div
                className="stat-bar hp-bar"
                style={{ width: `${displayAttrs.hpPercentage}%` }}
              ></div>
            </div>
            <span className="stat-value">{displayAttrs.hp}/{displayAttrs.max_hp}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">真元:</span>
            <div className="stat-bar-container">
              <div
                className="stat-bar mp-bar"
                style={{ width: `${displayAttrs.mpPercentage}%` }}
              ></div>
            </div>
            <span className="stat-value">{displayAttrs.mp}/{displayAttrs.max_mp}</span>
          </div>
          <div className="stat-info">
            <span>境界: <span className="level-value">{displayAttrs.realm} {displayAttrs.realm_layer}层</span></span>
          </div>
          <div className="stat-info">
            <span>修为: <span className="level-value">{displayAttrs.experience}</span></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeftPanel
