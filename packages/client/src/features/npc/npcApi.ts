/**
 * NPC API调用
 */

import axios from 'axios';
import type {
  NpcInfo,
  DialogueInteractionRequest,
  DialogueInteractionResponse,
  TradeRequest,
  TradeResponse,
  RoomNpcsResponse,
} from './types';

const API_BASE_URL = 'http://localhost:3000/api/api/npc';

/**
 * 获取NPC信息
 */
export async function getNpcInfo(npcId: string): Promise<NpcInfo> {
  const response = await axios.get<NpcInfo>(`${API_BASE_URL}/${npcId}`);
  return response.data;
}

/**
 * 获取房间内的所有NPC
 */
export async function getNpcsInRoom(roomId: string): Promise<RoomNpcsResponse> {
  const response = await axios.get<RoomNpcsResponse>(`${API_BASE_URL}/room/${roomId}`);
  return response.data;
}

/**
 * 与NPC对话
 */
export async function talkToNpc(request: DialogueInteractionRequest): Promise<DialogueInteractionResponse> {
  const response = await axios.post<DialogueInteractionResponse>(`${API_BASE_URL}/dialogue`, request);
  return response.data;
}

/**
 * 与NPC交易
 */
export async function tradeWithNpc(request: TradeRequest): Promise<TradeResponse> {
  const response = await axios.post<TradeResponse>(`${API_BASE_URL}/trade`, request);
  return response.data;
}
