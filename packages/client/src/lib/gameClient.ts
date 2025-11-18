import { io, Socket } from 'socket.io-client'
import type { 消息类型, 消息分类 } from '../types/message'

/**
 * 游戏Socket.IO客户端
 * 负责与NestJS后端服务器通信
 */
export class 游戏客户端 {
  private socket: Socket | null = null
  private 服务器地址 = ''
  private 重连定时器: number | null = null
  private 连接超时定时器: number | null = null
  private 消息回调列表: Array<(消息: 消息类型) => void> = []
  private 连接状态回调列表: Array<(已连接: boolean, 手动断开: boolean) => void> = []
  private 连接错误回调列表: Array<(错误信息: string) => void> = []
  private 认证成功回调列表: Array<() => void> = []
  private 正在连接 = false
  private 连接超时时长 = 60000
  private 手动断开 = false
  private 被踢下线 = false
  private 待发送的Token: string | null = null
  private static readonly SESSION_KEY = 'mud_manual_disconnect'

  constructor() {
    // 从 sessionStorage 读取手动断开状态（仅在当前会话中有效）
    const savedState = sessionStorage.getItem(游戏客户端.SESSION_KEY)
    if (savedState === 'true') {
      this.手动断开 = true
    }
  }

  /**
   * 设置认证Token（登录成功后调用）
   */
  设置认证Token(token: string): void {
    this.待发送的Token = token

    // 如果已经连接，立即发送认证
    if (this.socket?.connected) {
      this.socket.emit('auth:login', { playerId: token })
    }
  }

  /**
   * 连接到游戏服务器
   */
  连接服务器(地址: string, 端口: number): void {
    // 如果已经连接或正在连接，不重复连接
    if (this.socket?.connected) {
      return
    }
    if (this.正在连接) {
      return
    }

    // 重置手动断开标志并清除 sessionStorage
    this.手动断开 = false
    this.被踢下线 = false
    sessionStorage.removeItem(游戏客户端.SESSION_KEY)

    this.服务器地址 = `http://${地址}:${端口}`
    this.建立连接()
  }

  /**
   * 建立Socket.IO连接
   */
  private 建立连接(): void {
    try {
      this.正在连接 = true

      // 创建Socket.IO连接
      this.socket = io(this.服务器地址, {
        transports: ['websocket', 'polling'],
        reconnection: false, // 禁用自动重连，我们自己管理
        timeout: this.连接超时时长,
      })

      // 启动连接超时检测
      this.启动连接超时检测()

      this.socket.on('connect', () => {
        this.正在连接 = false
        this.清除连接超时定时器()
        this.清除重连定时器()
        this.通知连接状态(true, false)

        // 如果有待发送的token，自动发送AUTH_LOGIN事件进行认证
        if (this.待发送的Token) {
          this.socket.emit('auth:login', { playerId: this.待发送的Token })
        }
      })

      // 监听服务器消息 - 使用通用的message事件
      this.socket.on('message', (data: any) => {
        this.处理服务器消息(data)
      })

      // 监听欢迎消息（连接成功时服务器发送）
      this.socket.on('welcome', (data: any) => {
        this.处理服务器消息(data)
      })

      // 监听各种可能的游戏事件
      this.socket.onAny((eventName: string, ...args: any[]) => {
        // 过滤掉不应该显示的内部事件
        const internalEvents = [
          'connect',
          'disconnect',
          'connect_error',
          'message',         // message 事件已在上面专门处理，避免重复
          'welcome',         // welcome 事件已在上面专门处理，避免重复
          'auth:success',    // 认证成功事件（内部处理）
          'auth:failed',     // 认证失败事件（内部处理）
          'room:enter',      // 房间进入事件（内部处理）
          'player:join',     // 玩家加入事件（内部处理）
        ]

        // 只处理应该显示给用户的消息
        if (!internalEvents.includes(eventName)) {
          this.处理服务器消息({
            type: eventName,
            data: args[0]
          })
        }
      })

      this.socket.on('connect_error', (错误) => {
        console.error('Socket.IO连接错误:', 错误)
        this.正在连接 = false
        this.清除连接超时定时器()
        this.通知连接错误('连接失败')
      })

      this.socket.on('disconnect', (原因) => {
        this.正在连接 = false
        this.清除连接超时定时器()

        // 判断是否是被踢下线
        const isForcedDisconnect = this.被踢下线
        if (isForcedDisconnect) {
          this.被踢下线 = false // 重置标志
        }

        this.通知连接状态(false, this.手动断开 || isForcedDisconnect)

        // 只有非手动断开且非被踢下线时才自动重连
        if (!this.手动断开 && !isForcedDisconnect && 原因 !== 'io client disconnect') {
          this.启动自动重连()
        }
      })
    } catch (错误) {
      console.error('连接失败:', 错误)
      this.正在连接 = false
      this.清除连接超时定时器()
      this.通知连接错误('连接失败')
    }
  }

