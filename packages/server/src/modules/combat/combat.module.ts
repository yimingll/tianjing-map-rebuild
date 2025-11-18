import { Module } from '@nestjs/common';
import { CombatService } from './combat.service';
import { CombatController } from './combat.controller';
import { PlayerModule } from '../player/player.module';
import { ItemModule } from '../item/item.module';
import { EconomyModule } from '../economy/economy.module';

@Module({
  imports: [PlayerModule, ItemModule, EconomyModule],
  controllers: [CombatController],
  providers: [CombatService],
  exports: [CombatService],
})
export class CombatModule {}
