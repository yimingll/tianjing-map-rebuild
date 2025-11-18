import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { PlayerModule } from '../player/player.module';
import { WorldModule } from '../world/world.module';
import { CombatModule } from '../combat/combat.module';
import { ChatModule } from '../chat/chat.module';
import { DataLoaderModule } from '../data-loader/data-loader.module';
import { NpcModule } from '../npc/npc.module';

@Module({
  imports: [PlayerModule, WorldModule, CombatModule, ChatModule, DataLoaderModule, NpcModule],
  providers: [GameGateway],
})
export class GameModule {}
