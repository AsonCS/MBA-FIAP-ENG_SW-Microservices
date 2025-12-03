import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/domain/user.entity';
import { PasswordService } from '../../shared/services/password.service';

/**
 * AuthService
 * Handles authentication logic including password validation and JWT token generation
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  /**
   * Validate user credentials by comparing password
   * @param user User entity
   * @param password Password to validate
   * @returns true if password matches, false otherwise
   */
  async validateUser(user: User, password: string): Promise<boolean> {
    if (!user || !password) {
      return false;
    }

    return await this.passwordService.compare(password, user.password);
  }

  /**
   * Generate JWT access token for authenticated user
   * @param user User entity
   * @returns Object with JWT token
   */
  async login(user: User): Promise<{ accessToken: string }> {
    const payload = {
      sub: user.id,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
    };
  }

  /**
   * Hash a plain text password using bcrypt
   * @param password Plain text password to hash
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    return this.passwordService.hash(password);
  }

  /**
   * Verify JWT token and extract payload
   * @param token JWT token to verify
   * @returns Decoded token payload
   * @throws UnauthorizedException if token is invalid
   */
  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
