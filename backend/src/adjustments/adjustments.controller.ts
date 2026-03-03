import { Controller, Post, Get, Body, Param, Put, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AdjustmentsService } from './adjustments.service';
import { AuthGuard } from '@nestjs/passport';
import { AdjustmentStatus } from '../entities/adjustment-request.entity';
import { UserRole } from '../entities/user.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('adjustments')
export class AdjustmentsController {
  constructor(private readonly adjustmentsService: AdjustmentsService) {}

  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.adjustmentsService.create(req.user, body);
  }

  @Get('my')
  async findAllMy(@Request() req) {
    return this.adjustmentsService.findAllByUser(req.user);
  }

  @Get('pending')
  async findAllPending(@Request() req) {
    if (req.user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can view pending adjustments');
    }
    return this.adjustmentsService.findAllPendingForManager(req.user);
  }

  @Put(':id/respond')
  async respond(
    @Request() req, 
    @Param('id') id: number, 
    @Body() body: { status: AdjustmentStatus; observation?: string }
  ) {
    if (req.user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can respond to adjustments');
    }
    return this.adjustmentsService.respond(req.user, id, body.status, body.observation);
  }
}
