import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../application/auth.service';
import { UsersService } from '../../users/application/users.service';
import { LoginDto } from './dtos/login.dto';
import { User } from '../../users/domain/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    password: '$2b$10$hashedpassword123',
    createdAt: new Date('2025-12-01T10:00:00Z'),
  };

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
  };

  const mockUsersService = {
    findByUsername: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return JWT token on successful login', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const mockToken = { accessToken: 'jwt-token-abc123' };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      mockAuthService.validateUser.mockResolvedValue(true);
      mockAuthService.login.mockResolvedValue(mockToken);

      const result = await controller.login(loginDto);

      expect(usersService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(authService.validateUser).toHaveBeenCalledWith(
        mockUser,
        'password123',
      );
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockToken);
    });

    it('should throw error if user not found', async () => {
      const loginDto: LoginDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(controller.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if password is invalid', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      mockAuthService.validateUser.mockResolvedValue(false);

      await expect(controller.login(loginDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
