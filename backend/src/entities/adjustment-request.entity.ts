import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

export enum AdjustmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('ajustes')
export class AdjustmentRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reference_date', type: 'date' })
  referenceDate: Date;

  @Column()
  reason: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: AdjustmentStatus,
    default: AdjustmentStatus.PENDING,
  })
  status: AdjustmentStatus;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: number; // User ID of the manager

  @Column({ nullable: true })
  observation: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.adjustmentRequests)
  user: User;
}
