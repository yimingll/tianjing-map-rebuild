import { useMemo, useState } from 'react'
import RegionMap from '@features/map/RegionMap'
import { useMovementStore } from '@features/movement'
import { testTalkToInnkeeper, testTalkToBlacksmith, testTalkToHerbalist } from '@features/npc'
import { useQuestStore } from '@features/quest'
import { useAuthStore } from '@features/auth/authStore'
import { useCombatStore } from '@features/combat'
import { startCombat } from '@features/combat/combatApi'
import './RightPanel.css'

interface RightPanelProps {
  快捷命令: (命令: string) => void
  已连接: boolean
  打开装备面板?: () => void
  打开背包面板?: () => void
  打开角色面板?: () => void
}

function RightPanel({ 快捷命令, 已连接, 打开装备面板, 打开背包面板, 打开角色面板 }: RightPanelProps) {
  const [显示区域地图, 设置显示区域地图] = useState(false)
  const { userInfo } = useAuthStore()
  const { openQuestPanel } = useQuestStore()
  const { setCurrentCombat, openCombatPanel, addCombatLog } = useCombatStore()

  // 从移动状态获取当前房间和出口信息
  const { currentRoom, exits } = useMovementStore()

  // 战斗测试函数
  const handleTestCombat = async (monsterId: string) => {
    console.log('用户信息:', userInfo)

    if (!userInfo?.userId) {
      alert('请先登录。当前用户信息: ' + JSON.stringify(userInfo))
      return
    }

    console.log('开始战斗，玩家ID:', userInfo.userId, '怪物ID:', monsterId)

    try {
      const response = await startCombat(userInfo.userId.toString(), monsterId)
      console.log('战斗响应:', response)

      if (response.success && response.combat) {
        setCurrentCombat(response.combat)
        addCombatLog(response.message)
        openCombatPanel()
      } else {
        alert(response.message)
      }
    } catch (error) {
      console.error('开始战斗失败:', error)
      alert('开始战斗失败: ' + (error as Error).message)
    }
  }

  // 生成11x11的ASCII地图 - 基于实际出口信息
  const 小地图 = useMemo(() => {
    const map = []
    const centerX = 5
    const centerY = 5

    // 创建方向到坐标偏移的映射
    const directionOffsets: { [key: string]: [number, number] } = {
      'north': [0, -1],
      'south': [0, 1],
      'east': [1, 0],
      'west': [-1, 0],
      'northeast': [1, -1],
      'northwest': [-1, -1],
      'southeast': [1, 1],
      'southwest': [-1, 1],
      'up': [0, 0],  // 显示为特殊符号
      'down': [0, 0]  // 显示为特殊符号
    }

    for (let y = 0; y < 11; y++) {
      const row = []
      for (let x = 0; x < 11; x++) {
        // 当前位置（中心）
        if (x === centerX && y === centerY) {
          row.push('@')
        } else {
          // 检查是否是出口方向
          let isExit = false
          for (const exit of exits) {
            const offset = directionOffsets[exit.direction.toLowerCase()]
            if (offset) {
              const [dx, dy] = offset
              if (x === centerX + dx && y === centerY + dy) {
                isExit = true
                break
              }
            }
          }

          if (isExit) {
            row.push('·')  // 出口
          } else {
            row.push(' ')  // 空白
          }
        }
      }
      map.push(row)
    }
    return map
  }, [exits])

  const 快捷命令列表 = [
    { label: '观察', cmd: 'look' },
    { label: '打坐', cmd: 'meditate' },
    { label: '角色', cmd: 'character', onClick: 打开角色面板 },
    { label: '任务', cmd: 'quest', onClick: openQuestPanel },
    { label: '帮助', cmd: 'help' },
    { label: '装备', cmd: 'equipment', onClick: 打开装备面板 },
    { label: '背包', cmd: 'inventory', onClick: 打开背包面板 },
  ]

  const NPC测试按钮列表 = [
    { label: '客栈老板', onClick: () => testTalkToInnkeeper(userInfo?.userId?.toString() || '') },
    { label: '铁匠', onClick: () => testTalkToBlacksmith(userInfo?.userId?.toString() || '') },
    { label: '药铺', onClick: () => testTalkToHerbalist(userInfo?.userId?.toString() || '') },
  ]

  const 战斗测试按钮列表 = [
    { label: '野狼', monsterId: 'monster_wolf' },
    { label: '狐妖', monsterId: 'monster_fox_spirit' },
    { label: '蛇妖', monsterId: 'monster_snake_demon' },
    { label: '黑熊精', monsterId: 'monster_black_bear' },
    { label: '山贼', monsterId: 'monster_mountain_bandit' },
    { label: '妖王', monsterId: 'monster_demon_lord' },
  ]

  const handleButtonClick = (cmd: any) => {
    if (cmd.onClick) {
      // 特殊按钮：装备和背包
      cmd.onClick()
    } else {
      // 普通命令按钮
      快捷命令(cmd.cmd)
    }
  }

  return (
    <div className="right-panel-container">
      {/* 小地图 */}
      <div className="panel-section minimap-panel">
        <div className="section-title">[ 小地图 ]</div>
        <div className="minimap">
          {小地图.map((row, y) => (
            <div key={y} className="map-row">
              {row.map((cell, x) => (
                <span
                  key={`${x}-${y}`}
                  className={`map-cell ${cell === '@' ? 'player' : ''}`}
                >
                  {cell}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="room-info">
          <div className="room-name">
            {currentRoom ? currentRoom.name : '未知区域'}
          </div>
        </div>
        <button
          className="region-map-button"
          onClick={() => {
            // 先发送map命令获取地图数据
            快捷命令('map')
            // 延迟一点打开窗口，等待数据返回
            setTimeout(() => 设置显示区域地图(true), 100)
          }}
          disabled={!已连接}
        >
          区域地图
        </button>

        {/* 区域地图弹窗 */}
        {显示区域地图 && (
          <RegionMap
            关闭={() => 设置显示区域地图(false)}
            发送命令={快捷命令}
          />
        )}
      </div>

      {/* 快捷命令 */}
      <div className="panel-section quick-commands-panel">
        <div className="section-title">[ 快捷命令 ]</div>
        <div className="quick-commands">
          {快捷命令列表.map((cmd, index) => (
            <button
              key={index}
              className="quick-button"
              onClick={() => handleButtonClick(cmd)}
              disabled={!已连接 && !cmd.onClick}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* NPC测试按钮 */}
      <div className="panel-section npc-test-panel">
        <div className="section-title">[ NPC测试 ]</div>
        <div className="quick-commands">
          {NPC测试按钮列表.map((npc, index) => (
            <button
              key={index}
              className="quick-button npc-test-btn"
              onClick={npc.onClick}
              disabled={!已连接}
              style={{ fontSize: '0.85rem' }}
            >
              💬 {npc.label}
            </button>
          ))}
        </div>
      </div>

      {/* 战斗测试按钮 */}
      <div className="panel-section combat-test-panel">
        <div className="section-title">[ 战斗测试 ]</div>
        <div className="quick-commands">
          {战斗测试按钮列表.map((monster, index) => (
            <button
              key={index}
              className="quick-button combat-test-btn"
              onClick={() => handleTestCombat(monster.monsterId)}
              disabled={!已连接}
              style={{ fontSize: '0.85rem' }}
            >
              ⚔️ {monster.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RightPanel
