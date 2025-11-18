import { useState, useEffect, useRef } from 'react'
import type { 消息类型 } from '../../types/message'
import './ChannelArea.css'

// 频道信息接口
interface ChannelInfo {
  id: string
  name: string
  messages: 消息类型[]
  unread: number
  enabled: boolean
}

interface ChannelAreaProps {
  消息列表: 消息类型[]
}

// 消息类型到频道的映射
function getMessageChannel(msgType: string): string {
  if (msgType.startsWith('chat.world') || msgType === '世界') return 'world'
  if (msgType.startsWith('chat.team') || msgType === '队伍') return 'team'
  if (msgType.startsWith('chat.tell') || msgType === '私聊') return 'tell'
  if (msgType.startsWith('chat.say') || msgType === '本地') return 'local'
  if (msgType.startsWith('system') || msgType === '系统') return 'system'
  if (msgType.startsWith('combat') || msgType === '战斗' || msgType === 'battle') return 'combat'
  return 'game' // 默认游戏频道
}

// 判断是否为聊天类消息（用于"全部"频道过滤）
function isChatMessage(msgType: string): boolean {
  // 只包含聊天相关的消息类型
  return msgType.startsWith('chat.') ||
         msgType === '世界' ||
         msgType === '队伍' ||
         msgType === '私聊' ||
         msgType === '本地'
}

// 解析颜色标签
function parseColorTags(content: string): string {
  return content
    .replace(/<cyan>/g, '<span style="color: #00ffff;">')
    .replace(/<\/cyan>/g, '</span>')
    .replace(/<gold>/g, '<span style="color: #ffd700;">')
    .replace(/<\/gold>/g, '</span>')
    .replace(/<red>/g, '<span style="color: #ff4444;">')
    .replace(/<\/red>/g, '</span>')
    .replace(/<green>/g, '<span style="color: #44ff44;">')
    .replace(/<\/green>/g, '</span>')
    .replace(/<blue>/g, '<span style="color: #4444ff;">')
    .replace(/<\/blue>/g, '</span>')
    .replace(/<purple>/g, '<span style="color: #ff44ff;">')
    .replace(/<\/purple>/g, '</span>')
    .replace(/<yellow>/g, '<span style="color: #ffff00;">')
    .replace(/<\/yellow>/g, '</span>')
    .replace(/<white>/g, '<span style="color: #ffffff;">')
    .replace(/<\/white>/g, '</span>')
    .replace(/<dark-gray>/g, '<span style="color: #666666;">')
    .replace(/<\/dark-gray>/g, '</span>')
    .replace(/<system>/g, '<span style="color: #aaaaaa;">')
    .replace(/<\/system>/g, '</span>')
}

export function ChannelArea({ 消息列表 }: ChannelAreaProps) {
  const [channels, setChannels] = useState<ChannelInfo[]>([
    { id: 'all', name: '全部', messages: [], unread: 0, enabled: true },
    { id: 'local', name: '本地', messages: [], unread: 0, enabled: true },
    { id: 'world', name: '世界', messages: [], unread: 0, enabled: true },
    { id: 'team', name: '队伍', messages: [], unread: 0, enabled: true },
    { id: 'tell', name: '私聊', messages: [], unread: 0, enabled: false },
    // { id: 'system', name: '系统', messages: [], unread: 0, enabled: true }, // 暂时隐藏
    { id: 'combat', name: '战斗', messages: [], unread: 0, enabled: true },
  ])

  const [activeChannel, setActiveChannel] = useState('all')
  const [collapsed, setCollapsed] = useState(true) // 默认为折叠状态
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const processedCountRef = useRef(0) // 追踪已处理的消息数量

  // 监听消息列表变化，分发到对应频道
  useEffect(() => {
    if (消息列表.length === 0 || 消息列表.length <= processedCountRef.current) return

    // 只处理新消息
    const newMessages = 消息列表.slice(processedCountRef.current)
    processedCountRef.current = 消息列表.length

    // 处理所有新消息
    setChannels(prev => {
      let updatedChannels = [...prev]

      newMessages.forEach(latestMessage => {
        const channel = getMessageChannel(latestMessage.类型)

        updatedChannels = updatedChannels.map(ch => {
          // "全部"频道只接收聊天类消息，过滤掉场景描述等信息
          if (ch.id === 'all') {
            // 只有聊天消息才加入"全部"频道
            if (isChatMessage(latestMessage.类型)) {
              return {
                ...ch,
                messages: [...ch.messages, latestMessage],
                unread: ch.id === activeChannel ? 0 : ch.unread + 1
              }
            }
            return ch
          }
          // 其他频道只接收对应类型的消息
          if (ch.id === channel) {
            return {
              ...ch,
              messages: [...ch.messages, latestMessage],
              unread: ch.id === activeChannel ? 0 : ch.unread + 1
            }
          }
          return ch
        })
      })

      return updatedChannels
    })
  }, [消息列表, activeChannel])

  // 切换频道时清除未读
  useEffect(() => {
    setChannels(prev => prev.map(ch =>
      ch.id === activeChannel ? { ...ch, unread: 0 } : ch
    ))
  }, [activeChannel])

  // 自动滚动到底部
  useEffect(() => {
    if (!collapsed && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [channels, activeChannel, collapsed])

  // 获取当前频道消息
  const getCurrentChannelMessages = () => {
    const channel = channels.find(ch => ch.id === activeChannel)
    return channel ? channel.messages : []
  }

  // 格式化消息内容
  const formatMessageContent = (msg: 消息类型) => {
    return parseColorTags(msg.内容)
  }

  return (
    <div className={`channel-area ${collapsed ? 'collapsed' : ''}`}>
      {/* 折叠按钮 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="collapse-btn"
        title={collapsed ? '展开频道' : '折叠频道'}
      >
        {collapsed ? '▼' : '▲'}
      </button>

      {/* Tab标签栏 */}
      <div className="channel-tabs">
        {channels.filter(ch => ch.enabled).map(channel => (
          <button
            key={channel.id}
            onClick={() => setActiveChannel(channel.id)}
            className={`channel-tab ${activeChannel === channel.id ? 'active' : ''} ${channel.unread > 0 ? 'unread' : ''}`}
          >
            {channel.name}
            {channel.unread > 0 && (
              <span className="badge">{channel.unread > 99 ? '99+' : channel.unread}</span>
            )}
          </button>
        ))}
      </div>

      {/* 当前频道消息区 */}
      {!collapsed && (
        <div className="channel-messages">
          {getCurrentChannelMessages().length === 0 ? (
            <div className="channel-empty">暂无消息</div>
          ) : (
            getCurrentChannelMessages().map((msg, index) => (
              <div
                key={`${activeChannel}-${index}`}
                className={`channel-message message-${msg.类型.replace('.', '-')}`}
                dangerouslySetInnerHTML={{ __html: formatMessageContent(msg) }}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
