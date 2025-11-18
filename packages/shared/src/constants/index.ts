/**
 * Game constants
 */

export const GAME_CONFIG = {
  MAX_PLAYERS: 10000,
  MAX_LEVEL: 100,
  STARTING_HEALTH: 100,
  STARTING_MANA: 50,
  STARTING_GOLD: 100,
  INVENTORY_SIZE: 40,
  MAX_PARTY_SIZE: 6,
  COMBAT_TURN_TIMEOUT: 30000, // 30 seconds
  SESSION_TIMEOUT: 3600000, // 1 hour
  AFK_TIMEOUT: 600000, // 10 minutes
} as const;

export const EXPERIENCE_TABLE = Array.from({ length: 100 }, (_, i) => {
  return Math.floor(100 * Math.pow(i + 1, 1.5));
});

export const ATTRIBUTE_COSTS = {
  STRENGTH: 2,
  DEXTERITY: 2,
  CONSTITUTION: 2,
  INTELLIGENCE: 2,
  WISDOM: 2,
  CHARISMA: 2,
} as const;

export const CURRENCY_CONVERSION = {
  GOLD_TO_SILVER: 100,
  SILVER_TO_COPPER: 100,
  GOLD_TO_COPPER: 10000,
} as const;

export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_001',
  SESSION_EXPIRED: 'AUTH_002',
  ACCOUNT_BANNED: 'AUTH_003',

  // Player
  PLAYER_NOT_FOUND: 'PLAYER_001',
  INSUFFICIENT_LEVEL: 'PLAYER_002',
  INSUFFICIENT_STATS: 'PLAYER_003',

  // Inventory
  INVENTORY_FULL: 'INV_001',
  ITEM_NOT_FOUND: 'INV_002',
  INSUFFICIENT_QUANTITY: 'INV_003',

  // Combat
  NOT_IN_COMBAT: 'COMBAT_001',
  INVALID_TARGET: 'COMBAT_002',
  SKILL_ON_COOLDOWN: 'COMBAT_003',
  INSUFFICIENT_MANA: 'COMBAT_004',

  // Economy
  INSUFFICIENT_FUNDS: 'ECON_001',
  TRADE_FAILED: 'ECON_002',
  INVALID_PRICE: 'ECON_003',

  // System
  SERVER_ERROR: 'SYS_001',
  DATABASE_ERROR: 'SYS_002',
  RATE_LIMIT: 'SYS_003',
} as const;

export const RATE_LIMITS = {
  CHAT_MESSAGE: { max: 5, window: 5000 }, // 5 messages per 5 seconds
  COMBAT_ACTION: { max: 10, window: 1000 }, // 10 actions per second
  TRADE_REQUEST: { max: 3, window: 60000 }, // 3 trades per minute
  API_REQUEST: { max: 100, window: 60000 }, // 100 requests per minute
} as const;
