import { Injectable, BadRequestException } from '@nestjs/common';
import { KafkaService } from '../infrastructure/kafka.service';
import { SubjectType, isValidSubject } from '../domain/subject.enum';
import { User } from '../../users/domain/user.entity';

/**
 * PublishMessageDto
 * Data Transfer Object for publishing a message to a subject
 */
export class PublishMessageDto {
  message: string;
}

/**
 * SubjectMessage
 * Message payload sent to Kafka
 */
export class SubjectMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

/**
 * SubjectsService
 * Handles publishing messages to Kafka topics by subject
 */
@Injectable()
export class SubjectsService {
  constructor(private readonly kafkaService: KafkaService) {}

  /**
   * Publish a message to a subject topic
   * @param subject Subject/topic name (enum validated)
   * @param message Message content from user
   * @param user Authenticated user publishing the message
   * @returns Message publish confirmation
   * @throws BadRequestException if subject is invalid or message is empty
   */
  async publishMessage(
    subject: string,
    message: string,
    user: User,
  ): Promise<{ success: boolean; message: string }> {
    // Validate subject
    if (!isValidSubject(subject)) {
      throw new BadRequestException(
        `Invalid subject. Valid subjects are: ${Object.values(SubjectType).join(', ')}`,
      );
    }

    // Validate message
    if (!message || message.trim() === '') {
      throw new BadRequestException('Message content cannot be empty');
    }

    if (message.length > 500) {
      throw new BadRequestException('Message cannot exceed 500 characters');
    }

    // Construct payload
    const payload: SubjectMessage = {
      id: this.generateMessageId(),
      userId: user.id,
      username: user.username,
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      // Publish to Kafka
      await this.kafkaService.publishMessage(subject, payload);

      return {
        success: true,
        message: `Message published to ${subject} topic`,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to publish message: ${error.message}`,
      );
    }
  }

  /**
   * Get all valid subject types
   */
  async getAvailableSubjects(): Promise<string[]> {
    return Object.values(SubjectType);
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
