export declare enum QuestType {
    MAIN = "main",
    SIDE = "side",
    DAILY = "daily",
    REPEATABLE = "repeatable"
}
export declare enum QuestStatus {
    NOT_STARTED = "not_started",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    TURNED_IN = "turned_in",
    FAILED = "failed"
}
export declare enum QuestObjectiveType {
    KILL = "kill",
    COLLECT = "collect",
    TALK = "talk",
    EXPLORE = "explore",
    DELIVER = "deliver",
    CULTIVATE = "cultivate",
    CUSTOM = "custom"
}
export interface QuestObjective {
    id: string;
    type: QuestObjectiveType;
    description: string;
    targetId?: string;
    targetName?: string;
    required: number;
    current: number;
    completed: boolean;
}
export interface QuestReward {
    experience?: number;
    money?: number;
    items?: Array<{
        itemId: string;
        quantity: number;
    }>;
    reputation?: {
        faction: string;
        amount: number;
    };
    cultivation?: number;
}
export interface QuestDefinition {
    id: string;
    name: string;
    description: string;
    type: QuestType;
    level: number;
    prerequisites?: {
        level?: number;
        quests?: string[];
        items?: string[];
        realm?: string;
    };
    questGiver: {
        npcId: string;
        npcName: string;
        dialogueId?: string;
    };
    objectives: Omit<QuestObjective, 'current' | 'completed'>[];
    rewards: QuestReward;
    acceptDialogue: string;
    progressDialogue: string;
    completeDialogue: string;
    isRepeatable: boolean;
    timeLimit?: number;
    chainQuestId?: string;
}
export interface PlayerQuest {
    questId: string;
    playerId: string;
    status: QuestStatus;
    objectives: QuestObjective[];
    startTime: Date;
    completeTime?: Date;
    turnInTime?: Date;
    timesCompleted?: number;
}
export interface QuestListResponse {
    success: boolean;
    message?: string;
    quests: QuestDefinition[];
}
export interface PlayerQuestListResponse {
    success: boolean;
    message?: string;
    quests: PlayerQuest[];
}
export interface AcceptQuestRequest {
    playerId: string;
    questId: string;
    npcId: string;
}
export interface AcceptQuestResponse {
    success: boolean;
    message: string;
    quest?: PlayerQuest;
}
export interface UpdateQuestProgressRequest {
    playerId: string;
    questId: string;
    objectiveId: string;
    progress: number;
}
export interface CompleteQuestRequest {
    playerId: string;
    questId: string;
    npcId: string;
}
export interface CompleteQuestResponse {
    success: boolean;
    message: string;
    rewards?: QuestReward;
    quest?: PlayerQuest;
}
export interface AbandonQuestRequest {
    playerId: string;
    questId: string;
}
export interface AbandonQuestResponse {
    success: boolean;
    message: string;
}
//# sourceMappingURL=quest.types.d.ts.map