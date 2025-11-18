/**
 * 聊天状态管理 Store
 */

import { create } from 'zustand'
import type { ChatMessage, ChatChannel } from './types'
import { MAX_CHAT_HISTORY } from './constants'

interface ChatState {
  messages: ChatMessage[]
  currentChannel: ChatChannel
  unreadCount: Record<ChatChannel, number>

  // 添加消息
  addMessage: (message: ChatMessage) => void

  // 切换频道
  setChannel: (channel: ChatChannel) => void

  // 清空消息
  clearMessages: () => void

  // 获取当前频道的消息
  getChannelMessages: () => ChatMessage[]

  // 标记频道已读
  markChannelAsRead: (channel: ChatChannel) => void

  // 获取频道未读数
  getUnreadCount: (channel: ChatChannel) => number
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  currentChannel: 'all',
  unreadCount: {
    all: 0,
    world: 0,
    room: 0,
    whisper: 0,
    system: 0
  },

  addMessage: (message: ChatMessage) => {
    set((state) => {
      const newMessages = [...state.messages, message]

      // 保持最多 MAX_CHAT_HISTORY 条消息
      const trimmedMessages = newMessages.slice(-MAX_CHAT_HISTORY)

      // 更新未读数（如果不是当前频道）
      const newUnreadCount = { ...state.unreadCount }
      if (message.channel !== state.currentChannel && state.currentChannel !== 'all') {
        newUnreadCount[message.channel] = (newUnreadCount[message.channel] || 0) + 1
      }
      if (state.currentChannel !== 'all') {
        newUnreadCount.all = (newUnreadCount.all || 0) + 1
      }

      console.log('[ChatStore] 添加消息:', message)

      return {
        messages: trimmedMessages,
        unreadCount: newUnreadCount
      }
    })
  },

  setChannel: (channel: ChatChannel) => {
    console.log('[ChatStore] 切换频道:', channel)
    set((state) => {
      // 清空该频道的未读数
      const newUnreadCount = { ...state.unreadCount }
      newUnreadCount[channel] = 0
      if (channel === 'all') {
        // 如果切换到全部，清空所有未读
        Object.keys(newUnreadCount).forEach(key => {
          newUnreadCount[key as ChatChannel] = 0
        })
      }

      return {
        currentChannel: channel,
        unreadCount: newUnreadCount
      }
    })
  },

  clearMessages: () => {
    console.log('[ChatStore] 清空所有消息')
    set({
      messages: [],
      unreadCount: {
        all: 0,
        world: 0,
        room: 0,
        whisper: 0,
        system: 0
      }
    })
  },

  getChannelMessages: (): ChatMessage[] => {
    const { messages, currentChannel } = get()

    if (currentChannel === 'all') {
      return messages
    }

    return messages.filter(msg => msg.channel === currentChannel)
  },

  markChannelAsRead: (channel: ChatChannel) => {
    set((state) => {
      const newUnreadCount = { ...state.unreadCount }
      newUnreadCount[channel] = 0
      return { unreadCount: newUnreadCount }
    })
  },

  getUnreadCount: (channel: ChatChannel): number => {
    return get().unreadCount[channel] || 0
  }
}))

/**
 * 解析后端聊天消息到ChatMessage格式
 */
export function parseChatMessage(
  content: string,
  messageType: string,
  timestamp: number
): ChatMessage | null {
  try {
    // 解析世界频道消息
    if (content.includes('[世界]')) {
      const match = content.match(/\[世界\] (?:\[(.+?)\]：|你：)(.+)/)
      if (match) {
        const sender = match[1] || '我'
        const text = match[2]
        return {
          id: `${timestamp}-${Math.random()}`,
          channel: 'world',
          sender,
          content: text,
          timestamp,
          isSelf: !match[1]
        }
      }
    }

    // 解析房间频道消息
    if (content.includes('说：')) {
      const match = content.match(/(?:\[(.+?)\] 说：|你说：)"(.+?)"/)
      if (match) {
        const sender = match[1] || '我'
        const text = match[2]
        return {
          id: `${timestamp}-${Math.random()}`,
          channel: 'room',
          sender,
          content: text,
          timestamp,
          isSelf: !match[1]
        }
      }
    }

    // 解析私聊消息
    if (content.includes('[私聊]')) {
      const match = content.match(/\[私聊\] (?:\[(.+?)\] -> 你|你 -> \[(.+?)\])：(.+)/)
      if (match) {
        const sender = match[1] || '我'
        const target = match[2]
        const text = match[3]
        return {
          id: `${timestamp}-${Math.random()}`,
          channel: 'whisper',
          sender,
          content: text,
          timestamp,
          isSelf: !match[1],
          target
        }
      }
    }

    return null
  } catch (error) {
    console.error('[ChatStore] 解析聊天消息失败:', error)
    return null
  }
}
