import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import './CommandInput.css'

interface CommandInputProps {
  发送命令: (命令: string) => void
}

export interface CommandInputRef {
  setInputValue: (value: string) => void
}

const CommandInput = forwardRef<CommandInputRef, CommandInputProps>(
  ({ 发送命令 }, ref) => {
    const [input, setInput] = useState('')
    const [history, setHistory] = useState<string[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [showCursor, setShowCursor] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      setInputValue: (value: string) => {
        setInput(value)
        inputRef.current?.focus()
      }
    }))

    // 常用命令列表用于自动补全
    const commonCommands = [
      'look', 'north', 'south', 'east', 'west',
      'connect', 'init', 'meditate', 'dz', '打坐',
      'breakthrough', 'tp', '突破', 'status', 'panel', 'mb', '面板',
      'help', 'quit', 'who', 'inventory', 'get', 'drop'
    ]

    // 光标闪烁效果
    useEffect(() => {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev)
      }, 530)
      return () => clearInterval(interval)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (input.trim()) {
        发送命令(input.trim())
        setHistory(prev => [...prev, input.trim()])
        setInput('')
        setHistoryIndex(-1)
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Tab 键自动补全 - 禁用默认的UI选择行为
      if (e.key === 'Tab') {
        e.preventDefault()
        if (input.trim()) {
          // 查找匹配的命令
          const matches = commonCommands.filter(cmd =>
            cmd.toLowerCase().startsWith(input.trim().toLowerCase())
          )
          if (matches.length === 1) {
            // 只有一个匹配，直接补全
            setInput(matches[0] + ' ')
          } else if (matches.length > 1) {
            // 多个匹配，补全到最长公共前缀
            const commonPrefix = matches.reduce((prefix, cmd) => {
              let i = 0
              while (i < prefix.length && i < cmd.length &&
                     prefix[i].toLowerCase() === cmd[i].toLowerCase()) {
                i++
              }
              return prefix.substring(0, i)
            })
            if (commonPrefix.length > input.length) {
              setInput(commonPrefix)
            }
          }
        }
        return
      }

      // 历史命令导航
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (history.length > 0) {
          const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex
          setHistoryIndex(newIndex)
          setInput(history[history.length - 1 - newIndex])
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1
          setHistoryIndex(newIndex)
          setInput(history[history.length - 1 - newIndex])
        } else if (historyIndex === 0) {
          setHistoryIndex(-1)
          setInput('')
        }
      }
    }

    return (
      <div className="command-input-container">
        <form onSubmit={handleSubmit} className="command-form">
          <span className="prompt-symbol">&gt;</span>
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入命令... (使用↑↓浏览历史)"
            autoFocus
          />
          <span className={`cursor ${showCursor ? 'visible' : ''}`}>█</span>
        </form>
        <div className="input-hint">
          提示: 使用 Tab 键自动补全命令, 使用 ↑ ↓ 键浏览历史命令
        </div>
      </div>
    )
  }
)

CommandInput.displayName = 'CommandInput'

export default CommandInput
