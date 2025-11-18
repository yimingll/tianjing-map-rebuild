import type { ExitInfo } from '../../types/movement'
import './ExitPanel.css'

interface ExitPanelProps {
  exits: ExitInfo[]
}

/**
 * 出口导航面板组件
 * 仅显示可用的移动方向（无点击功能）
 */
export function ExitPanel({ exits }: ExitPanelProps) {
  // 方向按钮的映射（用于布局）
  const directionLayout = {
    up: { row: 0, col: 1 },
    north: { row: 1, col: 1 },
    west: { row: 2, col: 0 },
    east: { row: 2, col: 2 },
    south: { row: 3, col: 1 },
    down: { row: 4, col: 1 },
  }

  // 检查某个方向是否可用
  const hasExit = (direction: string): boolean => {
    return exits.some(exit => exit.direction === direction)
  }

  // 获取出口信息
  const getExit = (direction: string): ExitInfo | undefined => {
    return exits.find(exit => exit.direction === direction)
  }

  // 渲染方向按钮（仅显示，无点击功能）
  const renderDirectionButton = (direction: string) => {
    const exit = getExit(direction)
    const available = hasExit(direction)
    const layout = directionLayout[direction as keyof typeof directionLayout]

    if (!layout) return null

    return (
      <div
        key={direction}
        className={`exit-button ${available ? 'available' : 'unavailable'}`}
        style={{
          gridRow: layout.row + 1,
          gridColumn: layout.col + 1,
        }}
        title={exit ? `${exit.displayName} → ${exit.targetRoom}` : '无法通行'}
      >
        <span className="direction-symbol">{getDirectionSymbol(direction)}</span>
        <span className="direction-name">{exit?.displayName || getChineseName(direction)}</span>
        {exit?.isLocked && <span className="lock-icon">🔒</span>}
      </div>
    )
  }

  return (
    <div className="exit-panel">
      <div className="exit-panel-header">
        <span className="exit-panel-title">可用出口</span>
        <span className="exit-count">{exits.length}</span>
      </div>

      <div className="direction-grid">
        {['up', 'north', 'west', 'east', 'south', 'down'].map(dir => renderDirectionButton(dir))}
      </div>

      {exits.length === 0 && (
        <div className="no-exits-message">
          此处暂无出口
        </div>
      )}
    </div>
  )
}

// 获取方向符号
function getDirectionSymbol(direction: string): string {
  const symbols: Record<string, string> = {
    north: '↑',
    south: '↓',
    east: '→',
    west: '←',
    up: '⬆',
    down: '⬇',
  }
  return symbols[direction] || '◆'
}

// 获取中文名称（后备）
function getChineseName(direction: string): string {
  const names: Record<string, string> = {
    north: '北方',
    south: '南方',
    east: '东方',
    west: '西方',
    up: '上方',
    down: '下方',
  }
  return names[direction] || direction
}

export default ExitPanel
