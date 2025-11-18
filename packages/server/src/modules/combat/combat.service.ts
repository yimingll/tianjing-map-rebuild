import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import {
  CombatState,
  CombatParticipant,
  CombatAction,
  CombatResult,
  CombatActionType,
  CombatStatus,
  ParticipantType,
  MonsterDefinition,
  CombatReward,
  DamageType,
} from '@mud-game/shared';
import { PlayerService } from '../player/player.service';
import { InventoryService } from '../item/inventory.service';
import { EconomyService } from '../economy/economy.service';

@Injectable()
export class CombatService {
  private readonly logger = new Logger(CombatService.name);
  private combats: Map<string, CombatState> = new Map();
  private monsters: Map<string, MonsterDefinition> = new Map();

  constructor(
    private playerService: PlayerService,
    private inventoryService: InventoryService,
    private economyService: EconomyService,
  ) {
    this.loadMonsters();
  }

  /**
   * 加载怪物数据
   */
  private async loadMonsters() {
    try {
      const monstersPath = join(process.cwd(), 'data/monsters.json');
      const data = await fs.readFile(monstersPath, 'utf-8');
      const monstersArray: MonsterDefinition[] = JSON.parse(data);

      monstersArray.forEach((monster) => {
        this.monsters.set(monster.id, monster);
      });

      this.logger.log(`Loaded ${this.monsters.size} monsters`);
    } catch (error) {
      this.logger.error('Failed to load monsters:', error);
    }
  }

  /**
   * 获取所有怪物列表
   */
  getAllMonsters(): MonsterDefinition[] {
    return Array.from(this.monsters.values());
  }

  /**
   * 根据ID获取怪物定义
   */
  getMonsterById(monsterId: string): MonsterDefinition | undefined {
    return this.monsters.get(monsterId);
  }

  /**
   * 开始战斗
   */
  async startCombat(
    playerId: string,
    monsterId: string,
  ): Promise<{ success: boolean; message: string; combat?: CombatState }> {
    try {
      const player = await this.playerService.findById(playerId);
      if (!player) {
        return { success: false, message: '玩家不存在' };
      }

      const monsterDef = this.monsters.get(monsterId);
      if (!monsterDef) {
        return { success: false, message: '怪物不存在' };
      }

      // 创建玩家战斗参与者
      const playerParticipant: CombatParticipant = {
        id: player.id,
        type: ParticipantType.PLAYER,
        name: player.displayName,
        level: player.level,
        health: player.health,
        maxHealth: player.maxHealth,
        mana: player.mana,
        maxMana: player.maxMana,
        stats: {
          attack: 10 + player.attributes.strength * 2,
          defense: 5 + player.attributes.constitution,
          magicAttack: player.attributes.intelligence * 2,
          magicDefense: 5 + player.attributes.wisdom,
          speed: 10 + player.attributes.dexterity,
          critRate: 5 + player.attributes.dexterity * 0.5,
          critDamage: 150 + player.attributes.strength,
          dodgeRate: 5 + player.attributes.dexterity * 0.8,
          hitRate: 85 + player.attributes.dexterity * 0.5,
        },
        effects: [],
        isAlive: true,
        isDefending: false,
      };

      // 创建怪物战斗参与者
      const monsterParticipant: CombatParticipant = {
        id: `monster_${Date.now()}`,
        type: ParticipantType.MONSTER,
        name: monsterDef.name,
        level: monsterDef.level,
        health: monsterDef.stats.maxHp,
        maxHealth: monsterDef.stats.maxHp,
        mana: monsterDef.stats.maxMp,
        maxMana: monsterDef.stats.maxMp,
        stats: {
          attack: monsterDef.stats.attack,
          defense: monsterDef.stats.defense,
          magicAttack: monsterDef.stats.magicAttack,
          magicDefense: monsterDef.stats.magicDefense,
          speed: monsterDef.stats.speed,
          critRate: monsterDef.stats.critRate,
          critDamage: monsterDef.stats.critDamage,
          dodgeRate: monsterDef.stats.dodgeRate,
          hitRate: monsterDef.stats.hitRate,
        },
        effects: [],
        isAlive: true,
        isDefending: false,
      };

      // 创建战斗状态
      const participants = [playerParticipant, monsterParticipant];
      const combatId = `combat_${Date.now()}_${playerId}`;

      // 根据速度决定行动顺序
      const turnOrder = participants
        .sort((a, b) => b.stats.speed - a.stats.speed)
        .map((p) => p.id);

      const combat: CombatState = {
        combatId,
        participants,
        currentTurn: 0,
        turnOrder,
        startedAt: new Date(),
        status: CombatStatus.IN_PROGRESS,
        rounds: [],
      };

      this.combats.set(combatId, combat);

      // 更新玩家状态
      await this.playerService.updateStatus(playerId, 'in_combat' as any);

      this.logger.log(`Combat started: ${combatId}`);

      return {
        success: true,
        message: `遭遇了 ${monsterDef.name}！`,
        combat,
      };
    } catch (error) {
      this.logger.error('Failed to start combat:', error);
      return { success: false, message: '开始战斗失败' };
    }
  }

