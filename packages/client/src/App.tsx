import { useState, useEffect, useRef } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ThemeProvider } from './contexts/ThemeContext'
import { TopBar } from '@components'
import { LeftPanel, RightPanel, TextDisplay, CommandInput, InkWashEffect, ChannelArea } from '@features/game-ui'
import { AuthModal } from '@features/auth'
import { loadGameSettings, applyGameSettings } from './components/SettingsModal'
import { MapStyleSettings } from '@features/settings'
import { 游戏客户端 as GameClient } from '@lib/gameClient'
import { useAuthStore } from '@features/auth/authStore'
import { 认证客户端实例 } from '@features/auth/authClient'
import { useCharacterSync, useCharacterStore, CharacterPanel } from '@features/character'
import { useMovementSync, useMovementStore } from '@features/movement'
import { useChatSync } from '@features/chat'
import { useMapStore } from '@features/map/mapStore'
import { setupEquipmentListeners, clearEquipmentState, EquipmentPanel } from '@features/equipment'
import { InventoryPanel, setupInventoryListeners } from '@features/inventory'
import { DialoguePanel, useDialogueSync } from '@features/dialogue'
import { NpcDialoguePanel, NpcShopPanel, useNpcStore } from '@features/npc'
import { QuestPanel } from '@features/quest'
import { CombatPanel, useCombatStore } from '@features/combat'
import type { 消息类型 } from '@types/message'
import type { CommandInputRef } from '@features/game-ui/CommandInput'
import './App.css'

