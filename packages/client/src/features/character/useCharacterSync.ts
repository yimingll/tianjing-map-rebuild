/**
 * 角色属性同步Hook
 *
 * 监听WebSocket消息，自动同步角色属性到Store
 */

import { useEffect, useRef } from 'react'
import { useCharacterStore, parseCharacterUpdate } from './characterStore'
import type { 消息类型 } from '../../types/message'

interface UseCharacterSyncOptions {
  enabled?: boolean  // 是否启用同步，默认true
}

/**
 * 角色属性同步Hook
 *
 * 自动处理 character_update 类型的消息，更新状态管理
 *
 * @param messages - 消息列表（从App.tsx传入）
 * @param options - 配置选项
 *
 * @example
 * ```tsx
 * function App() {
 *   const [消息列表, 设置消息列表] = useState<消息类型[]>([])
 *   useCharacterSync(消息列表)
 *   // ...
 * }
 * ```
 */
export function useCharacterSync(
  messages: 消息类型[],
  options: UseCharacterSyncOptions = {}
) {
  const { enabled = true } = options
  const { updateAttributes } = useCharacterStore()
  const lastProcessedIndex = useRef(-1)

  useEffect(() => {
    if (!enabled || messages.length === 0) return

    // 处理所有新消息（从上次处理位置之后的消息）
    const newMessages = messages.slice(lastProcessedIndex.current + 1)

    if (newMessages.length === 0) return

    console.log(`[useCharacterSync] 处理 ${newMessages.length} 条新消息`)

    // 遍历所有新消息
    for (const msg of newMessages) {
      console.log('[useCharacterSync] 检查消息，类型:', msg.类型, '内容预览:', msg.内容.substring(0, 50))

      // 检查是否是角色属性更新消息
      if (msg.类型 === 'character_update') {
        console.log('[useCharacterSync] 检测到角色属性更新消息')

        // 解析属性数据
        const attributes = parseCharacterUpdate(msg.内容)

        if (attributes) {
          // 更新Store
          updateAttributes(attributes)
          console.log('[useCharacterSync] 角色属性已更新到Store')
        } else {
          console.error('[useCharacterSync] 解析角色属性失败')
        }
      }
    }

    // 更新已处理的消息索引
    lastProcessedIndex.current = messages.length - 1
  }, [messages, enabled, updateAttributes])
}
