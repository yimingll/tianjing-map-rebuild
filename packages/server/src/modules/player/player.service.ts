import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity } from './player.entity';
import { PlayerStatus } from '@mud-game/shared';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>,
  ) {}

  async findById(id: string) {
    return this.playerRepository.findOne({ where: { id } });
  }

  async updateStatus(playerId: string, status: PlayerStatus) {
    await this.playerRepository.update(playerId, { status });
  }

  async updatePosition(playerId: string, roomId: string) {
    await this.playerRepository.update(playerId, { currentRoomId: roomId });
  }

  async getPlayersInRoom(roomId: string) {
    return this.playerRepository.find({
      where: { currentRoomId: roomId, status: PlayerStatus.ONLINE },
    });
  }

  async addExperience(playerId: string, amount: number) {
    const player = await this.findById(playerId);
    if (!player) return;

    player.experience += amount;

    // Simple level up logic
    const experienceForNextLevel = Math.floor(100 * Math.pow(player.level, 1.5));
    if (player.experience >= experienceForNextLevel) {
      player.level++;
      player.experience -= experienceForNextLevel;
      player.maxHealth += 10;
      player.maxMana += 5;
      player.health = player.maxHealth;
      player.mana = player.maxMana;
    }

    await this.playerRepository.save(player);
    return player;
  }

  async updateHealth(playerId: string, health: number) {
    await this.playerRepository.update(playerId, { health });
  }

  async updateMana(playerId: string, mana: number) {
    await this.playerRepository.update(playerId, { mana });
  }
}
