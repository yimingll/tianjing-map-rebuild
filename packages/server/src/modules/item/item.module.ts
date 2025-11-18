import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemService } from './item.service';
import { InventoryService } from './inventory.service';
import { ItemController } from './item.controller';
import { PlayerEntity } from '../player/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerEntity])],
  controllers: [ItemController],
  providers: [ItemService, InventoryService],
  exports: [ItemService, InventoryService],
})
export class ItemModule {}
