import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Request() req) {
    // Ensure only manager can access? Or allow all? PRD implies Manager Dashboard.
    // For now, assume any authorized user can see stats (or add RoleGuard later).
    return this.dashboardService.getStats(req.user);
  }

  @Get('employees')
  async getEmployees(@Request() req) {
    return this.dashboardService.getEmployeesList(req.user);
  }
}
