import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceRecord, AttendanceType } from '../entities/attendance-record.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private attendanceRepository: Repository<AttendanceRecord>,
  ) {}

  async create(user: User, type: AttendanceType, latitude: number, longitude: number) {
    // 1. Validate sequence (optional for MVP but good to have)
    // const lastRecord = await this.attendanceRepository.findOne({ where: { user: { id: user.id } }, order: { timestamp: 'DESC' } });
    
    // 2. Check radius (Server-side validation)
    const distance = this.getDistanceFromLatLonInM(latitude, longitude, user.company.latitude, user.company.longitude);
    const allowedRadius = user.allowedRadiusMeters ?? user.company.allowedRadiusMeters;
    const withinRadius = distance <= allowedRadius;

    // 3. Create record
    const record = this.attendanceRepository.create({
      user,
      type,
      latitude,
      longitude,
      withinRadius,
      timestamp: new Date(),
    });

    return this.attendanceRepository.save(record);
  }

  async findAllByUser(user: User) {
    return this.attendanceRepository.find({
      where: { user: { id: user.id } },
      order: { timestamp: 'DESC' },
    });
  }

  async getLastAttendanceForUsers(userIds: number[]): Promise<Map<number, AttendanceRecord>> {
    if (userIds.length === 0) return new Map();
    
    // Using QueryBuilder to get the latest record for each user
    // This is a bit tricky in standard SQL without window functions or DISTINCT ON (Postgres specific)
    // Let's use a simple approach: fetch latest records for these users in a reasonable time window (e.g. last 24h) or just all latest
    // For MVP/small scale, we can fetch latest per user via subqueries or just raw query
    
    const records = await this.attendanceRepository
      .createQueryBuilder('record')
      .where('record.userId IN (:...userIds)', { userIds })
      .orderBy('record.timestamp', 'DESC')
      .getMany();

    // In-memory grouping (efficient enough for < 1000 records)
    const lastRecords = new Map<number, AttendanceRecord>();
    for (const record of records) {
      // Since it's ordered by DESC, the first one we see for a user is the latest
      if (!lastRecords.has(record.user.id)) {
        lastRecords.set(record.user.id, record);
      }
    }
    return lastRecords;
  }

  // Helper
  private getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
    var R = 6371e3; // Radius of the earth in m
    var dLat = this.deg2rad(lat2 - lat1);
    var dLon = this.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat1)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in m
    return d;
  }

  private deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
}
