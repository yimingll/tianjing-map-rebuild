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
export declare enum ItemType {
    WEAPON = "weapon",
    ARMOR = "armor",
    ACCESSORY = "accessory",
    CONSUMABLE = "consumable",
    MATERIAL = "material",
    TREASURE = "treasure",
    CURRENCY = "currency",
    QUEST = "quest",
    MISC = "misc"
}
export declare enum ItemQuality {
    COMMON = "common",
    UNCOMMON = "uncommon",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary"
}
export declare const ItemRarity: typeof ItemQuality;
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
export declare enum EffectType {
    HEAL = "heal",
    DAMAGE = "damage",
    BUFF = "buff",
    DEBUFF = "debuff",
    BUFF_STRENGTH = "buff_strength",
    BUFF_DEFENSE = "buff_defense",
    BUFF_SPEED = "buff_speed",
    DEBUFF_POISON = "debuff_poison",
    DEBUFF_SLOW = "debuff_slow"
}
export interface ItemProperties {
    damage?: number;
    defense?: number;
    healing?: number;
    effects?: ItemEffect[];
    requiredLevel?: number;
    durability?: number;
    maxDurability?: number;
}
export declare enum EquipmentSlot {
    WEAPON = "weapon",
    ARMOR = "armor",
    HELMET = "helmet",
    BOOTS = "boots",
    ACCESSORY = "accessory"
}
//# sourceMappingURL=item.types.d.ts.map