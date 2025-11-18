/**
 * 任务系统类型定义
 */

/**
 * 任务类型
 */
export enum QuestType {
  MAIN = 'main',           // 主线任务
  SIDE = 'side',           // 支线任务
  DAILY = 'daily',         // 日常任务
  REPEATABLE = 'repeatable' // 可重复任务
}

/**
 * 任务状态
 */
export enum QuestStatus {
  NOT_STARTED = 'not_started',  // 未开始
  IN_PROGRESS = 'in_progress',  // 进行中
  COMPLETED = 'completed',      // 已完成
  TURNED_IN = 'turned_in',      // 已交付（领取奖励）
  FAILED = 'failed'             // 失败
}

/**
 * 任务目标类型
 */
export enum QuestObjectiveType {
  KILL = 'kill',           // 击杀怪物
  COLLECT = 'collect',     // 收集物品
  TALK = 'talk',          // 对话
  EXPLORE = 'explore',     // 探索地点
  DELIVER = 'deliver',     // 运送物品
  CULTIVATE = 'cultivate', // 修炼到指定境界
  CUSTOM = 'custom'        // 自定义
}

/**
 * 任务目标
 */
export interface QuestObjective {
  id: string;
  type: QuestObjectiveType;
  description: string;
  targetId?: string;       // 目标ID（怪物ID、物品ID、NPC ID等）
  targetName?: string;     // 目标名称
  required: number;        // 需要数量
  current: number;         // 当前数量
  completed: boolean;      // 是否完成
}

/**
 * 任务奖励
 */
export interface QuestReward {
  experience?: number;     // 经验奖励
  money?: number;         // 金钱奖励（灵石）
  items?: Array<{         // 物品奖励
    itemId: string;
    quantity: number;
  }>;
  reputation?: {          // 声望奖励
    faction: string;
    amount: number;
  };
  cultivation?: number;   // 修炼点数
}

/**
 * 任务定义（来自quest.json）
 */
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  level: number;           // 建议等级

  // 前置条件
  prerequisites?: {
    level?: number;        // 最低等级要求
    quests?: string[];     // 前置任务
    items?: string[];      // 需要的物品
    realm?: string;        // 修炼境界要求
  };

  // 任务给予者
  questGiver: {
    npcId: string;
    npcName: string;
    dialogueId?: string;   // 对话ID
  };

  // 任务目标
  objectives: Omit<QuestObjective, 'current' | 'completed'>[];

  // 奖励
  rewards: QuestReward;

  // 任务流程
  acceptDialogue: string;  // 接受时的对话
  progressDialogue: string; // 进行中的对话
  completeDialogue: string; // 完成时的对话

  // 其他
  isRepeatable: boolean;   // 是否可重复
  timeLimit?: number;      // 时间限制（秒）
  chainQuestId?: string;   // 后续任务ID
}

/**
 * 玩家任务进度
 */
export interface PlayerQuest {
  questId: string;
  playerId: string;
  status: QuestStatus;
  objectives: QuestObjective[];
  startTime: Date;
  completeTime?: Date;
  turnInTime?: Date;
  timesCompleted?: number; // 完成次数（可重复任务）
}

/**
 * 任务列表响应
 */
export interface QuestListResponse {
  success: boolean;
  message?: string;
  quests: QuestDefinition[];
}

/**
 * 玩家任务列表响应
 */
export interface PlayerQuestListResponse {
  success: boolean;
  message?: string;
  quests: PlayerQuest[];
}

/**
 * 接受任务请求
 */
export interface AcceptQuestRequest {
  playerId: string;
  questId: string;
  npcId: string;
}

/**
 * 接受任务响应
 */
export interface AcceptQuestResponse {
  success: boolean;
  message: string;
  quest?: PlayerQuest;
}

/**
 * 更新任务进度请求
 */
export interface UpdateQuestProgressRequest {
  playerId: string;
  questId: string;
  objectiveId: string;
  progress: number;
}

/**
 * 完成任务请求
 */
export interface CompleteQuestRequest {
  playerId: string;
  questId: string;
  npcId: string;
}

/**
 * 完成任务响应
 */
export interface CompleteQuestResponse {
  success: boolean;
  message: string;
  rewards?: QuestReward;
  quest?: PlayerQuest;
}

/**
 * 放弃任务请求
 */
export interface AbandonQuestRequest {
  playerId: string;
  questId: string;
}

/**
 * 放弃任务响应
 */
export interface AbandonQuestResponse {
  success: boolean;
  message: string;
}
