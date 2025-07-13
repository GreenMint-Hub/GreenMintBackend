import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ActivityService, SensorData } from './activity.service';
import { ActivityClassifierService } from './activity-classifier.service';
import { ActivityStatus } from './schemas/activity.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
}
