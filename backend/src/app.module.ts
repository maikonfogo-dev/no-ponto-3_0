import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Company } from './entities/company.entity';
import { User } from './entities/user.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { AdjustmentRequest } from './entities/adjustment-request.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdjustmentsModule } from './adjustments/adjustments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbType = configService.get('DB_TYPE') || 'sqlite';
        
        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            entities: [Company, User, AttendanceRecord, AdjustmentRequest],
            synchronize: true,
            ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
          };
        }

        return {
          type: 'sqlite',
          database: 'database.sqlite',
          entities: [Company, User, AttendanceRecord, AdjustmentRequest],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    AttendanceModule,
    DashboardModule,
    AdjustmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
