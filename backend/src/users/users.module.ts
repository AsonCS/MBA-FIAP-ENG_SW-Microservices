import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';
import { UserRepository } from './infrastructure/user.repository';
import { UsersService } from './application/users.service';
import { UsersController } from './interfaces/users.controller';
import { CommonModule } from '../shared/common.module';

/**
 * UsersModule
 * Encapsulates all user-related functionality
 * Follows DDD bounded context principle
 */
@Module({
  imports: [TypeOrmModule.forFeature([User]), CommonModule],
  controllers: [UsersController],
  providers: [UserRepository, UsersService],
  exports: [UsersService, UserRepository],
})
export class UsersModule {}
