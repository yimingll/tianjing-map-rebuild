import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NpcService } from './npc.service';
import {
  DialogueInteractionRequest,
  TradeRequest,
} from './npc-interaction.interfaces';

@Controller('api/npc')
export class NpcController {
  constructor(private readonly npcService: NpcService) {}

  /**
   * 获取NPC信息
   */
  @Get(':npcId')
  getNpcInfo(@Param('npcId') npcId: string) {
    return this.npcService.getNpcInfo(npcId);
  }

  /**
   * 获取房间内的所有NPC
   */
  @Get('room/:roomId')
  getNpcsInRoom(@Param('roomId') roomId: string) {
    return this.npcService.getNpcsInRoom(roomId);
  }

  /**
   * 与NPC对话
   */
  @Post('dialogue')
  handleDialogue(@Body() request: DialogueInteractionRequest) {
    return this.npcService.handleDialogue(request);
  }

  /**
   * 与NPC交易
   */
  @Post('trade')
  handleTrade(@Body() request: TradeRequest) {
    return this.npcService.handleTrade(request);
  }
}
