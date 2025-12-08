import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

/**
 * CreateUserDto
 * Request DTO for user registration
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username (alphanumeric, underscore, hyphen only)',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username is required' })
  @MinLength(3, { message: 'Username must be at least 3 characters' })
  @MaxLength(50, { message: 'Username must not exceed 50 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Username can only contain alphanumeric characters, underscores, and hyphens',
  })
  username: string;

  @ApiProperty({
    example: 'SecurePass123!',
    description: 'User password (minimum 6 characters)',
    minLength: 6,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}

/**
 * UpdateUserDto
 * Request DTO for updating user (all fields optional)
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}

/**
 * UserDto
 * Response DTO for user data (without password)
 */
export class UserDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User unique identifier (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'john_doe',
    description: 'Username',
  })
  username: string;

  @ApiProperty({
    example: '2025-12-01T10:00:00Z',
    description: 'User creation timestamp',
  })
  createdAt: Date;
}
