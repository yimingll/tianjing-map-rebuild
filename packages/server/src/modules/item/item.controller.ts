import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ItemService } from './item.service';
import { InventoryService } from './inventory.service';

@Controller('api/item')
export class ItemController {
  constructor(
    private readonly itemService: ItemService,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * 获取所有物品
   */
  @Get()
  getAllItems() {
    return this.itemService.getAllItems();
  }

  /**
   * 获取单个物品信息
   */
  @Get(':id')
  getItem(@Param('id') id: string) {
    return this.itemService.getItem(id);
  }

  /**
   * 根据类型获取物品
   */
  @Get('type/:type')
  getItemsByType(@Param('type') type: string) {
    return this.itemService.getItemsByType(type);
  }

  /**
   * 搜索物品
   */
  @Get('search')
  searchItems(@Query('keyword') keyword: string) {
    return this.itemService.searchItems(keyword);
  }

  /**
   * 获取玩家背包
   */
  @Get('inventory/:playerId')
  async getInventory(@Param('playerId') playerId: string) {
    const inventory = await this.inventoryService.getInventory(playerId);
    const inventoryWithDetails = inventory.map(inv => {
      const item = this.itemService.getItem(inv.itemId);
      return {
        ...inv,
        item,
      };
    });
    return inventoryWithDetails;
  }

  /**
   * 获取玩家装备
   */
  @Get('equipment/:playerId')
  async getEquipment(@Param('playerId') playerId: string) {
    const equipment = await this.inventoryService.getEquipment(playerId);
    const equipmentWithDetails = {};

    for (const slot in equipment) {
      const itemId = (equipment as any)[slot];
      if (itemId) {
        const item = this.itemService.getItem(itemId);
        (equipmentWithDetails as any)[slot] = {
          itemId,
          item,
        };
      }
    }

    return equipmentWithDetails;
  }

  /**
   * 添加物品到背包
   */
  @Post('inventory/:playerId/add')
  async addItem(
    @Param('playerId') playerId: string,
    @Body() body: { itemId: string; quantity?: number },
  ) {
    return this.inventoryService.addItem(playerId, body.itemId, body.quantity || 1);
  }

  /**
   * 移除背包物品
   */
  @Post('inventory/:playerId/remove')
  async removeItem(
    @Param('playerId') playerId: string,
    @Body() body: { itemId: string; quantity?: number },
  ) {
    return this.inventoryService.removeItem(playerId, body.itemId, body.quantity || 1);
  }

  /**
   * 使用物品
   */
  @Post('inventory/:playerId/use')
  async useItem(
    @Param('playerId') playerId: string,
    @Body() body: { itemId: string },
  ) {
    return this.inventoryService.useItem(playerId, body.itemId);
  }

  /**
   * 装备物品
   */
  @Post('equipment/:playerId/equip')
  async equipItem(
    @Param('playerId') playerId: string,
    @Body() body: { itemId: string; slot: string },
  ) {
    return this.inventoryService.equipItem(playerId, body.itemId, body.slot);
  }

  /**
   * 卸下装备
   */
  @Post('equipment/:playerId/unequip')
  async unequipItem(
    @Param('playerId') playerId: string,
    @Body() body: { slot: string },
  ) {
    return this.inventoryService.unequipItem(playerId, body.slot);
  }
}
