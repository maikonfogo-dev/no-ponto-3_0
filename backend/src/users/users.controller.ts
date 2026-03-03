import { Controller, Get, Patch, Param, Body, UseGuards, Request, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('employees')
  async getEmployees(@Request() req) {
    // req.user is populated by JwtStrategy and is the User entity
    const user = req.user;
    if (!user || !user.company) {
      return [];
    }
    return this.usersService.findByCompany(user.company.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const manager = req.user;
    const user = await this.usersService.findOne(+id);
    
    if (!user) throw new NotFoundException('User not found');
    if (user.company.id !== manager.company.id) throw new ForbiddenException('Access denied');
    
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const manager = req.user;
    const userToUpdate = await this.usersService.findOne(+id);

    if (!userToUpdate) {
        throw new NotFoundException('User not found');
    }
    
    // Check if manager belongs to same company
    if (userToUpdate.company.id !== manager.company.id) {
        throw new ForbiddenException('You can only manage employees from your company');
    }

    return this.usersService.update(+id, updateUserDto);
  }
}
