import { Module } from '@nestjs/common';
import { NpcController } from './npc.controller';
import { NpcService } from './npc.service';
import { DataLoaderModule } from '../data-loader/data-loader.module';
import { EconomyModule } from '../economy/economy.module';
import { ItemModule } from '../item/item.module';

@Module({
  imports: [DataLoaderModule, EconomyModule, ItemModule],
  controllers: [NpcController],
  providers: [NpcService],
  exports: [NpcService],
})
export class NpcModule {}
