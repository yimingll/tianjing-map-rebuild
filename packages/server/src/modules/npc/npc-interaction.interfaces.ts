/**
 * NPC交互类型
 */
export enum InteractionType {
  DIALOGUE = 'dialogue',
  TRADE = 'trade',
  QUEST = 'quest',
  COMBAT = 'combat',
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
  onEnter?: string; // 进入对话时触发的事件
  onExit?: string; // 退出对话时触发的事件
}

/**
 * 对话交互请求
 */
export interface DialogueInteractionRequest {
  npcId: string;
  playerId: string;
  dialogueId?: string; // 可选，用于继续对话
  optionId?: string; // 玩家选择的选项ID
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
  items?: TradeItem[]; // 商人的商品列表
  playerGold?: number; // 玩家剩余金币
  itemReceived?: {
    itemId: string;
    quantity: number;
  };
}

/**
 * NPC交互结果
 */
export interface InteractionResult {
  success: boolean;
  type: InteractionType;
  message: string;
  data?: any;
}
