import { Injectable, OnModuleInit } from '@nestjs/common';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { Room } from '@mud-game/shared';

export interface MapData {
  id: string;
  name: string;
  description: string;
  level: number;
  rooms: Room[];
}

export interface CityData {
  id: string;
  name: string;
  fullName: string;
  type: string;
  level: number;
  province: string;
  population: {
    mortal: number;
    cultivator: number;
  };
  description?: string;
}

export interface District {
  id: string;
  name: string;
  description?: string;
  locations: Location[];
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  rooms: Room[];
}

export interface CityMapData {
  city: CityData;
  districts: District[];
  metadata?: {
    part?: number;
    totalParts?: number;
    roomCount?: number;
  };
}

export interface NpcData {
  id: string;
  name: string;
  description: string;
  level: number;
  type: string;
  faction: string;
  defaultRoomId: string;
  stats: any;
  inventory: any[];
  dialogue: any;
  behaviorType: string;
  isAggressive: boolean;
  respawnTime: number;
  lootTable: any[];
  [key: string]: any;
}

export interface ItemData {
  id: string;
  name: string;
  description: string;
  type: string;
  subType: string;
  quality: string;
  level: number;
  price: number;
  weight: number;
  stackable: boolean;
  [key: string]: any;
}

@Injectable()
export class DataLoaderService implements OnModuleInit {
  private maps = new Map<string, MapData>();
  private cities = new Map<string, CityData>();
  private rooms = new Map<string, Room>();
  private npcs = new Map<string, NpcData>();
  private items = new Map<string, ItemData>();
  // 房间ID -> 区域信息的映射
  private roomDistricts = new Map<string, { districtId: string; districtName: string; locationId: string; locationName: string }>();

  private readonly dataFilePath = join(process.cwd(), 'data', 'maps.json');
  private readonly npcsFilePath = join(process.cwd(), 'data', 'npcs.json');
  private readonly itemsFilePath = join(process.cwd(), 'data', 'items.json');
  private readonly mapsDir = join(process.cwd(), 'data', 'maps');

  async onModuleInit() {
    await this.loadAllMaps();
    await this.loadCityMaps();
    await this.loadAllNpcs();
    await this.loadAllItems();
  }

  /**
   * 加载所有地图数据（旧版单一JSON）
   */
  private async loadAllMaps(): Promise<void> {
    try {
      const content = await readFile(this.dataFilePath, 'utf-8');
      const data: { maps: MapData[] } = JSON.parse(content);

      for (const mapData of data.maps) {
        // 保存地图信息
        this.maps.set(mapData.id, mapData);

        // 保存所有房间到全局房间Map
        for (const room of mapData.rooms) {
          // 确保房间有 areaId 字段
          room.areaId = mapData.id;
          // 确保房间有 players 数组
          if (!room.players) {
            room.players = [];
          }
          this.rooms.set(room.id, room);
        }

        console.log(`[DataLoader] Loaded map: ${mapData.name} (${mapData.rooms.length} rooms)`);
      }

      console.log(`[DataLoader] Total: ${this.maps.size} maps with ${this.rooms.size} rooms`);
    } catch (error: any) {
      console.warn('[DataLoader] No legacy maps.json found or failed to load:', error?.message || error);
    }
  }

  /**
   * 递归加载城市地图数据（新版层级结构）
   */
  private async loadCityMaps(): Promise<void> {
    try {
      await this.loadCityMapsRecursive(this.mapsDir);
      console.log(`[DataLoader] Loaded ${this.cities.size} cities with total ${this.rooms.size} rooms`);
    } catch (error) {
      console.error('[DataLoader] Failed to load city maps:', error);
    }
  }

