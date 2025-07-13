import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { LeaderboardService, LeaderboardQuery } from './leaderboard.service';
import {
  LeaderboardType,
  LeaderboardPeriod,
} from './schemas/leaderboard.schema';

export interface GetLeaderboardQuery {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  page?: number;
  limit?: number;
  userId?: string;
}

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(@Query() query: GetLeaderboardQuery) {
    const { type, period, page, limit, userId } = query;

    if (!type || !period) {
      throw new BadRequestException('Type and period are required');
    }

    const leaderboardQuery: LeaderboardQuery = {
      type,
      period,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
      userId,
    };

    return this.leaderboardService.getLeaderboard(leaderboardQuery);
  }

  @Get('carbon-saved')
  async getCarbonSavedLeaderboard(
    @Query('period') period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard({
      type: LeaderboardType.CARBON_SAVED,
      period,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
    });
  }

  @Get('points')
  async getPointsLeaderboard(
    @Query('period') period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard({
      type: LeaderboardType.POINTS,
      period,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
    });
  }

  @Get('activity-count')
  async getActivityCountLeaderboard(
    @Query('period') period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard({
      type: LeaderboardType.ACTIVITY_COUNT,
      period,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
    });
  }

  @Get('weekly')
  async getWeeklyLeaderboard(
    @Query('type') type: LeaderboardType = LeaderboardType.CARBON_SAVED,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard({
      type,
      period: LeaderboardPeriod.WEEKLY,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
    });
  }

  @Get('monthly')
  async getMonthlyLeaderboard(
    @Query('type') type: LeaderboardType = LeaderboardType.CARBON_SAVED,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard({
      type,
      period: LeaderboardPeriod.MONTHLY,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
    });
  }

  @Get('all-time')
  async getAllTimeLeaderboard(
    @Query('type') type: LeaderboardType = LeaderboardType.CARBON_SAVED,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leaderboardService.getLeaderboard({
      type,
      period: LeaderboardPeriod.ALL_TIME,
      page: page ? parseInt(page.toString()) : 1,
      limit: limit ? parseInt(limit.toString()) : 20,
    });
  }

  @Get('user/:userId/rankings')
  async getUserRankings(@Param('userId') userId: string) {
    return this.leaderboardService.getUserRankings(userId);
  }

  @Get('top-performers')
  async getTopPerformers(@Query('limit') limit?: number) {
    const limitNum = limit ? parseInt(limit.toString()) : 10;
    return this.leaderboardService.getTopPerformers(limitNum);
  }

  @Get('history')
  async getLeaderboardHistory(
    @Query('type') type: LeaderboardType = LeaderboardType.CARBON_SAVED,
    @Query('period') period: LeaderboardPeriod = LeaderboardPeriod.ALL_TIME,
    @Query('limit') limit?: number,
  ) {
    const limitNum = limit ? parseInt(limit.toString()) : 10;
    return this.leaderboardService.getLeaderboardHistory(
      type,
      period,
      limitNum,
    );
  }

  @Post('refresh')
  async refreshLeaderboard(
    @Query('type') type: LeaderboardType,
    @Query('period') period: LeaderboardPeriod,
  ) {
    if (!type || !period) {
      throw new BadRequestException('Type and period are required');
    }

    await this.leaderboardService.refreshLeaderboard(type, period);
    return { message: `Leaderboard refreshed: ${type} - ${period}` };
  }

  @Post('refresh-all')
  async refreshAllLeaderboards() {
    const types = Object.values(LeaderboardType);
    const periods = Object.values(LeaderboardPeriod);

    const refreshPromises = types.flatMap((type) =>
      periods.map((period) =>
        this.leaderboardService.refreshLeaderboard(type, period),
      ),
    );

    await Promise.all(refreshPromises);
    return { message: 'All leaderboards refreshed successfully' };
  }

  @Get('stats')
  async getLeaderboardStats() {
    // Get stats for all leaderboard types
    const carbonSaved = await this.leaderboardService.getLeaderboard({
      type: LeaderboardType.CARBON_SAVED,
      period: LeaderboardPeriod.ALL_TIME,
      page: 1,
      limit: 1,
    });

    const points = await this.leaderboardService.getLeaderboard({
      type: LeaderboardType.POINTS,
      period: LeaderboardPeriod.ALL_TIME,
      page: 1,
      limit: 1,
    });

    const activityCount = await this.leaderboardService.getLeaderboard({
      type: LeaderboardType.ACTIVITY_COUNT,
      period: LeaderboardPeriod.ALL_TIME,
      page: 1,
      limit: 1,
    });

    return {
      carbonSaved: carbonSaved.stats,
      points: points.stats,
      activityCount: activityCount.stats,
      lastUpdated: new Date(),
    };
  }

  @Get('test')
  async testLeaderboard() {
    // Test endpoint to generate sample leaderboard data
    return this.leaderboardService.getLeaderboard({
      type: LeaderboardType.CARBON_SAVED,
      period: LeaderboardPeriod.ALL_TIME,
      page: 1,
      limit: 10,
    });
  }
}
