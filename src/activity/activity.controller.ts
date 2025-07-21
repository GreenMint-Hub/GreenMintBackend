import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ActivityService, SensorData } from './activity.service';
import { ActivityClassifierService } from './activity-classifier.service';
import { ActivityStatus } from './schemas/activity.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { IPFSService } from '../common/services/ipfs.service';

export interface CreateActivityDto {
  userId: string;
  sensorData: SensorData[];
}

export interface UpdateActivityStatusDto {
  status: ActivityStatus;
}

@Controller('activity')
export class ActivityController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly classifierService: ActivityClassifierService,
    private readonly ipfsService: IPFSService,
  ) {}

  @Post()
  async createActivity(@Body() createActivityDto: CreateActivityDto) {
    const { userId, sensorData } = createActivityDto;

    // Detect activity type from sensor data
    const detectionResult = this.activityService.detectActivity(sensorData);

    // Create activity record
    const activity = await this.activityService.createActivity(
      userId,
      sensorData,
      detectionResult,
    );

    return {
      activity,
      detection: detectionResult,
      message: 'Activity detected and recorded successfully',
    };
  }

  @Post('log')
  @UseGuards(JwtAuthGuard)
  async logActivity(@Body() activityData: any, @Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.activityService.logActivity(userId, activityData);
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUserActivities(@Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.activityService.getUserActivities(userId);
  }

  @Get('community')
  @UseGuards(JwtAuthGuard)
  async getCommunityActions(@Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.activityService.getCommunityActions(userId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.activityService.getUserStats(userId);
  }

  @Get(':id')
  async getActivity(@Param('id') id: string) {
    return this.activityService.getActivityById(id);
  }

  @Patch(':id/status')
  async updateActivityStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateActivityStatusDto,
  ) {
    return this.activityService.updateActivityStatus(
      id,
      updateStatusDto.status,
    );
  }

  @Post('detect')
  async detectActivity(@Body() body: { sensorData: SensorData[] }) {
    const detectionResult = this.activityService.detectActivity(
      body.sensorData,
    );

    return {
      detection: detectionResult,
      message: 'Activity detection completed',
    };
  }

  @Post('test-classification')
  async testClassification() {
    // Sample sensor data for testing
    const sampleBikingData: SensorData[] = [
      {
        speed: 15,
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: new Date('2024-01-01T10:00:00Z'),
        acceleration: 0.5,
        altitude: 10,
      },
      {
        speed: 18,
        latitude: 37.775,
        longitude: -122.4195,
        timestamp: new Date('2024-01-01T10:01:00Z'),
        acceleration: 0.3,
        altitude: 12,
      },
      {
        speed: 12,
        latitude: 37.7751,
        longitude: -122.4196,
        timestamp: new Date('2024-01-01T10:02:00Z'),
        acceleration: -0.2,
        altitude: 15,
      },
    ];

    const classification =
      this.classifierService.classifyActivity(sampleBikingData);

    return {
      sampleData: sampleBikingData,
      classification,
      message: 'Test classification completed',
    };
  }

  // POST /activity/media
  // Uploads an image to Supabase Storage and stores the public URL in the database.
  @Post('media')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadMediaAction(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { actionType: string; description?: string },
    @Request() req
  ) {
    console.log('Received file:', file); // DEBUG LOG
    // 1. Upload to Supabase
    const mediaUrl = await this.ipfsService.uploadFile(file);
    // 2. Create activity in DB
    const activity = await this.activityService.createMediaActivity({
      userId: req.user.sub || req.user.userId,
      actionType: body.actionType,
      mediaUrl,
      mediaType: file.mimetype,
      description: body.description,
    });
    // 3. Assign voters
    await this.activityService.assignVoters((activity as any)._id);
    return { activity };
  }

  @Post(':id/vote')
  @UseGuards(JwtAuthGuard)
  async voteOnAction(
    @Param('id') actionId: string,
    @Body() body: { value: 'yes' | 'no' | 'fake' | 'spam' },
    @Request() req
  ) {
    return this.activityService.voteOnAction(actionId, req.user.sub || req.user.userId, body.value);
  }
}
