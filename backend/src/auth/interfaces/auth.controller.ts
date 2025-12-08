import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../application/auth.service';
import { UsersService } from '../../users/application/users.service';
import { LoginDto, LoginResponseDto } from './dtos/login.dto';

/**
 * AuthController
 * Handles all authentication-related HTTP endpoints
 */
@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * POST /api/auth/login
   * Authenticate user with credentials and return JWT token
   */
  @Post('login')
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with username and password, returns JWT token',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        value: {
          username: 'john_doe',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials or validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'User not found or password incorrect',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    // Find user by username
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    // Validate password
    const isPasswordValid = await this.authService.validateUser(user, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    // Generate JWT token
    return this.authService.login(user);
  }
}
