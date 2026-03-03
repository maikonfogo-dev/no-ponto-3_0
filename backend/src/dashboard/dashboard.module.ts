import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../entities/user.entity';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { AdjustmentRequest } from '../entities/adjustment-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AttendanceRecord, AdjustmentRequest]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
