/**
 * 物品系统 API 客户端
 */

import { Item, InventoryItem, Equipment } from '@mud-game/shared';

const API_BASE_URL = 'http://localhost:3000/api';

export class ItemApi {
  /**
   * 获取所有物品
   */
  static async getAllItems(): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/item`);
    if (!response.ok) throw new Error('获取物品列表失败');
    return response.json();
  }

  /**
   * 获取单个物品信息
   */
  static async getItem(itemId: string): Promise<Item> {
    const response = await fetch(`${API_BASE_URL}/item/${itemId}`);
    if (!response.ok) throw new Error('获取物品信息失败');
    return response.json();
  }

  /**
   * 根据类型获取物品
   */
  static async getItemsByType(type: string): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/item/type/${type}`);
    if (!response.ok) throw new Error('获取物品列表失败');
    return response.json();
  }

  /**
   * 搜索物品
   */
  static async searchItems(keyword: string): Promise<Item[]> {
    const response = await fetch(`${API_BASE_URL}/item/search?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) throw new Error('搜索物品失败');
    return response.json();
  }

  /**
   * 获取玩家背包
   */
  static async getInventory(playerId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/item/inventory/${playerId}`);
    if (!response.ok) throw new Error('获取背包失败');
    return response.json();
  }

  /**
   * 获取玩家装备
   */
  static async getEquipment(playerId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/item/equipment/${playerId}`);
    if (!response.ok) throw new Error('获取装备失败');
    return response.json();
  }

  /**
   * 添加物品到背包
   */
  static async addItem(playerId: string, itemId: string, quantity: number = 1): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/item/inventory/${playerId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    });
    if (!response.ok) throw new Error('添加物品失败');
    return response.json();
  }

  /**
   * 移除背包物品
   */
  static async removeItem(playerId: string, itemId: string, quantity: number = 1): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/item/inventory/${playerId}/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, quantity }),
    });
    if (!response.ok) throw new Error('移除物品失败');
    return response.json();
  }

  /**
   * 使用物品
   */
  static async useItem(playerId: string, itemId: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/item/inventory/${playerId}/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    });
    if (!response.ok) throw new Error('使用物品失败');
    return response.json();
  }

  /**
   * 装备物品
   */
  static async equipItem(playerId: string, itemId: string, slot: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/item/equipment/${playerId}/equip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, slot }),
    });
    if (!response.ok) throw new Error('装备物品失败');
    return response.json();
  }

  /**
   * 卸下装备
   */
  static async unequipItem(playerId: string, slot: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/item/equipment/${playerId}/unequip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot }),
    });
    if (!response.ok) throw new Error('卸下装备失败');
    return response.json();
  }
}
