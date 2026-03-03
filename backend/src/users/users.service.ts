import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Company } from '../entities/company.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Company)
    private companiesRepository: Repository<Company>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, relations: ['company'] });
  }

  async findOneByCpf(cpf: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { cpf } });
  }

  async findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id }, relations: ['company'] });
  }

  async findByCompany(companyId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { company: { id: companyId } },
      order: { name: 'ASC' },
      select: ['id', 'name', 'email', 'role', 'cpf', 'active', 'allowedRadiusMeters'] // Added fields
    });
  }

  async update(id: number, updateUserDto: { active?: boolean, allowedRadiusMeters?: number }): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    if (updateUserDto.active !== undefined) user.active = updateUserDto.active;
    if (updateUserDto.allowedRadiusMeters !== undefined) user.allowedRadiusMeters = updateUserDto.allowedRadiusMeters;
    
    return this.usersRepository.save(user);
  }

  // Helper for seeding/testing
  async createTestUser(email: string, cpf: string, passwordHash: string, role: string = 'employee'): Promise<User> {
    let company = await this.companiesRepository.findOne({ where: { name: 'Empresa Teste' } });
    if (!company) {
      company = this.companiesRepository.create({
        name: 'Empresa Teste',
        allowedRadiusMeters: 200,
        latitude: -23.550520, // Example: São Paulo center
        longitude: -46.633308,
      });
      await this.companiesRepository.save(company);
    }

    const userRole = role === 'manager' ? UserRole.MANAGER : UserRole.EMPLOYEE;

    const user = this.usersRepository.create({
      name: role === 'manager' ? 'Gestor Teste' : 'Colaborador Teste',
      email,
      cpf,
      passwordHash,
      role: userRole,
      company,
    });
    return this.usersRepository.save(user);
  }
}
