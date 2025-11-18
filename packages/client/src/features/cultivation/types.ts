/**
 * 修炼系统类型定义
 */

/**
 * 修炼数据
 */
export interface CultivationData {
  /** 当前境界名称 */
  realm: string
  /** 境界层级（数值） */
  realmLevel: number
  /** 当前修为值 */
  cultivationExp: number
  /** 突破所需修为 */
  requiredExp: number
  /** 境界稳固度 (0-100) */
  stability: number
  /** 当前寿命 */
  lifespan: number
  /** 最大寿命 */
  maxLifespan: number
  /** 道心值 (0-100) */
  daoHeart: number
}

/**
 * 打坐状态
 */
export interface MeditationState {
  /** 是否在打坐 */
  isMeditating: boolean
  /** 打坐开始时间戳 */
  meditationStartTime: number | null
  /** 每秒修为增长 */
  expPerSecond: number
}

/**
 * 突破状态
 */
export interface BreakthroughState {
  /** 是否在突破中 */
  isBreakthroughInProgress: boolean
  /** 突破进度 (0-100) */
  breakthroughProgress: number
}

/**
 * WebSocket 消息 - 修炼信息
 */
export interface CultivationInfoMessage {
  type: 'cultivation_info'
  data: CultivationData
}

/**
 * WebSocket 消息 - 打坐开始
 */
export interface MeditationStartMessage {
  type: 'meditation_start'
  data: {
    startTime: number
    expPerSecond: number
  }
}

/**
 * WebSocket 消息 - 打坐停止
 */
export interface MeditationStopMessage {
  type: 'meditation_stop'
  data: {
    totalExp: number
    duration: number
  }
}

/**
 * WebSocket 消息 - 修为增长
 */
export interface ExpGainMessage {
  type: 'exp_gain'
  data: {
    exp: number
    currentExp: number
  }
}

/**
 * WebSocket 消息 - 突破结果
 */
export interface BreakthroughResultMessage {
  type: 'breakthrough_result'
  data: {
    success: boolean
    newRealm?: string
    newRealmLevel?: number
    message: string
    cultivationData?: CultivationData
  }
}

/**
 * 修炼系统 WebSocket 消息联合类型
 */
export type CultivationMessage =
  | CultivationInfoMessage
  | MeditationStartMessage
  | MeditationStopMessage
  | ExpGainMessage
  | BreakthroughResultMessage
