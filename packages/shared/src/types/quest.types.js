"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestObjectiveType = exports.QuestStatus = exports.QuestType = void 0;
var QuestType;
(function (QuestType) {
    QuestType["MAIN"] = "main";
    QuestType["SIDE"] = "side";
    QuestType["DAILY"] = "daily";
    QuestType["REPEATABLE"] = "repeatable";
})(QuestType || (exports.QuestType = QuestType = {}));
var QuestStatus;
(function (QuestStatus) {
    QuestStatus["NOT_STARTED"] = "not_started";
    QuestStatus["IN_PROGRESS"] = "in_progress";
    QuestStatus["COMPLETED"] = "completed";
    QuestStatus["TURNED_IN"] = "turned_in";
    QuestStatus["FAILED"] = "failed";
})(QuestStatus || (exports.QuestStatus = QuestStatus = {}));
var QuestObjectiveType;
(function (QuestObjectiveType) {
    QuestObjectiveType["KILL"] = "kill";
    QuestObjectiveType["COLLECT"] = "collect";
    QuestObjectiveType["TALK"] = "talk";
    QuestObjectiveType["EXPLORE"] = "explore";
    QuestObjectiveType["DELIVER"] = "deliver";
    QuestObjectiveType["CULTIVATE"] = "cultivate";
    QuestObjectiveType["CUSTOM"] = "custom";
})(QuestObjectiveType || (exports.QuestObjectiveType = QuestObjectiveType = {}));
//# sourceMappingURL=quest.types.js.map