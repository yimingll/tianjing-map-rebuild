import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from '../player/player.entity';
import { ItemService } from './item.service';
import { InventoryItem, Equipment } from '@mud-game/shared';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>,
    private itemService: ItemService,
  ) {}

  /**
   * 添加物品到玩家背包
   */
  async addItem(playerId: string, itemId: string, quantity: number = 1): Promise<{ success: boolean; message: string; inventory?: InventoryItem[] }> {
    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      return { success: false, message: '玩家不存在' };
    }

    const item = this.itemService.getItem(itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    const inventory = player.inventory as InventoryItem[] || [];

    // 检查物品是否可堆叠
    if (item.stackable) {
      const existingItem = inventory.find(inv => inv.itemId === itemId);
      if (existingItem) {
        const maxStack = this.itemService.getMaxStack(itemId);
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity <= maxStack) {
          existingItem.quantity = newQuantity;
        } else {
          return { success: false, message: `物品堆叠已达上限 (${maxStack})` };
        }
      } else {
        inventory.push({ itemId, quantity });
      }
    } else {
      // 不可堆叠物品，每个占用一个槽位
      for (let i = 0; i < quantity; i++) {
        inventory.push({ itemId, quantity: 1 });
      }
    }

    player.inventory = inventory;
    await this.playerRepository.save(player);

    return { success: true, message: `获得 ${item.name} x${quantity}`, inventory };
  }

  /**
   * 从玩家背包移除物品
   */
  async removeItem(playerId: string, itemId: string, quantity: number = 1): Promise<{ success: boolean; message: string; inventory?: InventoryItem[] }> {
    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      return { success: false, message: '玩家不存在' };
    }

    const inventory = player.inventory as InventoryItem[] || [];
    const itemIndex = inventory.findIndex(inv => inv.itemId === itemId);

    if (itemIndex === -1) {
      return { success: false, message: '背包中没有该物品' };
    }

    const inventoryItem = inventory[itemIndex];

    if (inventoryItem.quantity < quantity) {
      return { success: false, message: '物品数量不足' };
    }

    inventoryItem.quantity -= quantity;

    if (inventoryItem.quantity <= 0) {
      inventory.splice(itemIndex, 1);
    }

    player.inventory = inventory;
    await this.playerRepository.save(player);

    const item = this.itemService.getItem(itemId);
    return { success: true, message: `失去 ${item?.name || itemId} x${quantity}`, inventory };
  }

  /**
   * 使用物品
   */
  async useItem(playerId: string, itemId: string): Promise<{ success: boolean; message: string; effects?: any }> {
    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      return { success: false, message: '玩家不存在' };
    }

    const item = this.itemService.getItem(itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    // 检查是否拥有该物品
    const inventory = player.inventory as InventoryItem[] || [];
    const hasItem = inventory.some(inv => inv.itemId === itemId && inv.quantity > 0);
    if (!hasItem) {
      return { success: false, message: '背包中没有该物品' };
    }

    // 检查使用要求
    if (!this.itemService.canUseItem(item, player.level, player.attributes)) {
      return { success: false, message: '不满足物品使用条件' };
    }

    // 应用物品效果
    const effects = await this.applyItemEffects(player, item);

    // 如果物品使用后消耗
    if (item.consumeOnUse !== false && item.type === 'consumable') {
      await this.removeItem(playerId, itemId, 1);
    }

    return { success: true, message: `使用了 ${item.name}`, effects };
  }

  /**
   * 应用物品效果
   */
  private async applyItemEffects(player: PlayerEntity, item: any): Promise<any> {
    const effects: any = {};

    if (item.effects && Array.isArray(item.effects)) {
      for (const effect of item.effects) {
        switch (effect.type) {
          case 'heal':
            const healAmount = Math.min(effect.value, player.maxHealth - player.health);
            player.health += healAmount;
            effects.heal = healAmount;
            break;

          case 'buff':
            // TODO: 实现 buff 系统
            effects.buff = { stat: effect.stat, value: effect.value, duration: effect.duration };
            break;
        }
      }

      await this.playerRepository.save(player);
    }

    return effects;
  }

  /**
   * 装备物品
   */
  async equipItem(playerId: string, itemId: string, slot: string): Promise<{ success: boolean; message: string; equipment?: Equipment }> {
    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      return { success: false, message: '玩家不存在' };
    }

    const item = this.itemService.getItem(itemId);
    if (!item) {
      return { success: false, message: '物品不存在' };
    }

    // 检查是否拥有该物品
    const inventory = player.inventory as InventoryItem[] || [];
    const hasItem = inventory.some(inv => inv.itemId === itemId);
    if (!hasItem) {
      return { success: false, message: '背包中没有该物品' };
    }

    // 检查装备要求
    if (!this.itemService.canUseItem(item, player.level, player.attributes)) {
      return { success: false, message: '不满足装备条件' };
    }

    const equipment = player.equipment as Equipment || {};

    // 如果该槽位已有装备，卸下它
    if ((equipment as any)[slot]) {
      const oldItemId = (equipment as any)[slot];
      // 卸下装备的属性加成会在下面重新计算
    }

    // 装备新物品
    (equipment as any)[slot] = itemId;
    player.equipment = equipment;

    // 重新计算玩家属性
    await this.recalculatePlayerStats(player);

    await this.playerRepository.save(player);

    return { success: true, message: `装备了 ${item.name}`, equipment };
  }

  /**
   * 卸下装备
   */
  async unequipItem(playerId: string, slot: string): Promise<{ success: boolean; message: string; equipment?: Equipment }> {
    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      return { success: false, message: '玩家不存在' };
    }

    const equipment = player.equipment as Equipment || {};

    if (!(equipment as any)[slot]) {
      return { success: false, message: '该槽位没有装备' };
    }

    const itemId = (equipment as any)[slot];
    const item = this.itemService.getItem(itemId!);

    delete (equipment as any)[slot];
    player.equipment = equipment;

    // 重新计算玩家属性
    await this.recalculatePlayerStats(player);

    await this.playerRepository.save(player);

    return { success: true, message: `卸下了 ${item?.name || '装备'}`, equipment };
  }

  /**
   * 重新计算玩家属性（基于装备）
   */
  private async recalculatePlayerStats(player: PlayerEntity): Promise<void> {
    // TODO: 实现基于装备的属性计算
    // 这里应该根据玩家装备的物品重新计算总属性
    const equipment = (player.equipment as Equipment) || {};

    let bonusHealth = 0;
    let bonusMana = 0;

    for (const slot in equipment) {
      const itemId = (equipment as any)[slot];
      if (itemId) {
        const item = this.itemService.getItem(itemId);
        if (item && item.stats) {
          bonusHealth += item.stats.health || 0;
          bonusMana += item.stats.mana || 0;
        }
      }
    }

    // 更新最大生命值和法力值
    // 注意：这里简化处理，实际应该有基础值
    if (bonusHealth > 0) {
      player.maxHealth = 100 + bonusHealth; // 100是基础值
    }
    if (bonusMana > 0) {
      player.maxMana = 50 + bonusMana; // 50是基础值
    }
  }

  /**
   * 获取玩家背包
   */
  async getInventory(playerId: string): Promise<InventoryItem[]> {
    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      return [];
    }
    return player.inventory as InventoryItem[] || [];
  }

  /**
   * 获取玩家装备
   */
  async getEquipment(playerId: string): Promise<Equipment> {
    const player = await this.playerRepository.findOne({ where: { id: playerId } });
    if (!player) {
      return {};
    }
    return player.equipment as Equipment || {};
  }
}
