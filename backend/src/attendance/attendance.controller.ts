import { Controller, Post, Body, UseGuards, Request, Get, BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceType } from '../entities/attendance-record.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  async create(@Request() req, @Body() body: { type: string; latitude: number; longitude: number }) {
    if (!Object.values(AttendanceType).includes(body.type as AttendanceType)) {
      throw new BadRequestException('Invalid attendance type');
    }
    
    // User from JWT already has company loaded if we updated JwtStrategy or AuthService properly.
    // However, JwtStrategy usually loads user from DB. Let's check JwtStrategy.
    // If JwtStrategy uses UsersService.findOne, we need to ensure it loads relations.
    // If not, we might need to load it here or rely on what's in request.
    
    return this.attendanceService.create(req.user, body.type as AttendanceType, body.latitude, body.longitude);
  }

  @Get()
  async findAll(@Request() req) {
    return this.attendanceService.findAllByUser(req.user);
  }
}
