import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum AttendanceType {
  ENTRY = 'entry',
  LUNCH_START = 'lunch_start',
  LUNCH_END = 'lunch_end',
  EXIT = 'exit',
}

@Entity('registros_ponto')
export class AttendanceRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @Column({
    type: 'simple-enum',
    enum: AttendanceType,
  })
  type: AttendanceType;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column({ name: 'within_radius' })
  withinRadius: boolean;

  @Column({ name: 'integrity_hash', nullable: true })
  integrityHash: string;

  @ManyToOne(() => User, (user) => user.attendanceRecords)
  user: User;
}