function AppContent() {
  // 应用启动时加载并应用游戏设置
  useEffect(() => {
    const settings = loadGameSettings()
    applyGameSettings(settings)
  }, [])
  // 认证状态
  const { isAuthenticated, userInfo, 检查登录状态, 登录, 登出 } = useAuthStore()

  // 控制登录界面显示
  const [显示登录弹窗, 设置显示登录弹窗] = useState(false)
  // 控制地图风格设置界面显示
  const [显示设置弹窗, 设置显示设置弹窗] = useState(false)
  // 控制装备面板显示
  const [显示装备面板, 设置显示装备面板] = useState(false)
  // 控制背包面板显示
  const [显示背包面板, 设置显示背包面板] = useState(false)
  // 控制角色面板显示
  const [显示角色面板, 设置显示角色面板] = useState(false)
  // 控制对话面板显示
  const [显示对话面板, 设置显示对话面板] = useState(false)
  // 是否已尝试自动登录
  const [已尝试自动登录, 设置已尝试自动登录] = useState(false)

  // 战斗面板状态
  const { isCombatPanelOpen, closeCombatPanel } = useCombatStore()
  // 是否已显示初始欢迎消息
  const 已显示初始欢迎消息 = useRef(false)

  const [消息列表, 设置消息列表] = useState<消息类型[]>([
    {
      类型: '系统',
      内容: '⏳ 正在连接服务器...',
      时间戳: new Date()
    }
  ])
  const [已连接, 设置已连接] = useState(false)
  const [客户端] = useState(() => new GameClient())

  // 角色属性管理
  const { clearAttributes } = useCharacterStore()

  // 移动系统管理
  const { clearRoom } = useMovementStore()

  // 地图系统管理
  const { setMapData } = useMapStore()

  // 启用角色属性同步
  useCharacterSync(消息列表)

  // 启用移动系统同步
  useMovementSync(消息列表)

  // 启用聊天消息同步
  useChatSync(消息列表)

  // 启用对话系统同步
  useDialogueSync(消息列表)

  // 监听对话消息自动打开对话面板
  useEffect(() => {
    const latestDialogueMessage = 消息列表.slice().reverse().find(msg => msg.类型 === 'dialogue')
    if (latestDialogueMessage) {
      try {
        const dialogueData = JSON.parse(latestDialogueMessage.内容)
        // 只在对话开始时打开面板
        if (dialogueData.type === 'dialogue_start') {
          设置显示对话面板(true)
        }
        // 对话结束时关闭面板
        if (dialogueData.type === 'dialogue_end') {
          setTimeout(() => {
            设置显示对话面板(false)
          }, 2000)
        }
      } catch (e) {
        console.error('解析对话消息失败:', e)
      }
    }
  }, [消息列表])

  // 同步地图数据 - 处理 map_data 类型的消息
  useEffect(() => {
    const latestMapMessage = 消息列表.slice().reverse().find(msg => msg.类型 === 'map_data')
    if (latestMapMessage) {
      try {
        const mapData = JSON.parse(latestMapMessage.内容)
        setMapData(mapData)
      } catch (e) {
        console.error('解析地图数据失败:', e)
      }
    }
  }, [消息列表, setMapData])

  const commandInputRef = useRef<CommandInputRef>(null)

  // 连接成功后的登录流程
  useEffect(() => {
    // 只有在连接成功后才执行登录流程
    if (!已连接 || 已尝试自动登录) {
      return
    }

    const executeLoginFlow = async () => {
      // 检查登录状态
      检查登录状态()

      // 检查当前登录状态（从 sessionStorage 恢复的）
      const currentAuthState = useAuthStore.getState()

      // 如果刷新页面时已经有登录状态（从 sessionStorage 恢复），显示账号信息
      if (currentAuthState.isAuthenticated && currentAuthState.userInfo) {
        添加消息('系统', `📋 账号信息 - 角色名: ${currentAuthState.userInfo.displayName} | 角色ID: ${currentAuthState.userInfo.username}`)

        // 立即设置 token，让 WebSocket 连接后自动认证
        const token = 认证客户端实例.获取Token()
        if (token) {
          客户端.设置认证Token(token)
        }

        // 请求装备数据
        // 客户端.发送命令('equipment') // TODO: 后端未实现 equipment 命令

        已显示初始欢迎消息.current = true
        设置已尝试自动登录(true)
        return // 已经登录，不需要继续自动登录流程
      }

      // 检查是否是手动登出（仅在当前会话中有效）
      const wasManualLogout = sessionStorage.getItem('manual_logout') === 'true'

      try {
        const saved = localStorage.getItem('saved_credentials')
        let autoLoginEnabled = false

        if (saved) {
          const decoded = atob(saved)
          const credentials = JSON.parse(decoded)
          autoLoginEnabled = credentials.autoLogin && credentials.username && credentials.password

          // 如果开启了自动登录且不是手动登出
          if (autoLoginEnabled && !wasManualLogout) {
            添加消息('系统', '🔄 正在自动登录...')
            // 自动登录时传递 rememberPassword=true，保持凭据不被清除
            const response = await 登录(credentials.username, credentials.password, true)

            if (response.success) {
              const currentUserInfo = useAuthStore.getState().userInfo
              // 添加自动登录成功消息（不清空历史消息）
              添加消息('系统', `🎉 自动登录成功！${currentUserInfo?.displayName || currentUserInfo?.username || credentials.username} (角色ID: ${currentUserInfo?.username || credentials.username})`)
              已显示初始欢迎消息.current = true

              // 获取token并设置到游戏客户端，用于WebSocket认证
              const token = 认证客户端实例.获取Token()
              if (token) {
                客户端.设置认证Token(token)
              }

              // 注意：不再发送 look 命令，因为后端在认证成功时已经自动执行并返回结果

              // 请求装备数据
              // 客户端.发送命令('equipment') // TODO: 后端未实现 equipment 命令
            } else {
              添加消息('系统', `⚠️ 自动登录失败: ${response.message}`)
              // 自动登录失败，显示登录提示
              if (!已显示初始欢迎消息.current) {
                添加消息('系统', '💡 点击右上角"账号登录"开始修行之旅。')
                已显示初始欢迎消息.current = true
              }
            }
          } else {
            // 没有开启自动登录，显示登录提示
            if (!已显示初始欢迎消息.current) {
              添加消息('系统', '💡 点击右上角"账号登录"开始修行之旅。')
              已显示初始欢迎消息.current = true
            }
          }
        }
      } catch (error) {
        console.error('登录流程失败:', error)
        // 出错时显示登录提示
        if (!已显示初始欢迎消息.current) {
          添加消息('系统', '💡 点击右上角"账号登录"开始修行之旅。')
          已显示初始欢迎消息.current = true
        }
      } finally {
        设置已尝试自动登录(true)
      }
    }

    executeLoginFlow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [已连接, 已尝试自动登录])

  // 初始化客户端监听（仅一次）
  useEffect(() => {
    // 设置装备系统监听器
    setupEquipmentListeners(客户端)
    // 设置背包系统监听器
    setupInventoryListeners(客户端)

    // 监听服务器消息
    const 取消消息监听 = 客户端.监听消息((消息) => {
      // 检测是否是欢迎Banner消息
      if (消息.内容 && typeof 消息.内容 === 'string') {
        try {
          const parsed = JSON.parse(消息.内容)
          if (parsed.type === 'welcome_banner' && parsed.data) {
            // 将欢迎Banner数据添加为特殊消息类型
            const welcomeMessage: 消息类型 = {
              类型: 'welcome_banner' as any,
              内容: JSON.stringify(parsed.data),
              时间戳: Date.now()
            }
            设置消息列表(prev => [...prev, welcomeMessage])
            return
          }
        } catch {
          // 不是JSON，继续正常处理
        }
      }

      设置消息列表(prev => [...prev, 消息])
    })

    // 监听认证成功事件
    const 取消认证成功监听 = 客户端.监听认证成功(() => {
      // 认证成功时，标记已显示欢迎消息，避免显示登录提示
      已显示初始欢迎消息.current = true
    })

    // 监听连接状态
    const 取消连接状态监听 = 客户端.监听连接状态((状态, 手动断开) => {
      设置已连接(状态)

      if (状态) {
        // 连接成功
        添加消息('系统', '✅ 已连接到服务器: localhost:3000')
        // 注意：服务器会自动发送欢迎消息，客户端不需要重复添加

        // 不在这里检查登录状态，而是让自动登录流程和认证成功回调来处理
        // 如果没有自动登录，会在自动登录流程的 finally 块中处理
      } else {
        // 连接断开
        if (手动断开) {
          // 手动断开连接
          // 如果已登录，自动登出（从 store 获取最新状态）
          const authState = useAuthStore.getState()
          if (authState.isAuthenticated) {
            const currentUsername = authState.userInfo?.username
            authState.登出()
            clearAttributes() // 清空角色属性
            clearRoom() // 清空房间信息
            clearEquipmentState() // 清空装备数据
            添加消息('系统', `👋 已断开连接并登出账号 ${currentUsername}，欢迎下次游玩！`)
          } else {
            添加消息('系统', '👋 已断开连接，欢迎下次游玩！')
          }
        } else {
          // 意外断开连接
          添加消息('系统', '❌ 与服务器的连接已断开')
          添加消息('系统', '⏳ 5秒后尝试重连...')
          clearAttributes() // 清空角色属性
          clearRoom() // 清空房间信息
          clearEquipmentState() // 清空装备数据
        }

        // 重置自动登录状态，以便重连后可以再次尝试
        设置已尝试自动登录(false)
        已显示初始欢迎消息.current = false
      }
    })

    // 监听连接错误（超时或失败）
    const 取消连接错误监听 = 客户端.监听连接错误((错误信息) => {
      console.error('连接错误:', 错误信息)

      if (错误信息 === '连接超时') {
        添加消息('错误', '❌ 连接服务器超时（60秒），请检查服务器是否启动')
      } else {
        添加消息('错误', `❌ 连接失败: ${错误信息}`)
      }

      // 连接错误时，标记已尝试登录，避免无限等待
      设置已尝试自动登录(true)
    })

    // 检查是否在当前会话中手动断开过
    const wasManuallyDisconnected = sessionStorage.getItem('mud_manual_disconnect') === 'true'

    if (wasManuallyDisconnected) {
      // 如果之前手动断开过，不自动连接
      设置消息列表([{
        类型: '系统',
        内容: '👋 上次会话已断开连接',
        时间戳: new Date()
      }, {
        类型: '系统',
        内容: '💡 点击"连接服务器"按钮重新连接',
        时间戳: new Date()
      }])
      设置已尝试自动登录(true)
    } else {
      // 页面加载时自动连接服务器
      客户端.连接服务器('localhost', 3000)
    }

    // 清理函数：取消所有监听
    return () => {
      取消消息监听()
      取消认证成功监听()
      取消连接状态监听()
      取消连接错误监听()
      // 注意：不在这里调用 断开连接()，让手动断开状态保持
    }
  }, [客户端])


  const 添加消息 = (类型: string, 内容: string) => {
    设置消息列表(prev => [...prev, {
      类型: 类型 as any,
      内容,
      时间戳: new Date()
    }])
  }

  const 清空消息 = () => {
    设置消息列表([])
    添加消息('系统', '📄 输出已清空')
  }

  const 连接服务器 = () => {
    // 如果已经连接，不重复连接
    if (已连接) {
      return
    }

    // 手动连接服务器时，重置登录状态
    // 清除 sessionStorage 中的登录信息（强制用户重新登录）
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user_info')
    sessionStorage.removeItem('manual_logout')

    // 重置认证状态
    const authState = useAuthStore.getState()
    if (authState.isAuthenticated) {
      authState.登出()
    }

    // 重置初始欢迎消息标记
    已显示初始欢迎消息.current = false
    设置已尝试自动登录(false)

    // 清空历史消息，准备新的连接会话
    设置消息列表([{
      类型: '系统',
      内容: '正在连接服务器...',
      时间戳: new Date()
    }])
    客户端.连接服务器('localhost', 3000)
  }

  const 断开连接 = () => {
    客户端.断开连接()
    // 注意：不在这里添加消息，连接状态监听会自动处理
  }

  const 发送命令 = (命令: string) => {
    if (已连接) {
      添加消息('命令', 命令)
      客户端.发送命令(命令)
    } else {
      添加消息('系统', '⚠️ 未连接到服务器，请先点击"连接服务器"')
    }
  }

  const 命令点击 = (命令: string, 动作: 'execute' | 'fill') => {
    if (动作 === 'execute') {
      发送命令(命令)
    } else {
      if (commandInputRef.current) {
        commandInputRef.current.setInputValue(命令 + ' ')
      }
    }
  }

  const handleAuthSuccess = () => {
    // 立即更新认证状态
    检查登录状态()
    const currentUserInfo = useAuthStore.getState().userInfo

    // 添加登录成功消息（不清空历史消息）
    添加消息('系统', `🎉 登录成功！${currentUserInfo?.displayName || currentUserInfo?.username} (角色ID: ${currentUserInfo?.username})`)

    已显示初始欢迎消息.current = true
    设置显示登录弹窗(false)

    // 清除手动登出标记（手动登录成功后，允许后续自动登录）
    sessionStorage.removeItem('manual_logout')

    // 获取token并设置到游戏客户端，用于WebSocket认证
    const token = 认证客户端实例.获取Token()
    if (token) {
      客户端.设置认证Token(token)
    }

    // 注意：不再发送 look 命令，因为后端在认证成功时已经自动执行并返回结果

    // 请求装备数据
    // TODO: 后端未实现 equipment 命令
    // if (已连接) {
    //   客户端.发送命令('equipment')
    // }
  }

  const 打开登录界面 = () => {
    设置显示登录弹窗(true)
  }

  const 关闭登录界面 = () => {
    设置显示登录弹窗(false)
  }

  const 打开设置界面 = () => {
    设置显示设置弹窗(true)
  }

  const 关闭设置界面 = () => {
    设置显示设置弹窗(false)
  }

  return (
    <div className="mud-game">
      <InkWashEffect />

      {/* 点击按钮时显示登录界面 */}
      {显示登录弹窗 && !isAuthenticated && (
        <AuthModal
          onSuccess={handleAuthSuccess}
          onClose={关闭登录界面}
          已连接={已连接}
          连接服务器={连接服务器}
        />
      )}

      {/* 地图风格设置界面 */}
      {显示设置弹窗 && (
        <MapStyleSettings 关闭={关闭设置界面} />
      )}

      {/* 装备面板 */}
      {显示装备面板 && (
        <EquipmentPanel
          isOpen={显示装备面板}
          onClose={() => 设置显示装备面板(false)}
        />
      )}

      {/* 背包面板 */}
      {显示背包面板 && (
        <InventoryPanel
          isOpen={显示背包面板}
          onClose={() => 设置显示背包面板(false)}
        />
      )}

      {/* 角色面板 */}
      {显示角色面板 && (
        <CharacterPanel
          isOpen={显示角色面板}
          onClose={() => 设置显示角色面板(false)}
        />
      )}

      {/* 对话面板 */}
      {显示对话面板 && (
        <DialoguePanel
          onClose={() => 设置显示对话面板(false)}
          onChoiceSelect={(choiceId, choiceIndex) => {
            // 发送对话选择到服务器
            发送命令(`dialogue_choice ${choiceIndex + 1}`)
          }}
        />
      )}

      {/* NPC对话面板 */}
      <NpcDialoguePanel />

      {/* NPC商店面板 */}
      <NpcShopPanel />

      {/* 任务面板 */}
      <QuestPanel />

      {/* 战斗面板 */}
      {isCombatPanelOpen && (
        <CombatPanel
          isOpen={isCombatPanelOpen}
          onClose={closeCombatPanel}
        />
      )}

      <TopBar
        已连接={已连接}
        服务器地址="localhost:3000"
        连接服务器={连接服务器}
        断开连接={断开连接}
        显示登录界面={打开登录界面}
        显示设置界面={打开设置界面}
      />
      <div className="game-content">
        <LeftPanel
          快捷命令={发送命令}
          已连接={已连接}
        />
        <div className="main-display">
          <ChannelArea 消息列表={消息列表} />
          <TextDisplay 消息列表={消息列表} 命令点击={命令点击} 清空消息={清空消息} />
          <CommandInput ref={commandInputRef} 发送命令={发送命令} />
        </div>
        <RightPanel
          快捷命令={发送命令}
          已连接={已连接}
          打开装备面板={() => 设置显示装备面板(true)}
          打开背包面板={() => 设置显示背包面板(true)}
          打开角色面板={() => 设置显示角色面板(true)}
        />
      </div>
    </div>
  )
}

// 主应用包装器 - 提供主题上下文
function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </DndProvider>
  )
}

export default App
