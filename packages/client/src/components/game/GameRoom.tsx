import { RoomInfo, ExitInfo, PlayerBrief, NPCBrief, ItemBrief } from '@types/movement'
import ExitPanel from './ExitPanel'
import RoomPlayers from './RoomPlayers'
import './GameRoom.css'

interface GameRoomProps {
  room: RoomInfo
  exits: ExitInfo[]
  players?: PlayerBrief[]
  npcs?: NPCBrief[]
  items?: ItemBrief[]
  currentPlayerId?: number
  onMove: (direction: string) => void
  onLook?: () => void
  disabled?: boolean
}

/**
 * 游戏房间主视图组件
 * 显示房间信息、出口、玩家、NPC等
 */
export function GameRoom({
  room,
  exits,
  players = [],
  npcs = [],
  items = [],
  currentPlayerId,
  onMove,
  onLook,
  disabled = false
}: GameRoomProps) {
  return (
    <div className="game-room">
      {/* 房间标题栏 */}
      <div className="room-header">
        <div className="room-title-wrapper">
          <h2 className="room-title">{room.name}</h2>
          {room.area && <span className="room-area">{room.area}</span>}
        </div>
        {onLook && (
          <button
            className="look-button"
            onClick={onLook}
            disabled={disabled}
            title="重新查看房间 (快捷键: look)"
          >
            👁️ 查看
          </button>
        )}
      </div>

      {/* 主内容区域 */}
      <div className="room-main-content">
        {/* 房间描述 */}
        <div className="room-description">
          <div className="description-text">{room.description}</div>

          {/* NPC列表 */}
          {npcs.length > 0 && (
            <div className="room-entities npcs">
              <div className="entity-header">这里有：</div>
              <div className="entity-list">
                {npcs.map(npc => (
                  <div key={npc.id} className="entity-item npc-item">
                    <span className="entity-icon">🧙</span>
                    <span className="entity-name">{npc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 物品列表 */}
          {items.length > 0 && (
            <div className="room-entities items">
              <div className="entity-header">你看到：</div>
              <div className="entity-list">
                {items.map(item => (
                  <div key={item.id} className="entity-item item-item">
                    <span className="entity-icon">📦</span>
                    <span className="entity-name">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 侧边栏 */}
        <div className="room-sidebar">
          {/* 出口面板 */}
          <ExitPanel
            exits={exits}
            onMove={onMove}
            disabled={disabled}
          />

          {/* 玩家列表 */}
          <RoomPlayers
            players={players}
            currentPlayerId={currentPlayerId}
          />
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="room-footer">
        <div className="room-stats">
          <span className="stat-item">
            <span className="stat-label">出口:</span>
            <span className="stat-value">{exits.length}</span>
          </span>
          <span className="stat-divider">|</span>
          <span className="stat-item">
            <span className="stat-label">玩家:</span>
            <span className="stat-value">{players.length}</span>
          </span>
          {npcs.length > 0 && (
            <>
              <span className="stat-divider">|</span>
              <span className="stat-item">
                <span className="stat-label">NPC:</span>
                <span className="stat-value">{npcs.length}</span>
              </span>
            </>
          )}
          {items.length > 0 && (
            <>
              <span className="stat-divider">|</span>
              <span className="stat-item">
                <span className="stat-label">物品:</span>
                <span className="stat-value">{items.length}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default GameRoom