  /**
   * 处理从服务器接收的消息
   */
  private 处理服务器消息(原始数据: any): void {
    try {
      let 数据 = 原始数据

      // 如果是字符串，尝试解析JSON
      if (typeof 原始数据 === 'string') {
        try {
          数据 = JSON.parse(原始数据)
        } catch {
          // 如果解析失败，保持原样
        }
      }


      // 根据消息类型处理
      const 消息: 消息类型 = {
        内容: 数据.content || 数据.Content || 数据.内容 || 数据.message || 数据.data?.content || 数据.data?.message || JSON.stringify(数据),
        类型: this.识别消息类型(数据),
        时间戳: Date.now()
      }

      // 检测认证成功消息（包含"欢迎回来"的消息表示认证成功）
      if (消息.内容.includes('欢迎回来') && 消息.内容.includes('成功进入游戏世界')) {
        this.触发认证成功回调()
      }

      // 检测被踢下线消息
      if (消息.内容.includes('您的账号在其他地方登录') || 消息.内容.includes('当前连接已断开')) {
        this.被踢下线 = true
      }

      this.触发消息回调(消息)
    } catch (错误) {
      console.error('处理消息失败:', 错误)
      // 如果处理失败，当作纯文本处理
      this.触发消息回调({
        内容: typeof 原始数据 === 'string' ? 原始数据 : JSON.stringify(原始数据),
        类型: '叙述',
        时间戳: Date.now()
      })
    }
  }

  /**
   * 识别消息类型
   */
  private 识别消息类型(数据: any): 消息分类 {
    // 优先检查中文字段
    if (数据.类型) return 数据.类型

    // 检查英文字段
    const type = 数据.type || 数据.Type || 数据.data?.type

    // 聊天消息类型（直接返回原始类型，包含点号）
    if (type === 'chat.say') return 'chat.say'
    if (type === 'chat.world') return 'chat.world'
    if (type === 'chat.team') return 'chat.team'
    if (type === 'chat.tell') return 'chat.tell'

    // 系统消息类型
    if (type === 'system') return '系统'
    if (type === 'system.login') return 'system.login'
    if (type === 'system.logout') return 'system.logout'
    if (type === 'system.announce') return 'system.announce'

    // 战斗消息类型
    if (type === 'battle') return '战斗'
    if (type === 'combat') return 'combat'
    if (type === 'combat.start') return 'combat.start'
    if (type === 'combat.round') return 'combat.round'
    if (type === 'combat.end') return 'combat.end'

    // 其他类型
    if (type === 'error') return '错误'
    if (type === 'help') return '帮助'
    if (type === 'narrative') return '叙述'
    if (type === 'description') return '描述'
    if (type === 'command') return '命令'
    if (type === 'response') return '响应'
    if (type === 'action') return '动作'
    if (type === 'character_update') return 'character_update'
    if (type === 'room_update') return 'room_update'
    if (type === 'map_data') return 'map_data'
    if (type === 'dialogue') return 'dialogue'

    return '叙述'
  }

  /**
   * 发送命令到服务器
   */
  发送命令(命令: string): void {
    if (!this.socket || !this.socket.connected) {
      this.触发消息回调({
        内容: '未连接到服务器',
        类型: '错误',
        时间戳: Date.now()
      })
      return
    }

    try {
      // 发送命令事件
      this.socket.emit('command', {
        type: 'command',
        content: 命令
      })
      // 注意：不在这里回显命令，由调用方（App.tsx）负责显示
    } catch (错误) {
      console.error('发送命令失败:', 错误)
      this.触发消息回调({
        内容: '发送命令失败',
        类型: '错误',
        时间戳: Date.now()
      })
    }
  }

  /**
   * 断开连接
   */
  断开连接(): void {
    this.手动断开 = true
    // 保存到 sessionStorage，仅在当前会话中有效
    sessionStorage.setItem(游戏客户端.SESSION_KEY, 'true')

    this.清除重连定时器()
    this.清除连接超时定时器()
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * 监听消息
   * 返回取消监听的函数
   */
  监听消息(回调: (消息: 消息类型) => void): () => void {
    // 检查是否已经添加过此回调，避免重复
    if (!this.消息回调列表.includes(回调)) {
      this.消息回调列表.push(回调)
    }

    // 返回取消监听的函数
    return () => {
      const 索引 = this.消息回调列表.indexOf(回调)
      if (索引 > -1) {
        this.消息回调列表.splice(索引, 1)
      }
    }
  }

  /**
   * 监听连接状态
   * 返回取消监听的函数
   */
  监听连接状态(回调: (已连接: boolean, 手动断开: boolean) => void): () => void {
    // 检查是否已经添加过此回调，避免重复
    if (!this.连接状态回调列表.includes(回调)) {
      this.连接状态回调列表.push(回调)
    }

    // 返回取消监听的函数
    return () => {
      const 索引 = this.连接状态回调列表.indexOf(回调)
      if (索引 > -1) {
        this.连接状态回调列表.splice(索引, 1)
      }
    }
  }

  /**
   * 触发消息回调
   */
  private 触发消息回调(消息: 消息类型): void {
    this.消息回调列表.forEach(回调 => 回调(消息))
  }

  /**
   * 监听连接错误
   * 返回取消监听的函数
   */
  监听连接错误(回调: (错误信息: string) => void): () => void {
    if (!this.连接错误回调列表.includes(回调)) {
      this.连接错误回调列表.push(回调)
    }

    return () => {
      const 索引 = this.连接错误回调列表.indexOf(回调)
      if (索引 > -1) {
        this.连接错误回调列表.splice(索引, 1)
      }
    }
  }

  /**
   * 通知连接状态
   */
  private 通知连接状态(已连接: boolean, 手动断开: boolean): void {
    this.连接状态回调列表.forEach(回调 => 回调(已连接, 手动断开))
  }

  /**
   * 通知连接错误
   */
  private 通知连接错误(错误信息: string): void {
    this.连接错误回调列表.forEach(回调 => 回调(错误信息))
  }

  /**
   * 监听认证成功事件
   * 返回取消监听的函数
   */
  监听认证成功(回调: () => void): () => void {
    if (!this.认证成功回调列表.includes(回调)) {
      this.认证成功回调列表.push(回调)
    }

    return () => {
      const 索引 = this.认证成功回调列表.indexOf(回调)
      if (索引 > -1) {
        this.认证成功回调列表.splice(索引, 1)
      }
    }
  }

  /**
   * 触发认证成功回调
   */
  private 触发认证成功回调(): void {
    this.认证成功回调列表.forEach(回调 => 回调())
  }


  /**
   * 启动连接超时检测
   */
  private 启动连接超时检测(): void {
    this.清除连接超时定时器()
    this.连接超时定时器 = window.setTimeout(() => {
      if (this.正在连接) {
        this.正在连接 = false
        if (this.socket) {
          this.socket.disconnect()
          this.socket = null
        }
        this.通知连接错误('连接超时')
      }
    }, this.连接超时时长)
  }

  /**
   * 清除连接超时定时器
   */
  private 清除连接超时定时器(): void {
    if (this.连接超时定时器) {
      clearTimeout(this.连接超时定时器)
      this.连接超时定时器 = null
    }
  }

  /**
   * 启动自动重连
   */
  private 启动自动重连(): void {
    this.清除重连定时器()
    this.重连定时器 = window.setTimeout(() => {
      this.建立连接()
    }, 5000)
  }

  /**
   * 清除重连定时器
   */
  private 清除重连定时器(): void {
    if (this.重连定时器) {
      clearTimeout(this.重连定时器)
      this.重连定时器 = null
    }
  }

}

// 导出单例实例供其他模块使用
export const gameClient = new 游戏客户端()
