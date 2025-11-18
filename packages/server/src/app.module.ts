import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { PlayerModule } from './modules/player/player.module';
import { WorldModule } from './modules/world/world.module';
import { CombatModule } from './modules/combat/combat.module';
import { EconomyModule } from './modules/economy/economy.module';
import { ChatModule } from './modules/chat/chat.module';
import { GameModule } from './modules/game/game.module';
import { NpcModule } from './modules/npc/npc.module';
import { ItemModule } from './modules/item/item.module';
import { QuestModule } from './modules/quest/quest.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database - PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: configService.get('DB_PORT') || 5432,
        username: configService.get('DB_USERNAME') || 'postgres',
        password: configService.get('DB_PASSWORD') || 'postgres',
        database: configService.get('DB_DATABASE') || 'xiuxian_mud',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Game modules
    AuthModule,
    PlayerModule,
    WorldModule,
    CombatModule,
    EconomyModule,
    ChatModule,
    GameModule,
    NpcModule,
    ItemModule,
    QuestModule,
  ],
})
export class AppModule {}
