"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopType = exports.TradeStatus = exports.TransactionStatus = exports.TransactionType = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["TRADE"] = "trade";
    TransactionType["SHOP_BUY"] = "shop_buy";
    TransactionType["SHOP_SELL"] = "shop_sell";
    TransactionType["PLAYER_TRANSFER"] = "player_transfer";
    TransactionType["QUEST_REWARD"] = "quest_reward";
    TransactionType["LOOT"] = "loot";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["CANCELLED"] = "cancelled";
    TransactionStatus["FAILED"] = "failed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var TradeStatus;
(function (TradeStatus) {
    TradeStatus["PENDING"] = "pending";
    TradeStatus["ACCEPTED"] = "accepted";
    TradeStatus["REJECTED"] = "rejected";
    TradeStatus["EXPIRED"] = "expired";
})(TradeStatus || (exports.TradeStatus = TradeStatus = {}));
var ShopType;
(function (ShopType) {
    ShopType["GENERAL"] = "general";
    ShopType["WEAPON"] = "weapon";
    ShopType["ARMOR"] = "armor";
    ShopType["POTION"] = "potion";
    ShopType["MAGIC"] = "magic";
})(ShopType || (exports.ShopType = ShopType = {}));
//# sourceMappingURL=economy.types.js.map