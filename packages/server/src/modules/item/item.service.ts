import { Injectable } from '@nestjs/common';
import { Item } from '@mud-game/shared';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ItemService {
  private items: Map<string, Item> = new Map();

  constructor() {
    this.loadItems();
  }

  /**
   * 从JSON文件加载物品数据
   */
  private loadItems() {
    try {
      const itemsFilePath = path.join(process.cwd(), 'data', 'items.json');
      const itemsData = JSON.parse(fs.readFileSync(itemsFilePath, 'utf-8'));

      itemsData.items.forEach((item: Item) => {
        this.items.set(item.id, item);
      });

      console.log(`[ItemService] Loaded ${this.items.size} items`);
    } catch (error) {
      console.error('[ItemService] Error loading items:', error);
    }
  }

  /**
   * 获取物品信息
   */
  getItem(itemId: string): Item | undefined {
    return this.items.get(itemId);
  }

  /**
   * 获取所有物品
   */
  getAllItems(): Item[] {
    return Array.from(this.items.values());
  }

  /**
   * 根据类型获取物品
   */
  getItemsByType(type: string): Item[] {
    return Array.from(this.items.values()).filter(item => item.type === type);
  }

  /**
   * 根据品质获取物品
   */
  getItemsByQuality(quality: string): Item[] {
    return Array.from(this.items.values()).filter(item => item.quality === quality);
  }

  /**
   * 搜索物品（按名称）
   */
  searchItems(keyword: string): Item[] {
    const lowerKeyword = keyword.toLowerCase();
    return Array.from(this.items.values()).filter(item =>
      item.name.toLowerCase().includes(lowerKeyword) ||
      item.description.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * 验证玩家是否满足物品使用要求
   */
  canUseItem(item: Item, playerLevel: number, playerStats: any): boolean {
    if (!item.requirements) {
      return true;
    }

    if (item.requirements.level && playerLevel < item.requirements.level) {
      return false;
    }

    const requiredStats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const stat of requiredStats) {
      if ((item.requirements as any)[stat] && playerStats[stat] < (item.requirements as any)[stat]) {
        return false;
      }
    }

    return true;
  }

  /**
   * 计算物品总价值（考虑数量）
   */
  calculateValue(itemId: string, quantity: number): number {
    const item = this.getItem(itemId);
    if (!item) {
      return 0;
    }
    return item.price * quantity;
  }

  /**
   * 检查物品是否可堆叠
   */
  isStackable(itemId: string): boolean {
    const item = this.getItem(itemId);
    return item ? item.stackable : false;
  }

  /**
   * 获取物品最大堆叠数量
   */
  getMaxStack(itemId: string): number {
    const item = this.getItem(itemId);
    if (!item || !item.stackable) {
      return 1;
    }
    return item.maxStack || 99;
  }
}
