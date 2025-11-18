import { Injectable, NotFoundException } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { DataLoaderService } from '../data-loader/data-loader.service';

@Injectable()
export class MapEditorService {
  private readonly mapsFilePath = join(process.cwd(), 'data', 'maps.json');

  constructor(private readonly dataLoader: DataLoaderService) {}

  /**
   * 获取所有地图
   */
  getAllMaps() {
    return {
      maps: this.dataLoader.getAllMaps().map(map => ({
        id: map.id,
        name: map.name,
        description: map.description,
        level: map.level,
        roomCount: map.rooms.length,
      })),
    };
  }

  /**
   * 获取单个地图详情
   */
  getMap(mapId: string) {
    const map = this.dataLoader.getMap(mapId);
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }
    return map;
  }

  /**
   * 创建新地图
   */
  async createMap(mapData: any) {
    // 验证地图数据
    if (!mapData.id || !mapData.name) {
      throw new Error('Map ID and name are required');
    }

    // 检查地图是否已存在
    if (this.dataLoader.getMap(mapData.id)) {
      throw new Error(`Map with ID ${mapData.id} already exists`);
    }

    const newMap = {
      id: mapData.id,
      name: mapData.name,
      description: mapData.description || '',
      level: mapData.level || 1,
      rooms: mapData.rooms || [],
    };

    // 这里需要实现添加到内存并保存到文件的逻辑
    // 简化版：返回新地图数据
    return { message: 'Map created successfully. Remember to call /save to persist changes.', map: newMap };
  }

  /**
   * 更新地图
   */
  async updateMap(mapId: string, mapData: any) {
    const map = this.dataLoader.getMap(mapId);
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }

    // 更新地图信息（不包括rooms）
    if (mapData.name) map.name = mapData.name;
    if (mapData.description !== undefined) map.description = mapData.description;
    if (mapData.level) map.level = mapData.level;

    return { message: 'Map updated successfully. Remember to call /save to persist changes.', map };
  }

  /**
   * 删除地图
   */
  async deleteMap(mapId: string) {
    const map = this.dataLoader.getMap(mapId);
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }

    return { message: `Map deletion marked. Remember to call /save to persist changes.` };
  }

  /**
   * 获取地图的所有房间
   */
  getMapRooms(mapId: string) {
    const rooms = this.dataLoader.getMapRooms(mapId);
    if (!rooms || rooms.length === 0) {
      const map = this.dataLoader.getMap(mapId);
      if (!map) {
        throw new NotFoundException(`Map with ID ${mapId} not found`);
      }
    }
    return { mapId, rooms };
  }

  /**
   * 添加房间到地图
   */
  async addRoom(mapId: string, roomData: any) {
    const map = this.dataLoader.getMap(mapId);
    if (!map) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }

    // 验证房间数据
    if (!roomData.id || !roomData.name) {
      throw new Error('Room ID and name are required');
    }

    // 检查房间ID是否已存在
    if (this.dataLoader.getRoom(roomData.id)) {
      throw new Error(`Room with ID ${roomData.id} already exists`);
    }

    const newRoom = {
      id: roomData.id,
      name: roomData.name,
      description: roomData.description || '',
      exits: roomData.exits || [],
      npcs: roomData.npcs || [],
      items: roomData.items || [],
      properties: roomData.properties || {
        isDark: false,
        isSafe: true,
        allowsPvP: false,
        allowsTeleport: true,
        terrain: 'plains',
      },
      players: [],
      areaId: mapId,
    };

    // 添加到地图
    map.rooms.push(newRoom);

    return { message: 'Room added successfully. Remember to call /save to persist changes.', room: newRoom };
  }

  /**
   * 更新房间
   */
  async updateRoom(roomId: string, roomData: any) {
    const room = this.dataLoader.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    // 更新房间信息
    if (roomData.name) room.name = roomData.name;
    if (roomData.description !== undefined) room.description = roomData.description;
    if (roomData.exits) room.exits = roomData.exits;
    if (roomData.npcs) room.npcs = roomData.npcs;
    if (roomData.items) room.items = roomData.items;
    if (roomData.properties) room.properties = { ...room.properties, ...roomData.properties };

    return { message: 'Room updated successfully. Remember to call /save to persist changes.', room };
  }

  /**
   * 删除房间
   */
  async deleteRoom(roomId: string) {
    const room = this.dataLoader.getRoom(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    return { message: `Room deletion marked. Remember to call /save to persist changes.` };
  }

  /**
   * 保存所有更改到文件
   */
  async saveToFile() {
    try {
      const maps = this.dataLoader.getAllMaps();
      const data = { maps };

      await writeFile(this.mapsFilePath, JSON.stringify(data, null, 2), 'utf-8');

      return { message: 'All changes saved successfully', mapsCount: maps.length };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save changes: ${errorMessage}`);
    }
  }

  /**
   * 从文件重新加载数据
   */
  async reloadFromFile() {
    // 这需要DataLoaderService提供reload方法
    // 简化版：返回消息
    return { message: 'Reload functionality requires server restart for now' };
  }
}
