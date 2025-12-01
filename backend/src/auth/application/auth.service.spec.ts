import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/domain/user.entity';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    password: '$2b$10$hashedpassword123', // bcrypt hashed
    createdAt: new Date('2025-12-01T10:00:00Z'),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return true if password is valid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser, 'password123');

      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(result).toBe(true);
    });

    it('should return false if password is invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(mockUser, 'wrongpassword');

      expect(result).toBe(false);
    });

    it('should return false if user is null', async () => {
      const result = await service.validateUser(null as any, 'password123');

      expect(result).toBe(false);
    });

    it('should return false if password is empty', async () => {
      const result = await service.validateUser(mockUser, '');

      expect(result).toBe(false);
    });

    it('should return false if bcrypt throws an error', async () => {
      (bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Bcrypt error'),
      );

      const result = await service.validateUser(mockUser, 'password123');

      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('should return JWT token for valid user', async () => {
      const mockToken = 'jwt-token-abc123';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
      expect(result).toEqual({ accessToken: mockToken });
    });

    it('should include userId and username in JWT payload', async () => {
      const mockToken = 'jwt-token-xyz789';
      mockJwtService.sign.mockReturnValue(mockToken);

      await service.login(mockUser);

      const callArgs = (jwtService.sign as jest.Mock).mock.calls[0][0];
      expect(callArgs.sub).toBe(mockUser.id);
      expect(callArgs.username).toBe(mockUser.username);
    });
  });

  describe('hashPassword', () => {
    it('should hash a password using bcrypt', async () => {
      const plainPassword = 'password123';
      const hashedPassword = '$2b$10$hashedpassword123';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 10);
      expect(result).toBe(hashedPassword);
    });

    it('should throw error if bcrypt fails', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Bcrypt error'));

      await expect(service.hashPassword('password123')).rejects.toThrow(
        'Bcrypt error',
      );
    });
  });

  describe('verifyToken', () => {
    it('should verify and return token payload', async () => {
      const mockToken = 'jwt-token-abc123';
      const mockPayload = {
        sub: mockUser.id,
        username: mockUser.username,
        iat: 1234567890,
      };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.verifyToken(mockToken);

      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
      expect(result).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockToken = 'invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.verifyToken(mockToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const mockToken = 'expired-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.verifyToken(mockToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
