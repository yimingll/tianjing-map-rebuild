import { Controller, Get, Param } from '@nestjs/common';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private playerService: PlayerService) {}

  @Get(':id')
  async getPlayer(@Param('id') id: string) {
    return this.playerService.findById(id);
  }
}
