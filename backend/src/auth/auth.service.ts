import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    // In a real app, use bcrypt.compare(pass, user.passwordHash)
    // For now, we assume user.passwordHash is the plain password or a hash
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async registerTestUser() {
    // Hardcoded for testing
    const email = 'teste@noponto.com.br';
    const cpf = '12345678900';
    const password = '123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if exists
    let user = await this.usersService.findOneByEmail(email);
    if (!user) {
      user = await this.usersService.createTestUser(email, cpf, passwordHash);
    }

    // Create Manager
    const managerEmail = 'gestor@noponto.com.br';
    const managerCpf = '00987654321';
    const managerPass = '123';
    const managerHash = await bcrypt.hash(managerPass, 10);

    let manager = await this.usersService.findOneByEmail(managerEmail);
    if (!manager) {
       // We need a method to create manager, or reuse createTestUser with role param
       // For now, let's just use createTestUser and update role manually if needed, 
       // or better, update UsersService to accept role.
       // Let's assume createTestUser creates EMPLOYEE. 
       // I'll update UsersService.createTestUser to accept role.
       manager = await this.usersService.createTestUser(managerEmail, managerCpf, managerHash, 'manager');
    }

    return { 
      employee: { email, password },
      manager: { email: managerEmail, password: managerPass }
    };
  }
}
