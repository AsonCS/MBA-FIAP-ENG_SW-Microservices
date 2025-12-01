import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';

/**
 * UserRepository
 * Implements the repository pattern for User entity persistence
 * Provides abstraction over TypeORM for data access
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeOrmRepository: Repository<User>,
  ) {}

  /**
   * Create and save a new user
   * @param user User entity to persist
   * @returns The saved user with generated ID
   */
  async create(user: User): Promise<User> {
    return this.typeOrmRepository.save(user);
  }

  /**
   * Find a user by ID
   * @param id User UUID
   * @returns User entity or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return this.typeOrmRepository.findOne({
      where: { id },
    });
  }

  /**
   * Find a user by username
   * @param username Username to search for
   * @returns User entity or null if not found
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.typeOrmRepository.findOne({
      where: { username },
    });
  }

  /**
   * Find all users
   * @returns Array of all users
   */
  async findAll(): Promise<User[]> {
    return this.typeOrmRepository.find();
  }

  /**
   * Update an existing user
   * @param id User UUID
   * @param updates Partial user data to update
   * @returns Updated user entity or null if not found
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    await this.typeOrmRepository.update(id, updates);
    return this.findById(id);
  }

  /**
   * Delete a user by ID
   * @param id User UUID
   * @returns true if user was deleted, false if not found
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.typeOrmRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if a username already exists
   * @param username Username to check
   * @returns true if username exists, false otherwise
   */
  async existsByUsername(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }
}
