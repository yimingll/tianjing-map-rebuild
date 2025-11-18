import { Injectable } from '@nestjs/common';
import { Room } from '@mud-game/shared';
import { DataLoaderService } from '../data-loader/data-loader.service';

@Injectable()
export class WorldService {
  constructor(private readonly dataLoader: DataLoaderService) {}

  getRoom(roomId: string): Room | undefined {
    return this.dataLoader.getRoom(roomId);
  }

  getAllRooms(): Room[] {
    return this.dataLoader.getAllRooms();
  }

  getRoomDistrict(roomId: string): { districtId: string; districtName: string; locationId: string; locationName: string } | undefined {
    return this.dataLoader.getRoomDistrict(roomId);
  }

  addPlayerToRoom(roomId: string, playerId: string) {
    this.dataLoader.addPlayerToRoom(roomId, playerId);
  }

  removePlayerFromRoom(roomId: string, playerId: string) {
    this.dataLoader.removePlayerFromRoom(roomId, playerId);
  }

  getPlayersInRoom(roomId: string): string[] {
    return this.dataLoader.getPlayersInRoom(roomId);
  }
}
