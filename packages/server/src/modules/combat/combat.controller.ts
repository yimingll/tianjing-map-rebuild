import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CombatService } from './combat.service';
import {
  StartCombatRequest,
  StartCombatResponse,
  ExecuteCombatActionRequest,
  ExecuteCombatActionResponse,
  FleeCombatRequest,
  FleeCombatResponse,
  MonsterDefinition,
  CombatState,
} from '@mud-game/shared';

@Controller('api/combat')
export class CombatController {
  constructor(private readonly combatService: CombatService) {}

  /**
   * 获取所有怪物列表
   * GET /api/combat/monsters
   */
  @Get('monsters')
  getAllMonsters(): MonsterDefinition[] {
    return this.combatService.getAllMonsters();
  }

  /**
   * 开始战斗
   * POST /api/combat/start
   */
  @Post('start')
  async startCombat(
    @Body() request: StartCombatRequest,
  ): Promise<StartCombatResponse> {
    const { playerId, monsterId } = request;

    if (!playerId || !monsterId) {
      throw new HttpException(
        '缺少必要参数',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.combatService.startCombat(playerId, monsterId);

    if (!result.success) {
      throw new HttpException(
        result.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      message: result.message,
      combat: result.combat,
    };
  }

  /**
   * 执行战斗行动
   * POST /api/combat/action
   */
  @Post('action')
  async executeCombatAction(
    @Body() request: ExecuteCombatActionRequest,
  ): Promise<ExecuteCombatActionResponse> {
    const { combatId, playerId, action } = request;

    if (!combatId || !playerId || !action) {
      throw new HttpException(
        '缺少必要参数',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.combatService.executeCombatAction(
      combatId,
      playerId,
      action,
    );

    if (!result.success) {
      throw new HttpException(
        result.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      message: result.message,
      combat: result.combat,
      roundResults: result.roundResults,
      combatEnded: result.combatEnded,
      victory: result.victory,
      reward: result.reward,
    };
  }

  /**
   * 逃跑
   * POST /api/combat/flee
   */
  @Post('flee')
  async fleeCombat(
    @Body() request: FleeCombatRequest,
  ): Promise<FleeCombatResponse> {
    const { combatId, playerId } = request;

    if (!combatId || !playerId) {
      throw new HttpException(
        '缺少必要参数',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.combatService.fleeCombat(combatId, playerId);

    if (!result.success) {
      throw new HttpException(
        result.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      success: true,
      message: result.message,
      fleeSuccessful: result.fleeSuccessful,
    };
  }

  /**
   * 获取战斗状态
   * GET /api/combat/:combatId
   */
  @Get(':combatId')
  getCombatState(@Param('combatId') combatId: string): CombatState {
    const combat = this.combatService.getCombat(combatId);

    if (!combat) {
      throw new HttpException(
        '战斗不存在',
        HttpStatus.NOT_FOUND,
      );
    }

    return combat;
  }
}

