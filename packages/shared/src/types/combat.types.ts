/**
 * 战斗系统类型定义
 */

// 战斗行动类型
export enum CombatActionType {
  ATTACK = 'attack',
  DEFEND = 'defend',
  USE_SKILL = 'use_skill',
  USE_ITEM = 'use_item',
  FLEE = 'flee',
}

// 参与者类型
export enum ParticipantType {
  PLAYER = 'player',
  NPC = 'npc',
  MONSTER = 'monster',
}

// 战斗状态
export enum CombatStatus {
  WAITING = 'waiting',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FLED = 'fled',
}

// 怪物类型
export enum MonsterType {
  NORMAL = 'normal',
  ELITE = 'elite',
  BOSS = 'boss',
}

// 伤害类型
export enum DamageType {
  PHYSICAL = 'physical',
  MAGICAL = 'magical',
  TRUE = 'true',
}

// 怪物定义
export interface MonsterDefinition {
  id: string;
  name: string;
  description: string;
  level: number;
  type: MonsterType;

  stats: {
    maxHp: number;
    maxMp: number;
    attack: number;
    defense: number;
    magicAttack: number;
    magicDefense: number;
    speed: number;
    critRate: number;
    critDamage: number;
    dodgeRate: number;
    hitRate: number;
  };

  drops: {
    experience: number;
    money: number;
    items?: Array<{
      itemId: string;
      chance: number;
      minQuantity: number;
      maxQuantity: number;
    }>;
  };

  ai?: {
    aggressiveness: number;
    fleeThreshold: number;
    skillUsageRate: number;
  };
}

// 战斗效果
export interface CombatEffect {
  type: string;
  value: number;
  duration: number;
  tickInterval?: number;
}

// 战斗参与者
export interface CombatParticipant {
  id: string;
  type: ParticipantType;
  name: string;
  level: number;

  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;

  stats: {
    attack: number;
    defense: number;
    magicAttack: number;
    magicDefense: number;
    speed: number;
    critRate: number;
    critDamage: number;
    dodgeRate: number;
    hitRate: number;
  };

  effects: CombatEffect[];
  isAlive: boolean;
  isDefending?: boolean;
}

// 战斗行动
export interface CombatAction {
  actorId: string;
  targetId: string;
  type: CombatActionType;
  skillId?: string;
  itemId?: string;
  timestamp: Date;
}

// 战斗结果
export interface CombatResult {
  success: boolean;
  damage?: number;
  healing?: number;
  effects?: CombatEffect[];
  message: string;
  isCritical?: boolean;
  isDodged?: boolean;
  isBlocked?: boolean;
  actorId: string;
  targetId: string;
  targetRemainingHp?: number;
}

// 战斗状态
export interface CombatState {
  combatId: string;
  participants: CombatParticipant[];
  currentTurn: number;
  turnOrder: string[];
  startedAt: Date;
  status: CombatStatus;
  rounds: CombatRound[];
}

// 战斗回合
export interface CombatRound {
  round: number;
  results: CombatResult[];
  timestamp: number;
}

// 战斗奖励
export interface CombatReward {
  experience: number;
  money: number;
  items: Array<{
    itemId: string;
    quantity: number;
  }>;
}

// 开始战斗请求
export interface StartCombatRequest {
  playerId: string;
  monsterId: string;
  roomId?: string;
}

// 开始战斗响应
export interface StartCombatResponse {
  success: boolean;
  message: string;
  combat?: CombatState;
}

// 执行战斗行动请求
export interface ExecuteCombatActionRequest {
  combatId: string;
  playerId: string;
  action: CombatAction;
}

// 执行战斗行动响应
export interface ExecuteCombatActionResponse {
  success: boolean;
  message: string;
  combat?: CombatState;
  roundResults?: CombatResult[];
  combatEnded?: boolean;
  victory?: boolean;
  reward?: CombatReward;
}

// 逃跑请求
export interface FleeCombatRequest {
  combatId: string;
  playerId: string;
}

// 逃跑响应
export interface FleeCombatResponse {
  success: boolean;
  message: string;
  fleeSuccessful: boolean;
}
