import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { MapEditorService } from './map-editor.service';

@Controller('api/map-editor')
export class MapEditorController {
  constructor(private readonly mapEditorService: MapEditorService) {}

  /**
   * 获取所有地图列表
   */
  @Get('maps')
  getAllMaps() {
    return this.mapEditorService.getAllMaps();
  }

  /**
   * 获取单个地图详情
   */
  @Get('maps/:mapId')
  getMap(@Param('mapId') mapId: string) {
    return this.mapEditorService.getMap(mapId);
  }

  /**
   * 创建新地图
   */
  @Post('maps')
  @HttpCode(HttpStatus.CREATED)
  createMap(@Body() mapData: any) {
    return this.mapEditorService.createMap(mapData);
  }

  /**
   * 更新地图
   */
  @Put('maps/:mapId')
  updateMap(@Param('mapId') mapId: string, @Body() mapData: any) {
    return this.mapEditorService.updateMap(mapId, mapData);
  }

  /**
   * 删除地图
   */
  @Delete('maps/:mapId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteMap(@Param('mapId') mapId: string) {
    return this.mapEditorService.deleteMap(mapId);
  }

  /**
   * 获取地图的所有房间
   */
  @Get('maps/:mapId/rooms')
  getMapRooms(@Param('mapId') mapId: string) {
    return this.mapEditorService.getMapRooms(mapId);
  }

  /**
   * 添加房间到地图
   */
  @Post('maps/:mapId/rooms')
  @HttpCode(HttpStatus.CREATED)
  addRoom(@Param('mapId') mapId: string, @Body() roomData: any) {
    return this.mapEditorService.addRoom(mapId, roomData);
  }

  /**
   * 更新房间
   */
  @Put('rooms/:roomId')
  updateRoom(@Param('roomId') roomId: string, @Body() roomData: any) {
    return this.mapEditorService.updateRoom(roomId, roomData);
  }

  /**
   * 删除房间
   */
  @Delete('rooms/:roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteRoom(@Param('roomId') roomId: string) {
    return this.mapEditorService.deleteRoom(roomId);
  }

  /**
   * 保存所有更改到文件
   */
  @Post('save')
  @HttpCode(HttpStatus.OK)
  saveChanges() {
    return this.mapEditorService.saveToFile();
  }

  /**
   * 从文件重新加载数据
   */
  @Post('reload')
  @HttpCode(HttpStatus.OK)
  reloadData() {
    return this.mapEditorService.reloadFromFile();
  }
}
