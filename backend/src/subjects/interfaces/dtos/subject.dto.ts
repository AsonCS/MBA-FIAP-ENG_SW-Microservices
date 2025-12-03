import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * PublishMessageDto
 * Request DTO for publishing message to a subject
 */
export class PublishMessageDto {
  @ApiProperty({
    example: 'Great game yesterday!',
    description: 'Message content to publish',
    maxLength: 500,
  })
  @IsString({ message: 'Message must be a string' })
  @IsNotEmpty({ message: 'Message cannot be empty' })
  @MaxLength(500, {
    message: 'Message cannot exceed 500 characters',
  })
  message: string;
}

/**
 * PublishMessageResponseDto
 * Response DTO after successful message publication
 */
export class PublishMessageResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the message was published successfully',
  })
  success: boolean;

  @ApiProperty({
    example: 'Message published to sports topic',
    description: 'Confirmation message',
  })
  message: string;
}

/**
 * AvailableSubjectsDto
 * Response DTO listing all available subjects
 */
export class AvailableSubjectsDto {
  @ApiProperty({
    example: ['sports', 'healthy', 'news', 'food', 'autos'],
    description: 'List of available subject/topic names',
  })
  subjects: string[];
}
