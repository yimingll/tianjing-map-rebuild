import { MapData } from '@/types/map'
import { Deque } from './deque'

/**
 * 路径查找服务 - 使用BFS算法找到最短路径
 * 性能优化：使用双端队列代替数组，shift操作从 O(n) 优化到 O(1)
 */

// 方向名称映射 - 提取为常量避免重复创建
const DIRECTION_NAMES: { [key: string]: string } = {
  'north': '北',
  'south': '南',
  'east': '东',
  'west': '西',
  'northeast': '东北',
  'northwest': '西北',
  'southeast': '东南',
  'southwest': '西南',
  'up': '上',
  'down': '下'
}

/**
 * 查找从起点到终点的最短路径
 * @param mapData 地图数据
 * @param startRoomId 起点房间ID
 * @param targetRoomId 目标房间ID
 * @returns 移动方向数组，如 ['north', 'east']，如果无法到达返回 null
 */
export function findPath(
  mapData: MapData,
  startRoomId: number,
  targetRoomId: number
): string[] | null {
  // 如果起点和终点相同
  if (startRoomId === targetRoomId) {
    return []
  }

  // 构建房间ID到房间的映射
  const roomMap = new Map(mapData.rooms.map(room => [room.id, room]))

  // 调试日志：输出起点和终点的出口信息
  const startRoom = roomMap.get(startRoomId)
  const targetRoom = roomMap.get(targetRoomId)
  console.log('[Pathfinding Debug] 起点房间:', {
    id: startRoomId,
    name: startRoom?.name,
    exits: startRoom?.exits
  })
  console.log('[Pathfinding Debug] 目标房间:', {
    id: targetRoomId,
    name: targetRoom?.name,
    exits: targetRoom?.exits
  })

  // 检查起点和终点是否存在
  if (!roomMap.has(startRoomId) || !roomMap.has(targetRoomId)) {
    console.error('起点或终点房间不存在')
    return null
  }

  // BFS队列：使用双端队列提升性能
  // [当前房间ID, 到达该房间的路径]
  const queue = new Deque<[number, string[]]>()
  queue.push([startRoomId, []])
  const visited = new Set<number>([startRoomId])

  let iterations = 0
  const maxIterations = 1000 // 防止无限循环

  while (!queue.isEmpty() && iterations < maxIterations) {
    iterations++
    const item = queue.shift()
    if (!item) break
    const [currentRoomId, path] = item

    const currentRoom = roomMap.get(currentRoomId)
    if (!currentRoom) {
      console.warn(`[Pathfinding] 房间 ${currentRoomId} 不存在于地图数据中`)
      continue
    }

    // 遍历所有出口 - exits 现在是 { direction: targetRoomId }
    for (const [direction, nextRoomIdStr] of Object.entries(currentRoom.exits)) {
      const nextRoomId = typeof nextRoomIdStr === 'number' ? nextRoomIdStr : parseInt(nextRoomIdStr)

      // 跳过无效的房间ID
      if (isNaN(nextRoomId)) {
        console.warn(`无效的房间ID: ${nextRoomIdStr} (从房间 ${currentRoomId} 的 ${direction} 出口)`)
        continue
      }

      if (visited.has(nextRoomId)) continue

      const newPath = [...path, direction]

      // 找到目标
      if (nextRoomId === targetRoomId) {
        console.log(`[Pathfinding] 找到路径! 迭代次数: ${iterations}, 路径长度: ${newPath.length}`)
        return newPath
      }

      visited.add(nextRoomId)
      queue.push([nextRoomId, newPath])
    }
  }

  // 无法到达
  console.warn(`无法从房间 ${startRoomId} 到达房间 ${targetRoomId}`)
  console.warn(`[Pathfinding] BFS统计: 访问了 ${visited.size} 个房间, 迭代 ${iterations} 次`)
  console.warn(`[Pathfinding] 可访问的房间ID列表:`, Array.from(visited).sort((a, b) => a - b).slice(0, 20))
  return null
}

/**
 * 格式化路径为可读文本
 */
export function formatPath(path: string[]): string {
  return path.map(dir => DIRECTION_NAMES[dir] || dir).join(' → ')
}
