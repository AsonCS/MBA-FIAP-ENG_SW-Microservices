// @typescript-eslint/no-unsafe-member-access

import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from '../application/users.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './dtos/user.dto';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard';

/**
 * UsersController
 * Handles all user-related HTTP endpoints
 */
@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /api/users
   * Register a new user
   */
  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create new user',
    description: 'Register a new user with username and password',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'john_doe',
      createdAt: '2025-12-01T10:00:00Z',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or username already exists',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * GET /api/users
   * Get all users (protected)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all users',
    description: 'Retrieve all registered users (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    type: [UserDto],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'john_doe',
        createdAt: '2025-12-01T10:00:00Z',
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        username: 'jane_smith',
        createdAt: '2025-12-01T11:00:00Z',
      },
    ],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
  })
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }

  /**
   * GET /api/users/:id
   * Get user by ID (protected)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Retrieve specific user details by ID (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    type: UserDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      username: 'john_doe',
      createdAt: '2025-12-01T10:00:00Z',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
  })
  async findOne(@Param('id') id: string): Promise<UserDto> {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * PUT /api/users/:id
   * Update user (protected)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOperation({
    summary: 'Update user',
    description: 'Update user information (requires authentication)',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: UserDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete user (protected)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(204)
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOperation({
    summary: 'Delete user',
    description: 'Delete a user by ID (requires authentication)',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
  })
  async delete(@Param('id') id: string): Promise<void> {
    const deleted = await this.usersService.delete(id);
    if (!deleted) {
      throw new NotFoundException('User not found');
    }
  }
}
