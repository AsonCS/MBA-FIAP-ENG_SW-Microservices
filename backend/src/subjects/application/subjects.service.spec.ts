import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { SubjectsService, PublishMessageDto } from './subjects.service';
import { KafkaService } from '../infrastructure/kafka.service';
import { SubjectType } from '../domain/subject.enum';
import { User } from '../../users/domain/user.entity';

describe('SubjectsService', () => {
  let service: SubjectsService;
  let kafkaService: KafkaService;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    password: 'hashedpassword',
    createdAt: new Date(),
  };

  const mockKafkaService = {
    publishMessage: jest.fn(),
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubjectsService,
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
      ],
    }).compile();

    service = module.get<SubjectsService>(SubjectsService);
    kafkaService = module.get<KafkaService>(KafkaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publishMessage', () => {
    it('should publish a valid message to a valid subject', async () => {
      const message = 'Great game yesterday!';
      mockKafkaService.publishMessage.mockResolvedValue({
        topicPartitions: [{ topic: 'sports', partition: 0 }],
      });

      const result = await service.publishMessage(
        SubjectType.SPORTS,
        message,
        mockUser,
      );

      expect(kafkaService.publishMessage).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.message).toContain('sports');
    });

    it('should throw error if subject is invalid', async () => {
      const message = 'Some message';

      await expect(
        service.publishMessage('invalid_subject', message, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if message is empty', async () => {
      await expect(
        service.publishMessage(SubjectType.SPORTS, '', mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if message is whitespace only', async () => {
      await expect(
        service.publishMessage(SubjectType.SPORTS, '   ', mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if message exceeds 500 characters', async () => {
      const longMessage = 'a'.repeat(501);

      await expect(
        service.publishMessage(SubjectType.SPORTS, longMessage, mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should trim message content', async () => {
      const message = '  Game was great!  ';
      mockKafkaService.publishMessage.mockResolvedValue({
        topicPartitions: [{ topic: 'sports', partition: 0 }],
      });

      await service.publishMessage(SubjectType.SPORTS, message, mockUser);

      const publishedMessage = (kafkaService.publishMessage as jest.Mock).mock
        .calls[0][1];
      expect(publishedMessage.content).toBe('Game was great!');
    });

    it('should include user data in published message', async () => {
      const message = 'Test message';
      mockKafkaService.publishMessage.mockResolvedValue({
        topicPartitions: [{ topic: 'sports', partition: 0 }],
      });

      await service.publishMessage(SubjectType.SPORTS, message, mockUser);

      const publishedMessage = (kafkaService.publishMessage as jest.Mock).mock
        .calls[0][1];
      expect(publishedMessage.userId).toBe(mockUser.id);
      expect(publishedMessage.username).toBe(mockUser.username);
      expect(publishedMessage.content).toBe(message);
    });

    it('should include ISO timestamp in published message', async () => {
      const message = 'Test message';
      mockKafkaService.publishMessage.mockResolvedValue({
        topicPartitions: [{ topic: 'sports', partition: 0 }],
      });

      await service.publishMessage(SubjectType.SPORTS, message, mockUser);

      const publishedMessage = (kafkaService.publishMessage as jest.Mock).mock
        .calls[0][1];
      expect(publishedMessage.timestamp).toBeDefined();
      expect(new Date(publishedMessage.timestamp)).toBeInstanceOf(Date);
    });

    it('should throw error if Kafka publish fails', async () => {
      mockKafkaService.publishMessage.mockRejectedValue(
        new Error('Kafka connection failed'),
      );

      await expect(
        service.publishMessage(SubjectType.SPORTS, 'message', mockUser),
      ).rejects.toThrow(BadRequestException);
    });

    it('should support all subject types', async () => {
      const subjects = [
        SubjectType.SPORTS,
        SubjectType.HEALTHY,
        SubjectType.NEWS,
        SubjectType.FOOD,
        SubjectType.AUTOS,
      ];

      mockKafkaService.publishMessage.mockResolvedValue({
        topicPartitions: [{ topic: 'test', partition: 0 }],
      });

      for (const subject of subjects) {
        const result = await service.publishMessage(subject, 'test', mockUser);
        expect(result.success).toBe(true);
      }

      expect(kafkaService.publishMessage).toHaveBeenCalledTimes(5);
    });
  });

  describe('getAvailableSubjects', () => {
    it('should return all available subjects', async () => {
      const subjects = await service.getAvailableSubjects();

      expect(subjects).toContain(SubjectType.SPORTS);
      expect(subjects).toContain(SubjectType.HEALTHY);
      expect(subjects).toContain(SubjectType.NEWS);
      expect(subjects).toContain(SubjectType.FOOD);
      expect(subjects).toContain(SubjectType.AUTOS);
      expect(subjects.length).toBe(5);
    });
  });
});
