"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherType = exports.TerrainType = exports.Direction = void 0;
var Direction;
(function (Direction) {
    Direction["NORTH"] = "north";
    Direction["SOUTH"] = "south";
    Direction["EAST"] = "east";
    Direction["WEST"] = "west";
    Direction["UP"] = "up";
    Direction["DOWN"] = "down";
    Direction["NORTHEAST"] = "northeast";
    Direction["NORTHWEST"] = "northwest";
    Direction["SOUTHEAST"] = "southeast";
    Direction["SOUTHWEST"] = "southwest";
})(Direction || (exports.Direction = Direction = {}));
var TerrainType;
(function (TerrainType) {
    TerrainType["PLAINS"] = "plains";
    TerrainType["FOREST"] = "forest";
    TerrainType["MOUNTAIN"] = "mountain";
    TerrainType["WATER"] = "water";
    TerrainType["DESERT"] = "desert";
    TerrainType["DUNGEON"] = "dungeon";
    TerrainType["CAVE"] = "cave";
    TerrainType["CITY"] = "city";
})(TerrainType || (exports.TerrainType = TerrainType = {}));
var WeatherType;
(function (WeatherType) {
    WeatherType["CLEAR"] = "clear";
    WeatherType["RAIN"] = "rain";
    WeatherType["SNOW"] = "snow";
    WeatherType["STORM"] = "storm";
    WeatherType["FOG"] = "fog";
})(WeatherType || (exports.WeatherType = WeatherType = {}));
//# sourceMappingURL=world.types.js.map