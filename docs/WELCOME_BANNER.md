# MUD 欢迎界面实现

## 概述

当玩家连接到游戏服务器时，会自动显示精美的欢迎界面（玄鉴仙录 MUD）。

## 实现文件

### 服务器端

1. **常量文件**: `packages/server/src/constants/welcome.ts`
   - 包含欢迎横幅（WELCOME_BANNER）
   - 包含实时状态信息生成函数（generateStatusInfo）
   - 包含入门指引（WELCOME_GUIDE）
   - 包含完整欢迎消息生成函数（getFullWelcomeMessage）

2. **网关处理**: `packages/server/src/modules/game/game.gateway.ts`
   - 在 `handleConnection` 方法中发送欢迎消息
   - 获取实时在线玩家数量
   - 通过 'welcome' 事件发送给客户端

### 客户端

1. **游戏客户端**: `packages/client/src/lib/gameClient.ts`
   - 监听 'welcome' 事件
   - 自动显示欢迎信息到聊天窗口

## 欢迎界面内容

欢迎界面包含以下部分：

1. **标题横幅**
   - 游戏名称：玄鉴仙录 MUD
   - 英文名称：Xuanjian Chronicles of Immortals
   - 精美的 ASCII 艺术边框

2. **游戏介绍**
   - 卷首语，介绍游戏背景故事

3. **实时状态信息**
   - 在线修士数量（实时更新）
   - 游戏版本号
   - 服务器运行状态
   - 最新更新内容

4. **入门指引**
   - 新手注册指南
   - 登录命令说明
   - 帮助命令

## 自定义欢迎信息

### 修改版本信息

在 `packages/server/src/modules/game/game.gateway.ts` 中的 `handleConnection` 方法中修改：

```typescript
const welcomeMessage = getFullWelcomeMessage({
  onlinePlayers,
  version: '玄鉴初启 5.0.1',  // 修改版本号
  serverStatus: '稳定',        // 修改服务器状态
  lastUpdate: '炼丹系统已开放', // 修改最新更新内容
});
```

### 修改横幅内容

编辑 `packages/server/src/constants/welcome.ts` 文件中的以下常量：

- `WELCOME_BANNER`: 主横幅和游戏介绍
- `WELCOME_GUIDE`: 入门指引
- `generateStatusInfo`: 实时状态信息格式

## 工作流程

1. 客户端连接到服务器（WebSocket）
2. 服务器触发 `handleConnection` 事件
3. 服务器获取当前在线玩家数量
4. 服务器生成包含实时数据的欢迎消息
5. 服务器通过 'welcome' 事件发送消息给客户端
6. 客户端接收并显示欢迎消息

## 测试

1. 启动服务器：
   ```bash
   cd packages/server
   npm run start:dev
   ```

2. 启动客户端：
   ```bash
   cd packages/client
   npm run dev
   ```

3. 在客户端中连接到服务器，应该会立即看到欢迎界面。

## 注意事项

- 欢迎消息使用等宽字体才能正确显示 ASCII 艺术
- 在线玩家数量是实时统计的
- 欢迎消息在每次连接时都会发送
- 可以在客户端的聊天窗口中看到完整的欢迎界面
