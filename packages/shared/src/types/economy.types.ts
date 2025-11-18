/**
 * Economy and trading types
 */

export interface Currency {
  gold: number;
  silver: number;
  copper: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  fromPlayerId?: string;
  toPlayerId?: string;
  amount: Currency;
  items?: TransactionItem[];
  timestamp: Date;
  status: TransactionStatus;
}

export enum TransactionType {
  TRADE = 'trade',
  SHOP_BUY = 'shop_buy',
  SHOP_SELL = 'shop_sell',
  PLAYER_TRANSFER = 'player_transfer',
  QUEST_REWARD = 'quest_reward',
  LOOT = 'loot',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export interface TransactionItem {
  itemId: string;
  quantity: number;
}

export interface TradeOffer {
  tradeId: string;
  initiatorId: string;
  targetId: string;
  initiatorOffer: {
    currency: Currency;
    items: TransactionItem[];
  };
  targetOffer: {
    currency: Currency;
    items: TransactionItem[];
  };
  status: TradeStatus;
  expiresAt: Date;
}

export enum TradeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export interface Shop {
  id: string;
  name: string;
  type: ShopType;
  inventory: ShopItem[];
  buybackItems: TransactionItem[];
}

export enum ShopType {
  GENERAL = 'general',
  WEAPON = 'weapon',
  ARMOR = 'armor',
  POTION = 'potion',
  MAGIC = 'magic',
}

export interface ShopItem {
  itemId: string;
  quantity: number;
  buyPrice: Currency;
  sellPrice: Currency;
  stockLimit?: number;
  restockTime?: number;
}
