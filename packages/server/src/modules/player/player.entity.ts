import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PlayerStatus } from '@mud-game/shared';

@Entity('players')
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  displayName: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 100 })
  health: number;

  @Column({ default: 100 })
  maxHealth: number;

  @Column({ default: 50 })
  mana: number;

  @Column({ default: 50 })
  maxMana: number;

  @Column({ default: 'room_005' })
  currentRoomId: string;

  @Column('jsonb', { default: {} })
  inventory: any;

  @Column('jsonb', { default: {} })
  equipment: any;

  @Column('jsonb', {
    default: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
  })
  attributes: any;

  @Column({
    type: 'enum',
    enum: PlayerStatus,
    default: PlayerStatus.OFFLINE,
  })
  status: PlayerStatus;

  @Column({ default: 100 })
  gold: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastLogin: Date;
}
