/**
 * Username Value Object
 * Encapsulates username validation logic following DDD principles
 */
export class Username {
  private readonly value: string;

  private constructor(value: string) {
    this.validateUsername(value);
    this.value = value;
  }

  /**
   * Factory method to create a Username instance
   * @param value The username string to validate
   * @throws Error if username is invalid
   */
  static create(value: string): Username {
    return new Username(value);
  }

  /**
   * Get the username string value
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Validate username according to business rules
   * @param value The username to validate
   * @throws Error if validation fails
   */
  private validateUsername(value: string): void {
    if (!value || value.trim() === '') {
      throw new Error('Username cannot be empty');
    }

    if (value.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (value.length > 50) {
      throw new Error('Username must not exceed 50 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      throw new Error(
        'Username can only contain alphanumeric characters, underscores, and hyphens',
      );
    }
  }

  /**
   * Compare two Username instances
   */
  equals(other: Username): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
