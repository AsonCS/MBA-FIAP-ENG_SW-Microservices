import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * PasswordService
 * Shared service for password hashing and validation
 * Used by multiple modules to break circular dependencies
 */
@Injectable()
export class PasswordService {
  /**
   * Hash a plain text password using bcrypt
   * @param password Plain text password to hash
   * @returns Hashed password
   */
  async hash(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password Plain text password to compare
   * @param hash Hashed password to compare against
   * @returns true if password matches hash, false otherwise
   */
  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }
}
