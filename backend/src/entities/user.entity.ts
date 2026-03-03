import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from './company.entity';
import { AttendanceRecord } from './attendance-record.entity';
import { AdjustmentRequest } from './adjustment-request.entity';

export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'simple-enum',
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'allowed_radius_meters', type: 'float', nullable: true })
  allowedRadiusMeters: number | null;

  @ManyToOne(() => Company, (company) => company.users)
  company: Company;

  @OneToMany(() => AttendanceRecord, (record) => record.user)
  attendanceRecords: AttendanceRecord[];

  @OneToMany(() => AdjustmentRequest, (request) => request.user)
  adjustmentRequests: AdjustmentRequest[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
