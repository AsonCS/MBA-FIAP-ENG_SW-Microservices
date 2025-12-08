import { Module } from '@nestjs/common';
import { KafkaService } from './infrastructure/kafka.service';
import { SubjectsService } from './application/subjects.service';
import { SubjectsController } from './interfaces/subjects.controller';
import { UsersModule } from '../users/users.module';

/**
 * SubjectsModule
 * Handles message publishing to Kafka topics by subject
 * Follows DDD bounded context principle
 */
@Module({
  imports: [UsersModule],
  providers: [KafkaService, SubjectsService],
  controllers: [SubjectsController],
  exports: [KafkaService, SubjectsService],
})
export class SubjectsModule {}