  /**
   * 执行战斗行动
   */
  async executeCombatAction(
    combatId: string,
    playerId: string,
    action: CombatAction,
  ): Promise<{
    success: boolean;
    message: string;
    combat?: CombatState;
    roundResults?: CombatResult[];
    combatEnded?: boolean;
    victory?: boolean;
    reward?: CombatReward;
  }> {
    try {
      const combat = this.combats.get(combatId);
      if (!combat) {
        return { success: false, message: '战斗不存在' };
      }

      if (combat.status !== CombatStatus.IN_PROGRESS) {
        return { success: false, message: '战斗已结束' };
      }

      const actor = combat.participants.find((p) => p.id === action.actorId);
      if (!actor || actor.id !== playerId) {
        return { success: false, message: '无效的行动者' };
      }

      if (!actor.isAlive) {
        return { success: false, message: '你已经死亡' };
      }

      const roundResults: CombatResult[] = [];

      // 执行玩家行动
      const playerResult = await this.performAction(combat, action);
      roundResults.push(playerResult);

      // 检查战斗是否结束
      if (this.checkCombatEnd(combat)) {
        const result = await this.endCombat(combat, playerId);
        return {
          success: true,
          message: result.message,
          combat,
          roundResults,
          combatEnded: true,
          victory: result.victory,
          reward: result.reward,
        };
      }

      // 怪物AI行动
      const monsters = combat.participants.filter(
        (p) => p.type === ParticipantType.MONSTER && p.isAlive,
      );

      for (const monster of monsters) {
        const monsterAction = this.getMonsterAction(combat, monster);
        const monsterResult = await this.performAction(combat, monsterAction);
        roundResults.push(monsterResult);

        // 每次怪物行动后检查战斗是否结束
        if (this.checkCombatEnd(combat)) {
          const result = await this.endCombat(combat, playerId);
          return {
            success: true,
            message: result.message,
            combat,
            roundResults,
            combatEnded: true,
            victory: result.victory,
            reward: result.reward,
          };
        }
      }

      // 保存回合结果
      combat.rounds.push({
        round: combat.currentTurn + 1,
        results: roundResults,
        timestamp: Date.now(),
      });

      combat.currentTurn++;

      return {
        success: true,
        message: '行动执行成功',
        combat,
        roundResults,
        combatEnded: false,
      };
    } catch (error) {
      this.logger.error('Failed to execute combat action:', error);
      return { success: false, message: '执行行动失败' };
    }
  }

  /**
   * 执行单个行动
   */
  private async performAction(
    combat: CombatState,
    action: CombatAction,
  ): Promise<CombatResult> {
    const actor = combat.participants.find((p) => p.id === action.actorId);
    const target = combat.participants.find((p) => p.id === action.targetId);

    if (!actor || !target) {
      return {
        success: false,
        message: '无效的行动目标',
        actorId: action.actorId,
        targetId: action.targetId,
      };
    }

    switch (action.type) {
      case CombatActionType.ATTACK:
        return this.performAttack(actor, target, DamageType.PHYSICAL);

      case CombatActionType.DEFEND:
        return this.performDefend(actor);

      case CombatActionType.FLEE:
        return this.performFlee(combat, actor);

      default:
        return {
          success: false,
          message: '未知的行动类型',
          actorId: action.actorId,
          targetId: action.targetId,
        };
    }
  }

