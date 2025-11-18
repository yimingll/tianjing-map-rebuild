import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DataLoaderService } from '../data-loader/data-loader.service';
import { EconomyService } from '../economy/economy.service';
import { InventoryService } from '../item/inventory.service';
import {
  DialogueInteractionRequest,
  DialogueInteractionResponse,
  TradeRequest,
  TradeResponse,
  DialogueNode,
  InteractionType,
} from './npc-interaction.interfaces';

@Injectable()
export class NpcService {
  private readonly logger = new Logger(NpcService.name);

  constructor(
    private readonly dataLoader: DataLoaderService,
    private readonly economyService: EconomyService,
    private readonly inventoryService: InventoryService,
  ) {}

  /**
   * 处理对话交互
   */
  async handleDialogue(request: DialogueInteractionRequest): Promise<DialogueInteractionResponse> {
    const npc = this.dataLoader.getNpc(request.npcId);

    if (!npc) {
      throw new NotFoundException(`NPC with ID ${request.npcId} not found`);
    }

    // 构建对话节点
    const dialogue = this.buildDialogueNode(npc, request.dialogueId, request.optionId);

    return {
      success: true,
      dialogue,
      npcName: npc.name,
    };
  }

  /**
   * 构建对话节点
   */
  private buildDialogueNode(npc: any, dialogueId?: string, optionId?: string): DialogueNode {
    // 如果没有指定对话ID,使用默认问候语
    if (!dialogueId) {
      return {
        id: 'greeting',
        npcText: npc.dialogue?.greeting || `你好,我是${npc.name}`,
        options: this.buildDialogueOptions(npc),
      };
    }

    // 根据对话ID返回相应的对话内容
    switch (dialogueId) {
      case 'trade':
        return {
          id: 'trade',
          npcText: npc.dialogue?.trade || '看看我有什么商品吧',
          options: [
            { id: 'open_trade', text: '查看商品', action: 'open_trade' },
            { id: 'goodbye', text: '告辞', nextDialogueId: 'greeting' },
          ],
        };

      case 'quest':
        return {
          id: 'quest',
          npcText: npc.dialogue?.quest || '我这里有些任务需要帮忙',
          options: [
            { id: 'accept_quest', text: '接受任务', action: 'accept_quest' },
            { id: 'goodbye', text: '稍后再说', nextDialogueId: 'greeting' },
          ],
        };

      case 'info':
        return {
          id: 'info',
          npcText: npc.dialogue?.info || '你想了解什么?',
          options: [
            { id: 'back', text: '返回', nextDialogueId: 'greeting' },
          ],
        };

      default:
        return {
          id: 'greeting',
          npcText: npc.dialogue?.greeting || `你好,我是${npc.name}`,
          options: this.buildDialogueOptions(npc),
        };
    }
  }

  /**
   * 构建对话选项
   */
  private buildDialogueOptions(npc: any) {
    const options = [];

    // 根据NPC类型添加不同的对话选项
    if (npc.type === 'merchant') {
      options.push({ id: 'trade', text: '我想交易', nextDialogueId: 'trade' });
    }

    if (npc.type === 'quest_giver') {
      options.push({ id: 'quest', text: '有什么任务吗?', nextDialogueId: 'quest' });
    }

    if (npc.dialogue?.info) {
      options.push({ id: 'info', text: '打听消息', nextDialogueId: 'info' });
    }

    options.push({ id: 'goodbye', text: '告辞' });

    return options;
  }

  /**
   * 处理交易
   */
  async handleTrade(request: TradeRequest): Promise<TradeResponse> {
    const npc = this.dataLoader.getNpc(request.npcId);

    if (!npc) {
      throw new NotFoundException(`NPC with ID ${request.npcId} not found`);
    }

    if (npc.type !== 'merchant') {
      return {
        success: false,
        message: `${npc.name}不是商人,无法交易`,
      };
    }

    switch (request.action) {
      case 'view':
        return this.viewMerchantItems(npc);

      case 'buy':
        return this.buyItem(npc, request);

      case 'sell':
        return this.sellItem(npc, request);

      default:
        return {
          success: false,
          message: '无效的交易操作',
        };
    }
  }

  /**
   * 查看商人商品
   */
  private viewMerchantItems(npc: any): TradeResponse {
    const items = (npc.inventory || []).map((invItem: any) => {
      const itemData = this.dataLoader.getItem(invItem.itemId);
      return {
        itemId: invItem.itemId,
        quantity: invItem.quantity,
        price: itemData?.price || 0,
      };
    });

    return {
      success: true,
      message: `${npc.name}的商品列表`,
      items,
    };
  }

