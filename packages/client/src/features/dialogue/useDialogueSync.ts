import { useEffect } from 'react'
import type { 消息类型 } from '../../types/message'
import type { DialogueData } from '../../types/message'

/**
 * 对话同步Hook
 * 监听对话消息并触发自定义事件
 */
export function useDialogueSync(消息列表: 消息类型[]) {
  useEffect(() => {
    const latestMessage = 消息列表[消息列表.length - 1]

    if (!latestMessage || latestMessage.类型 !== 'dialogue') {
      return
    }

    try {
      const dialogueData: DialogueData = JSON.parse(latestMessage.内容)
      console.log('解析对话数据:', dialogueData)

      // 触发自定义事件，供DialoguePanel监听
      const event = new CustomEvent('dialogue_message', {
        detail: dialogueData
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error('解析对话数据失败:', error)
    }
  }, [消息列表])
}
