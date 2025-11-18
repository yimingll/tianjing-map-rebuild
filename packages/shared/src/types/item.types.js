"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentSlot = exports.EffectType = exports.ItemRarity = exports.ItemQuality = exports.ItemType = void 0;
var ItemType;
(function (ItemType) {
    ItemType["WEAPON"] = "weapon";
    ItemType["ARMOR"] = "armor";
    ItemType["ACCESSORY"] = "accessory";
    ItemType["CONSUMABLE"] = "consumable";
    ItemType["MATERIAL"] = "material";
    ItemType["TREASURE"] = "treasure";
    ItemType["CURRENCY"] = "currency";
    ItemType["QUEST"] = "quest";
    ItemType["MISC"] = "misc";
})(ItemType || (exports.ItemType = ItemType = {}));
var ItemQuality;
(function (ItemQuality) {
    ItemQuality["COMMON"] = "common";
    ItemQuality["UNCOMMON"] = "uncommon";
    ItemQuality["RARE"] = "rare";
    ItemQuality["EPIC"] = "epic";
    ItemQuality["LEGENDARY"] = "legendary";
})(ItemQuality || (exports.ItemQuality = ItemQuality = {}));
exports.ItemRarity = ItemQuality;
var EffectType;
(function (EffectType) {
    EffectType["HEAL"] = "heal";
    EffectType["DAMAGE"] = "damage";
    EffectType["BUFF"] = "buff";
    EffectType["DEBUFF"] = "debuff";
    EffectType["BUFF_STRENGTH"] = "buff_strength";
    EffectType["BUFF_DEFENSE"] = "buff_defense";
    EffectType["BUFF_SPEED"] = "buff_speed";
    EffectType["DEBUFF_POISON"] = "debuff_poison";
    EffectType["DEBUFF_SLOW"] = "debuff_slow";
})(EffectType || (exports.EffectType = EffectType = {}));
var EquipmentSlot;
(function (EquipmentSlot) {
    EquipmentSlot["WEAPON"] = "weapon";
    EquipmentSlot["ARMOR"] = "armor";
    EquipmentSlot["HELMET"] = "helmet";
    EquipmentSlot["BOOTS"] = "boots";
    EquipmentSlot["ACCESSORY"] = "accessory";
})(EquipmentSlot || (exports.EquipmentSlot = EquipmentSlot = {}));
//# sourceMappingURL=item.types.js.map