/**
 * Item related types
 */

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  subType?: string;
  quality: ItemQuality;
  level: number;
  price: number;
  weight: number;
  stackable: boolean;
  maxStack?: number;
  stats?: ItemStats;
  effects?: ItemEffect[];
  requirements?: ItemRequirements;
  durability?: number;
  maxDurability?: number;
  cooldown?: number;
  learnSkill?: string;
  consumeOnUse?: boolean;
}

export enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  CONSUMABLE = 'consumable',
  MATERIAL = 'material',
  TREASURE = 'treasure',
  CURRENCY = 'currency',
  QUEST = 'quest',
  MISC = 'misc',
}

export enum ItemQuality {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

// 兼容旧的 ItemRarity
export const ItemRarity = ItemQuality;
export type ItemRarity = ItemQuality;

export interface ItemStats {
  attack?: number;
  defense?: number;
  health?: number;
  mana?: number;
  critical?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  speed?: number;
  manaRegen?: number;
}

export interface ItemRequirements {
  level?: number;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
}

export interface ItemEffect {
  type: EffectType;
  value: number;
  stat?: string;
  duration?: number;
}

export enum EffectType {
  HEAL = 'heal',
  DAMAGE = 'damage',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  BUFF_STRENGTH = 'buff_strength',
  BUFF_DEFENSE = 'buff_defense',
  BUFF_SPEED = 'buff_speed',
  DEBUFF_POISON = 'debuff_poison',
  DEBUFF_SLOW = 'debuff_slow',
}

// 兼容旧的 ItemProperties
export interface ItemProperties {
  damage?: number;
  defense?: number;
  healing?: number;
  effects?: ItemEffect[];
  requiredLevel?: number;
  durability?: number;
  maxDurability?: number;
}

export enum EquipmentSlot {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  HELMET = 'helmet',
  BOOTS = 'boots',
  ACCESSORY = 'accessory',
}
