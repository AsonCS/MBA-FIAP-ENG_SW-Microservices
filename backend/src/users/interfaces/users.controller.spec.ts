import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../application/users.service';
import { CreateUserDto, UpdateUserDto, UserDto } from './dtos/user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUserDto: UserDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    createdAt: new Date('2025-12-01T10:00:00Z'),
  };

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        password: 'password123',
      };

      mockUsersService.create.mockResolvedValue(mockUserDto);

      const result = await controller.create(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUserDto);
    });

    it('should throw error if creation fails', async () => {
      const createUserDto: CreateUserDto = {
        username: 'existinguser',
        password: 'password123',
      };

      mockUsersService.create.mockRejectedValue(
        new Error('Username already exists'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [mockUserDto, { ...mockUserDto, id: 'id2', username: 'user2' }];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no users exist', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find a user by ID', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUserDto);

      const result = await controller.findOne(mockUserDto.id);

      expect(usersService.findOne).toHaveBeenCalledWith(mockUserDto.id);
      expect(result).toEqual(mockUserDto);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        username: 'updateduser',
      };

      const updatedUser = { ...mockUserDto, username: 'updateduser' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockUserDto.id, updateUserDto);

      expect(usersService.update).toHaveBeenCalledWith(
        mockUserDto.id,
        updateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      const updateUserDto: UpdateUserDto = {};
      mockUsersService.update.mockResolvedValue(null);

      await expect(
        controller.update('non-existent-id', updateUserDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error on validation failure', async () => {
      const updateUserDto: UpdateUserDto = { password: 'short' };
      mockUsersService.update.mockRejectedValue(
        new Error('Password too short'),
      );

      await expect(
        controller.update(mockUserDto.id, updateUserDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      mockUsersService.delete.mockResolvedValue(true);

      await controller.delete(mockUserDto.id);

      expect(usersService.delete).toHaveBeenCalledWith(mockUserDto.id);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersService.delete.mockResolvedValue(false);

      await expect(controller.delete('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
