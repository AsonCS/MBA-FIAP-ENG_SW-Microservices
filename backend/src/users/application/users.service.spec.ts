import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UsersService, CreateUserDto, UserResponseDto } from './users.service';
import { UserRepository } from '../infrastructure/user.repository';
import { AuthService } from '../../auth/application/auth.service';
import { User } from '../domain/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: UserRepository;
  let authService: AuthService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    password: '$2b$10$hashedpassword123',
    createdAt: new Date('2025-12-01T10:00:00Z'),
  };

  const mockUserResponseDto: UserResponseDto = {
    id: mockUser.id,
    username: mockUser.username,
    createdAt: mockUser.createdAt,
  };

  const mockUserRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUsername: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    existsByUsername: jest.fn(),
  };

  const mockAuthService = {
    hashPassword: jest.fn(),
    validateUser: jest.fn(),
    login: jest.fn(),
    verifyToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<UserRepository>(UserRepository);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with valid data', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
      };

      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockAuthService.hashPassword.mockResolvedValue(
        '$2b$10$hashedpassword123',
      );
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(userRepository.existsByUsername).toHaveBeenCalledWith('newuser');
      expect(authService.hashPassword).toHaveBeenCalledWith('password123');
      expect(userRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockUserResponseDto);
      expect((result as any).password).toBeUndefined();
    });

    it('should throw error if username already exists', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
      };

      mockUserRepository.existsByUsername.mockResolvedValue(true);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if username is too short', async () => {
      const createUserDto: CreateUserDto = {
        username: 'ab',
        password: 'password123',
      };

      mockUserRepository.existsByUsername.mockResolvedValue(false);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if username is too long', async () => {
      const createUserDto: CreateUserDto = {
        username: 'a'.repeat(51),
        password: 'password123',
      };

      mockUserRepository.existsByUsername.mockResolvedValue(false);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if username contains invalid characters', async () => {
      const createUserDto: CreateUserDto = {
        username: 'user@invalid',
        password: 'password123',
      };

      mockUserRepository.existsByUsername.mockResolvedValue(false);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if password is too short', async () => {
      const createUserDto: CreateUserDto = {
        username: 'validuser',
        password: 'short',
      };

      mockUserRepository.existsByUsername.mockResolvedValue(false);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if password is empty', async () => {
      const createUserDto: CreateUserDto = {
        username: 'validuser',
        password: '',
      };

      mockUserRepository.existsByUsername.mockResolvedValue(false);

      await expect(service.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('should find a user by ID', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);

      expect(userRepository.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUserResponseDto);
      expect((result as any)?.password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await service.findOne('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      const result = await service.findByUsername('testuser');

      expect(userRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(result).toEqual(mockUser);
    });

    it('should return null if username not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      const result = await service.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users as DTOs', async () => {
      const mockUsers = [mockUser, { ...mockUser, id: 'id2', username: 'user2' }];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(userRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(mockUserResponseDto);
      result.forEach((user) => {
        expect((user as any).password).toBeUndefined();
      });
    });

    it('should return empty array if no users exist', async () => {
      mockUserRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update user username', async () => {
      const updates = { username: 'updateduser' };
      const updatedUser = { ...mockUser, username: 'updateduser' };
      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, updates);

      expect(userRepository.existsByUsername).toHaveBeenCalledWith(
        'updateduser',
      );
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, updates);
      expect(result?.username).toBe('updateduser');
    });

    it('should update user password', async () => {
      const updates = { password: 'newpassword123' };
      mockAuthService.hashPassword.mockResolvedValue(
        '$2b$10$newhashed',
      );
      mockUserRepository.update.mockResolvedValue(mockUser);

      await service.update(mockUser.id, updates);

      expect(authService.hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(userRepository.update).toHaveBeenCalledWith(mockUser.id, {
        password: '$2b$10$newhashed',
      });
    });

    it('should throw error if new username already exists', async () => {
      const updates = { username: 'takenuser' };
      mockUserRepository.existsByUsername.mockResolvedValue(true);

      await expect(service.update(mockUser.id, updates)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if new password is too short', async () => {
      const updates = { password: 'short' };

      await expect(service.update(mockUser.id, updates)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should return null if user not found', async () => {
      const updates = { username: 'updated' };
      mockUserRepository.existsByUsername.mockResolvedValue(false);
      mockUserRepository.update.mockResolvedValue(null);

      const result = await service.update('non-existent-id', updates);

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await service.delete(mockUser.id);

      expect(userRepository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      mockUserRepository.delete.mockResolvedValue(false);

      const result = await service.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });
});