  /**
   * 执行攻击
   */
  private performAttack(
    actor: CombatParticipant,
    target: CombatParticipant,
    damageType: DamageType = DamageType.PHYSICAL,
  ): CombatResult {
    // 命中判定
    const hitChance = actor.stats.hitRate - target.stats.dodgeRate;
    const hitRoll = Math.random() * 100;
    const isHit = hitRoll < hitChance;

    if (!isHit) {
      return {
        success: true,
        isDodged: true,
        damage: 0,
        message: `${actor.name} 的攻击被 ${target.name} 闪避了！`,
        actorId: actor.id,
        targetId: target.id,
        targetRemainingHp: target.health,
      };
    }

    // 计算基础伤害
    let baseDamage = 0;
    let defense = 0;

    if (damageType === DamageType.PHYSICAL) {
      baseDamage = actor.stats.attack;
      defense = target.stats.defense;
    } else if (damageType === DamageType.MAGICAL) {
      baseDamage = actor.stats.magicAttack;
      defense = target.stats.magicDefense;
    }

    // 防御减伤
    if (target.isDefending) {
      defense *= 2;
    }

    // 伤害计算
    const damageReduction = defense / (defense + 100);
    let damage = baseDamage * (1 - damageReduction);

    // 随机波动 (90% - 110%)
    damage *= 0.9 + Math.random() * 0.2;

    // 暴击判定
    const critRoll = Math.random() * 100;
    const isCritical = critRoll < actor.stats.critRate;

    if (isCritical) {
      damage *= actor.stats.critDamage / 100;
    }

    // 最终伤害
    const finalDamage = Math.max(1, Math.floor(damage));

    // 应用伤害
    target.health = Math.max(0, target.health - finalDamage);

    if (target.health <= 0) {
      target.isAlive = false;
    }

    // 重置防御状态
    if (target.isDefending) {
      target.isDefending = false;
    }

    let message = '';
    if (isCritical) {
      message = `${actor.name} 对 ${target.name} 发动暴击！造成 ${finalDamage} 点伤害！`;
    } else {
      message = `${actor.name} 攻击 ${target.name}，造成 ${finalDamage} 点伤害`;
    }

    if (!target.isAlive) {
      message += ` ${target.name} 被击败了！`;
    }

    return {
      success: true,
      damage: finalDamage,
      isCritical,
      isDodged: false,
      message,
      actorId: actor.id,
      targetId: target.id,
      targetRemainingHp: target.health,
    };
  }

  /**
   * 执行防御
   */
  private performDefend(actor: CombatParticipant): CombatResult {
    actor.isDefending = true;

    return {
      success: true,
      message: `${actor.name} 采取了防御姿态！`,
      actorId: actor.id,
      targetId: actor.id,
    };
  }

  /**
   * 执行逃跑
   */
  private performFlee(
    combat: CombatState,
    actor: CombatParticipant,
  ): CombatResult {
    // 计算逃跑成功率 (基础50% + 速度差影响)
    const monsters = combat.participants.filter(
      (p) => p.type === ParticipantType.MONSTER && p.isAlive,
    );

    const avgMonsterSpeed =
      monsters.reduce((sum, m) => sum + m.stats.speed, 0) / monsters.length;

    const speedDiff = actor.stats.speed - avgMonsterSpeed;
    const baseFleeChance = 50;
    const fleeChance = Math.max(
      20,
      Math.min(80, baseFleeChance + speedDiff * 2),
    );

    const success = Math.random() * 100 < fleeChance;

    if (success) {
      combat.status = CombatStatus.FLED;
    }

    return {
      success,
      message: success
        ? `${actor.name} 成功逃离了战斗！`
        : `${actor.name} 逃跑失败！`,
      actorId: actor.id,
      targetId: actor.id,
    };
  }

  /**
   * 怪物AI - 决定怪物的行动
   */
  private getMonsterAction(
    combat: CombatState,
    monster: CombatParticipant,
  ): CombatAction {
    // 获取怪物定义
    const monsterDef = Array.from(this.monsters.values()).find(
      (m) => m.name === monster.name,
    );

    // 查找目标 (优先攻击血量最低的玩家)
    const players = combat.participants.filter(
      (p) => p.type === ParticipantType.PLAYER && p.isAlive,
    );

    const target = players.reduce((prev, current) =>
      prev.health < current.health ? prev : current,
    );

    // 判断是否逃跑
    if (monsterDef?.ai) {
      const hpPercent = (monster.health / monster.maxHealth) * 100;
      if (hpPercent < monsterDef.ai.fleeThreshold) {
        const fleeRoll = Math.random() * 100;
        if (fleeRoll < 30) {
          return {
            actorId: monster.id,
            targetId: monster.id,
            type: CombatActionType.FLEE,
            timestamp: new Date(),
          };
        }
      }
    }

    // 简单AI：大部分时间攻击，偶尔防御
    const actionRoll = Math.random() * 100;

    if (actionRoll < 80) {
      // 80% 攻击
      return {
        actorId: monster.id,
        targetId: target.id,
        type: CombatActionType.ATTACK,
        timestamp: new Date(),
      };
    } else {
      // 20% 防御
      return {
        actorId: monster.id,
        targetId: monster.id,
        type: CombatActionType.DEFEND,
        timestamp: new Date(),
      };
    }
  }

  /**
   * 检查战斗是否结束
   */
  private checkCombatEnd(combat: CombatState): boolean {
    const alivePlayers = combat.participants.filter(
      (p) => p.type === ParticipantType.PLAYER && p.isAlive,
    );
    const aliveMonsters = combat.participants.filter(
      (p) => p.type === ParticipantType.MONSTER && p.isAlive,
    );

    if (alivePlayers.length === 0 || aliveMonsters.length === 0) {
      combat.status = CombatStatus.COMPLETED;
      return true;
    }

    return false;
  }

