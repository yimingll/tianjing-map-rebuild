/**
 * 移动系统相关类型定义
 */

/**
 * 房间信息
 */
export interface RoomInfo {
  id: string
  name: string
  description: string
  area: string
  exits: Record<string, string> // 方向 -> 目标房间ID
}

/**
 * 出口信息
 */
export interface ExitInfo {
  direction: string       // 标准方向（north, south等）
  displayName: string     // 显示名称（北方、南方等）
  targetRoom: string      // 目标房间名称
  isLocked: boolean       // 是否锁定
}

/**
 * 玩家简要信息
 */
export interface PlayerBrief {
  id: number
  name: string
  realm?: string          // 境界
  realmLayer?: number     // 境界层数
}

/**
 * NPC简要信息
 */
export interface NPCBrief {
  id: string
  name: string
  description?: string
}

/**
 * 物品简要信息
 */
export interface ItemBrief {
  id: string
  name: string
  description?: string
}

/**
 * 移动响应
 */
export interface MoveResponse {
  success: boolean
  message: string
  fromRoomId?: number
  toRoomId?: number
  direction?: string
  currentRoom?: RoomInfo
  visibleExits?: ExitInfo[]
  roomPlayers?: PlayerBrief[]
  roomNPCs?: NPCBrief[]
  roomItems?: ItemBrief[]
}

/**
 * 房间进入事件
 */
export interface RoomEnterEvent {
  type: 'room.enter'
  data: {
    character_name: string
    direction: string
    message: string
  }
}

/**
 * 房间离开事件
 */
export interface RoomLeaveEvent {
  type: 'room.leave'
  data: {
    character_name: string
    direction: string
    message: string
  }
}

/**
 * 房间信息响应
 */
export interface RoomInfoResponse {
  success: boolean
  room: RoomInfo
  exits: ExitInfo[]
  players: PlayerBrief[]
  npcs: NPCBrief[]
  items: ItemBrief[]
}
