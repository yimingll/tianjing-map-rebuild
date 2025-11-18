/**
 * 背包系统的API操作
 */

import { ItemApi } from '@/api/itemApi';
import { useInventoryStore } from './inventoryStore';

/**
 * 从服务器加载背包数据
 */
export async function loadInventory(playerId: string) {
  const store = useInventoryStore.getState();

  try {
    store.setLoading(true);
    const inventory = await ItemApi.getInventory(playerId);

    // 转换为前端格式
    const items = inventory.map((inv, index) => ({
      instance_id: index, // 使用索引作为临时ID
      item_id: inv.itemId,
      item_name: inv.item?.name || '未知物品',
      item_type: inv.item?.type || 'misc',
      quantity: inv.quantity,
      item_data: inv.item, // 完整的物品数据
    }));

    store.setItems(items);
    store.setLoading(false);

    console.log('[Inventory] 背包数据加载成功:', items);
    return items;
  } catch (error) {
    console.error('[Inventory] 加载背包失败:', error);
    store.setError(error instanceof Error ? error.message : '加载背包失败');
    return [];
  }
}

/**
 * 添加物品到背包
 */
export async function addItemToInventory(playerId: string, itemId: string, quantity: number = 1) {
  const store = useInventoryStore.getState();

  try {
    store.setLoading(true);
    const result = await ItemApi.addItem(playerId, itemId, quantity);

    if (result.success) {
      // 重新加载背包数据
      await loadInventory(playerId);
      console.log('[Inventory] 物品添加成功:', result.message);
      return { success: true, message: result.message };
    } else {
      store.setError(result.message);
      return { success: false, message: result.message };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '添加物品失败';
    store.setError(message);
    return { success: false, message };
  }
}

/**
 * 移除背包物品
 */
export async function removeItemFromInventory(playerId: string, itemId: string, quantity: number = 1) {
  const store = useInventoryStore.getState();

  try {
    store.setLoading(true);
    const result = await ItemApi.removeItem(playerId, itemId, quantity);

    if (result.success) {
      await loadInventory(playerId);
      console.log('[Inventory] 物品移除成功:', result.message);
      return { success: true, message: result.message };
    } else {
      store.setError(result.message);
      return { success: false, message: result.message };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '移除物品失败';
    store.setError(message);
    return { success: false, message };
  }
}

/**
 * 使用物品
 */
export async function useInventoryItem(playerId: string, itemId: string) {
  const store = useInventoryStore.getState();

  try {
    store.setLoading(true);
    const result = await ItemApi.useItem(playerId, itemId);

    if (result.success) {
      await loadInventory(playerId);
      console.log('[Inventory] 物品使用成功:', result.message);
      return { success: true, message: result.message, effects: result.effects };
    } else {
      store.setError(result.message);
      return { success: false, message: result.message };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '使用物品失败';
    store.setError(message);
    return { success: false, message };
  }
}

/**
 * 获取所有可用物品（商店/拾取用）
 */
export async function getAllAvailableItems() {
  try {
    const items = await ItemApi.getAllItems();
    console.log('[Inventory] 获取所有物品:', items.length);
    return items;
  } catch (error) {
    console.error('[Inventory] 获取物品列表失败:', error);
    return [];
  }
}

/**
 * 搜索物品
 */
export async function searchItems(keyword: string) {
  try {
    const items = await ItemApi.searchItems(keyword);
    console.log('[Inventory] 搜索结果:', items.length);
    return items;
  } catch (error) {
    console.error('[Inventory] 搜索物品失败:', error);
    return [];
  }
}
