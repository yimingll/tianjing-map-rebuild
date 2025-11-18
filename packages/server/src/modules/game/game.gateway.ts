import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvent, PlayerStatus, Direction } from '@mud-game/shared';
import { PlayerService } from '../player/player.service';
import { WorldService } from '../world/world.service';
import { DataLoaderService } from '../data-loader/data-loader.service';
import { NpcService } from '../npc/npc.service';
import { getFullWelcomeMessage } from '../../constants/welcome';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private playerService: PlayerService,
    private worldService: WorldService,
    private dataLoader: DataLoaderService,
    private npcService: NpcService,
  ) {}

  async handleConnection(client: Socket) {
    // 获取服务器统计信息
    const onlinePlayers = await this.getOnlinePlayersCount();

    // 发送结构化的欢迎数据（用于 React 组件渲染）
    client.emit('welcome', {
      type: 'welcome_banner',
      data: {
        onlinePlayers,
        version: '玄鉴初启 5.0.1',
        serverStatus: '稳定',
        lastUpdate: '炼丹系统已开放',
      },
    });
  }

  /**
   * 获取在线玩家数量
   */
  private async getOnlinePlayersCount(): Promise<number> {
    try {
      // 通过 Socket.IO 获取连接的客户端数量
      const sockets = await this.server.fetchSockets();
      return sockets.length;
    } catch (error) {
      return 0;
    }
  }

  async handleDisconnect(client: Socket) {

    const playerId = client.data.playerId;
    if (playerId) {
      await this.playerService.updateStatus(playerId, PlayerStatus.OFFLINE);

      // Remove from current room
      const player = await this.playerService.findById(playerId);
      if (player) {
        this.worldService.removePlayerFromRoom(player.currentRoomId, playerId);
      }
    }
  }

  @SubscribeMessage(SocketEvent.AUTH_LOGIN)
  async handleLogin(
    @MessageBody() data: { playerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const player = await this.playerService.findById(data.playerId);

    if (!player) {
      client.emit(SocketEvent.AUTH_FAILED, { message: 'Player not found' });
      return;
    }

    // Set player data on socket
    client.data.playerId = player.id;
    client.data.playerName = player.displayName;

    // Update player status
    await this.playerService.updateStatus(player.id, PlayerStatus.ONLINE);

    // Add player to their current room
    this.worldService.addPlayerToRoom(player.currentRoomId, player.id);
    client.join(player.currentRoomId);

    // Send success response
    client.emit(SocketEvent.AUTH_SUCCESS, { player });

    // Send current room info
    const room = this.worldService.getRoom(player.currentRoomId);
    client.emit(SocketEvent.ROOM_ENTER, { room });

    return { success: true };
  }

  @SubscribeMessage(SocketEvent.PLAYER_MOVE)
  async handleMove(
    @MessageBody() data: { direction: Direction },
    @ConnectedSocket() client: Socket,
  ) {
    const playerId = client.data.playerId;
    const player = await this.playerService.findById(playerId);

    if (!player) {
      return { success: false, message: 'Player not found' };
    }

    const currentRoom = this.worldService.getRoom(player.currentRoomId);
    if (!currentRoom) {
      return { success: false, message: 'Current room not found' };
    }

    const exit = currentRoom.exits.find((e) => e.direction === data.direction);
    if (!exit) {
      return { success: false, message: 'No exit in that direction' };
    }

    if (exit.isLocked) {
      return { success: false, message: 'That exit is locked' };
    }

    // Remove from old room
    this.worldService.removePlayerFromRoom(currentRoom.id, playerId);
    client.leave(currentRoom.id);

    // Add to new room
    const newRoom = this.worldService.getRoom(exit.targetRoomId);
    if (!newRoom) {
      return { success: false, message: 'Target room not found' };
    }

    this.worldService.addPlayerToRoom(newRoom.id, playerId);
    await this.playerService.updatePosition(playerId, newRoom.id);
    client.join(newRoom.id);

    // Notify player of new room
    client.emit(SocketEvent.ROOM_ENTER, { room: newRoom });

    // Notify others in the room
    client.to(newRoom.id).emit(SocketEvent.PLAYER_JOIN, {
      playerId,
      playerName: player.displayName,
    });

    return { success: true, room: newRoom };
  }

  @SubscribeMessage(SocketEvent.PLAYER_STATS)
  async handleGetStats(@ConnectedSocket() client: Socket) {
    const playerId = client.data.playerId;
    const player = await this.playerService.findById(playerId);

    if (!player) {
      return { success: false };
    }

    const { password, ...playerData } = player;
    return { success: true, player: playerData };
  }

  @SubscribeMessage('command')
  async handleCommand(
    @MessageBody() data: { type: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const playerId = client.data.playerId;
    if (!playerId) {
      client.emit('message', {
        type: 'error',
        content: '请先登录',
      });
      return;
    }

    const player = await this.playerService.findById(playerId);
    if (!player) {
      client.emit('message', {
        type: 'error',
        content: '玩家不存在',
      });
      return;
    }

    const command = data.content.trim().toLowerCase();
    const parts = command.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case 'look':
      case 'l':
        await this.handleLookCommand(client, player);
        break;

      case 'north':
      case 'n':
        await this.handleMoveCommand(client, player, Direction.NORTH);
        break;

      case 'south':
      case 's':
        await this.handleMoveCommand(client, player, Direction.SOUTH);
        break;

      case 'east':
      case 'e':
        await this.handleMoveCommand(client, player, Direction.EAST);
        break;

      case 'west':
      case 'w':
        await this.handleMoveCommand(client, player, Direction.WEST);
        break;

      case 'up':
      case 'u':
        await this.handleMoveCommand(client, player, Direction.UP);
        break;

      case 'down':
      case 'd':
        await this.handleMoveCommand(client, player, Direction.DOWN);
        break;

      case 'talk':
      case 't':
        await this.handleTalkCommand(client, player, args);
        break;

      case 'teleport':
      case 'tp':
      case '传送':
        await this.handleTeleportCommand(client, player, args);
        break;

      case 'map':
      case '地图':
        await this.handleMapCommand(client, player);
        break;

      case 'help':
      case '?':
        this.handleHelpCommand(client);
        break;

      default:
        client.emit('message', {
          type: 'error',
          content: `未知命令: ${cmd}`,
        });
    }
  }

  private async handleLookCommand(client: Socket, player: any) {
    const room = this.worldService.getRoom(player.currentRoomId);
    if (!room) {
      client.emit('message', {
        type: 'error',
        content: '当前房间不存在',
      });
      return;
    }

    // 发送房间名称
    client.emit('message', {
      type: 'room_title',
      content: `<color:#8B4513>╔═══════════════════════════╗</color>\n<color:#8B4513>║</color>  <color:#006400>【${room.name}】</color>  <color:#8B4513>║</color>\n<color:#8B4513>╚═══════════════════════════╝</color>`,
    });

    // 发送房间描述
    client.emit('message', {
      type: 'description',
      content: `<color:#2F4F4F>${room.description}</color>`,
    });

    // 发送出口信息
    if (room.exits && room.exits.length > 0) {
      const exitList = room.exits
        .map((exit) => {
          const dirName = this.getDirectionName(exit.direction);
          const dirKey = this.getDirectionKey(exit.direction);
          // 使用简单的标记格式，客户端会解析为可点击链接
          return `[exit:${dirKey}]<color:#1E90FF>${dirName}</color>[/exit]`;
        })
        .join(' <color:#333333>|</color> ');

      client.emit('message', {
        type: 'exits',
        content: `<color:#8B4513>━━━━ 出口 ━━━━</color>\n${exitList}`,
      });
    } else {
      client.emit('message', {
        type: 'narrative',
        content: '<color:#696969>这里没有明显的出口。</color>',
      });
    }

    // 发送房间内的NPC信息
    if (room.npcs && room.npcs.length > 0) {
      const npcList = room.npcs
        .map((npcId) => {
          const npc = this.dataLoader.getNpc(npcId);
          return npc ? `<color:#DC143C>${npc.name}</color>` : null;
        })
        .filter(Boolean)
        .join(' <color:#333333>•</color> ');

      if (npcList) {
        client.emit('message', {
          type: 'npcs',
          content: `<color:#8B4513>━━━━ 人物 ━━━━</color>\n${npcList}`,
        });
      }
    }

    // 发送房间内的玩家信息
    const playersInRoom = this.worldService.getPlayersInRoom(room.id);
    const otherPlayers = playersInRoom.filter((id) => id !== player.id);
    if (otherPlayers.length > 0) {
      client.emit('message', {
        type: 'players',
        content: `<color:#8B4513>━━━━ 玩家 ━━━━</color>\n<color:#4B0082>这里还有其他${otherPlayers.length}位修士</color>`,
      });
    }
  }

  private async handleMoveCommand(
    client: Socket,
    player: any,
    direction: Direction,
  ) {
    const currentRoom = this.worldService.getRoom(player.currentRoomId);
    if (!currentRoom) {
      client.emit('message', {
        type: 'error',
        content: '当前房间不存在',
      });
      return;
    }

    const exit = currentRoom.exits.find((e) => e.direction === direction);
    if (!exit) {
      client.emit('message', {
        type: 'error',
        content: '这个方向没有出口。',
      });
      return;
    }

    if (exit.isLocked) {
      client.emit('message', {
        type: 'error',
        content: '这个出口被锁住了。',
      });
      return;
    }

    // 离开当前房间
    this.worldService.removePlayerFromRoom(currentRoom.id, player.id);
    client.leave(currentRoom.id);

    // 进入新房间
    const newRoom = this.worldService.getRoom(exit.targetRoomId);
    if (!newRoom) {
      client.emit('message', {
        type: 'error',
        content: '目标房间不存在',
      });
      return;
    }

    this.worldService.addPlayerToRoom(newRoom.id, player.id);
    await this.playerService.updatePosition(player.id, newRoom.id);
    client.join(newRoom.id);

    // 通知玩家离开旧房间
    client.to(currentRoom.id).emit('message', {
      type: 'narrative',
      content: `${player.displayName}离开了这里。`,
    });

    // 通知玩家进入新房间
    client.to(newRoom.id).emit('message', {
      type: 'narrative',
      content: `${player.displayName}来到了这里。`,
    });

    // 自动look新房间
    player.currentRoomId = newRoom.id;
    await this.handleLookCommand(client, player);
  }

  private handleHelpCommand(client: Socket) {
    const helpText = `
【游戏命令帮助】

基本命令:
  look/l            - 查看当前房间
  north/n           - 向北移动
  south/s           - 向南移动
  east/e            - 向东移动
  west/w            - 向西移动
  up/u              - 向上移动
  down/d            - 向下移动
  map/地图          - 查看当前区域地图
  talk/t            - 与NPC对话 (talk <名字>)
  teleport/tp/传送  - 传送到指定房间 (teleport <房间ID>)
  help/?            - 显示帮助信息

更多功能正在开发中...
    `.trim();

    client.emit('message', {
      type: 'help',
      content: helpText,
    });
  }

  private async handleTalkCommand(client: Socket, player: any, args: string[]) {
    const room = this.worldService.getRoom(player.currentRoomId);
    if (!room) {
      client.emit('message', {
        type: 'error',
        content: '当前房间不存在',
      });
      return;
    }

    // 如果没有指定NPC名字,列出房间内所有NPC
    if (args.length === 0) {
      if (!room.npcs || room.npcs.length === 0) {
        client.emit('message', {
          type: 'error',
          content: '这里没有人可以交谈。',
        });
        return;
      }

      const npcList = room.npcs
        .map((npcId) => {
          const npc = this.dataLoader.getNpc(npcId);
          return npc ? npc.name : null;
        })
        .filter(Boolean)
        .join('、');

      client.emit('message', {
        type: 'narrative',
        content: `你可以和这些人交谈: ${npcList}\n使用 talk <名字> 来对话`,
      });
      return;
    }

    // 根据名字查找NPC
    const npcName = args.join(' ');
    const npcId = room.npcs?.find((id) => {
      const npc = this.dataLoader.getNpc(id);
      return npc && npc.name.includes(npcName);
    });

    if (!npcId) {
      client.emit('message', {
        type: 'error',
        content: `这里没有叫"${npcName}"的人。`,
      });
      return;
    }

    // 获取NPC对话
    try {
      const dialogue = await this.npcService.handleDialogue({
        npcId,
        playerId: player.id,
      });

      // 发送NPC名字
      client.emit('message', {
        type: 'npc',
        content: `【${dialogue.npcName}】`,
      });

      // 发送对话内容
      client.emit('message', {
        type: 'dialogue',
        content: dialogue.dialogue.npcText,
      });

      // 发送对话选项
      if (dialogue.dialogue.options && dialogue.dialogue.options.length > 0) {
        const optionText = dialogue.dialogue.options
          .map((opt, index) => `  ${index + 1}. ${opt.text}`)
          .join('\n');

        client.emit('message', {
          type: 'dialogue',
          content: `\n请选择:\n${optionText}`,
        });
      }
    } catch (error) {
      client.emit('message', {
        type: 'error',
        content: '对话出错了。',
      });
    }
  }

  private async handleTeleportCommand(
    client: Socket,
    player: any,
    args: string[],
  ) {
    // 检查是否提供了房间ID
    if (args.length === 0) {
      client.emit('message', {
        type: 'error',
        content: '请指定要传送的房间ID。\n用法: teleport <房间ID> 或 tp <房间ID>',
      });
      return;
    }

    const targetRoomId = args[0];

    // 检查目标房间是否存在
    const targetRoom = this.worldService.getRoom(targetRoomId);
    if (!targetRoom) {
      client.emit('message', {
        type: 'error',
        content: `房间 "${targetRoomId}" 不存在。`,
      });
      return;
    }

    // 检查是否已经在目标房间
    if (player.currentRoomId === targetRoomId) {
      client.emit('message', {
        type: 'error',
        content: '你已经在这个房间了。',
      });
      return;
    }

    const currentRoom = this.worldService.getRoom(player.currentRoomId);

    // 从当前房间移除玩家
    if (currentRoom) {
      this.worldService.removePlayerFromRoom(currentRoom.id, player.id);
      client.leave(currentRoom.id);

      // 通知当前房间的其他玩家
      client.to(currentRoom.id).emit('message', {
        type: 'narrative',
        content: `${player.displayName}消失在一道光芒中。`,
      });
    }

    // 添加玩家到目标房间
    this.worldService.addPlayerToRoom(targetRoom.id, player.id);
    await this.playerService.updatePosition(player.id, targetRoom.id);
    client.join(targetRoom.id);

    // 通知玩家传送成功
    client.emit('message', {
      type: 'system',
      content: `你被一道神秘的力量传送到了新的地方...`,
    });

    // 通知目标房间的其他玩家
    client.to(targetRoom.id).emit('message', {
      type: 'narrative',
      content: `${player.displayName}从一道光芒中出现。`,
    });

    // 更新玩家位置并自动look新房间
    player.currentRoomId = targetRoom.id;
    await this.handleLookCommand(client, player);
  }

  /**
   * 处理地图命令 - 发送当前区域的所有房间信息
   */
  private async handleMapCommand(client: Socket, player: any) {
    const currentRoom = this.worldService.getRoom(player.currentRoomId);
    if (!currentRoom) {
      client.emit('message', {
        type: 'error',
        content: '无法获取当前位置信息。',
      });
      return;
    }

    // 获取当前区域的所有房间
    const allRooms = this.worldService.getAllRooms();
    const allAreaRooms = allRooms.filter(room => room.areaId === currentRoom.areaId);

    if (allAreaRooms.length === 0) {
      client.emit('message', {
        type: 'error',
        content: '当前区域没有地图数据。',
      });
      return;
    }

    // 只获取从当前位置可达的房间(避免显示不连通的区域)
    const areaRooms = this.getReachableRooms(allAreaRooms, player.currentRoomId);

    // 使用基于连接关系的自动布局算法
    const roomPositions = this.calculateRoomPositions(areaRooms);

    // 构建地图数据
    const mapNodes = areaRooms.map((room, index) => {
      // 使用计算出的坐标
      const position = roomPositions.get(room.id) || { x: index % 10, y: Math.floor(index / 10) };

      // 构建出口映射
      const exits: { [direction: string]: number } = {};
      let skippedExits = 0;
      room.exits.forEach((exit: any) => {
        const targetRoomIndex = areaRooms.findIndex(r => r.id === exit.targetRoomId);
        if (targetRoomIndex !== -1) {
          // 将Direction枚举转换为简单的方向字符串
          const dirKey = this.getDirectionKey(exit.direction);
          exits[dirKey] = targetRoomIndex; // 使用数组索引作为节点ID
        } else {
          // 出口指向的房间不在可达房间列表中
          skippedExits++;
        }
      });

      // 如果有跳过的出口，记录警告
      if (skippedExits > 0 && index < 5) {
        console.log(`[Map Debug] 房间 ${room.id} (${room.name}) 有 ${skippedExits} 个出口被跳过（目标房间不可达）`);
      }

      // 获取房间所属的district信息
      const districtInfo = this.worldService.getRoomDistrict(room.id);

      return {
        id: index, // 使用数组索引作为节点ID
        name: room.name,
        x: position.x,
        y: position.y,
        exits,
        originalId: room.id, // 调试用：保存原始房间ID
        districtId: districtInfo?.districtId,
        districtName: districtInfo?.districtName,
      };
    });

    // 调试日志：输出地图节点信息
    const playerNodeIndex = mapNodes.findIndex(n => n.originalId === player.currentRoomId);
    console.log(`[Map Debug] 玩家房间: ${player.currentRoomId} (索引: ${playerNodeIndex})`);

    if (playerNodeIndex >= 0) {
      const playerNode = mapNodes[playerNodeIndex];
      console.log(`[Map Debug] 玩家所在房间详情:`, {
        id: playerNode.id,
        name: playerNode.name,
        originalId: playerNode.originalId,
        exits: playerNode.exits
      });

      // 输出玩家房间出口指向的房间信息
      Object.entries(playerNode.exits).forEach(([dir, targetIndex]) => {
        const targetNode = mapNodes[targetIndex as number];
        if (targetNode) {
          console.log(`[Map Debug]   ${dir} -> 房间${targetIndex}: ${targetNode.name} (${targetNode.originalId})`);
        }
      });
    }

    console.log(`[Map Debug] 前5个房间的出口信息:`, mapNodes.slice(0, 5).map(node => ({
      id: node.id,
      name: node.name,
      originalId: node.originalId,
      exits: node.exits
    })));

    // 额外调试：显示房间31的详细信息（东长安街）
    if (mapNodes[31]) {
      console.log(`[Map Debug] 房间31详情:`, {
        id: mapNodes[31].id,
        name: mapNodes[31].name,
        originalId: mapNodes[31].originalId,
        exits: mapNodes[31].exits
      });
      Object.entries(mapNodes[31].exits).forEach(([dir, targetIndex]) => {
        const targetNode = mapNodes[targetIndex as number];
        if (targetNode) {
          console.log(`[Map Debug]   房间31的${dir} -> 房间${targetIndex}: ${targetNode.name}`);
        }
      });
    }

    // 找到玩家当前所在房间的索引
    const playerRoomIndex = areaRooms.findIndex(r => r.id === player.currentRoomId);

    // 构建district列表（去重）
    const districtsMap = new Map<string, { id: string; name: string; roomCount: number }>();
    mapNodes.forEach(node => {
      if (node.districtId && node.districtName) {
        if (districtsMap.has(node.districtId)) {
          const district = districtsMap.get(node.districtId)!;
          district.roomCount++;
        } else {
          districtsMap.set(node.districtId, {
            id: node.districtId,
            name: node.districtName,
            roomCount: 1
          });
        }
      }
    });
    const districts = Array.from(districtsMap.values());

    // 发送地图数据
    client.emit('message', {
      type: 'map_data',
      content: JSON.stringify({
        area_name: currentRoom.areaId,
        rooms: mapNodes,
        player_room: playerRoomIndex,
        districts: districts,
      }),
    });

    // 发送系统提示
    client.emit('message', {
      type: 'system',
      content: `已加载 ${currentRoom.areaId} 区域地图，共 ${mapNodes.length} 个房间。`,
    });
  }

  /**
   * 获取从起始房间可达的所有房间(使用BFS)
   * 这样可以避免显示不连通的孤立房间
   *
   * 重要：这个函数遍历实际的出口连接，确保只返回真正可达的房间
   */
  private getReachableRooms(allRooms: any[], startRoomId: string): any[] {
    const reachable = new Set<string>();
    const queue: string[] = [startRoomId];
    reachable.add(startRoomId);

    // 建立房间ID到房间对象的映射
    const roomMap = new Map(allRooms.map(room => [room.id, room]));

    while (queue.length > 0) {
      const currentRoomId = queue.shift();
      if (!currentRoomId) break;

      const currentRoom = roomMap.get(currentRoomId);
      if (!currentRoom) continue;

      // 遍历所有出口
      for (const exit of currentRoom.exits) {
        const targetRoomId = exit.targetRoomId;

        // 如果目标房间在当前区域且未访问过
        if (roomMap.has(targetRoomId) && !reachable.has(targetRoomId)) {
          reachable.add(targetRoomId);
          queue.push(targetRoomId);
        }
      }
    }

    const reachableRooms = allRooms.filter(room => reachable.has(room.id));

    // 调试日志
    console.log(`[Map Debug] 区域总房间数: ${allRooms.length}, 可达房间数: ${reachableRooms.length}`);
    console.log(`[Map Debug] 服务器BFS遍历统计: 队列处理次数未知, 访问的房间ID (前20个):`,
      Array.from(reachable).slice(0, 20));

    if (reachableRooms.length < allRooms.length) {
      const unreachable = allRooms.filter(room => !reachable.has(room.id));
      console.log(`[Map Debug] 不可达的房间数: ${unreachable.length}, 前5个:`,
        unreachable.slice(0, 5).map(r => ({ id: r.id, name: r.name })));
    }

    return reachableRooms;
  }

  /**
   * 基于房间连接关系计算房间位置
   * 使用BFS遍历,根据方向关系自动布局
   */
  private calculateRoomPositions(rooms: any[]): Map<string, { x: number; y: number }> {
    const positions = new Map<string, { x: number; y: number }>();

    if (rooms.length === 0) {
      return positions;
    }

    // 方向到坐标偏移的映射
    const directionOffsets: { [key: string]: { dx: number; dy: number } } = {
      [Direction.NORTH]: { dx: 0, dy: -1 },
      [Direction.SOUTH]: { dx: 0, dy: 1 },
      [Direction.EAST]: { dx: 1, dy: 0 },
      [Direction.WEST]: { dx: -1, dy: 0 },
      [Direction.NORTHEAST]: { dx: 1, dy: -1 },
      [Direction.NORTHWEST]: { dx: -1, dy: -1 },
      [Direction.SOUTHEAST]: { dx: 1, dy: 1 },
      [Direction.SOUTHWEST]: { dx: -1, dy: 1 },
      [Direction.UP]: { dx: 0, dy: -2 },
      [Direction.DOWN]: { dx: 0, dy: 2 },
    };

    // 从第一个房间开始,设置为原点
    const startRoom = rooms[0];
    positions.set(startRoom.id, { x: 0, y: 0 });

    // BFS队列
    const queue: string[] = [startRoom.id];
    const visited = new Set<string>([startRoom.id]);

    while (queue.length > 0) {
      const currentRoomId = queue.shift();
      if (!currentRoomId) break;

      const currentRoom = rooms.find(r => r.id === currentRoomId);
      if (!currentRoom) continue;

      const currentPos = positions.get(currentRoomId)!;

      // 遍历所有出口
      for (const exit of currentRoom.exits) {
        const targetRoomId = exit.targetRoomId;

        // 如果目标房间已经访问过,跳过
        if (visited.has(targetRoomId)) continue;

        // 计算目标房间的位置
        const offset = directionOffsets[exit.direction];
        if (!offset) continue;

        const newPos = {
          x: currentPos.x + offset.dx,
          y: currentPos.y + offset.dy,
        };

        // 检查位置冲突,如果冲突则微调
        let adjustedPos = { ...newPos };
        let attempts = 0;
        while (this.hasPositionConflict(positions, adjustedPos) && attempts < 20) {
          adjustedPos = {
            x: newPos.x + (attempts % 4) - 1,
            y: newPos.y + Math.floor(attempts / 4) - 1,
          };
          attempts++;
        }

        positions.set(targetRoomId, adjustedPos);
        visited.add(targetRoomId);
        queue.push(targetRoomId);
      }
    }

    // 处理未连接的房间(如果有)
    rooms.forEach((room, index) => {
      if (!positions.has(room.id)) {
        // 放置在网格的空闲位置
        positions.set(room.id, {
          x: (index % 5) * 3,
          y: Math.floor(index / 5) * 3 + 20,
        });
      }
    });

    return positions;
  }

  /**
   * 检查位置是否与已有房间冲突
   */
  private hasPositionConflict(
    positions: Map<string, { x: number; y: number }>,
    pos: { x: number; y: number }
  ): boolean {
    for (const [_, existingPos] of positions) {
      if (existingPos.x === pos.x && existingPos.y === pos.y) {
        return true;
      }
    }
    return false;
  }

  /**
   * 将Direction枚举转换为简单的方向字符串键
   */
  private getDirectionKey(direction: Direction): string {
    const dirMap: { [key: string]: string } = {
      [Direction.NORTH]: 'north',
      [Direction.SOUTH]: 'south',
      [Direction.EAST]: 'east',
      [Direction.WEST]: 'west',
      [Direction.UP]: 'up',
      [Direction.DOWN]: 'down',
      [Direction.NORTHEAST]: 'northeast',
      [Direction.NORTHWEST]: 'northwest',
      [Direction.SOUTHEAST]: 'southeast',
      [Direction.SOUTHWEST]: 'southwest',
    };
    return dirMap[direction] || direction.toLowerCase();
  }

  private getDirectionName(direction: Direction): string {
    const dirMap = {
      [Direction.NORTH]: '北',
      [Direction.SOUTH]: '南',
      [Direction.EAST]: '东',
      [Direction.WEST]: '西',
      [Direction.UP]: '上',
      [Direction.DOWN]: '下',
      [Direction.NORTHEAST]: '东北',
      [Direction.NORTHWEST]: '西北',
      [Direction.SOUTHEAST]: '东南',
      [Direction.SOUTHWEST]: '西南',
    };
    return dirMap[direction] || direction;
  }
}
