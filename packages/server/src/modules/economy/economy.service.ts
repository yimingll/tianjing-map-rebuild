import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from '@mud-game/shared';
import { PlayerEntity } from '../player/player.entity';

@Injectable()
export class EconomyService {
  private readonly logger = new Logger(EconomyService.name);
  private transactions: Map<string, Transaction> = new Map();

  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>,
  ) {}

  /**
   * 给玩家添加金币
   */
  async addPlayerGold(playerId: string, amount: number): Promise<boolean> {
    if (amount <= 0) {
      this.logger.warn(`尝试添加无效金币数量: ${amount}`);
      return false;
    }

    try {
      const player = await this.playerRepository.findOne({ where: { id: playerId } });
      if (!player) {
        this.logger.warn(`玩家不存在: ${playerId}`);
        return false;
      }

      player.gold = (player.gold || 0) + amount;
      await this.playerRepository.save(player);

      this.logger.log(`玩家 ${player.displayName} 获得 ${amount} 金币，当前: ${player.gold}`);
      return true;
    } catch (error) {
      this.logger.error(`添加金币失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 扣除玩家金币
   */
  async removePlayerGold(playerId: string, amount: number): Promise<boolean> {
    if (amount <= 0) {
      this.logger.warn(`尝试扣除无效金币数量: ${amount}`);
      return false;
    }

    try {
      const player = await this.playerRepository.findOne({ where: { id: playerId } });
      if (!player) {
        this.logger.warn(`玩家不存在: ${playerId}`);
        return false;
      }

      if (player.gold < amount) {
        this.logger.warn(`玩家 ${player.displayName} 金币不足: 需要 ${amount}，拥有 ${player.gold}`);
        return false;
      }

      player.gold -= amount;
      await this.playerRepository.save(player);

      this.logger.log(`玩家 ${player.displayName} 花费 ${amount} 金币，剩余: ${player.gold}`);
      return true;
    } catch (error) {
      this.logger.error(`扣除金币失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 转移金币（从一个玩家到另一个玩家）
   */
  async transferGold(fromPlayerId: string, toPlayerId: string, amount: number): Promise<boolean> {
    if (amount <= 0) {
      this.logger.warn(`尝试转移无效金币数量: ${amount}`);
      return false;
    }

    if (fromPlayerId === toPlayerId) {
      this.logger.warn('不能给自己转金币');
      return false;
    }

    try {
      // 使用事务确保原子性
      return await this.playerRepository.manager.transaction(async (transactionManager) => {
        const fromPlayer = await transactionManager.findOne(PlayerEntity, { where: { id: fromPlayerId } });
        const toPlayer = await transactionManager.findOne(PlayerEntity, { where: { id: toPlayerId } });

        if (!fromPlayer || !toPlayer) {
          this.logger.warn('玩家不存在');
          return false;
        }

        if (fromPlayer.gold < amount) {
          this.logger.warn(`玩家 ${fromPlayer.displayName} 金币不足`);
          return false;
        }

        fromPlayer.gold -= amount;
        toPlayer.gold = (toPlayer.gold || 0) + amount;

        await transactionManager.save(fromPlayer);
        await transactionManager.save(toPlayer);

        this.logger.log(`${fromPlayer.displayName} 转账 ${amount} 金币给 ${toPlayer.displayName}`);

        // 记录交易
        // 记录转账交易
        this.createTransaction('transfer' as TransactionType, amount, fromPlayerId, toPlayerId);

        return true;
      });
    } catch (error) {
      this.logger.error(`转账失败: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /**
   * 获取玩家金币数量
   */
  async getPlayerGold(playerId: string): Promise<number> {
    try {
      const player = await this.playerRepository.findOne({ where: { id: playerId } });
      return player?.gold || 0;
    } catch (error) {
      this.logger.error(`获取金币失败: ${error instanceof Error ? error.message : String(error)}`);
      return 0;
    }
  }

  /**
   * 检查玩家是否有足够金币
   */
  async hasEnoughGold(playerId: string, amount: number): Promise<boolean> {
    const gold = await this.getPlayerGold(playerId);
    return gold >= amount;
  }

  createTransaction(
    type: TransactionType,
    amount: number,
    fromPlayerId?: string,
    toPlayerId?: string,
  ): Transaction {
    const transaction: Transaction = {
      id: `tx_${Date.now()}`,
      type,
      fromPlayerId,
      toPlayerId,
      amount: { gold: amount, silver: 0, copper: 0 },
      timestamp: new Date(),
      status: TransactionStatus.PENDING,
    };

    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  completeTransaction(transactionId: string): boolean {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    transaction.status = TransactionStatus.COMPLETED;
    return true;
  }

  cancelTransaction(transactionId: string): boolean {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    transaction.status = TransactionStatus.CANCELLED;
    return true;
  }

  getTransaction(transactionId: string): Transaction | undefined {
    return this.transactions.get(transactionId);
  }

  getPlayerTransactions(playerId: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.fromPlayerId === playerId || tx.toPlayerId === playerId,
    );
  }
}
