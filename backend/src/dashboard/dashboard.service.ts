import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { AttendanceRecord } from '../entities/attendance-record.entity';
import { AdjustmentRequest, AdjustmentStatus } from '../entities/adjustment-request.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
    @InjectRepository(AdjustmentRequest)
    private adjustmentRepository: Repository<AdjustmentRequest>,
  ) {}

  async getEmployeesList(manager: User) {
    if (!manager.company) return [];

    const employees = await this.usersRepository.find({
      where: { company: { id: manager.company.id } },
      order: { name: 'ASC' },
      select: ['id', 'name', 'email', 'role', 'cpf', 'active']
    });

    if (employees.length === 0) return [];

    const employeeIds = employees.map(e => e.id);
    
    const records = await this.attendanceRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.user', 'user')
      .where('record.userId IN (:...userIds)', { userIds: employeeIds })
      .orderBy('record.timestamp', 'DESC')
      .getMany();

    const lastRecords = new Map<number, AttendanceRecord>();
    for (const record of records) {
      if (!lastRecords.has(record.user.id)) {
        lastRecords.set(record.user.id, record);
      }
    }

    return employees.map(emp => {
      const lastRecord = lastRecords.get(emp.id);
      return {
        ...emp,
        lastAttendance: lastRecord ? {
          type: lastRecord.type,
          timestamp: lastRecord.timestamp,
          withinRadius: lastRecord.withinRadius
        } : null
      };
    });
  }

  async getStats(manager: User) {
    if (!manager.company) {
      return {
        totalEmployees: 0,
        pendingAdjustments: 0,
        incompleteRecords: 0,
      };
    }

    const companyId = manager.company.id;

    // 1. Total Active Employees
    const totalEmployees = await this.usersRepository.count({
      where: { company: { id: companyId }, role: UserRole.EMPLOYEE, active: true },
    });

    // 2. Pending Adjustments
    const pendingAdjustments = await this.adjustmentRepository.count({
      where: { user: { company: { id: companyId } }, status: AdjustmentStatus.PENDING },
    });

    // 3. Incomplete Records Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayRecords = await this.attendanceRepository.find({
      where: { 
        user: { company: { id: companyId } },
        timestamp: Between(today, tomorrow)
      },
      relations: ['user']
    });

    const userRecords: Record<number, number> = {};
    todayRecords.forEach(r => {
      userRecords[r.user.id] = (userRecords[r.user.id] || 0) + 1;
    });

    let incompleteRecords = 0;
    Object.values(userRecords).forEach(count => {
      if (count % 2 !== 0) incompleteRecords++;
    });

    return {
      totalEmployees,
      pendingAdjustments,
      incompleteRecords,
    };
  }
}
