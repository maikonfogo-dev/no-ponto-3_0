import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdjustmentRequest, AdjustmentStatus } from '../entities/adjustment-request.entity';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class AdjustmentsService {
  constructor(
    @InjectRepository(AdjustmentRequest)
    private adjustmentsRepository: Repository<AdjustmentRequest>,
  ) {}

  async create(user: User, data: Partial<AdjustmentRequest>) {
    const adjustment = this.adjustmentsRepository.create({
      ...data,
      user,
      status: AdjustmentStatus.PENDING,
    });
    return this.adjustmentsRepository.save(adjustment);
  }

  async findAllByUser(user: User) {
    return this.adjustmentsRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPendingForManager(manager: User) {
    return this.adjustmentsRepository.find({
      where: { 
        user: { company: { id: manager.company.id } },
        status: AdjustmentStatus.PENDING 
      },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  async respond(manager: User, id: number, status: AdjustmentStatus, observation?: string) {
    const adjustment = await this.adjustmentsRepository.findOne({ 
      where: { id },
      relations: ['user', 'user.company']
    });

    if (!adjustment) {
      throw new NotFoundException('Adjustment not found');
    }

    // Verify if manager belongs to same company
    if (adjustment.user.company.id !== manager.company.id) {
      throw new ForbiddenException('You cannot manage this adjustment');
    }

    adjustment.status = status;
    adjustment.approvedBy = manager.id;
    adjustment.observation = observation ?? ''; // Ensure string
    return this.adjustmentsRepository.save(adjustment);
  }
}
