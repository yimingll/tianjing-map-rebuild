/**
 * 聊天辅助组件和工具函数
 */

import type { ChatChannel } from './types'

/**
 * 聊天命令快捷方式提示
 */
export const CHAT_SHORTCUTS = [
  {
    command: 'say',
    alias: "'",
    description: '房间聊天',
    example: "say 大家好 或 '大家好",
    channel: 'room' as ChatChannel
  },
  {
    command: 'chat',
    alias: '!',
    description: '世界聊天',
    example: 'chat 大家好 或 !大家好',
    channel: 'world' as ChatChannel
  },
  {
    command: 'tell',
    alias: 't',
    description: '私聊',
    example: 'tell 玩家名 消息 或 t 玩家名 消息',
    channel: 'whisper' as ChatChannel
  }
]

/**
 * 检测命令是否是聊天命令
 */
export function isChatCommand(command: string): boolean {
  const chatCommands = ['say', 'chat', 'tell', 'whisper', 't', '!', "'"]
  const firstWord = command.trim().split(/\s+/)[0].toLowerCase()

  // 检查是否以快捷符号开头
  if (command.startsWith('!') || command.startsWith("'")) {
    return true
  }

  return chatCommands.includes(firstWord)
}

/**
 * 获取聊天命令的频道类型
 */
export function getChatCommandChannel(command: string): ChatChannel | null {
  const trimmed = command.trim()

  if (trimmed.startsWith('!') || trimmed.startsWith('chat ')) {
    return 'world'
  }

  if (trimmed.startsWith("'") || trimmed.startsWith('say ')) {
    return 'room'
  }

  if (trimmed.startsWith('tell ') || trimmed.startsWith('whisper ') || trimmed.startsWith('t ')) {
    return 'whisper'
  }

  return null
}
