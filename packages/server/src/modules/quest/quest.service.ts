/**
 * 任务服务
 */

import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  QuestDefinition,
  PlayerQuest,
  QuestStatus,
  QuestObjective,
  AcceptQuestRequest,
  AcceptQuestResponse,
  CompleteQuestRequest,
  CompleteQuestResponse,
  UpdateQuestProgressRequest,
  AbandonQuestRequest,
  AbandonQuestResponse,
  PlayerQuestListResponse,
} from '@mud-game/shared';

@Injectable()
export class QuestService {
  private readonly logger = new Logger(QuestService.name);
  private quests: Map<string, QuestDefinition> = new Map();
  private playerQuests: Map<string, PlayerQuest[]> = new Map();

  constructor() {
    this.loadQuests();
  }

  /**
   * 加载任务数据
   */
  private loadQuests() {
    try {
      const questsPath = join(process.cwd(), 'data', 'quests.json');
      const data = JSON.parse(readFileSync(questsPath, 'utf-8'));

      data.quests.forEach((quest: QuestDefinition) => {
        this.quests.set(quest.id, quest);
      });

      this.logger.log(`Loaded ${this.quests.size} quests`);
    } catch (error) {
      this.logger.error('Failed to load quests:', error);
    }
  }

  /**
   * 获取所有任务定义
   */
  getAllQuests(): QuestDefinition[] {
    return Array.from(this.quests.values());
  }

  /**
   * 根据ID获取任务定义
   */
  getQuestById(questId: string): QuestDefinition | undefined {
    return this.quests.get(questId);
  }

  /**
   * 获取NPC可提供的任务
   */
  getQuestsByNpc(npcId: string): QuestDefinition[] {
    return Array.from(this.quests.values()).filter(
      (quest) => quest.questGiver.npcId === npcId
    );
  }

  /**
   * 获取玩家任务列表
   */
  getPlayerQuests(playerId: string): PlayerQuestListResponse {
    const quests = this.playerQuests.get(playerId) || [];
    return {
      success: true,
      quests,
    };
  }

  /**
   * 检查玩家是否可以接受任务
   */
  private canAcceptQuest(
    playerId: string,
    quest: QuestDefinition,
    playerLevel: number = 1
  ): { can: boolean; reason?: string } {
    // 检查前置等级
    if (quest.prerequisites?.level && playerLevel < quest.prerequisites.level) {
      return { can: false, reason: `需要达到${quest.prerequisites.level}级` };
    }

    // 检查是否已有该任务
    const playerQuestList = this.playerQuests.get(playerId) || [];
    const existing = playerQuestList.find((pq) => pq.questId === quest.id);

    if (existing) {
      if (existing.status === 'in_progress') {
        return { can: false, reason: '该任务已接受' };
      }
      if (existing.status === 'turned_in' && !quest.isRepeatable) {
        return { can: false, reason: '该任务已完成' };
      }
    }

    // 检查前置任务
    if (quest.prerequisites?.quests) {
      for (const prereqId of quest.prerequisites.quests) {
        const prereq = playerQuestList.find((pq) => pq.questId === prereqId);
        if (!prereq || prereq.status !== 'turned_in') {
          return { can: false, reason: '需要先完成前置任务' };
        }
      }
    }

    return { can: true };
  }

  /**
   * 接受任务
   */
  acceptQuest(request: AcceptQuestRequest): AcceptQuestResponse {
    const { playerId, questId, npcId } = request;
    const quest = this.quests.get(questId);

    if (!quest) {
      return { success: false, message: '任务不存在' };
    }

    // 检查是否是正确的NPC
    if (quest.questGiver.npcId !== npcId) {
      return { success: false, message: '该NPC不提供此任务' };
    }

    // 检查是否可以接受
    const checkResult = this.canAcceptQuest(playerId, quest);
    if (!checkResult.can) {
      return { success: false, message: checkResult.reason || '无法接受任务' };
    }

    // 创建玩家任务
    const objectives: QuestObjective[] = quest.objectives.map((obj) => ({
      ...obj,
      current: 0,
      completed: false,
    }));

    const playerQuest: PlayerQuest = {
      questId,
      playerId,
      status: 'in_progress' as QuestStatus,
      objectives,
      startTime: new Date(),
      timesCompleted: 0,
    };

    // 保存到玩家任务列表
    const playerQuestList = this.playerQuests.get(playerId) || [];
    playerQuestList.push(playerQuest);
    this.playerQuests.set(playerId, playerQuestList);

    this.logger.log(`Player ${playerId} accepted quest ${questId}`);

    return {
      success: true,
      message: '任务已接受',
      quest: playerQuest,
    };
  }

