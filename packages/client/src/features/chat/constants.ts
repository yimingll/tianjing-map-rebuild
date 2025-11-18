/**
 * 聊天系统常量定义
 */

import type { ChannelInfo } from './types'

export const CHAT_CHANNELS: Record<string, ChannelInfo> = {
  ALL: {
    id: 'all',
    name: '全部',
    color: '#FFFFFF',
    icon: '📝'
  },
  WORLD: {
    id: 'world',
    name: '世界',
    color: '#FFD700',
    icon: '🌍'
  },
  ROOM: {
    id: 'room',
    name: '房间',
    color: '#87CEEB',
    icon: '💬'
  },
  WHISPER: {
    id: 'whisper',
    name: '私聊',
    color: '#FF69B4',
    icon: '✉️'
  },
  SYSTEM: {
    id: 'system',
    name: '系统',
    color: '#FF6347',
    icon: '⚙️'
  }
}

// 最大消息历史记录数
export const MAX_CHAT_HISTORY = 100

// 消息渲染颜色映射
export const CHANNEL_COLORS: Record<string, string> = {
  world: '#FFD700',
  room: '#87CEEB',
  whisper: '#FF69B4',
  system: '#FF6347',
  all: '#FFFFFF'
}
