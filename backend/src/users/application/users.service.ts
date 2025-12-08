import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UserRepository } from '../infrastructure/user.repository';
import { PasswordService } from '../../shared/services/password.service';
import { Username } from '../domain/value-objects/username.vo';

/**
 * CreateUserDto
 * Data Transfer Object for user creation
 */
export class CreateUserDto {
  username: string;
  password: string;
}

/**
 * UserResponseDto
 * Data Transfer Object for user responses (excludes password)
 */
export class UserResponseDto {
  id: string;
  username: string;
  createdAt: Date;
}

/**
 * UsersService
 * Handles all user-related business logic
 * Implements use cases for user creation and retrieval
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Create a new user with password hashing
   * @param createUserDto Contains username and password
   * @returns Created user (without password)
   * @throws BadRequestException if username already exists or validation fails
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { username, password } = createUserDto;

    // Validate username using Value Object
    try {
      Username.create(username);
    } catch (error) {
      throw new BadRequestException(error.message);
    }

    // Check if username already exists
    const existingUser = await this.userRepository.existsByUsername(username);
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }

    // Validate password
    if (!password || password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(password);

    // Create and persist user
    const user = new User({
      username,
      password: hashedPassword,
    });

    const createdUser = await this.userRepository.create(user);

    // Return user without password
    return this.toUserResponseDto(createdUser);
  }

  /**
   * Find a user by ID
   * @param id User UUID
   * @returns User data (without password) or null if not found
   */
  async findOne(id: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return null;
    }
    return this.toUserResponseDto(user);
  }

  /**
   * Find a user by username
   * @param username Username to search for
   * @returns User entity or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  /**
   * Get all users (paginated for large datasets)
   * @returns Array of all users (without passwords)
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => this.toUserResponseDto(user));
  }

  /**
   * Update user information
   * @param id User UUID
   * @param updates Partial user data to update
   * @returns Updated user (without password) or null if not found
   * @throws BadRequestException if validation fails
   */
  async update(
    id: string,
    updates: Partial<CreateUserDto>,
  ): Promise<UserResponseDto | null> {
    // Validate username if provided
    if (updates.username) {
      try {
        Username.create(updates.username);
      } catch (error) {
        throw new BadRequestException(error.message);
      }

      // Check if new username already exists
      const existingUser = await this.userRepository.existsByUsername(
        updates.username,
      );
      if (existingUser) {
        throw new BadRequestException('Username already exists');
      }
    }

    // Hash password if provided
    const updateData = { ...updates };
    if (updates.password) {
      if (updates.password.length < 6) {
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      }
      updateData.password = await this.passwordService.hash(updates.password);
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      return null;
    }

    return this.toUserResponseDto(updatedUser);
  }

  /**
   * Delete a user
   * @param id User UUID
   * @returns true if deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }

  /**
   * Convert User entity to response DTO (excludes password)
   * @param user User entity
   * @returns UserResponseDto without sensitive data
   */
  private toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
    };
  }
}
