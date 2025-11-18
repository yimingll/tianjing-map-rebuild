/**
 * 任务控制器
 */

import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { QuestService } from './quest.service';
import type {
  AcceptQuestRequest,
  AcceptQuestResponse,
  CompleteQuestRequest,
  CompleteQuestResponse,
  AbandonQuestRequest,
  AbandonQuestResponse,
  PlayerQuestListResponse,
  QuestListResponse,
  QuestDefinition,
} from '@mud-game/shared';

@Controller('api/quest')
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  /**
   * 获取所有任务定义
   */
  @Get('all')
  getAllQuests(): QuestListResponse {
    const quests = this.questService.getAllQuests();
    return {
      success: true,
      quests,
    };
  }

  /**
   * 获取单个任务详情
   */
  @Get(':questId')
  getQuestById(@Param('questId') questId: string): QuestDefinition | null {
    return this.questService.getQuestById(questId) || null;
  }

  /**
   * 获取NPC提供的任务列表
   */
  @Get('npc/:npcId')
  getQuestsByNpc(@Param('npcId') npcId: string): QuestListResponse {
    const quests = this.questService.getQuestsByNpc(npcId);
    return {
      success: true,
      quests,
    };
  }

  /**
   * 获取玩家任务列表
   */
  @Get('player/:playerId')
  getPlayerQuests(@Param('playerId') playerId: string): PlayerQuestListResponse {
    return this.questService.getPlayerQuests(playerId);
  }

  /**
   * 获取玩家可接任务列表
   */
  @Get('available/:playerId')
  getAvailableQuests(
    @Param('playerId') playerId: string,
    @Query('level') level?: string
  ): QuestListResponse {
    const playerLevel = level ? parseInt(level, 10) : 1;
    const quests = this.questService.getAvailableQuests(playerId, playerLevel);
    return {
      success: true,
      quests,
    };
  }

  /**
   * 接受任务
   */
  @Post('accept')
  acceptQuest(@Body() request: AcceptQuestRequest): AcceptQuestResponse {
    return this.questService.acceptQuest(request);
  }

  /**
   * 完成任务（交付并领取奖励）
   */
  @Post('complete')
  completeQuest(@Body() request: CompleteQuestRequest): CompleteQuestResponse {
    return this.questService.completeQuest(request);
  }

  /**
   * 放弃任务
   */
  @Post('abandon')
  abandonQuest(@Body() request: AbandonQuestRequest): AbandonQuestResponse {
    return this.questService.abandonQuest(request);
  }
}
