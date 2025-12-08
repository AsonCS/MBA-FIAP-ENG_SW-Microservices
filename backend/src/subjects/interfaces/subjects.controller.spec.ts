import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from '../application/subjects.service';
import { UsersService } from '../../users/application/users.service';
import { PublishMessageDto } from './dtos/subject.dto';
import { SubjectType } from '../domain/subject.enum';
import { UserDto } from '../../users/interfaces/dtos/user.dto';

describe('SubjectsController', () => {
  let controller: SubjectsController;
  let subjectsService: SubjectsService;
  let usersService: UsersService;

  const mockUserDto: UserDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    createdAt: new Date(),
  };

  const mockRequest = {
    user: {
      userId: mockUserDto.id,
      username: mockUserDto.username,
    },
  };

  const mockSubjectsService = {
    publishMessage: jest.fn(),
    getAvailableSubjects: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubjectsController],
      providers: [
        {
          provide: SubjectsService,
          useValue: mockSubjectsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<SubjectsController>(SubjectsController);
    subjectsService = module.get<SubjectsService>(SubjectsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableSubjects', () => {
    it('should return list of available subjects', async () => {
      const subjects = ['sports', 'healthy', 'news', 'food', 'autos'];
      mockSubjectsService.getAvailableSubjects.mockResolvedValue(subjects);

      const result = await controller.getAvailableSubjects();

      expect(result.subjects).toEqual(subjects);
      expect(result.subjects.length).toBe(5);
    });
  });

  describe('publishMessage', () => {
    it('should publish a message successfully', async () => {
      const publishMessageDto: PublishMessageDto = {
        message: 'Great game yesterday!',
      };

      mockUsersService.findOne.mockResolvedValue(mockUserDto);
      mockSubjectsService.publishMessage.mockResolvedValue({
        success: true,
        message: 'Message published to sports topic',
      });

      const result = await controller.publishMessage(
        'sports',
        publishMessageDto,
        mockRequest,
      );

      expect(usersService.findOne).toHaveBeenCalledWith(mockUserDto.id);
      expect(subjectsService.publishMessage).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should throw error if user not found', async () => {
      const publishMessageDto: PublishMessageDto = {
        message: 'Test message',
      };

      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        controller.publishMessage('sports', publishMessageDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if subjects service fails', async () => {
      const publishMessageDto: PublishMessageDto = {
        message: 'Test message',
      };

      mockUsersService.findOne.mockResolvedValue(mockUserDto);
      mockSubjectsService.publishMessage.mockRejectedValue(
        new BadRequestException('Invalid subject'),
      );

      await expect(
        controller.publishMessage('invalid', publishMessageDto, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });

    it('should extract user ID from request token', async () => {
      const publishMessageDto: PublishMessageDto = {
        message: 'Test message',
      };

      mockUsersService.findOne.mockResolvedValue(mockUserDto);
      mockSubjectsService.publishMessage.mockResolvedValue({
        success: true,
        message: 'Message published',
      });

      await controller.publishMessage('sports', publishMessageDto, mockRequest);

      expect(usersService.findOne).toHaveBeenCalledWith(
        mockRequest.user.userId,
      );
    });
  });
});
