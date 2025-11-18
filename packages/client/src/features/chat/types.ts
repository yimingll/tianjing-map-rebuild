/**
 * 聊天系统类型定义
 */

export type ChatChannel = 'world' | 'room' | 'whisper' | 'system' | 'all'

export interface ChatMessage {
  id: string
  channel: ChatChannel
  sender: string        // 发送者显示名
  senderId?: string     // 发送者ID (用于私聊)
  content: string       // 消息内容
  timestamp: number     // 时间戳
  isSelf: boolean       // 是否是自己发的
  target?: string       // 私聊目标（仅私聊消息有）
}

export interface ChannelInfo {
  id: ChatChannel
  name: string
  color: string
  icon?: string
}
