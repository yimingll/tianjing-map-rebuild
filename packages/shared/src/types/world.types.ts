/**
 * World and room related types
 */

export interface Room {
  id: string;
  name: string;
  description: string;
  areaId: string;
  exits: Exit[];
  npcs: string[];
  items: string[];
  players: string[];
  properties: RoomProperties;
}

export interface Exit {
  direction: Direction;
  targetRoomId: string;
  isLocked: boolean;
  requiredKey?: string;
  description?: string;
}

export enum Direction {
  NORTH = 'north',
  SOUTH = 'south',
  EAST = 'east',
  WEST = 'west',
  UP = 'up',
  DOWN = 'down',
  NORTHEAST = 'northeast',
  NORTHWEST = 'northwest',
  SOUTHEAST = 'southeast',
  SOUTHWEST = 'southwest',
}

export interface RoomProperties {
  isDark: boolean;
  isSafe: boolean;
  allowsPvP: boolean;
  allowsTeleport: boolean;
  terrain: TerrainType;
  weather?: WeatherType;
}

export enum TerrainType {
  PLAINS = 'plains',
  FOREST = 'forest',
  MOUNTAIN = 'mountain',
  WATER = 'water',
  DESERT = 'desert',
  DUNGEON = 'dungeon',
  CAVE = 'cave',
  CITY = 'city',
}

export enum WeatherType {
  CLEAR = 'clear',
  RAIN = 'rain',
  SNOW = 'snow',
  STORM = 'storm',
  FOG = 'fog',
}

export interface Area {
  id: string;
  name: string;
  description: string;
  level: number;
  rooms: string[];
}
