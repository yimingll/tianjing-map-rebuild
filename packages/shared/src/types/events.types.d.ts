export declare enum SocketEvent {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    ERROR = "error",
    AUTH_LOGIN = "auth:login",
    AUTH_LOGOUT = "auth:logout",
    AUTH_REGISTER = "auth:register",
    AUTH_SUCCESS = "auth:success",
    AUTH_FAILED = "auth:failed",
    PLAYER_JOIN = "player:join",
    PLAYER_LEAVE = "player:leave",
    PLAYER_MOVE = "player:move",
    PLAYER_UPDATE = "player:update",
    PLAYER_STATS = "player:stats",
    CHAT_MESSAGE = "chat:message",
    CHAT_GLOBAL = "chat:global",
    CHAT_WHISPER = "chat:whisper",
    CHAT_PARTY = "chat:party",
    CHAT_SYSTEM = "chat:system",
    COMBAT_START = "combat:start",
    COMBAT_ACTION = "combat:action",
    COMBAT_RESULT = "combat:result",
    COMBAT_END = "combat:end",
    COMBAT_TURN = "combat:turn",
    ROOM_ENTER = "room:enter",
    ROOM_LEAVE = "room:leave",
    ROOM_UPDATE = "room:update",
    ROOM_PLAYERS = "room:players",
    INVENTORY_UPDATE = "inventory:update",
    INVENTORY_ADD = "inventory:add",
    INVENTORY_REMOVE = "inventory:remove",
    INVENTORY_USE = "inventory:use",
    TRADE_REQUEST = "trade:request",
    TRADE_ACCEPT = "trade:accept",
    TRADE_DECLINE = "trade:decline",
    TRADE_UPDATE = "trade:update",
    TRADE_COMPLETE = "trade:complete",
    SYSTEM_BROADCAST = "system:broadcast",
    SYSTEM_NOTIFICATION = "system:notification",
    SYSTEM_MAINTENANCE = "system:maintenance"
}
export interface BaseEvent<T = any> {
    event: SocketEvent;
    data: T;
    timestamp: Date;
}
export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    channel: ChatChannel;
    timestamp: Date;
}
export declare enum ChatChannel {
    GLOBAL = "global",
    LOCAL = "local",
    WHISPER = "whisper",
    PARTY = "party",
    GUILD = "guild",
    SYSTEM = "system"
}
//# sourceMappingURL=events.types.d.ts.map