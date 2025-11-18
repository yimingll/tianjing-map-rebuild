/**
 * 装备系统的API操作
 */

import { ItemApi } from '@/api/itemApi';
import { useEquipmentStore } from './equipmentStore';

/**
 * 从服务器加载装备数据
 */
export async function loadEquipment(playerId: string) {
  const store = useEquipmentStore.getState();

  try {
    store.setLoading(true);
    const equipment = await ItemApi.getEquipment(playerId);

    // 转换为前端格式
    const slots: any = {};
    for (const [slot, data] of Object.entries(equipment)) {
      if (data && typeof data === 'object' && 'item' in data) {
        const itemData = (data as any).item;
        slots[slot] = {
          item_id: (data as any).itemId,
          item_name: itemData?.name || '未知装备',
          item_type: itemData?.type || 'misc',
          attributes: itemData?.stats || {},
          item_data: itemData,
        };
      }
    }

    store.setSlots(slots);
    store.setLoading(false);

    console.log('[Equipment] 装备数据加载成功:', slots);
    return slots;
  } catch (error) {
    console.error('[Equipment] 加载装备失败:', error);
    store.setError(error instanceof Error ? error.message : '加载装备失败');
    return {};
  }
}

/**
 * 装备物品
 */
export async function equipItem(playerId: string, itemId: string, slot: string) {
  const store = useEquipmentStore.getState();

  try {
    store.setLoading(true);
    const result = await ItemApi.equipItem(playerId, itemId, slot);

    if (result.success) {
      await loadEquipment(playerId);
      console.log('[Equipment] 装备成功:', result.message);
      return { success: true, message: result.message };
    } else {
      store.setError(result.message);
      return { success: false, message: result.message };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '装备失败';
    store.setError(message);
    return { success: false, message };
  }
}

/**
 * 卸下装备
 */
export async function unequipItem(playerId: string, slot: string) {
  const store = useEquipmentStore.getState();

  try {
    store.setLoading(true);
    const result = await ItemApi.unequipItem(playerId, slot);

    if (result.success) {
      await loadEquipment(playerId);
      console.log('[Equipment] 卸下装备成功:', result.message);
      return { success: true, message: result.message };
    } else {
      store.setError(result.message);
      return { success: false, message: result.message };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '卸下装备失败';
    store.setError(message);
    return { success: false, message };
  }
}
