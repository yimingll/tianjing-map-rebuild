import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { PlayerEntity } from '../player/player.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PlayerEntity)
    private playerRepository: Repository<PlayerEntity>,
  ) {}

  async register(username: string, password: string, displayName: string) {
    const existingPlayer = await this.playerRepository.findOne({
      where: { username },
    });

    if (existingPlayer) {
      return {
        success: false,
        message: '用户名已存在',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const player = this.playerRepository.create({
      username,
      password: hashedPassword,
      displayName,
    });

    await this.playerRepository.save(player);

    // 生成token(使用player的ID)
    const token = player.id;

    return {
      success: true,
      message: '注册成功',
      token,
      user_id: player.id,
      username: player.username,
      display_name: player.displayName,
    };
  }

  async login(username: string, password: string) {
    const player = await this.playerRepository.findOne({
      where: { username },
    });

    if (!player) {
      return {
        success: false,
        message: '用户名或密码错误',
      };
    }

    const isPasswordValid = await bcrypt.compare(password, player.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: '用户名或密码错误',
      };
    }

    player.lastLogin = new Date();
    await this.playerRepository.save(player);

    // 生成token(使用player的ID)
    const token = player.id;

    return {
      success: true,
      message: '登录成功',
      token,
      user_id: player.id,
      username: player.username,
      display_name: player.displayName,
    };
  }

  async validatePlayer(playerId: string) {
    const player = await this.playerRepository.findOne({
      where: { id: playerId },
    });

    if (!player) {
      throw new UnauthorizedException('Player not found');
    }

    const { password: _, ...result } = player;
    return result;
  }
}
