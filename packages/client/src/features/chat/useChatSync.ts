/**
 * 聊天消息同步Hook
 *
 * 监听WebSocket消息，自动解析聊天消息并添加到ChatStore
 */

import { useEffect, useRef } from 'react'
import { useChatStore, parseChatMessage } from './chatStore'
import type { 消息类型 } from '../../types/message'

interface UseChatSyncOptions {
  enabled?: boolean  // 是否启用同步，默认true
}

/**
 * 聊天消息同步Hook
 *
 * @param messages - 消息列表（从App.tsx传入）
 * @param options - 配置选项
 */
export function useChatSync(
  messages: 消息类型[],
  options: UseChatSyncOptions = {}
) {
  const { enabled = true } = options
  const { addMessage } = useChatStore()
  const lastProcessedIndex = useRef(-1)

  useEffect(() => {
    if (!enabled || messages.length === 0) return

    // 处理所有新消息（从上次处理位置之后的消息）
    const newMessages = messages.slice(lastProcessedIndex.current + 1)

    if (newMessages.length === 0) return

    console.log(`[useChatSync] 处理 ${newMessages.length} 条新消息`)

    // 遍历所有新消息，提取聊天消息
    for (const msg of newMessages) {
      // 尝试解析聊天消息
      const chatMsg = parseChatMessage(msg.内容, msg.类型, msg.时间戳)

      if (chatMsg) {
        console.log('[useChatSync] 检测到聊天消息:', chatMsg)
        addMessage(chatMsg)
      }
    }

    // 更新已处理的消息索引
    lastProcessedIndex.current = messages.length - 1
  }, [messages, enabled, addMessage])
}
