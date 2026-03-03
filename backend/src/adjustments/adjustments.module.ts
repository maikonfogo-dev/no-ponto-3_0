import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdjustmentsService } from './adjustments.service';
import { AdjustmentsController } from './adjustments.controller';
import { AdjustmentRequest } from '../entities/adjustment-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdjustmentRequest]),
  ],
  controllers: [AdjustmentsController],
  providers: [AdjustmentsService],
})
export class AdjustmentsModule {}
