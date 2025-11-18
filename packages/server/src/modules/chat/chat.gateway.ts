import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage, ChatChannel, SocketEvent } from '@mud-game/shared';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage(SocketEvent.CHAT_MESSAGE)
  handleMessage(
    @MessageBody() data: { message: string; channel: ChatChannel },
    @ConnectedSocket() client: Socket,
  ) {
    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: client.data.playerId,
      senderName: client.data.playerName || 'Unknown',
      message: data.message,
      channel: data.channel,
      timestamp: new Date(),
    };

    // Broadcast to appropriate channel
    if (data.channel === ChatChannel.GLOBAL) {
      this.server.emit(SocketEvent.CHAT_GLOBAL, chatMessage);
    } else {
      client.emit(SocketEvent.CHAT_MESSAGE, chatMessage);
    }

    return chatMessage;
  }

  sendSystemMessage(message: string, roomId?: string) {
    const chatMessage: ChatMessage = {
      id: `sys_${Date.now()}`,
      senderId: 'system',
      senderName: 'System',
      message,
      channel: ChatChannel.SYSTEM,
      timestamp: new Date(),
    };

    if (roomId) {
      this.server.to(roomId).emit(SocketEvent.CHAT_SYSTEM, chatMessage);
    } else {
      this.server.emit(SocketEvent.CHAT_SYSTEM, chatMessage);
    }
  }
}
