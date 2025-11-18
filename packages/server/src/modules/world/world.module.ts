import { Module } from '@nestjs/common';
import { WorldService } from './world.service';
import { DataLoaderModule } from '../data-loader/data-loader.module';
import { MapEditorController } from './map-editor.controller';
import { MapEditorService } from './map-editor.service';

@Module({
  imports: [DataLoaderModule],
  controllers: [MapEditorController],
  providers: [WorldService, MapEditorService],
  exports: [WorldService],
})
export class WorldModule {}
