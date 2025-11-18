/**
 * 消息类型定义
 */
export type 消息分类 = '系统' | '叙述' | '描述' | '命令' | '响应' | '战斗' | '动作' | '帮助' | '错误' | 'character_update' | 'room_update' | 'map_data' | 'equipment_data' | 'equipment_changed' | 'cultivation_info' | 'meditation_start' | 'meditation_stop' | 'exp_gain' | 'breakthrough_result' | 'inventory_data' | 'inventory_updated' | 'item_added' | 'item_removed' | 'dialogue' | '世界' | '队伍' | '私聊' | '本地' | 'chat.say' | 'chat.world' | 'chat.team' | 'chat.tell' | 'system.login' | 'system.logout' | 'system.announce' | 'combat' | 'combat.start' | 'combat.round' | 'combat.end' | 'room_title' | 'exits' | 'npcs' | 'players' | 'welcome_banner'

export interface 消息类型 {
  内容: string
  类型: 消息分类
  时间戳: number
}

// 装备槽位物品数据
export interface EquippedItemData {
  slot_type: string;
  item_instance_id: number;
  item_id: number;
  item_name: string;
  quality: string;
  attributes: Record<string, number>;
  equipped_at: string;
}

// 装备数据消息
export interface EquipmentDataMessage {
  type: "equipment_data";
  data: {
    [slotType: string]: EquippedItemData;
  };
}

// 装备变更消息
export interface EquipmentChangedMessage {
  type: "equipment_changed";
  data: {
    action: "equip" | "unequip";
    slot?: string;
    message: string;
  };
}

// 对话选项数据
export interface DialogueChoice {
  id: string;
  text: string;
  disabled?: boolean; // 选项是否禁用
  disabled_text?: string; // 禁用时的提示文本
  conditions?: Array<{ type: string; params: any }>; // 条件列表（可选）
}

// 对话消息数据
export interface DialogueData {
  type: string; // dialogue_start, dialogue_node, dialogue_action, dialogue_end
  npc_id: string;
  npc_name: string;
  tree_id?: string;
  node_id?: string;
  text?: string;
  speaker?: string;
  choices?: DialogueChoice[];
  action?: string;
  quest_id?: string;
  message?: string;
}

// 对话消息
export interface DialogueMessage {
  type: "dialogue";
  content: string; // JSON字符串形式的DialogueData
}
