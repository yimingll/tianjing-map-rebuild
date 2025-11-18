import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { 消息类型 } from '../../types/message'
import { 解析颜色文本, 包含颜色标记 } from '@lib/colorParser'
import { WelcomeBanner } from '@components/WelcomeBanner'
import './TextDisplay.css'

interface TextDisplayProps {
  消息列表: 消息类型[]
  命令点击?: (命令: string, 动作: 'execute' | 'fill') => void
  清空消息?: () => void
}

function TextDisplay({ 消息列表, 命令点击, 清空消息 }: TextDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // 过滤掉数据型消息（只用于状态更新，不应显示在聊天窗口）
  const 可见消息列表 = 消息列表.filter(msg => {
    // 过滤掉纯数据消息，但保留 welcome_banner
    return msg.类型 !== 'character_update' && msg.类型 !== 'room_update' && msg.类型 !== 'map_data'
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [可见消息列表])

  const formatTime = (timestamp: Date | number) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }

  // 解析出口标记并转换为可点击元素
  const parseExits = (content: string): string => {
    // 匹配 [exit:方向]文本[/exit] 格式，转换为可点击的出口
    // 处理可能包含颜色标记的情况: [exit:south]<color:#1E90FF>南</color>[/exit]
    const exitRegex = /\[exit:([a-z]+)\](.*?)\[\/exit\]/gi
    return content.replace(exitRegex, (match, direction, text) => {
      // 如果包含颜色标记，提取其中的纯文本
      const colorMatch = text.match(/<color:[^>]+>(.*?)<\/color>/i)
      const displayText = colorMatch ? colorMatch[1] : text

      return `<span class="exit-clickable" data-direction="${direction}" title="点击移动到${displayText}">${displayText}</span>`
    })
  }

  // 渲染带颜色的文本
  const renderColoredText = (content: string) => {
    // 先解析出口标记
    let processedContent = parseExits(content)

    // 检查是否包含颜色标记
    if (!包含颜色标记(processedContent)) {
      // 没有颜色标记，直接返回
      return <span dangerouslySetInnerHTML={{ __html: processedContent }} />
    }

    // 解析颜色文本
    const segments = 解析颜色文本(processedContent)

    return (
      <>
        {segments.map((segment, index) => {
          return segment.color ? (
            <span
              key={index}
              style={{ color: segment.color }}
              dangerouslySetInnerHTML={{ __html: segment.text }}
            />
          ) : (
            <span key={index} dangerouslySetInnerHTML={{ __html: segment.text }} />
          )
        })}
      </>
    )
  }

  
  // 处理出口点击事件
  useEffect(() => {
    const handleExitClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // 检查是否点击了可点击的出口
      if (target.classList.contains('exit-clickable') && 命令点击) {
        e.preventDefault()
        e.stopPropagation()

        const direction = target.getAttribute('data-direction')
        if (direction) {
          // 执行移动命令
          命令点击(direction, 'execute')
        }
      }
    }

    const displayElement = scrollRef.current
    if (displayElement) {
      displayElement.addEventListener('click', handleExitClick)
      return () => {
        displayElement.removeEventListener('click', handleExitClick)
      }
    }
  }, [命令点击])

  // 处理快捷键 Ctrl+L 清空
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l' && 清空消息) {
        e.preventDefault()
        清空消息()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [清空消息])

  return (
    <div className="text-display-container">
      <div className="text-display" ref={scrollRef}>
        <AnimatePresence>
          {可见消息列表.map((msg, index) => {
            // 特殊处理 welcome_banner 消息
            if (msg.类型 === 'welcome_banner') {
              try {
                const welcomeData = JSON.parse(msg.内容)
                return (
                  <motion.div
                    key={index}
                    className="message msg-welcome-banner"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <WelcomeBanner
                      onlinePlayers={welcomeData.onlinePlayers}
                      version={welcomeData.version}
                      serverStatus={welcomeData.serverStatus}
                      lastUpdate={welcomeData.lastUpdate}
                    />
                  </motion.div>
                )
              } catch {
                // 解析失败，跳过
                return null
              }
            }

            // 正常消息
            return (
              <motion.div
                key={index}
                className={`message msg-${msg.类型}`}
                initial={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 0.3,
                  delay: index === 消息列表.length - 1 ? 0.1 : 0
                }}
              >
                <span className="message-time">[{formatTime(msg.时间戳)}]</span>
                <motion.span
                  className="message-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {renderColoredText(msg.内容)}
                </motion.span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      {清空消息 && (
        <motion.button
          className="clear-button"
          onClick={清空消息}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="清空输出 (Ctrl+L)"
        >
          清空
        </motion.button>
      )}
    </div>
  )
}

export default TextDisplay
