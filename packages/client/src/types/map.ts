// 区域信息
export interface District {
  id: string
  name: string
  roomCount: number
}

// 地图房间节点 - 与后端数据结构匹配
export interface RoomNode {
  id: number
  name: string
  x: number
  y: number
  exits: { [direction: string]: number }  // 方向 -> 目标房间ID
  districtId?: string  // 所属区域ID
  districtName?: string  // 所属区域名称
}

// 地图数据 - 与后端数据结构匹配
export interface MapData {
  area_name: string
  rooms: RoomNode[]
  player_room: number  // 玩家所在房间的ID
  districts?: District[]  // 区域列表
}
