/**
 * 聊天系统模块导出
 */

export { useChatStore, parseChatMessage } from './chatStore'
export { useChatSync } from './useChatSync'
export { CHAT_CHANNELS, CHANNEL_COLORS, MAX_CHAT_HISTORY } from './constants'
export { CHAT_SHORTCUTS, isChatCommand, getChatCommandChannel } from './ChatHelpers'
export type { ChatMessage, ChatChannel, ChannelInfo } from './types'
