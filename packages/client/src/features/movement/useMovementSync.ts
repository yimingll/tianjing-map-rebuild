/**
 * 移动系统同步Hook
 *
 * 监听WebSocket消息，自动同步房间信息到Store
 */

import { useEffect } from 'react'
import { useMovementStore } from './movementStore'
import type { 消息类型 } from '../../types/message'
import type { RoomInfo, ExitInfo } from '../../types/movement'

interface UseMovementSyncOptions {
  enabled?: boolean  // 是否启用同步，默认true
}

/**
 * 移动系统同步Hook
 *
 * 自动处理 room_update 类型的消息，更新状态管理
 *
 * @param messages - 消息列表（从App.tsx传入）
 * @param options - 配置选项
 *
 * @example
 * ```tsx
 * function App() {
 *   const [消息列表, 设置消息列表] = useState<消息类型[]>([])
 *   useMovementSync(消息列表)
 *   // ...
 * }
 * ```
 */
export function useMovementSync(
  messages: 消息类型[],
  options: UseMovementSyncOptions = {}
) {
  const { enabled = true } = options
  const { updateRoom } = useMovementStore()

  useEffect(() => {
    if (!enabled || messages.length === 0) return

    // 获取最新消息
    const latestMessage = messages[messages.length - 1]

    // 检查是否是房间更新消息
    if (latestMessage.类型 === 'room_update') {
      console.log('[useMovementSync] 检测到房间更新消息')

      try {
        // 解析房间数据
        const roomData = JSON.parse(latestMessage.内容)

        // 提取房间信息
        const room: RoomInfo = {
          id: roomData.id || '',
          name: roomData.name || '未知房间',
          description: roomData.description || '',
          regionId: roomData.region_id || '',
          coordinates: roomData.coordinates || { x: 0, y: 0, z: 0 }
        }

        // 提取出口信息
        const exits: ExitInfo[] = (roomData.exits || []).map((exit: any) => ({
          direction: exit.direction,
          displayName: exit.display_name || exit.direction,
          targetRoomId: exit.target_room_id,
          isLocked: exit.is_locked || false,
          lockDescription: exit.lock_description
        }))

        // 更新Store
        updateRoom(room, exits)
        console.log('[useMovementSync] 房间信息已更新到Store', room.name)
      } catch (error) {
        console.error('[useMovementSync] 解析房间数据失败:', error)
      }
    }
  }, [messages, enabled, updateRoom])
}
