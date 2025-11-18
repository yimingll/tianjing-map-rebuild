/**
 * 装备系统类型定义
 */

/**
 * 装备槽位类型
 */
export type SlotType =
  | "weapon"        // 武器
  | "helmet"        // 头盔
  | "armor"         // 护甲
  | "leggings"      // 护腿
  | "boots"         // 靴子
  | "necklace"      // 项链
  | "ring1"         // 戒指1
  | "ring2"         // 戒指2
  | "belt"          // 腰带
  | "magic_treasure" // 法宝
  | "spirit_pet"    // 灵宠
  | "talisman"      // 符箓
  | "jade_pendant"; // 玉佩

/**
 * 槽位中文名称映射
 */
export const SLOT_NAMES: Record<SlotType, string> = {
  weapon: "武器",
  helmet: "头盔",
  armor: "护甲",
  leggings: "护腿",
  boots: "靴子",
  necklace: "项链",
  ring1: "戒指1",
  ring2: "戒指2",
  belt: "腰带",
  magic_treasure: "法宝",
  spirit_pet: "灵宠",
  talisman: "符箓",
  jade_pendant: "玉佩",
};

/**
 * 装备品质类型
 */
export type EquipmentQuality = "common" | "uncommon" | "rare" | "epic" | "legendary";

/**
 * 品质中文名称映射
 */
export const QUALITY_NAMES: Record<EquipmentQuality, string> = {
  common: "普通",
  uncommon: "优秀",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
};

/**
 * 品质颜色映射（用于UI显示）
 */
export const QUALITY_COLORS: Record<EquipmentQuality, string> = {
  common: "#808080",    // 灰色
  uncommon: "#1eff00",  // 绿色
  rare: "#0070dd",      // 蓝色
  epic: "#a335ee",      // 紫色
  legendary: "#ff8000", // 橙色
};

/**
 * 已装备的物品接口
 */
export interface EquippedItem {
  slot_type: SlotType;           // 槽位类型
  item_instance_id: number;      // 物品实例ID
  item_id: number;               // 物品模板ID
  item_name: string;             // 物品名称
  quality: EquipmentQuality;     // 品质
  attributes: Record<string, number>; // 属性加成
  equipped_at: string;           // 装备时间
}

/**
 * 装备槽位映射（部分槽位可能为空）
 */
export type EquipmentSlots = Partial<Record<SlotType, EquippedItem>>;

/**
 * 装备状态管理接口
 */
export interface EquipmentState {
  // 状态数据
  slots: EquipmentSlots;   // 装备槽位数据
  isLoading: boolean;      // 是否正在加载/操作中
  error: string | null;    // 错误信息

  // 数据设置方法
  setSlots: (slots: EquipmentSlots) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 装备操作方法
  equipItem: (itemInstanceId: number) => void;    // 穿戴装备（发送命令）
  unequipItem: (slotType: SlotType) => void;      // 卸下装备（发送命令）

  // 本地状态管理方法
  clearSlot: (slotType: SlotType) => void;        // 清空指定槽位
  clearAllSlots: () => void;                      // 清空所有槽位

  // 查询方法
  getEquippedItem: (slotType: SlotType) => EquippedItem | undefined;  // 获取指定槽位装备
  isSlotEmpty: (slotType: SlotType) => boolean;                       // 检查槽位是否为空
  getTotalAttributes: () => Record<string, number>;                   // 计算总属性加成
}