  /**
   * 递归扫描目录加载城市JSON文件
   */
  private async loadCityMapsRecursive(dir: string): Promise<void> {
    try {
      const entries = await readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // 递归扫描子目录
          await this.loadCityMapsRecursive(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          // 跳过索引文件和旧版地图文件
          if (entry.name.startsWith('_') || entry.name === 'maps.json') {
            continue;
          }

          // 检查是否是多部分文件
          const isPartFile = /_part\d+\.json$/.test(entry.name);
          const baseFileName = entry.name.replace(/_part\d+\.json$/, '').replace(/\.json$/, '');

          // 检查是否存在分部文件
          const part1File = `${baseFileName}_part1.json`;
          const part1Exists = await stat(join(dir, part1File)).then(() => true).catch(() => false);

          // 如果存在分部文件，跳过同名的单一文件
          if (!isPartFile && part1Exists) {
            console.log(`[DataLoader] Skipping ${entry.name} as multi-part version exists`);
            continue;
          }

          // 如果是第一部分或单一文件（且不存在分部版本），开始加载
          if (!isPartFile || entry.name.includes('_part1.json')) {
            await this.loadCityMapFile(dir, baseFileName, entry.name);
          }
        }
      }
    } catch (error: any) {
      // 目录不存在时忽略
      if (error?.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * 加载单个城市地图文件（支持多部分合并）
   */
  private async loadCityMapFile(dir: string, baseFileName: string, fileName: string): Promise<void> {
    try {
      // 收集所有部分文件
      const parts: CityMapData[] = [];
      let partNum = 1;
      let currentFile = fileName;

      // 尝试加载所有部分
      while (true) {
        const filePath = join(dir, currentFile);
        try {
          const content = await readFile(filePath, 'utf-8');
          const cityData: CityMapData = JSON.parse(content);
          parts.push(cityData);

          // 检查是否有更多部分
          partNum++;
          currentFile = `${baseFileName}_part${partNum}.json`;

          // 检查下一个文件是否存在
          try {
            await stat(join(dir, currentFile));
          } catch {
            // 文件不存在，结束循环
            break;
          }
        } catch (error) {
          if (partNum === 1) {
            // 如果连第一个文件都加载失败，抛出错误
            throw error;
          }
          // 否则结束循环
          break;
        }
      }

      if (parts.length === 0) {
        return;
      }

      // 合并所有部分
      const mergedCityData = this.mergeCityParts(parts);

      // 保存城市信息
      this.cities.set(mergedCityData.city.id, mergedCityData.city);

      // 解析并保存所有房间
      let roomCount = 0;
      for (const district of mergedCityData.districts) {
        for (const location of district.locations) {
          for (const room of location.rooms) {
            // 确保房间有必要的字段
            room.areaId = mergedCityData.city.id;
            if (!room.players) {
              room.players = [];
            }

            this.rooms.set(room.id, room);

            // 保存房间所属的district和location信息
            this.roomDistricts.set(room.id, {
              districtId: district.id,
              districtName: district.name,
              locationId: location.id,
              locationName: location.name
            });

            roomCount++;
          }
        }
      }

      const partInfo = parts.length > 1 ? ` (${parts.length} parts)` : '';
      console.log(`[DataLoader] Loaded city: ${mergedCityData.city.name}${partInfo} - ${roomCount} rooms`);
    } catch (error) {
      console.error(`[DataLoader] Failed to load city map ${fileName}:`, error);
    }
  }

  /**
   * 合并多个城市数据部分
   */
  private mergeCityParts(parts: CityMapData[]): CityMapData {
    if (parts.length === 1) {
      return parts[0];
    }

    const merged: CityMapData = {
      city: parts[0].city,
      districts: [],
    };

    // 合并所有部分的区域
    for (const part of parts) {
      merged.districts.push(...part.districts);
    }

    return merged;
  }

  /**
   * 获取房间
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * 获取所有房间
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * 获取房间所属的区域信息
   */
  getRoomDistrict(roomId: string): { districtId: string; districtName: string; locationId: string; locationName: string } | undefined {
    return this.roomDistricts.get(roomId);
  }

  /**
   * 获取地图信息
   */
  getMap(mapId: string): MapData | undefined {
    return this.maps.get(mapId);
  }

  /**
   * 获取所有地图
   */
  getAllMaps(): MapData[] {
    return Array.from(this.maps.values());
  }

  /**
   * 获取地图的所有房间
   */
  getMapRooms(mapId: string): Room[] {
    const map = this.maps.get(mapId);
    return map ? map.rooms : [];
  }

  /**
   * 添加玩家到房间
   */
  addPlayerToRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (room && !room.players.includes(playerId)) {
      room.players.push(playerId);
    }
  }

  /**
   * 从房间移除玩家
   */
  removePlayerFromRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.players = room.players.filter(id => id !== playerId);
    }
  }

  /**
   * 获取房间中的玩家列表
   */
  getPlayersInRoom(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? room.players : [];
  }

  /**
   * 加载所有NPC数据
   */
  private async loadAllNpcs(): Promise<void> {
    try {
      const content = await readFile(this.npcsFilePath, 'utf-8');
      const data: { npcs: NpcData[] } = JSON.parse(content);

      for (const npc of data.npcs) {
        this.npcs.set(npc.id, npc);
      }

      console.log(`[DataLoader] Loaded ${this.npcs.size} NPCs`);
    } catch (error) {
      console.error('[DataLoader] Failed to load NPCs:', error);
      throw error;
    }
  }

  /**
   * 加载所有物品数据
   */
  private async loadAllItems(): Promise<void> {
    try {
      const content = await readFile(this.itemsFilePath, 'utf-8');
      const data: { items: ItemData[] } = JSON.parse(content);

      for (const item of data.items) {
        this.items.set(item.id, item);
      }

      console.log(`[DataLoader] Loaded ${this.items.size} items`);
    } catch (error) {
      console.error('[DataLoader] Failed to load items:', error);
      throw error;
    }
  }

  /**
   * 获取NPC
   */
  getNpc(npcId: string): NpcData | undefined {
    return this.npcs.get(npcId);
  }

  /**
   * 获取所有NPC
   */
  getAllNpcs(): NpcData[] {
    return Array.from(this.npcs.values());
  }

  /**
   * 根据类型获取NPC
   */
  getNpcsByType(type: string): NpcData[] {
    return Array.from(this.npcs.values()).filter(npc => npc.type === type);
  }

  /**
   * 获取房间内的NPC
   */
  getNpcsInRoom(roomId: string): NpcData[] {
    return Array.from(this.npcs.values()).filter(npc => npc.defaultRoomId === roomId);
  }

  /**
   * 获取物品
   */
  getItem(itemId: string): ItemData | undefined {
    return this.items.get(itemId);
  }

  /**
   * 获取所有物品
   */
  getAllItems(): ItemData[] {
    return Array.from(this.items.values());
  }

  /**
   * 根据类型获取物品
   */
  getItemsByType(type: string): ItemData[] {
    return Array.from(this.items.values()).filter(item => item.type === type);
  }

  /**
   * 根据品质获取物品
   */
  getItemsByQuality(quality: string): ItemData[] {
    return Array.from(this.items.values()).filter(item => item.quality === quality);
  }

  /**
   * 获取城市信息
   */
  getCity(cityId: string): CityData | undefined {
    return this.cities.get(cityId);
  }

  /**
   * 获取所有城市
   */
  getAllCities(): CityData[] {
    return Array.from(this.cities.values());
  }

  /**
   * 根据城市ID获取所有房间
   */
  getRoomsByCity(cityId: string): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.areaId === cityId);
  }
}
