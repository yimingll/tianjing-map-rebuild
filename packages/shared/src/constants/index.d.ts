export declare const GAME_CONFIG: {
    readonly MAX_PLAYERS: 10000;
    readonly MAX_LEVEL: 100;
    readonly STARTING_HEALTH: 100;
    readonly STARTING_MANA: 50;
    readonly STARTING_GOLD: 100;
    readonly INVENTORY_SIZE: 40;
    readonly MAX_PARTY_SIZE: 6;
    readonly COMBAT_TURN_TIMEOUT: 30000;
    readonly SESSION_TIMEOUT: 3600000;
    readonly AFK_TIMEOUT: 600000;
};
export declare const EXPERIENCE_TABLE: number[];
export declare const ATTRIBUTE_COSTS: {
    readonly STRENGTH: 2;
    readonly DEXTERITY: 2;
    readonly CONSTITUTION: 2;
    readonly INTELLIGENCE: 2;
    readonly WISDOM: 2;
    readonly CHARISMA: 2;
};
export declare const CURRENCY_CONVERSION: {
    readonly GOLD_TO_SILVER: 100;
    readonly SILVER_TO_COPPER: 100;
    readonly GOLD_TO_COPPER: 10000;
};
export declare const ERROR_CODES: {
    readonly INVALID_CREDENTIALS: "AUTH_001";
    readonly SESSION_EXPIRED: "AUTH_002";
    readonly ACCOUNT_BANNED: "AUTH_003";
    readonly PLAYER_NOT_FOUND: "PLAYER_001";
    readonly INSUFFICIENT_LEVEL: "PLAYER_002";
    readonly INSUFFICIENT_STATS: "PLAYER_003";
    readonly INVENTORY_FULL: "INV_001";
    readonly ITEM_NOT_FOUND: "INV_002";
    readonly INSUFFICIENT_QUANTITY: "INV_003";
    readonly NOT_IN_COMBAT: "COMBAT_001";
    readonly INVALID_TARGET: "COMBAT_002";
    readonly SKILL_ON_COOLDOWN: "COMBAT_003";
    readonly INSUFFICIENT_MANA: "COMBAT_004";
    readonly INSUFFICIENT_FUNDS: "ECON_001";
    readonly TRADE_FAILED: "ECON_002";
    readonly INVALID_PRICE: "ECON_003";
    readonly SERVER_ERROR: "SYS_001";
    readonly DATABASE_ERROR: "SYS_002";
    readonly RATE_LIMIT: "SYS_003";
};
export declare const RATE_LIMITS: {
    readonly CHAT_MESSAGE: {
        readonly max: 5;
        readonly window: 5000;
    };
    readonly COMBAT_ACTION: {
        readonly max: 10;
        readonly window: 1000;
    };
    readonly TRADE_REQUEST: {
        readonly max: 3;
        readonly window: 60000;
    };
    readonly API_REQUEST: {
        readonly max: 100;
        readonly window: 60000;
    };
};
//# sourceMappingURL=index.d.ts.map