  /**
   * 购买物品
   */
  private async buyItem(npc: any, request: TradeRequest): Promise<TradeResponse> {
    if (!request.itemId || !request.quantity) {
      return {
        success: false,
        message: '请指定要购买的物品和数量',
      };
    }

    // 检查商人是否有该物品
    const invItem = npc.inventory?.find((item: any) => item.itemId === request.itemId);
    if (!invItem) {
      return {
        success: false,
        message: '商人没有这件物品',
      };
    }

    // 检查库存
    if (invItem.quantity < request.quantity) {
      return {
        success: false,
        message: `库存不足,只剩 ${invItem.quantity} 个`,
      };
    }

    // 获取物品数据计算价格
    const itemData = this.dataLoader.getItem(request.itemId);
    if (!itemData) {
      return {
        success: false,
        message: '物品数据错误',
      };
    }

    const totalPrice = itemData.price * request.quantity;

    // 检查玩家金币
    const hasEnough = await this.economyService.hasEnoughGold(request.playerId, totalPrice);
    if (!hasEnough) {
      const currentGold = await this.economyService.getPlayerGold(request.playerId);
      return {
        success: false,
        message: `金币不足！需要 ${totalPrice} 灵石，你只有 ${currentGold} 灵石`,
      };
    }

    // 扣除金币
    const goldRemoved = await this.economyService.removePlayerGold(request.playerId, totalPrice);
    if (!goldRemoved) {
      return {
        success: false,
        message: '扣除金币失败',
      };
    }

    // 添加物品到背包
    const itemAdded = await this.inventoryService.addItem(request.playerId, request.itemId, request.quantity);
    if (!itemAdded) {
      // 如果添加物品失败，退还金币
      await this.economyService.addPlayerGold(request.playerId, totalPrice);
      return {
        success: false,
        message: '背包已满或添加物品失败',
      };
    }

    this.logger.log(`玩家 ${request.playerId} 购买了 ${itemData.name} x${request.quantity}`);

    return {
      success: true,
      message: `成功购买 ${itemData.name} x${request.quantity}，花费 ${totalPrice} 灵石`,
      itemReceived: {
        itemId: request.itemId,
        quantity: request.quantity,
      },
    };
  }

  /**
   * 出售物品
   */
  private async sellItem(npc: any, request: TradeRequest): Promise<TradeResponse> {
    if (!request.itemId || !request.quantity) {
      return {
        success: false,
        message: '请指定要出售的物品和数量',
      };
    }

    const itemData = this.dataLoader.getItem(request.itemId);
    if (!itemData) {
      return {
        success: false,
        message: '无效的物品',
      };
    }

    // 检查玩家是否有该物品
    const inventory = await this.inventoryService.getInventory(request.playerId);
    const playerItem = inventory.find(inv => inv.itemId === request.itemId);
    if (!playerItem || playerItem.quantity < request.quantity) {
      return {
        success: false,
        message: `你没有足够的 ${itemData.name}`,
      };
    }

    // 卖给商人的价格通常是购买价格的一半
    const sellPrice = Math.floor(itemData.price * 0.5);
    const totalPrice = sellPrice * request.quantity;

    // 从背包移除物品
    const itemRemoved = await this.inventoryService.removeItem(request.playerId, request.itemId, request.quantity);
    if (!itemRemoved) {
      return {
        success: false,
        message: '移除物品失败',
      };
    }

    // 添加金币
    const goldAdded = await this.economyService.addPlayerGold(request.playerId, totalPrice);
    if (!goldAdded) {
      // 如果添加金币失败，退还物品
      await this.inventoryService.addItem(request.playerId, request.itemId, request.quantity);
      return {
        success: false,
        message: '添加金币失败',
      };
    }

    this.logger.log(`玩家 ${request.playerId} 出售了 ${itemData.name} x${request.quantity}`);

    const playerGold = await this.economyService.getPlayerGold(request.playerId);

    return {
      success: true,
      message: `成功出售 ${itemData.name} x${request.quantity}，获得 ${totalPrice} 灵石`,
      playerGold,
    };
  }

  /**
   * 获取NPC信息
   */
  getNpcInfo(npcId: string) {
    const npc = this.dataLoader.getNpc(npcId);

    if (!npc) {
      throw new NotFoundException(`NPC with ID ${npcId} not found`);
    }

    return {
      id: npc.id,
      name: npc.name,
      description: npc.description,
      type: npc.type,
      level: npc.level,
      faction: npc.faction,
      canTrade: npc.type === 'merchant',
      canGiveQuest: npc.type === 'quest_giver',
      isAggressive: npc.isAggressive,
    };
  }

  /**
   * 获取房间内的所有NPC
   */
  getNpcsInRoom(roomId: string) {
    const npcs = this.dataLoader.getNpcsInRoom(roomId);

    return {
      roomId,
      npcs: npcs.map(npc => ({
        id: npc.id,
        name: npc.name,
        description: npc.description,
        type: npc.type,
        level: npc.level,
      })),
    };
  }
}
