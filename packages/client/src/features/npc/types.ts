/**
 * NPC交互类型定义
 */

export enum InteractionType {
  DIALOGUE = 'dialogue',
  TRADE = 'trade',
  QUEST = 'quest',
  COMBAT = 'combat',
}

export enum NpcType {
  MERCHANT = 'merchant',
  QUEST_GIVER = 'quest_giver',
  TRAINER = 'trainer',
  GUARD = 'guard',
  COMMON = 'common',
}

/**
 * NPC基础信息
 */
export interface NpcInfo {
  id: string;
  name: string;
  description: string;
  type: NpcType | string;
  level: number;
  faction?: string;
  canTrade: boolean;
  canGiveQuest: boolean;
  isAggressive: boolean;
}

/**
 * 对话选项
 */
export interface DialogueOption {
  id: string;
  text: string;
  nextDialogueId?: string;
  action?: string;
  requirements?: {
    level?: number;
    questId?: string;
    itemId?: string;
  };
}

/**
 * 对话节点
 */
export interface DialogueNode {
  id: string;
  npcText: string;
  options: DialogueOption[];
  onEnter?: string;
  onExit?: string;
}

/**
 * 对话交互请求
 */
export interface DialogueInteractionRequest {
  npcId: string;
  playerId: string;
  dialogueId?: string;
  optionId?: string;
}

/**
 * 对话交互响应
 */
export interface DialogueInteractionResponse {
  success: boolean;
  dialogue: DialogueNode;
  npcName: string;
  message?: string;
}

/**
 * 交易物品
 */
export interface TradeItem {
  itemId: string;
  itemName?: string;
  itemData?: any;
  quantity: number;
  price: number;
}

/**
 * 交易请求
 */
export interface TradeRequest {
  npcId: string;
  playerId: string;
  action: 'buy' | 'sell' | 'view';
  itemId?: string;
  quantity?: number;
}

/**
 * 交易响应
 */
export interface TradeResponse {
  success: boolean;
  message: string;
  items?: TradeItem[];
  playerGold?: number;
  itemReceived?: {
    itemId: string;
    quantity: number;
  };
}

/**
 * 房间内NPC列表响应
 */
export interface RoomNpcsResponse {
  roomId: string;
  npcs: NpcInfo[];
}
