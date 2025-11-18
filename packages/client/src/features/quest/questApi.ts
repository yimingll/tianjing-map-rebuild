/**
 * 任务API调用
 */

import axios from 'axios';
import type {
  QuestDefinition,
  PlayerQuest,
  AcceptQuestRequest,
  AcceptQuestResponse,
  CompleteQuestRequest,
  CompleteQuestResponse,
  AbandonQuestRequest,
  AbandonQuestResponse,
  PlayerQuestListResponse,
  QuestListResponse,
} from './types';

const API_BASE_URL = 'http://localhost:3000/api/api/quest';

/**
 * 获取所有任务定义
 */
export async function getAllQuests(): Promise<QuestDefinition[]> {
  const response = await axios.get<QuestListResponse>(`${API_BASE_URL}/all`);
  return response.data.quests;
}

/**
 * 获取单个任务详情
 */
export async function getQuestById(questId: string): Promise<QuestDefinition | null> {
  const response = await axios.get<QuestDefinition>(`${API_BASE_URL}/${questId}`);
  return response.data;
}

/**
 * 获取NPC提供的任务
 */
export async function getQuestsByNpc(npcId: string): Promise<QuestDefinition[]> {
  const response = await axios.get<QuestListResponse>(`${API_BASE_URL}/npc/${npcId}`);
  return response.data.quests;
}

/**
 * 获取玩家任务列表
 */
export async function getPlayerQuests(playerId: string): Promise<PlayerQuest[]> {
  const response = await axios.get<PlayerQuestListResponse>(`${API_BASE_URL}/player/${playerId}`);
  return response.data.quests;
}

/**
 * 获取玩家可接任务
 */
export async function getAvailableQuests(playerId: string, level: number = 1): Promise<QuestDefinition[]> {
  const response = await axios.get<QuestListResponse>(`${API_BASE_URL}/available/${playerId}?level=${level}`);
  return response.data.quests;
}

/**
 * 接受任务
 */
export async function acceptQuest(request: AcceptQuestRequest): Promise<AcceptQuestResponse> {
  const response = await axios.post<AcceptQuestResponse>(`${API_BASE_URL}/accept`, request);
  return response.data;
}

/**
 * 完成任务（交付并领取奖励）
 */
export async function completeQuest(request: CompleteQuestRequest): Promise<CompleteQuestResponse> {
  const response = await axios.post<CompleteQuestResponse>(`${API_BASE_URL}/complete`, request);
  return response.data;
}

/**
 * 放弃任务
 */
export async function abandonQuest(request: AbandonQuestRequest): Promise<AbandonQuestResponse> {
  const response = await axios.post<AbandonQuestResponse>(`${API_BASE_URL}/abandon`, request);
  return response.data;
}