  /**
   * 结束战斗并计算奖励
   */
  private async endCombat(
    combat: CombatState,
    playerId: string,
  ): Promise<{
    message: string;
    victory: boolean;
    reward?: CombatReward;
  }> {
    const player = combat.participants.find((p) => p.id === playerId);
    const victory = player?.isAlive || false;

    let reward: CombatReward | undefined;

    if (victory) {
      // 计算奖励
      const monsters = combat.participants.filter(
        (p) => p.type === ParticipantType.MONSTER,
      );

      let totalExp = 0;
      let totalMoney = 0;
      const items: Array<{ itemId: string; quantity: number }> = [];

      for (const monster of monsters) {
        const monsterDef = Array.from(this.monsters.values()).find(
          (m) => m.name === monster.name,
        );

        if (monsterDef) {
          totalExp += monsterDef.drops.experience;
          totalMoney += monsterDef.drops.money;

          // 计算掉落物品
          const droppedItems = this.calculateDrops(monsterDef);
          items.push(...droppedItems);
        }
      }

      reward = {
        experience: totalExp,
        money: totalMoney,
        items,
      };

      // 更新玩家数据
      const playerEntity = await this.playerService.findById(playerId);
      if (playerEntity) {
        // 更新生命值
        await this.playerService.updateHealth(playerId, player?.health || 0);

        // 添加经验
        await this.playerService.addExperience(playerId, totalExp);

        // 添加掉落物品到玩家背包
        for (const item of items) {
          await this.inventoryService.addItem(
            playerId,
            item.itemId,
            item.quantity,
          );
        }

        // 添加金币
        if (totalMoney > 0) {
          await this.economyService.addPlayerGold(playerId, totalMoney);
          this.logger.log(`玩家 ${playerId} 从战斗中获得 ${totalMoney} 金币`);
        }
      }
    } else {
      // 失败：更新玩家生命值为1
      await this.playerService.updateHealth(playerId, 1);
    }

    // 更新玩家状态
    await this.playerService.updateStatus(playerId, 'online' as any);

    // 删除战斗记录
    this.combats.delete(combat.combatId);

    const message = victory
      ? `战斗胜利！获得 ${reward?.experience} 经验和 ${reward?.money} 金币`
      : '战斗失败...';

    return { message, victory, reward };
  }

  /**
   * 计算怪物掉落物品
   */
  private calculateDrops(
    monster: MonsterDefinition,
  ): Array<{ itemId: string; quantity: number }> {
    const drops: Array<{ itemId: string; quantity: number }> = [];

    if (monster.drops.items) {
      for (const item of monster.drops.items) {
        // 判断是否掉落
        if (Math.random() * 100 < item.chance) {
          // 计算掉落数量
          const quantity =
            Math.floor(
              Math.random() * (item.maxQuantity - item.minQuantity + 1),
            ) + item.minQuantity;

          drops.push({
            itemId: item.itemId,
            quantity,
          });
        }
      }
    }

    return drops;
  }

  /**
   * 逃跑
   */
  async fleeCombat(
    combatId: string,
    playerId: string,
  ): Promise<{ success: boolean; message: string; fleeSuccessful: boolean }> {
    try {
      const combat = this.combats.get(combatId);
      if (!combat) {
        return { success: false, message: '战斗不存在', fleeSuccessful: false };
      }

      const player = combat.participants.find((p) => p.id === playerId);
      if (!player) {
        return {
          success: false,
          message: '玩家不在战斗中',
          fleeSuccessful: false,
        };
      }

      const result = this.performFlee(combat, player);

      if (result.success) {
        // 逃跑成功，结束战斗
        await this.playerService.updateStatus(playerId, 'online' as any);
        this.combats.delete(combatId);

        return {
          success: true,
          message: '成功逃离战斗！',
          fleeSuccessful: true,
        };
      } else {
        // 逃跑失败，怪物会攻击
        const monsters = combat.participants.filter(
          (p) => p.type === ParticipantType.MONSTER && p.isAlive,
        );

        for (const monster of monsters) {
          const attackAction: CombatAction = {
            actorId: monster.id,
            targetId: playerId,
            type: CombatActionType.ATTACK,
            timestamp: new Date(),
          };

          this.performAction(combat, attackAction);
        }

        // 检查玩家是否死亡
        if (!player.isAlive) {
          await this.endCombat(combat, playerId);
        }

        return {
          success: true,
          message: '逃跑失败！受到了怪物的攻击',
          fleeSuccessful: false,
        };
      }
    } catch (error) {
      this.logger.error('Failed to flee combat:', error);
      return { success: false, message: '逃跑失败', fleeSuccessful: false };
    }
  }

  /**
   * 获取战斗状态
   */
  getCombat(combatId: string): CombatState | undefined {
    return this.combats.get(combatId);
  }

  /**
   * 清理战斗
   */
  removeCombat(combatId: string) {
    this.combats.delete(combatId);
  }
}
