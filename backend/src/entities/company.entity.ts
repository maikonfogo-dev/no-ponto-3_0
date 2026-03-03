import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'float', default: 0 })
  latitude: number;

  @Column({ type: 'float', default: 0 })
  longitude: number;

  @Column({ name: 'allowed_radius_meters', type: 'float', default: 100 })
  allowedRadiusMeters: number;

  @OneToMany(() => User, (user) => user.company)
  users: User[];
}
