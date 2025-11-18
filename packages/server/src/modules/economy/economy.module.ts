import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EconomyService } from './economy.service';
import { PlayerEntity } from '../player/player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerEntity])],
  providers: [EconomyService],
  exports: [EconomyService],
})
export class EconomyModule {}