  /**
   * 更新任务进度
   */
  updateQuestProgress(request: UpdateQuestProgressRequest): boolean {
    const { playerId, questId, objectiveId, progress } = request;
    const playerQuestList = this.playerQuests.get(playerId) || [];
    const playerQuest = playerQuestList.find((pq) => pq.questId === questId);

    if (!playerQuest || playerQuest.status !== 'in_progress') {
      return false;
    }

    const objective = playerQuest.objectives.find((obj) => obj.id === objectiveId);
    if (!objective) {
      return false;
    }

    // 更新进度
    objective.current = Math.min(objective.current + progress, objective.required);
    objective.completed = objective.current >= objective.required;

    // 检查所有目标是否完成
    const allCompleted = playerQuest.objectives.every((obj) => obj.completed);
    if (allCompleted) {
      playerQuest.status = 'completed' as QuestStatus;
      playerQuest.completeTime = new Date();
      this.logger.log(`Player ${playerId} completed quest ${questId}`);
    }

    return true;
  }

  /**
   * 完成任务（交付任务并领取奖励）
   */
  completeQuest(request: CompleteQuestRequest): CompleteQuestResponse {
    const { playerId, questId, npcId } = request;
    const quest = this.quests.get(questId);

    if (!quest) {
      return { success: false, message: '任务不存在' };
    }

    // 检查是否是正确的NPC
    if (quest.questGiver.npcId !== npcId) {
      return { success: false, message: '请向任务发布者交付任务' };
    }

    const playerQuestList = this.playerQuests.get(playerId) || [];
    const playerQuest = playerQuestList.find((pq) => pq.questId === questId);

    if (!playerQuest) {
      return { success: false, message: '你还没有接受这个任务' };
    }

    if (playerQuest.status !== 'completed') {
      return { success: false, message: '任务还未完成' };
    }

    // 标记为已交付
    playerQuest.status = 'turned_in' as QuestStatus;
    playerQuest.turnInTime = new Date();
    playerQuest.timesCompleted = (playerQuest.timesCompleted || 0) + 1;

    this.logger.log(`Player ${playerId} turned in quest ${questId}`);

    return {
      success: true,
      message: '任务已完成！',
      rewards: quest.rewards,
      quest: playerQuest,
    };
  }

  /**
   * 放弃任务
   */
  abandonQuest(request: AbandonQuestRequest): AbandonQuestResponse {
    const { playerId, questId } = request;
    const playerQuestList = this.playerQuests.get(playerId) || [];
    const index = playerQuestList.findIndex((pq) => pq.questId === questId);

    if (index === -1) {
      return { success: false, message: '任务不存在' };
    }

    const playerQuest = playerQuestList[index];
    if (playerQuest.status !== 'in_progress') {
      return { success: false, message: '无法放弃该任务' };
    }

    // 移除任务
    playerQuestList.splice(index, 1);
    this.playerQuests.set(playerId, playerQuestList);

    this.logger.log(`Player ${playerId} abandoned quest ${questId}`);

    return {
      success: true,
      message: '已放弃任务',
    };
  }

  /**
   * 检查玩家任务完成度
   */
  checkQuestCompletion(playerId: string, questId: string): boolean {
    const playerQuestList = this.playerQuests.get(playerId) || [];
    const playerQuest = playerQuestList.find((pq) => pq.questId === questId);
    return playerQuest?.status === 'completed' || playerQuest?.status === 'turned_in';
  }

  /**
   * 获取可接任务列表（根据玩家等级和前置条件）
   */
  getAvailableQuests(playerId: string, playerLevel: number = 1): QuestDefinition[] {
    return Array.from(this.quests.values()).filter((quest) => {
      const checkResult = this.canAcceptQuest(playerId, quest, playerLevel);
      return checkResult.can;
    });
  }
}
