import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { AuthController } from './interfaces/auth.controller';
import { UsersModule } from '../users/users.module';
import { CommonModule } from '../shared/common.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    UsersModule,
    CommonModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
