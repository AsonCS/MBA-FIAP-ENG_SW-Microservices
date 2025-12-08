import { Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';

/**
 * CommonModule
 * Shared utilities and services used across multiple modules
 * Helps break circular dependencies
 */
@Module({
  providers: [PasswordService],
  exports: [PasswordService],
})
export class CommonModule {}
