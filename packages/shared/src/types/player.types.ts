/**
 * Player related types
 */

export interface Player {
  id: string;
  username: string;
  displayName: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  position: Position;
  inventory: InventoryItem[];
  equipment: Equipment;
  attributes: PlayerAttributes;
  status: PlayerStatus;
  createdAt: Date;
  lastLogin: Date;
}

export interface Position {
  roomId: string;
  x?: number;
  y?: number;
  z?: number;
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
  slot?: number;
}

export interface Equipment {
  weapon?: string;
  armor?: string;
  helmet?: string;
  boots?: string;
  accessory?: string;
}

export interface PlayerAttributes {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export enum PlayerStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  IN_COMBAT = 'in_combat',
  TRADING = 'trading',
  AFK = 'afk',
}

export interface PlayerSession {
  playerId: string;
  socketId: string;
  connectedAt: Date;
  ipAddress: string;
}
