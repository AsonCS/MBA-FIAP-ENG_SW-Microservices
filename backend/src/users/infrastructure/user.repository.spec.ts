import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from '../domain/user.entity';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let typeOrmRepository: Repository<User>;

  // Mock data
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    password: 'hashedpassword123',
    createdAt: new Date('2025-12-01T10:00:00Z'),
  };

  const mockUsers: User[] = [
    mockUser,
    {
      id: '223e4567-e89b-12d3-a456-426614174001',
      username: 'user2',
      password: 'hashedpassword456',
      createdAt: new Date('2025-12-01T11:00:00Z'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    typeOrmRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      jest.spyOn(typeOrmRepository, 'save').mockResolvedValue(mockUser);

      const result = await userRepository.create(mockUser);

      expect(typeOrmRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if save fails', async () => {
      jest
        .spyOn(typeOrmRepository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(userRepository.create(mockUser)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findById', () => {
    it('should find a user by ID', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await userRepository.findById(mockUser.id);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(null);

      const result = await userRepository.findById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should find a user by username', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await userRepository.findByUsername('testuser');

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if username not found', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(null);

      const result = await userRepository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue(mockUsers);

      const result = await userRepository.findAll();

      expect(typeOrmRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array if no users exist', async () => {
      jest.spyOn(typeOrmRepository, 'find').mockResolvedValue([]);

      const result = await userRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updatedUser = { ...mockUser, username: 'updateduser' };
      jest.spyOn(typeOrmRepository, 'update').mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(updatedUser);

      const result = await userRepository.update(mockUser.id, {
        username: 'updateduser',
      });

      expect(typeOrmRepository.update).toHaveBeenCalledWith(mockUser.id, {
        username: 'updateduser',
      });
      expect(result).toEqual(updatedUser);
    });

    it('should return null if user not found during update', async () => {
      jest.spyOn(typeOrmRepository, 'update').mockResolvedValue({
        affected: 0,
        raw: {},
        generatedMaps: [],
      });
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(null);

      const result = await userRepository.update('non-existent-id', {
        username: 'updated',
      });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a user by ID', async () => {
      jest.spyOn(typeOrmRepository, 'delete').mockResolvedValue({
        affected: 1,
        raw: {},
      });

      const result = await userRepository.delete(mockUser.id);

      expect(typeOrmRepository.delete).toHaveBeenCalledWith(mockUser.id);
      expect(result).toBe(true);
    });

    it('should return false if user not found', async () => {
      jest.spyOn(typeOrmRepository, 'delete').mockResolvedValue({
        affected: 0,
        raw: {},
      });

      const result = await userRepository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('existsByUsername', () => {
    it('should return true if username exists', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(mockUser);

      const result = await userRepository.existsByUsername('testuser');

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
      expect(result).toBe(true);
    });

    it('should return false if username does not exist', async () => {
      jest.spyOn(typeOrmRepository, 'findOne').mockResolvedValue(null);

      const result = await userRepository.existsByUsername('nonexistent');

      expect(result).toBe(false);
    });
  });
});
