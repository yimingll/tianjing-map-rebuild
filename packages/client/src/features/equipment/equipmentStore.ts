/**
 * 装备系统状态管理
 * 使用 Zustand 管理装备数据和操作
 */

import { create } from "zustand";
import { EquipmentState, EquipmentSlots, SlotType } from "@/types/equipment";
import { 游戏客户端 as GameClient } from "@/lib/gameClient";

/**
 * 装备状态管理 Store
 */
export const useEquipmentStore = create<EquipmentState>((set, get) => ({
  // 初始状态
  slots: {},
  isLoading: false,
  error: null,

  // 设置槽位数据（从后端接收）
  setSlots: (slots: EquipmentSlots) => {
    set({ slots, error: null });
  },

  // 设置加载状态
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  // 设置错误信息
  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  // 穿戴装备（发送命令到后端）
  equipItem: (itemInstanceId: number) => {
    // TODO: 当inventoryStore实现后，可以从库存中获取物品名称
    // const inventoryStore = useInventoryStore.getState();
    // const item = inventoryStore.items.find((i) => i.instance_id === itemInstanceId);

    // if (!item) {
    //   set({ error: "物品不存在" });
    //   return;
    // }

    // 暂时直接发送实例ID，后端会处理
    // 发送命令到后端
    console.log("穿戴装备，实例ID:", itemInstanceId);

    // 注意：后端需要支持通过实例ID穿戴，或者我们需要传递物品名称
    // 这里暂时使用实例ID，后端可以通过ID查找物品
    set({ isLoading: true, error: null });

    // 实际发送命令的逻辑需要根据后端API调整
    // gameClient.sendCommand(`equip ${itemInstanceId}`);
  },

  // 卸下装备（发送命令到后端）
  unequipItem: (slotType: SlotType) => {
    const slot = get().slots[slotType];
    if (!slot) {
      set({ error: "该槽位没有装备" });
      return;
    }

    // 发送命令到后端
    console.log("卸下装备，槽位:", slotType);
    set({ isLoading: true, error: null });

    // 实际发送命令的逻辑需要根据后端API调整
    // gameClient.sendCommand(`unequip ${slotType}`);
  },

  // 清空槽位（仅本地状态）
  clearSlot: (slotType: SlotType) => {
    set((state) => {
      const newSlots = { ...state.slots };
      delete newSlots[slotType];
      return { slots: newSlots };
    });
  },

  // 清空所有槽位（用于登出时清理状态）
  clearAllSlots: () => {
    set({ slots: {}, error: null, isLoading: false });
  },

  // 获取指定槽位的装备
  getEquippedItem: (slotType: SlotType) => {
    return get().slots[slotType];
  },

  // 检查槽位是否为空
  isSlotEmpty: (slotType: SlotType) => {
    return !get().slots[slotType];
  },

  // 计算所有装备提供的总属性加成
  getTotalAttributes: () => {
    const slots = get().slots;
    const totalAttrs: Record<string, number> = {};

    Object.values(slots).forEach((item) => {
      if (item && item.attributes) {
        Object.entries(item.attributes).forEach(([attr, value]) => {
          totalAttrs[attr] = (totalAttrs[attr] || 0) + value;
        });
      }
    });

    return totalAttrs;
  },
}));

/**
 * WebSocket消息监听器设置
 * 在游戏客户端连接后调用此函数来设置装备系统的消息监听
 */
export function setupEquipmentListeners(gameClient: GameClient) {
  console.log("设置装备系统WebSocket监听器");

  // 监听所有消息并处理装备相关的消息
  gameClient.监听消息((消息) => {
    try {
      // 尝试解析消息内容为JSON
      const content = 消息.内容;

      // 检查是否是装备数据消息
      if (消息.类型 === "equipment_data") {
        console.log("收到装备数据:", content);
        try {
          const data = typeof content === "string" ? JSON.parse(content) : content;
          useEquipmentStore.getState().setSlots(data);
          useEquipmentStore.getState().setLoading(false);
        } catch (e) {
          console.error("解析装备数据失败:", e);
        }
      }

      // 检查是否是装备变更消息
      else if (消息.类型 === "equipment_changed") {
        console.log("装备已变更:", content);
        useEquipmentStore.getState().setLoading(false);

        // 刷新装备数据
        gameClient.发送命令("equipment");
      }

      // 检查是否是错误消息（与装备相关）
      else if (消息.类型 === "错误") {
        const message = typeof content === "string" ? content : JSON.stringify(content);
        if (message.includes("穿戴") || message.includes("卸下") || message.includes("装备")) {
          console.error("装备操作错误:", message);
          useEquipmentStore.getState().setError(message);
        }
      }
    } catch (error) {
      console.error("处理装备消息时出错:", error);
    }
  });
}

/**
 * 清理装备状态（用于登出时）
 */
export function clearEquipmentState() {
  useEquipmentStore.getState().clearAllSlots();
}
