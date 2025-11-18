"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DamageType = exports.MonsterType = exports.CombatStatus = exports.ParticipantType = exports.CombatActionType = void 0;
var CombatActionType;
(function (CombatActionType) {
    CombatActionType["ATTACK"] = "attack";
    CombatActionType["DEFEND"] = "defend";
    CombatActionType["USE_SKILL"] = "use_skill";
    CombatActionType["USE_ITEM"] = "use_item";
    CombatActionType["FLEE"] = "flee";
})(CombatActionType || (exports.CombatActionType = CombatActionType = {}));
var ParticipantType;
(function (ParticipantType) {
    ParticipantType["PLAYER"] = "player";
    ParticipantType["NPC"] = "npc";
    ParticipantType["MONSTER"] = "monster";
})(ParticipantType || (exports.ParticipantType = ParticipantType = {}));
var CombatStatus;
(function (CombatStatus) {
    CombatStatus["WAITING"] = "waiting";
    CombatStatus["IN_PROGRESS"] = "in_progress";
    CombatStatus["COMPLETED"] = "completed";
    CombatStatus["FLED"] = "fled";
})(CombatStatus || (exports.CombatStatus = CombatStatus = {}));
var MonsterType;
(function (MonsterType) {
    MonsterType["NORMAL"] = "normal";
    MonsterType["ELITE"] = "elite";
    MonsterType["BOSS"] = "boss";
})(MonsterType || (exports.MonsterType = MonsterType = {}));
var DamageType;
(function (DamageType) {
    DamageType["PHYSICAL"] = "physical";
    DamageType["MAGICAL"] = "magical";
    DamageType["TRUE"] = "true";
})(DamageType || (exports.DamageType = DamageType = {}));
//# sourceMappingURL=combat.types.js.map