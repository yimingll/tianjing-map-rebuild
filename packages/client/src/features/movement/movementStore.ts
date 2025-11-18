/**
 * 移动系统状态管理
 *
 * 使用 Zustand 管理当前房间、出口、房间内实体等信息
 */

import { create } from 'zustand'
import type { RoomInfo, ExitInfo, PlayerBrief, NPCBrief, ItemBrief } from '../../types/movement'

interface MovementState {
  // 当前房间信息
  currentRoom: RoomInfo | null
  exits: ExitInfo[]
  roomPlayers: PlayerBrief[]
  roomNPCs: NPCBrief[]
  roomItems: ItemBrief[]

  // 移动状态
  isMoving: boolean
  lastMoveTime: number | null

  // Actions
  updateRoom: (room: RoomInfo, exits: ExitInfo[]) => void
  updateRoomEntities: (players: PlayerBrief[], npcs: NPCBrief[], items: ItemBrief[]) => void
  setMoving: (moving: boolean) => void
  clearRoom: () => void

  // 辅助方法
  getExitByDirection: (direction: string) => ExitInfo | undefined
  hasExit: (direction: string) => boolean
}

export const useMovementStore = create<MovementState>((set, get) => ({
  // 初始状态
  currentRoom: null,
  exits: [],
  roomPlayers: [],
  roomNPCs: [],
  roomItems: [],
  isMoving: false,
  lastMoveTime: null,

  // 更新房间信息
  updateRoom: (room: RoomInfo, exits: ExitInfo[]) => {
    console.log('[MovementStore] 更新房间:', room.name)
    set({
      currentRoom: room,
      exits: exits,
      isMoving: false,
      lastMoveTime: Date.now(),
    })
  },

  // 更新房间内实体
  updateRoomEntities: (players: PlayerBrief[], npcs: NPCBrief[], items: ItemBrief[]) => {
    console.log('[MovementStore] 更新房间实体:', {
      players: players.length,
      npcs: npcs.length,
      items: items.length
    })
    set({
      roomPlayers: players,
      roomNPCs: npcs,
      roomItems: items,
    })
  },

  // 设置移动状态
  setMoving: (moving: boolean) => {
    set({ isMoving: moving })
  },

  // 清空房间信息（登出时调用）
  clearRoom: () => {
    console.log('[MovementStore] 清空房间信息')
    set({
      currentRoom: null,
      exits: [],
      roomPlayers: [],
      roomNPCs: [],
      roomItems: [],
      isMoving: false,
      lastMoveTime: null,
    })
  },

  // 根据方向获取出口
  getExitByDirection: (direction: string): ExitInfo | undefined => {
    const { exits } = get()
    return exits.find(
      exit =>
        exit.direction.toLowerCase() === direction.toLowerCase() ||
        exit.displayName === direction
    )
  },

  // 检查是否有某个方向的出口
  hasExit: (direction: string): boolean => {
    const exit = get().getExitByDirection(direction)
    return exit !== undefined && !exit.isLocked
  },
}))

/**
 * 辅助函数：解析look命令返回的房间信息
 *
 * 从文本格式的look响应中提取房间信息
 * 注意：这是临时方案，理想情况下后端应返回结构化JSON
 */
export function parseLookResponse(content: string): {
  room: RoomInfo | null
  exits: ExitInfo[]
} {
  // TODO: 实现文本解析逻辑
  // 当前后端返回的是彩色文本，需要解析
  // 或者修改后端返回结构化数据

  console.log('[MovementStore] 解析look响应 (待实现)')

  return {
    room: null,
    exits: []
  }
}

/**
 * 辅助函数：解析移动响应
 *
 * 从移动命令的响应中提取房间信息
 */
export function parseMoveResponse(content: string): {
  room: RoomInfo | null
  exits: ExitInfo[]
} {
  // TODO: 实现移动响应解析
  console.log('[MovementStore] 解析移动响应 (待实现)')

  return {
    room: null,
    exits: []
  }
}
