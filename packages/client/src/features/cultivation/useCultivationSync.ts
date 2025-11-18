/**
 * 修炼系统 WebSocket 同步 Hook
 *
 * 监听来自后端的修炼相关 WebSocket 消息并更新状态
 */

import { useEffect } from 'react'
import { 游戏客户端 } from '../../lib/gameClient'
import { useCultivationStore } from './cultivationStore'
import type { 消息类型 } from '../../types/message'

/**
 * WebSocket 消息监听 Hook
 *
 * 用于在组件中启用修炼系统的 WebSocket 消息监听
 * 监听以下消息类型:
 * - cultivation_info: 修炼信息更新
 * - meditation_start: 打坐开始
 * - meditation_stop: 打坐停止
 * - exp_gain: 修为增长（每秒累加）
 * - breakthrough_result: 突破结果
 */
export function useCultivationSync(gameClient: 游戏客户端) {
  const updateCultivationData = useCultivationStore((state) => state.updateCultivationData)

  useEffect(() => {
    console.log('[CultivationSync] 启动修炼系统 WebSocket 监听')

    // 消息处理函数
    const handleMessage = (message: 消息类型) => {
      try {
        // 尝试解析消息内容为 JSON
        const data = typeof message.内容 === 'string'
          ? JSON.parse(message.内容)
          : message.内容

        // 根据消息类型处理
        switch (message.类型) {
          case 'cultivation_info':
            handleCultivationInfo(data)
            break

          case 'meditation_start':
            handleMeditationStart(data)
            break

          case 'meditation_stop':
            handleMeditationStop(data)
            break

          case 'exp_gain':
            handleExpGain(data)
            break

          case 'breakthrough_result':
            handleBreakthroughResult(data)
            break

          default:
            // 忽略其他消息类型
            break
        }
      } catch (error) {
        // 如果不是 JSON 或无法解析，忽略
        // console.debug('[CultivationSync] 忽略非修炼系统消息')
      }
    }

    // 修炼信息更新
    const handleCultivationInfo = (data: any) => {
      console.log('[CultivationSync] 收到修炼信息更新:', data)
      updateCultivationData({
        realm: data.realm || data.境界,
        realmLevel: data.realmLevel || data.realm_level || data.境界层级,
        cultivationExp: data.cultivationExp || data.cultivation_exp || data.修为,
        requiredExp: data.requiredExp || data.required_exp || data.所需修为,
        stability: data.stability || data.稳固度 || 100,
        lifespan: data.lifespan || data.寿命,
        maxLifespan: data.maxLifespan || data.max_lifespan || data.最大寿命,
        daoHeart: data.daoHeart || data.dao_heart || data.道心 || 50,
      })
    }

    // 打坐开始
    const handleMeditationStart = (data: any) => {
      console.log('[CultivationSync] 收到打坐开始消息:', data)
      updateCultivationData({
        isMeditating: true,
        meditationStartTime: data.startTime || data.start_time || Date.now(),
        expPerSecond: data.expPerSecond || data.exp_per_second || 0,
      })
    }

    // 打坐停止
    const handleMeditationStop = (data: any) => {
      console.log('[CultivationSync] 收到打坐停止消息:', data)
      updateCultivationData({
        isMeditating: false,
        meditationStartTime: null,
        expPerSecond: 0,
      })

      // 如果返回了总修为，更新修为值
      if (data.totalExp || data.total_exp) {
        const currentStore = useCultivationStore.getState()
        updateCultivationData({
          cultivationExp: currentStore.cultivationExp + (data.totalExp || data.total_exp),
        })
      }
    }

    // 修为增长（每秒累加）
    const handleExpGain = (data: any) => {
      const currentStore = useCultivationStore.getState()
      const expGain = data.exp || data.修为增长 || 0

      console.log('[CultivationSync] 修为增长:', expGain)

      updateCultivationData({
        cultivationExp: (data.currentExp || data.current_exp) ?? (currentStore.cultivationExp + expGain),
        expPerSecond: expGain,
      })
    }

    // 突破结果
    const handleBreakthroughResult = (data: any) => {
      console.log('[CultivationSync] 收到突破结果:', data)

      const success = data.success || data.成功 || false
      const updates: any = {
        isBreakthroughInProgress: false,
        breakthroughProgress: 0,
      }

      // 如果突破成功，更新境界信息
      if (success) {
        if (data.newRealm || data.new_realm || data.新境界) {
          updates.realm = data.newRealm || data.new_realm || data.新境界
        }
        if (data.newRealmLevel || data.new_realm_level || data.新境界层级) {
          updates.realmLevel = data.newRealmLevel || data.new_realm_level || data.新境界层级
        }

        // 如果有完整的修炼数据，更新所有数据
        if (data.cultivationData || data.cultivation_data) {
          const cultivationData = data.cultivationData || data.cultivation_data
          Object.assign(updates, {
            cultivationExp: cultivationData.cultivationExp || cultivationData.cultivation_exp || 0,
            requiredExp: cultivationData.requiredExp || cultivationData.required_exp || 1000,
            stability: cultivationData.stability || cultivationData.稳固度 || 100,
            lifespan: cultivationData.lifespan || cultivationData.寿命,
            maxLifespan: cultivationData.maxLifespan || cultivationData.max_lifespan,
            daoHeart: cultivationData.daoHeart || cultivationData.dao_heart || 50,
          })
        }
      }

      updateCultivationData(updates)
    }

    // 注册消息监听器
    const unsubscribe = gameClient.监听消息(handleMessage)

    // 清理函数
    return () => {
      console.log('[CultivationSync] 停止修炼系统 WebSocket 监听')
      unsubscribe()
    }
  }, [gameClient, updateCultivationData])
}

/**
 * 发送打坐命令
 */
export function sendStartMeditationCommand(gameClient: 游戏客户端) {
  console.log('[CultivationSync] 发送打坐命令')
  gameClient.发送命令('打坐')
}

/**
 * 发送停止打坐命令
 */
export function sendStopMeditationCommand(gameClient: 游戏客户端) {
  console.log('[CultivationSync] 发送停止打坐命令')
  gameClient.发送命令('停止打坐')
}

/**
 * 发送突破命令
 */
export function sendBreakthroughCommand(gameClient: 游戏客户端, useItems: number[] = []) {
  console.log('[CultivationSync] 发送突破命令，使用物品:', useItems)
  if (useItems.length > 0) {
    gameClient.发送命令(`突破 ${useItems.join(',')}`)
  } else {
    gameClient.发送命令('突破')
  }
}

/**
 * 发送查看修炼信息命令
 */
export function sendViewCultivationCommand(gameClient: 游戏客户端) {
  console.log('[CultivationSync] 发送查看修炼信息命令')
  gameClient.发送命令('修炼')
}
