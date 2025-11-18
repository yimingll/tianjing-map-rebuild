import { useMemo, useState, useEffect } from 'react'
import './RegionMap.css'
import { useMapStore } from './mapStore'
import { findPath, formatPath } from './pathfinding'
import { autoMovementController } from './autoMovement'

interface RegionMapProps {
  关闭: () => void
  发送命令: (命令: string) => void
}

type 地图模式 = 'layout' | 'radar'

function RegionMap({ 关闭, 发送命令 }: RegionMapProps) {
  // 获取真实地图数据
  const { mapData } = useMapStore()
  const [地图模式, 设置地图模式] = useState<地图模式>('layout')
  const [雷达偏移量, 设置雷达偏移量] = useState({ x: 0, y: 0 })
  const [布局偏移量, 设置布局偏移量] = useState({ x: 0, y: 0 })
  const [拖动中, 设置拖动中] = useState(false)
  const [拖动起点, 设置拖动起点] = useState({ x: 0, y: 0 })
  const [已发生拖动, 设置已发生拖动] = useState(false) // 跟踪是否真正拖动过
  const [缩放比例, 设置缩放比例] = useState(100)
  const [正在关闭, 设置正在关闭] = useState(false)
  const [缩放原点, 设置缩放原点] = useState({ x: 0, y: 0 })
  const [边界状态, 设置边界状态] = useState({ top: false, right: false, bottom: false, left: false })
  const [模式切换动画, 设置模式切换动画] = useState(false)
  const [移动进度, 设置移动进度] = useState<{ current: number; total: number; direction: string; fullPath: string[] } | null>(null)
  const [悬停房间, 设置悬停房间] = useState<{ id: number; name: string; path: string[] | null } | null>(null)
  const [选中的区域, 设置选中的区域] = useState<string | null>(null) // null表示显示所有区域

  // 根据玩家当前位置自动确定默认区域
  useEffect(() => {
    if (mapData?.rooms && mapData?.player_room !== undefined) {
      // 找到玩家当前所在的房间
      const 当前房间 = mapData.rooms.find(room => room.id === mapData.player_room)
      if (当前房间 && 当前房间.districtId) {
        // 默认显示玩家当前所在区域
        设置选中的区域(当前房间.districtId)
        console.log('[RegionMap] 自动选择当前区域:', 当前房间.districtName, '房间:', 当前房间.name)
      } else {
        // 如果无法确定区域,显示所有区域
        设置选中的区域(null)
        console.log('[RegionMap] 无法确定区域,显示全部区域')
      }
    }
  }, [mapData])

  const [搜索关键词, 设置搜索关键词] = useState<string>('')
  const [搜索结果房间, 设置搜索结果房间] = useState<number | null>(null) // 搜索到的房间ID

  // 处理关闭动画
  const 执行关闭 = () => {
    // 如果正在移动，先停止移动
    if (autoMovementController.isActive()) {
      autoMovementController.stop()
      设置移动进度(null)
    }

    设置正在关闭(true)
    setTimeout(() => {
      关闭()
    }, 100) // 与动画时长一致
  }

  // ESC键关闭窗口或中断移动
  useEffect(() => {
    const 处理按键 = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (autoMovementController.isActive()) {
          autoMovementController.stop()
          设置移动进度(null)
        } else {
          执行关闭()
        }
      }
    }
    window.addEventListener('keydown', 处理按键)
    return () => {
      window.removeEventListener('keydown', 处理按键)
    }
  }, [])

  // 点击遮罩关闭
  const 处理遮罩点击 = () => {
    执行关闭()
  }

  // 生成更大的地图区域 (50x50)，支持拖动
  const 完整地图 = useMemo(() => {
    const map = []
    for (let y = 0; y < 50; y++) {
      const row = []
      for (let x = 0; x < 50; x++) {
        // 中心点 - 当前位置 (25, 25)
        if (x === 25 && y === 25) {
          row.push({ char: '●', type: 'current', name: '当前位置' })
        }
        // 随机生成地形
        else {
          const rand = Math.random()
          if (rand > 0.85) {
            row.push({ char: '山', type: 'mountain', name: '山脉' })
          } else if (rand > 0.75) {
            row.push({ char: '林', type: 'forest', name: '森林' })
          } else if (rand > 0.70) {
            row.push({ char: '水', type: 'water', name: '水域' })
          } else if (rand > 0.65) {
            row.push({ char: '镇', type: 'town', name: '城镇' })
          } else {
            row.push({ char: '·', type: 'plain', name: '平原' })
          }
        }
      }
      map.push(row)
    }
    return map
  }, [])

  // 计算网格点到中心的距离
  const 计算距离 = (x: number, y: number, centerX: number, centerY: number) => {
    const dx = x - centerX
    const dy = y - centerY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 处理雷达模式拖动
  const 开始雷达拖动 = (e: React.MouseEvent) => {
    设置拖动中(true)
    设置拖动起点({ x: e.clientX - 雷达偏移量.x, y: e.clientY - 雷达偏移量.y })
  }

  const 雷达拖动中处理 = (e: React.MouseEvent) => {
    if (!拖动中) return
    const newX = e.clientX - 拖动起点.x
    const newY = e.clientY - 拖动起点.y
    // 限制拖动范围
    设置雷达偏移量({
      x: Math.max(Math.min(newX, 200), -200),
      y: Math.max(Math.min(newY, 200), -200)
    })
  }

  // 处理布局模式拖动
  const 开始布局拖动 = (e: React.MouseEvent) => {
    // 如果点击的是房间名，不触发拖动
    const target = e.target as HTMLElement
    if (target.classList.contains('room-name') || target.closest('.room-name')) {
      return
    }
    设置拖动中(true)
    设置已发生拖动(false) // 重置拖动标志
    设置拖动起点({ x: e.clientX - 布局偏移量.x, y: e.clientY - 布局偏移量.y })
  }

  const 布局拖动中处理 = (e: React.MouseEvent) => {
    if (!拖动中) return

    const newX = e.clientX - 拖动起点.x
    const newY = e.clientY - 拖动起点.y

    // 如果移动距离超过5px，标记为真正的拖动
    const dragDistance = Math.sqrt(
      Math.pow(newX - 布局偏移量.x, 2) + Math.pow(newY - 布局偏移量.y, 2)
    )
    if (dragDistance > 5) {
      设置已发生拖动(true)
    }

    // 限制拖动范围并检测边界
    const maxOffset = 500
    const clampedX = Math.max(Math.min(newX, maxOffset), -maxOffset)
    const clampedY = Math.max(Math.min(newY, maxOffset), -maxOffset)

    // 更新边界状态
    设置边界状态({
      top: clampedY === maxOffset,
      bottom: clampedY === -maxOffset,
      left: clampedX === maxOffset,
      right: clampedX === -maxOffset
    })

    设置布局偏移量({
      x: clampedX,
      y: clampedY
    })
  }

  const 结束拖动 = () => {
    设置拖动中(false)
    // 清除边界状态
    setTimeout(() => {
      设置边界状态({ top: false, right: false, bottom: false, left: false })
    }, 300)
  }

  // 使用真实地图数据（替换硬编码）并根据选中区域过滤
  const 布局地图数据 = useMemo(() => {
    console.log('[RegionMap] mapData:', mapData)
    console.log('[RegionMap] districts:', mapData?.districts)
    if (!mapData || !mapData.rooms) {
      console.log('[RegionMap] 无地图数据')
      return []  // 无数据时返回空数组
    }
    console.log('[RegionMap] 房间数量:', mapData.rooms.length)
    console.log('[RegionMap] 区域数量:', mapData.districts?.length || 0)

    // 如果选中了特定区域，只显示该区域的房间
    if (选中的区域) {
      const filtered = mapData.rooms.filter(room => room.districtId === 选中的区域)
      console.log(`[RegionMap] 过滤到区域 ${选中的区域}:`, filtered.length, '个房间')
      return filtered
    }

    return mapData.rooms
  }, [mapData, 选中的区域])

  // ASCII地图渲染常量
  const CELL_WIDTH = 12   // 每个房间单元格宽度
  const CELL_HEIGHT = 3   // 每个房间单元格高度

  // 计算字符串的显示宽度
  const 计算显示宽度 = (text: string) => {
    let width = 0
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i)
      if (
        (code >= 0x4E00 && code <= 0x9FFF) ||  // CJK统一汉字
        (code >= 0x3000 && code <= 0x303F) ||  // CJK符号和标点
        (code >= 0xFF00 && code <= 0xFFEF)     // 全角ASCII
      ) {
        width += 2  // 全角字符占2格
      } else {
        width += 1  // 半角字符占1格
      }
    }
    return width
  }

  // 新的基于区域的地图渲染算法
  const 渲染ASCII地图 = useMemo(() => {
    if (!布局地图数据 || 布局地图数据.length === 0) {
      return { lines: [], rooms: [] }
    }

    // 按区域组织房间
    const districtRooms: { [districtId: string]: typeof 布局地图数据 } = {}
    const unassignedRooms: typeof 布局地图数据 = []

    布局地图数据.forEach(room => {
      if (room.districtId) {
        if (!districtRooms[room.districtId]) {
          districtRooms[room.districtId] = []
        }
        districtRooms[room.districtId].push(room)
      } else {
        unassignedRooms.push(room)
      }
    })

    // 获取区域信息
    const districts = mapData?.districts || []
    const districtInfo: { [id: string]: District } = {}
    districts.forEach(district => {
      districtInfo[district.id] = district
    })

    const lines: string[] = []
    const roomsInfo: any[] = []
    let currentLine = 0

    // 辅助函数：渲染区域组
    const renderDistrictGroup = (rooms: typeof 布局地图数据, districtName?: string) => {
      if (rooms.length === 0) return

      // 如果有区域名称，添加区域标题
      if (districtName) {
        const title = `╔═ ${districtName} ═╗`
        const titleLength = 计算显示宽度(title)
        const borderLength = Math.max(titleLength, 40)
        const titlePadding = Math.floor((borderLength - titleLength) / 2)
        const border = '═'.repeat(borderLength)

        lines.push('╔' + border + '╗')
        lines.push('║' + ' '.repeat(titlePadding) + title + ' '.repeat(borderLength - titleLength - titlePadding) + '║')
        currentLine += 2
      }

      // 简化的布局算法 - 固定网格布局
      const roomsPerRow = 3 // 每行3个房间
      const roomWidth = 20 // 每个房间占用20个字符宽度
      const leftPadding = districtName ? 4 : 2

      // 计算需要的行数
      const totalRows = Math.ceil(rooms.length / roomsPerRow)

      // 创建房间位置映射
      const roomPositionMap: { [roomId: number]: { row: number, col: number, lineIndex: number, centerPos: number } } = {}

      // 为每个房间分配位置
      rooms.forEach((room, index) => {
        const row = Math.floor(index / roomsPerRow)
        const col = index % roomsPerRow
        roomPositionMap[room.id] = { row, col, lineIndex: 0, centerPos: 0 }
      })

      // 逐行渲染
      for (let row = 0; row < totalRows; row++) {
        const roomsInThisRow = rooms.filter((_, index) => Math.floor(index / roomsPerRow) === row)

        if (roomsInThisRow.length === 0) continue

        // 渲染房间行
        let roomLine = ''

        roomsInThisRow.forEach((room, colIndex) => {
          const roomText = `[${room.name}]`
          const roomDisplayWidth = 计算显示宽度(roomText)
          const startPos = leftPadding + colIndex * roomWidth
          const centerPos = startPos + Math.floor(roomDisplayWidth / 2)

          // 存储房间位置信息
          roomPositionMap[room.id].lineIndex = currentLine
          roomPositionMap[room.id].centerPos = centerPos

          // 添加房间到行
          const padding = startPos - roomLine.length
          roomLine += ' '.repeat(Math.max(0, padding)) + roomText

          // 保存房间信息用于点击检测
          roomsInfo.push({
            id: room.id,
            name: room.name,
            y: currentLine,
            centerPos,
            isPlayerHere: room.id === (mapData?.player_room || 0)
          })
        })

        lines.push(roomLine)
        currentLine++

        // 渲染连接线行
        let connectionLine = ''
        let hasConnections = false

        roomsInThisRow.forEach((room, colIndex) => {
          const roomInfo = roomPositionMap[room.id]

          // 添加南向连接
          if (room.exits.south && roomPositionMap[room.exits.south]) {
            const targetInfo = roomPositionMap[room.exits.south]
            if (targetInfo.row === row + 1) {
              // 填充空格到房间中心位置
              const padding = roomInfo.centerPos - connectionLine.length
              connectionLine += ' '.repeat(Math.max(0, padding)) + '│'
              hasConnections = true
            }
          }
        })

        if (hasConnections) {
          lines.push(connectionLine)
          currentLine++
        }

        // 行间分隔
        if (row < totalRows - 1) {
          lines.push('')
          currentLine++
        }
      }

      // 如果有区域名称，添加区域底部
      if (districtName) {
        const footerText = `${districtName} (${rooms.length}个房间)`
        const footerLength = 计算显示宽度(footerText)
        const borderLength = Math.max(footerLength, 40)
        const border = '═'.repeat(borderLength)
        const footerPadding = Math.floor((borderLength - footerLength) / 2)

        lines.push('║' + ' '.repeat(footerPadding) + footerText + ' '.repeat(borderLength - footerLength - footerPadding) + '║')
        lines.push('╚' + border + '╝')
        currentLine += 2
      }
    }

    // 渲染各个区域 - 优先显示有玩家所在区域
    const orderedDistricts = districts.slice()

    // 查找玩家所在区域
    const playerRoom = 布局地图数据.find(room => room.id === (mapData?.player_room || 0))
    if (playerRoom?.districtId) {
      const playerDistrictIndex = orderedDistricts.findIndex(d => d.id === playerRoom.districtId)
      if (playerDistrictIndex > 0) {
        // 将玩家所在区域移到前面
        const [playerDistrict] = orderedDistricts.splice(playerDistrictIndex, 1)
        orderedDistricts.unshift(playerDistrict)
      }
    }

    // 首先渲染未分配区域（如果有的话）
    if (unassignedRooms.length > 0) {
      renderDistrictGroup(unassignedRooms, '未分配区域')
      lines.push('') // 区域间空行
      lines.push('') // 增加额外空行间距
      currentLine += 2
    }

    // 然后渲染各个区域
    orderedDistricts.forEach(district => {
      if (districtRooms[district.id]) {
        renderDistrictGroup(districtRooms[district.id], district.name)
        lines.push('') // 区域间空行
        lines.push('') // 增加额外空行间距
        currentLine += 2
      }
    })

    return { lines: lines.filter(line => line.trim() !== ''), rooms: roomsInfo }
  }, [布局地图数据, mapData?.player_room, mapData?.districts])

  // 切换地图模式
  const 切换模式 = () => {
    设置模式切换动画(true)
    setTimeout(() => {
      设置地图模式(prev => prev === 'layout' ? 'radar' : 'layout')
    }, 150)
    setTimeout(() => {
      设置模式切换动画(false)
    }, 300)
  }

  // 缩放控制
  const 放大 = () => {
    设置缩放比例(prev => Math.min(prev + 10, 200))
  }

  const 缩小 = () => {
    设置缩放比例(prev => Math.max(prev - 10, 50))
  }

  const 重置缩放 = () => {
    设置缩放比例(100)
  }

  // 鼠标滚轮缩放（基于鼠标位置）
  const 处理滚轮缩放 = (e: React.WheelEvent) => {
    e.preventDefault()

    const delta = e.deltaY > 0 ? -10 : 10
    const newScale = Math.max(50, Math.min(200, 缩放比例 + delta))

    if (newScale !== 缩放比例) {
      // 获取鼠标相对于容器的位置
      const rect = e.currentTarget.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      // 计算缩放原点（鼠标位置的百分比）
      设置缩放原点({
        x: (mouseX / rect.width) * 100,
        y: (mouseY / rect.height) * 100
      })

      设置缩放比例(newScale)
    }
  }

  // 双击重置视图
  const 处理双击重置 = () => {
    设置缩放比例(100)
    设置布局偏移量({ x: 0, y: 0 })
    设置雷达偏移量({ x: 0, y: 0 })
    设置缩放原点({ x: 50, y: 50 })
  }

  // 处理房间悬停 - 显示路径预览
  const 处理房间悬停 = (目标房间ID: number, 房间名称: string) => {
    if (!mapData || autoMovementController.isActive()) {
      return
    }

    const 当前房间ID = mapData.player_room
    if (目标房间ID === 当前房间ID) {
      设置悬停房间(null)
      return
    }

    // 计算路径
    const path = findPath(mapData, 当前房间ID, 目标房间ID)
    设置悬停房间({
      id: 目标房间ID,
      name: 房间名称,
      path
    })
  }

  // 处理房间点击 - 自动寻路
  const 处理房间点击 = (目标房间ID: number, 房间名称: string) => {
    console.log('[RegionMap] 点击房间:', { 目标房间ID, 房间名称, mapData })

    if (!mapData) {
      console.warn('[RegionMap] 无地图数据')
      return
    }

    // 检查是否正在移动
    if (autoMovementController.isActive()) {
      alert('正在自动移动中，请等待完成或按 ESC 中断')
      return
    }

    const 当前房间ID = mapData.player_room
    console.log('[RegionMap] 当前房间ID:', 当前房间ID, '目标房间ID:', 目标房间ID)

    // 如果点击的是当前房间，不需要移动
    if (目标房间ID === 当前房间ID) {
      console.log('[RegionMap] 点击的是当前房间，无需移动')
      return
    }

    // 查找路径
    console.log('[RegionMap] 开始查找路径...')
    const path = findPath(mapData, 当前房间ID, 目标房间ID)
    console.log('[RegionMap] 路径结果:', path)

    if (!path) {
      alert(`无法到达 ${房间名称}`)
      return
    }

    // 开始自动移动
    autoMovementController.startMoving(path, {
      sendCommand: 发送命令,
      onProgress: (current, total, direction) => {
        设置移动进度({ current, total, direction, fullPath: path })
      },
      onComplete: () => {
        设置移动进度(null)
      },
      onError: (error) => {
        设置移动进度(null)
        alert(`移动失败: ${error}`)
      }
    })
  }

  // 处理搜索
  const 处理搜索 = (关键词: string) => {
    设置搜索关键词(关键词)
    if (!关键词.trim()) {
      设置搜索结果房间(null)
      return
    }

    // 在所有房间中搜索（不受区域过滤影响）
    const 匹配房间 = mapData?.rooms.find(room =>
      room.name.toLowerCase().includes(关键词.toLowerCase())
    )

    if (匹配房间) {
      设置搜索结果房间(匹配房间.id)
      // 如果匹配的房间在某个区域，自动切换到该区域
      if (匹配房间.districtId) {
        设置选中的区域(匹配房间.districtId)
      }
    } else {
      设置搜索结果房间(null)
      alert('未找到匹配的房间')
    }
  }

  return (
    <div className={`region-map-overlay ${正在关闭 ? 'closing' : ''}`} onClick={处理遮罩点击}>
      <div
        className={`region-map-container seal-border-style ${正在关闭 ? 'closing' : ''}`}
        onClick={(e) => e.stopPropagation()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
      >
        {/* 顶部装饰带 - 印章风格 */}
        <div className="seal-header-band">
          <div className="header-decoration-left">
            <span className="deco-line">━━━━</span>
            <span className="deco-symbol">◆</span>
            <span className="deco-line">━━━</span>
          </div>
          <div className="seal-title-center">
            <h2 className="seal-main-title">【玄鉴仙录·{mapData?.area_name || '区域'}舆图】</h2>
            <p className="seal-subtitle">
              <span className="location-label">当前区域</span>
              <span className="location-divider">●</span>
              <span className="location-name">{mapData?.area_name || '未知'}</span>
            </p>
            {/* 搜索框 */}
            <div className="map-search-box" style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="搜索房间名称..."
                value={搜索关键词}
                onChange={(e) => 处理搜索(e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #8b7355',
                  borderRadius: '4px',
                  backgroundColor: '#fff9f0',
                  color: '#2c1810',
                  fontSize: '14px',
                  width: '200px'
                }}
              />
            </div>
          </div>
          <div className="header-decoration-right">
            <span className="deco-line">━━━</span>
            <span className="deco-symbol">◆</span>
            <span className="deco-line">━━━━</span>
          </div>
        </div>

        {/* 中间主体区域 - 左装饰列 + 区域导航 + 地图 + 右装饰列 */}
        <div className="seal-main-body">
          {/* 左侧装饰列 */}
          <div className="seal-left-column">
            <div className="column-ornament">☁</div>
            <div className="column-ornament">❋</div>
            <div className="column-ornament">✿</div>
            <div className="column-ornament">❂</div>
            <div className="column-ornament">✾</div>
            <div className="column-ornament">❀</div>
            <div className="column-ornament">✺</div>
            <div className="column-ornament">❃</div>
            <div className="column-ornament">☯</div>
          </div>

          {/* 区域导航面板 */}
          {mapData?.districts && mapData.districts.length > 0 && (
            <div className="district-navigation-panel">
              <div className="district-nav-header">
                <span className="district-nav-title">区域导航</span>
                <div className="district-nav-decoration">❀</div>
              </div>
              <div className="district-nav-list">
                <div
                  onClick={() => 设置选中的区域(null)}
                  className={`district-nav-item ${选中的区域 === null ? 'active' : ''}`}
                >
                  <span className="district-nav-item-name">全部区域</span>
                  <span className="district-nav-item-count">({mapData.rooms.length})</span>
                </div>
                {mapData.districts.map(district => (
                  <div
                    key={district.id}
                    onClick={() => 设置选中的区域(district.id)}
                    className={`district-nav-item ${选中的区域 === district.id ? 'active' : ''}`}
                  >
                    <span className="district-nav-item-name">{district.name}</span>
                    <span className="district-nav-item-count">({district.roomCount})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 中间地图容器 */}
          <div className="seal-map-container" style={{ flex: 1 }}>
            {/* 模式切换按钮 - 固定在地图区域右下角 */}
            <button className="map-mode-toggle-btn" onClick={切换模式} title="切换地图模式">
              {地图模式 === 'layout' ? '布局式' : '雷达式'}
            </button>

            {地图模式 === 'radar' ? (
              /* 雷达模式 */
              <div
                className={`seal-map-content radar-style ${模式切换动画 ? 'switching' : ''}`}
                onWheel={处理滚轮缩放}
                onDoubleClick={处理双击重置}
              >
                {/* 雷达圆形遮罩容器 */}
                <div
                  className="radar-container"
                  onMouseDown={开始雷达拖动}
                  onMouseMove={雷达拖动中处理}
                  onMouseUp={结束拖动}
                  onMouseLeave={结束拖动}
                >
                  {/* 雷达背景网格 */}
                  <div className="radar-background">
                    {/* 距离圈层 */}
                    {[1, 2, 3, 4, 5].map(level => (
                      <div
                        key={level}
                        className="radar-circle"
                        style={{
                          width: `${level * 20}%`,
                          height: `${level * 20}%`
                        }}
                      />
                    ))}

                    {/* 方位线 */}
                    <div className="radar-crosshair horizontal" />
                    <div className="radar-crosshair vertical" />
                    <div className="radar-crosshair diagonal1" />
                    <div className="radar-crosshair diagonal2" />
                  </div>

                  {/* 地图内容层 */}
                  <div
                    className="radar-map-layer"
                    style={{
                      transform: `translate(${雷达偏移量.x}px, ${雷达偏移量.y}px) scale(${缩放比例 / 100})`
                    }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 500 500">
                      {完整地图.map((row, y) =>
                        row.map((cell, x) => {
                          const distance = 计算距离(x, y, 25, 25)
                          const maxRadius = 12 // 最大显示半径
                          const opacity = Math.max(0, 1 - distance / maxRadius)

                          if (distance > maxRadius) return null

                          const posX = x * 10
                          const posY = y * 10

                          return (
                            <g key={`${x}-${y}`} opacity={opacity}>
                              <circle
                                cx={posX}
                                cy={posY}
                                r={4}
                                className={`radar-point ${cell.type}`}
                              />
                              <text
                                x={posX}
                                y={posY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className={`radar-text ${cell.type}`}
                                fontSize="8"
                              >
                                {cell.char}
                              </text>
                            </g>
                          )
                        })
                      )}
                    </svg>
                  </div>

                  {/* 雷达扫描光束 */}
                  <div className="radar-scan-beam"></div>

                  {/* 中心标记 */}
                  <div className="radar-center-mark">
                    <div className="center-pulse"></div>
                    <div className="center-cross"></div>
                  </div>
                </div>

                {/* 图例 */}
                <div className="radar-controls">
                  <div className="map-legend">
                    <span className="legend-item">
                      <span className="legend-symbol current">●</span> 当前位置
                    </span>
                    <span className="legend-item">
                      <span className="legend-symbol mountain">山</span> 山脉
                    </span>
                    <span className="legend-item">
                      <span className="legend-symbol forest">林</span> 森林
                    </span>
                    <span className="legend-item">
                      <span className="legend-symbol water">水</span> 水域
                    </span>
                    <span className="legend-item">
                      <span className="legend-symbol town">镇</span> 城镇
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* 布局模式 - ASCII文本地图 */
              <div
                className={`seal-map-content layout-style ${拖动中 ? 'dragging' : ''} ${模式切换动画 ? 'switching' : ''} ${
                  边界状态.top ? 'boundary-top' : ''
                } ${边界状态.right ? 'boundary-right' : ''} ${
                  边界状态.bottom ? 'boundary-bottom' : ''
                } ${边界状态.left ? 'boundary-left' : ''}`}
                onWheel={处理滚轮缩放}
                onMouseDown={开始布局拖动}
                onMouseMove={布局拖动中处理}
                onMouseUp={结束拖动}
                onMouseLeave={结束拖动}
                onDoubleClick={处理双击重置}
              >
                <div className="ascii-map-container">
                  {渲染ASCII地图.lines.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                      color: '#999',
                      fontSize: '16px'
                    }}>
                      正在加载地图数据...
                    </div>
                  ) : (
                    <div
                      className={`ascii-map ${移动进度 ? 'moving' : ''}`}
                      style={{
                        transform: `translate(${布局偏移量.x}px, ${布局偏移量.y}px) scale(${缩放比例 / 100})`,
                        transformOrigin: `${缩放原点.x}% ${缩放原点.y}%`,
                        transition: 拖动中 ? 'none' : 'transform 0.2s ease-out'
                      }}
                      onClick={(e) => {
                        console.log('[RegionMap] onClick triggered, 已发生拖动:', 已发生拖动)

                        // 如果发生了拖动，不触发点击
                        if (已发生拖动) {
                          console.log('[RegionMap] 点击被拖动阻止')
                          return
                        }

                        // 事件委托：检查点击的是否是房间名
                        const target = e.target as HTMLElement
                        console.log('[RegionMap] 点击目标:', {
                          tagName: target.tagName,
                          className: target.className,
                          hasRoomNameClass: target.classList.contains('room-name'),
                          dataRoomName: target.getAttribute('data-room-name'),
                          dataRoomId: target.getAttribute('data-room-id')
                        })

                        if (target.classList.contains('room-name')) {
                          e.stopPropagation() // 阻止事件继续冒泡
                          const roomName = target.getAttribute('data-room-name')
                          const roomId = target.getAttribute('data-room-id')
                          console.log('[RegionMap] 房间点击检查:', { roomName, roomId })
                          if (roomName && roomId && roomId !== 'unknown') {
                            console.log('[RegionMap] 调用处理房间点击函数')
                            处理房间点击(parseInt(roomId), roomName)
                          } else {
                            console.warn('[RegionMap] 房间ID无效或未知:', { roomName, roomId })
                          }
                        } else {
                          console.log('[RegionMap] 点击的不是房间名')
                        }
                      }}
                    >
                      {渲染ASCII地图.lines.map((line, index) => {
                      const parts: React.ReactNode[] = []
                      let lastIndex = 0

                      // 匹配所有房间名 [xxx]
                      const roomRegex = /\[([^\]]+)\]/g
                      let match

                      while ((match = roomRegex.exec(line)) !== null) {
                        const roomName = match[1]
                        const matchStart = match.index
                        const matchEnd = match.index + match[0].length

                        // 添加房间名前的文本(连接线等)
                        if (matchStart > lastIndex) {
                          const beforeText = line.substring(lastIndex, matchStart)
                          parts.push(
                            <span key={`line-${index}-text-${lastIndex}`} className="connection-line">
                              {beforeText}
                            </span>
                          )
                        }

                        // 查找这个房间是否是玩家所在位置
                        // 注意: roomInfo.y 是渲染时的行号，index 是当前遍历的行号，它们应该相同
                        const roomInfo = 渲染ASCII地图.rooms.find(r => r.name === roomName && r.y === index)
                        const isPlayerRoom = roomInfo?.isPlayerHere || false

                        // 如果找不到roomInfo，尝试只通过名称查找
                        const roomInfoByName = 渲染ASCII地图.rooms.find(r => r.name === roomName)

                        // 添加房间名（可点击）- 使用事件委托
                        const roomId = roomInfoByName?.id
                        const isSearchResult = roomId === 搜索结果房间
                        parts.push(
                          <span
                            key={`line-${index}-room-${matchStart}`}
                            className={`room-name ${isPlayerRoom ? 'player-room' : ''} ${悬停房间?.id === roomId ? 'hover-highlight' : ''} ${isSearchResult ? 'search-highlight' : ''}`}
                            title={isPlayerRoom ? `${roomName} (你在这里)` : `点击前往 ${roomName}`}
                            data-room-name={roomName}
                            data-room-id={roomId || 'unknown'}
                            onMouseEnter={() => {
                              if (roomId && roomId !== 'unknown' && !isPlayerRoom) {
                                处理房间悬停(roomId, roomName)
                              }
                            }}
                            onMouseLeave={() => {
                              设置悬停房间(null)
                            }}
                          >
                            [{roomName}]
                          </span>
                        )

                        lastIndex = matchEnd
                      }

                      // 添加剩余文本
                      if (lastIndex < line.length) {
                        const remaining = line.substring(lastIndex)
                        parts.push(
                          <span key={`line-${index}-text-${lastIndex}`} className="connection-line">
                            {remaining}
                          </span>
                        )
                      }

                      // 如果这一行没有任何内容,添加空span保持行高
                      if (parts.length === 0) {
                        parts.push(
                          <span key={`line-${index}-empty`} className="connection-line">
                            {line || ' '}
                          </span>
                        )
                      }

                      return (
                        <div key={index} className="map-line">
                          {parts}
                        </div>
                      )
                    })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右侧装饰列 - 镜像对称 */}
          <div className="seal-right-column">
            <div className="column-ornament">☁</div>
            <div className="column-ornament">❋</div>
            <div className="column-ornament">✿</div>
            <div className="column-ornament">❂</div>
            <div className="column-ornament">✾</div>
            <div className="column-ornament">❀</div>
            <div className="column-ornament">✺</div>
            <div className="column-ornament">❃</div>
            <div className="column-ornament">☯</div>
          </div>
        </div>

        {/* 路径预览提示 */}
        {悬停房间 && !移动进度 && 悬停房间.path && (
          <div className="path-preview-tooltip">
            <div className="tooltip-header">
              <span className="tooltip-icon">🗺️</span>
              <span className="tooltip-title">前往 {悬停房间.name}</span>
            </div>
            <div className="tooltip-content">
              <div className="tooltip-label">路径:</div>
              <div className="tooltip-path">{formatPath(悬停房间.path)}</div>
              <div className="tooltip-steps">共 {悬停房间.path.length} 步</div>
            </div>
          </div>
        )}

        {/* 移动进度提示 */}
        {移动进度 && (
          <div className="movement-progress-overlay">
            <div className="movement-progress-panel">
              <div className="progress-title">自动移动中...</div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${(移动进度.current / 移动进度.total) * 100}%` }}
                />
              </div>
              <div className="progress-info">
                <span>进度: {移动进度.current} / {移动进度.total}</span>
                <span>当前: {formatPath([移动进度.direction])}</span>
              </div>
              <div className="progress-path">
                <span className="path-label">路径:</span>
                <span className="path-value">{formatPath(移动进度.fullPath)}</span>
              </div>
              <button
                className="progress-cancel-btn"
                onClick={() => {
                  autoMovementController.stop()
                  设置移动进度(null)
                }}
              >
                中断移动 (ESC)
              </button>
            </div>
          </div>
        )}

        {/* 底部装饰带 */}
        <div className="seal-footer-band">
          <div className="footer-ornament-left">
            <span className="ornament-symbol">◢</span>
            <span className="ornament-symbol">◣</span>
          </div>
          <div className="seal-info-center">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <span className="info-text">{mapData?.rooms?.length || 0} 个房间</span>
            </div>
            <div className="info-divider">|</div>
            <div className="info-item zoom-controls">
              <button className="zoom-btn" onClick={缩小} title="缩小 (-)">-</button>
              <span className="info-icon">🔍</span>
              <span className="zoom-text">{缩放比例}%</span>
              <button className="zoom-btn" onClick={放大} title="放大 (+)">+</button>
              <button className="zoom-reset-btn" onClick={重置缩放} title="重置缩放">
                ⟲
              </button>
            </div>
            <div className="info-divider">|</div>
            <div className="info-item hint-item">
              <span className="info-icon">💡</span>
              <span className="info-text">ESC 或 点击空白处关闭</span>
            </div>
            <div className="info-divider">|</div>
            <div className="info-item hint-item">
              <span className="info-icon">🖱️</span>
              <span className="info-text">拖动查看周边区域</span>
            </div>
          </div>
          <div className="footer-ornament-right">
            <span className="ornament-symbol">◢</span>
            <span className="ornament-symbol">◣</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegionMap
