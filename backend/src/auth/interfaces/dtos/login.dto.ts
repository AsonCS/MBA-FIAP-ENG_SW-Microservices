import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * LoginDto
 * Request DTO for user login endpoint
 */
export class LoginDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'Username for authentication',
  })
  @IsString()
  @IsNotEmpty({ message: 'Username is required' })
  username: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

/**
 * LoginResponseDto
 * Response DTO for successful login
 */
export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0',
    description: 'JWT access token',
  })
  accessToken: string;
}
