import { useState, useEffect, useRef } from 'react'
import type { DialogueData, DialogueChoice } from '../../types/message'
import './DialoguePanel.css'

interface DialoguePanelProps {
  onClose: () => void
  onChoiceSelect: (choiceId: string, choiceIndex: number) => void
}

export function DialoguePanel({ onClose, onChoiceSelect }: DialoguePanelProps) {
  const [dialogueData, setDialogueData] = useState<DialogueData | null>(null)
  const [dialogueHistory, setDialogueHistory] = useState<Array<{ speaker: string; text: string }>>([])
  const [hoveredChoice, setHoveredChoice] = useState<number | null>(null)
  const historyEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到对话历史底部
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [dialogueHistory])

  // 监听对话消息
  useEffect(() => {
    const handleDialogueMessage = (event: CustomEvent<DialogueData>) => {
      const data = event.detail
      console.log('收到对话数据:', data)

      setDialogueData(data)

      // 添加到对话历史
      if (data.text) {
        setDialogueHistory(prev => [
          ...prev,
          {
            speaker: data.speaker || data.npc_name,
            text: data.text!
          }
        ])
      }

      // 如果是结束对话
      if (data.type === 'dialogue_end') {
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    }

    window.addEventListener('dialogue_message' as any, handleDialogueMessage)

    return () => {
      window.removeEventListener('dialogue_message' as any, handleDialogueMessage)
    }
  }, [onClose])

  const handleChoice = (choice: DialogueChoice, index: number) => {
    // 如果选项禁用，不执行操作
    if (choice.disabled) {
      return
    }
    onChoiceSelect(choice.id, index)
  }

  if (!dialogueData) {
    return null
  }

  return (
    <div className="dialogue-panel-overlay">
      <div className="dialogue-panel">
        <div className="dialogue-header">
          <h3 className="dialogue-title">
            {dialogueData.npc_name}
          </h3>
          <button className="dialogue-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="dialogue-content">
          {/* 对话历史 */}
          <div className="dialogue-history">
            {dialogueHistory.map((entry, index) => (
              <div key={index} className="dialogue-entry">
                <div className="dialogue-speaker">{entry.speaker}：</div>
                <div className="dialogue-text">{entry.text}</div>
              </div>
            ))}
            <div ref={historyEndRef} />
          </div>
        </div>

        {/* 对话选项 */}
        {dialogueData.choices && dialogueData.choices.length > 0 && (
          <div className="dialogue-choices">
            <div className="dialogue-choices-title">选择回复：</div>
            {dialogueData.choices.map((choice, index) => (
              <div
                key={choice.id}
                className="choice-wrapper"
                onMouseEnter={() => setHoveredChoice(index)}
                onMouseLeave={() => setHoveredChoice(null)}
              >
                <button
                  className={`dialogue-choice-btn ${choice.disabled ? 'disabled' : ''}`}
                  onClick={() => handleChoice(choice, index)}
                  disabled={choice.disabled}
                  title={choice.disabled ? choice.disabled_text : undefined}
                >
                  <span className="choice-number">{index + 1}.</span>
                  <span className="choice-text">{choice.text}</span>
                  {choice.disabled && (
                    <span className="choice-lock-icon">🔒</span>
                  )}
                </button>
                {choice.disabled && choice.disabled_text && hoveredChoice === index && (
                  <div className="choice-tooltip">
                    <div className="tooltip-arrow"></div>
                    <div className="tooltip-content">{choice.disabled_text}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 动作提示 */}
        {dialogueData.type === 'dialogue_action' && dialogueData.message && (
          <div className="dialogue-action">
            <span className="action-icon">⚡</span>
            {dialogueData.message}
          </div>
        )}
      </div>
    </div>
  )
}
