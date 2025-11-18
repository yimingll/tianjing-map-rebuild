export declare enum CombatActionType {
    ATTACK = "attack",
    DEFEND = "defend",
    USE_SKILL = "use_skill",
    USE_ITEM = "use_item",
    FLEE = "flee"
}
export declare enum ParticipantType {
    PLAYER = "player",
    NPC = "npc",
    MONSTER = "monster"
}
export declare enum CombatStatus {
    WAITING = "waiting",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FLED = "fled"
}
export declare enum MonsterType {
    NORMAL = "normal",
    ELITE = "elite",
    BOSS = "boss"
}
export declare enum DamageType {
    PHYSICAL = "physical",
    MAGICAL = "magical",
    TRUE = "true"
}
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
export interface CombatEffect {
    type: string;
    value: number;
    duration: number;
    tickInterval?: number;
}
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
export interface CombatAction {
    actorId: string;
    targetId: string;
    type: CombatActionType;
    skillId?: string;
    itemId?: string;
    timestamp: Date;
}
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
export interface CombatState {
    combatId: string;
    participants: CombatParticipant[];
    currentTurn: number;
    turnOrder: string[];
    startedAt: Date;
    status: CombatStatus;
    rounds: CombatRound[];
}
export interface CombatRound {
    round: number;
    results: CombatResult[];
    timestamp: number;
}
export interface CombatReward {
    experience: number;
    money: number;
    items: Array<{
        itemId: string;
        quantity: number;
    }>;
}
export interface StartCombatRequest {
    playerId: string;
    monsterId: string;
    roomId?: string;
}
export interface StartCombatResponse {
    success: boolean;
    message: string;
    combat?: CombatState;
}
export interface ExecuteCombatActionRequest {
    combatId: string;
    playerId: string;
    action: CombatAction;
}
export interface ExecuteCombatActionResponse {
    success: boolean;
    message: string;
    combat?: CombatState;
    roundResults?: CombatResult[];
    combatEnded?: boolean;
    victory?: boolean;
    reward?: CombatReward;
}
export interface FleeCombatRequest {
    combatId: string;
    playerId: string;
}
export interface FleeCombatResponse {
    success: boolean;
    message: string;
    fleeSuccessful: boolean;
}
//# sourceMappingURL=combat.types.d.ts.map