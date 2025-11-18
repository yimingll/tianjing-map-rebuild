/**
 * 战斗系统 API 调用模块
 */

import axios from 'axios';
import type {
  MonsterDefinition,
  StartCombatResponse,
  ExecuteCombatActionResponse,
  FleeCombatResponse,
  CombatState,
  CombatAction,
} from './types';

// API 基础地址
const API_BASE = '/api/api/combat';

/**
 * 获取所有怪物列表
 */
export async function getMonsters(): Promise<MonsterDefinition[]> {
  try {
    const response = await axios.get<MonsterDefinition[]>(`${API_BASE}/monsters`);
    return response.data;
  } catch (error) {
    console.error('获取怪物列表失败:', error);
    throw error;
  }
}

/**
 * 开始战斗
 */
export async function startCombat(
  playerId: string,
  monsterId: string
): Promise<StartCombatResponse> {
  try {
    const response = await axios.post<StartCombatResponse>(`${API_BASE}/start`, {
      playerId,
      monsterId,
    });
    return response.data;
  } catch (error) {
    console.error('开始战斗失败:', error);
    throw error;
  }
}

/**
 * 执行战斗行动
 */
export async function executeCombatAction(
  combatId: string,
  playerId: string,
  action: CombatAction
): Promise<ExecuteCombatActionResponse> {
  try {
    const response = await axios.post<ExecuteCombatActionResponse>(`${API_BASE}/action`, {
      combatId,
      playerId,
      action,
    });
    return response.data;
  } catch (error) {
    console.error('执行战斗行动失败:', error);
    throw error;
  }
}

/**
 * 逃跑
 */
export async function fleeCombat(
  combatId: string,
  playerId: string
): Promise<FleeCombatResponse> {
  try {
    const response = await axios.post<FleeCombatResponse>(`${API_BASE}/flee`, {
      combatId,
      playerId,
    });
    return response.data;
  } catch (error) {
    console.error('逃跑失败:', error);
    throw error;
  }
}

/**
 * 获取战斗状态
 */
export async function getCombat(combatId: string): Promise<CombatState> {
  try {
    const response = await axios.get<CombatState>(`${API_BASE}/${combatId}`);
    return response.data;
  } catch (error) {
    console.error('获取战斗状态失败:', error);
    throw error;
  }
}
