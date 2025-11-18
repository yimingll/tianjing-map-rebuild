import type { PlayerBrief } from '../../types/movement'
import './RoomPlayers.css'

interface RoomPlayersProps {
  players: PlayerBrief[]
  currentPlayerId?: number
}

/**
 * 房间内玩家列表组件
 * 显示当前房间内的所有玩家
 */
export function RoomPlayers({ players, currentPlayerId }: RoomPlayersProps) {
  // 过滤掉当前玩家自己
  const otherPlayers = players.filter(p => p.id !== currentPlayerId)

  if (otherPlayers.length === 0) {
    return (
      <div className="room-players empty">
        <div className="room-players-header">
          <span className="room-players-title">此处的人</span>
          <span className="player-count">0</span>
        </div>
        <div className="no-players-message">
          这里空无一人，只有你独自一人
        </div>
      </div>
    )
  }

  return (
    <div className="room-players">
      <div className="room-players-header">
        <span className="room-players-title">此处的人</span>
        <span className="player-count">{otherPlayers.length}</span>
      </div>

      <div className="players-list">
        {otherPlayers.map(player => (
          <div key={player.id} className="player-item">
            <div className="player-avatar">👤</div>
            <div className="player-info">
              <div className="player-name">{player.name}</div>
              {player.realm && (
                <div className="player-realm">
                  {player.realm}
                  {player.realmLayer && player.realmLayer > 1 && ` ${player.realmLayer}层`}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoomPlayers
