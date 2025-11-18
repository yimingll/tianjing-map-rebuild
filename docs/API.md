# API 文档

## REST API

### 认证 API

#### 注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "player1",
  "password": "password123",
  "displayName": "Player One"
}
```

**响应**:
```json
{
  "id": "uuid",
  "username": "player1",
  "displayName": "Player One",
  "level": 1,
  "experience": 0,
  "health": 100,
  "maxHealth": 100,
  "mana": 50,
  "maxMana": 50,
  "currentRoomId": "room_001",
  "status": "offline",
  "gold": 100,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T00:00:00.000Z"
}
```

#### 登录
```http
POST /auth/login
Content-Type: application/json

{
  "username": "player1",
  "password": "password123"
}
```

**响应**: 与注册相同的玩家对象

### 玩家 API

#### 获取玩家信息
```http
GET /player/:id
```

**响应**: 玩家对象

## WebSocket API

### 连接

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### 事件列表

#### 认证事件

##### `auth:login` (发送)
玩家登录游戏

**数据**:
```typescript
{
  playerId: string;
}
```

##### `auth:success` (接收)
登录成功

**数据**:
```typescript
{
  player: Player;
}
```

##### `auth:failed` (接收)
登录失败

**数据**:
```typescript
{
  message: string;
}
```

#### 房间事件

##### `room:enter` (接收)
进入房间

**数据**:
```typescript
{
  room: {
    id: string;
    name: string;
    description: string;
    exits: Array<{
      direction: Direction;
      targetRoomId: string;
      isLocked: boolean;
      description?: string;
    }>;
    npcs: string[];
    items: string[];
    players: string[];
    properties: {
      isDark: boolean;
      isSafe: boolean;
      allowsPvP: boolean;
      allowsTeleport: boolean;
      terrain: TerrainType;
    };
  }
}
```

##### `player:move` (发送)
移动到其他房间

**数据**:
```typescript
{
  direction: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
}
```

##### `player:join` (接收)
其他玩家进入房间

**数据**:
```typescript
{
  playerId: string;
  playerName: string;
}
```

##### `player:leave` (接收)
其他玩家离开房间

**数据**:
```typescript
{
  playerId: string;
  playerName: string;
}
```

#### 聊天事件

##### `chat:message` (发送)
发送聊天消息

**数据**:
```typescript
{
  message: string;
  channel: 'global' | 'local' | 'whisper' | 'party';
}
```

##### `chat:global` (接收)
接收全局聊天

**数据**:
```typescript
{
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  channel: 'global';
  timestamp: Date;
}
```

##### `chat:system` (接收)
系统消息

**数据**:
```typescript
{
  id: string;
  senderId: 'system';
  senderName: 'System';
  message: string;
  channel: 'system';
  timestamp: Date;
}
```

#### 玩家事件

##### `player:stats` (发送)
请求玩家状态

**无数据**

**响应**:
```typescript
{
  success: boolean;
  player: Player;
}
```

##### `player:update` (接收)
玩家状态更新

**数据**:
```typescript
{
  player: Partial<Player>;
}
```

#### 战斗事件

##### `combat:start` (接收)
战斗开始

**数据**:
```typescript
{
  combatId: string;
  participants: Array<{
    id: string;
    type: 'player' | 'npc' | 'monster';
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
  }>;
  turnOrder: string[];
}
```

##### `combat:action` (发送)
执行战斗动作

**数据**:
```typescript
{
  combatId: string;
  targetId: string;
  type: 'attack' | 'defend' | 'use_skill' | 'use_item' | 'flee';
  skillId?: string;
  itemId?: string;
}
```

##### `combat:result` (接收)
战斗结果

**数据**:
```typescript
{
  success: boolean;
  damage?: number;
  healing?: number;
  message: string;
  isCritical?: boolean;
  isDodged?: boolean;
}
```

##### `combat:end` (接收)
战斗结束

**数据**:
```typescript
{
  combatId: string;
  winner: 'player' | 'enemy';
  rewards?: {
    experience: number;
    gold: number;
    items: string[];
  };
}
```

#### 交易事件

##### `trade:request` (发送)
发起交易请求

**数据**:
```typescript
{
  targetPlayerId: string;
  offer: {
    currency: { gold: number; silver: number; copper: number };
    items: Array<{ itemId: string; quantity: number }>;
  };
}
```

##### `trade:accept` (发送)
接受交易

**数据**:
```typescript
{
  tradeId: string;
}
```

##### `trade:decline` (发送)
拒绝交易

**数据**:
```typescript
{
  tradeId: string;
}
```

##### `trade:complete` (接收)
交易完成

**数据**:
```typescript
{
  tradeId: string;
  success: boolean;
}
```

## 错误代码

### 认证错误
- `AUTH_001`: Invalid credentials
- `AUTH_002`: Session expired
- `AUTH_003`: Account banned

### 玩家错误
- `PLAYER_001`: Player not found
- `PLAYER_002`: Insufficient level
- `PLAYER_003`: Insufficient stats

### 背包错误
- `INV_001`: Inventory full
- `INV_002`: Item not found
- `INV_003`: Insufficient quantity

### 战斗错误
- `COMBAT_001`: Not in combat
- `COMBAT_002`: Invalid target
- `COMBAT_003`: Skill on cooldown
- `COMBAT_004`: Insufficient mana

### 经济错误
- `ECON_001`: Insufficient funds
- `ECON_002`: Trade failed
- `ECON_003`: Invalid price

### 系统错误
- `SYS_001`: Server error
- `SYS_002`: Database error
- `SYS_003`: Rate limit exceeded

## 速率限制

| 操作类型 | 限制 | 时间窗口 |
|---------|------|---------|
| 聊天消息 | 5 | 5 秒 |
| 战斗动作 | 10 | 1 秒 |
| 交易请求 | 3 | 1 分钟 |
| API 请求 | 100 | 1 分钟 |

## 使用示例

### 完整的客户端示例

```typescript
import { io } from 'socket.io-client';
import { SocketEvent, Direction } from '@mud-game/shared';

// 连接服务器
const socket = io('http://localhost:3000');

// 监听连接事件
socket.on('connect', () => {
  console.log('Connected to server');

  // 登录
  socket.emit(SocketEvent.AUTH_LOGIN, { playerId: 'your-player-id' });
});

// 监听登录成功
socket.on(SocketEvent.AUTH_SUCCESS, ({ player }) => {
  console.log('Login successful:', player);
});

// 监听进入房间
socket.on(SocketEvent.ROOM_ENTER, ({ room }) => {
  console.log('Entered room:', room.name);
  console.log('Description:', room.description);
  console.log('Exits:', room.exits.map(e => e.direction));
});

// 监听聊天消息
socket.on(SocketEvent.CHAT_GLOBAL, (message) => {
  console.log(`${message.senderName}: ${message.message}`);
});

// 发送移动命令
function move(direction: Direction) {
  socket.emit(SocketEvent.PLAYER_MOVE, { direction });
}

// 发送聊天消息
function sendMessage(text: string) {
  socket.emit(SocketEvent.CHAT_MESSAGE, {
    message: text,
    channel: 'global'
  });
}

// 使用示例
move(Direction.NORTH);
sendMessage('Hello, world!');
```
