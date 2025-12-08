import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SubjectsService } from '../application/subjects.service';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard';
import {
  PublishMessageDto,
  PublishMessageResponseDto,
  AvailableSubjectsDto,
} from './dtos/subject.dto';
import { UsersService } from '../../users/application/users.service';
import { User } from '../../users/domain/user.entity';

/**
 * SubjectsController
 * Handles publishing messages to subject topics
 */
@ApiTags('Subjects')
@Controller('api/subjects')
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * GET /api/subjects
   * Get all available subjects
   */
  @Get()
  @ApiOperation({
    summary: 'Get available subjects',
    description: 'Retrieve list of all available subject/topic names',
  })
  @ApiResponse({
    status: 200,
    description: 'Available subjects retrieved',
    type: AvailableSubjectsDto,
    example: {
      subjects: ['sports', 'healthy', 'news', 'food', 'autos'],
    },
  })
  async getAvailableSubjects(): Promise<AvailableSubjectsDto> {
    const subjects = await this.subjectsService.getAvailableSubjects();
    return { subjects };
  }

  /**
   * POST /api/subjects/:subject
   * Publish message to a subject topic
   */
  @Post(':subject')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({
    name: 'subject',
    description: 'Subject/topic name (sports, healthy, news, food, autos)',
    example: 'sports',
  })
  @ApiOperation({
    summary: 'Publish message to subject',
    description:
      'Publish a message to a specific subject topic (requires authentication)',
  })
  @ApiResponse({
    status: 201,
    description: 'Message published successfully',
    type: PublishMessageResponseDto,
    example: {
      success: true,
      message: 'Message published to sports topic',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid subject or message validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid token',
  })
  @ApiResponse({
    status: 500,
    description: 'Server error or Kafka connection failure',
  })
  async publishMessage(
    @Param('subject') subject: string,
    @Body() publishMessageDto: PublishMessageDto,
    @Request() req: any,
  ): Promise<PublishMessageResponseDto> {
    // Get authenticated user
    const userDto = await this.usersService.findOne(req.user.userId);
    if (!userDto) {
      throw new BadRequestException('User not found');
    }

    // Convert user DTO to entity
    const userEntity = new User({
      id: userDto.id,
      username: userDto.username,
    });

    return this.subjectsService.publishMessage(
      subject,
      publishMessageDto.message,
      userEntity,
    );
  }
}
