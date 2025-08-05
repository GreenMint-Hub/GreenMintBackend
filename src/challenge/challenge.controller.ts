import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get('available')
  @UseGuards(JwtAuthGuard)
  async getAvailable(@Request() req) {
    // Update expired challenges first
    await this.challengeService.updateExpiredChallenges();
    // Return all challenges (active and completed) that the user is not in
    return this.challengeService.listAvailableChallenges(req.user.userId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyChallenges(@Request() req) {
    // Update expired challenges first
    await this.challengeService.updateExpiredChallenges();
    // Try to get userId from query, then from req.user, then fallback
    return this.challengeService.listMyChallenges(req.user.userId);
  }

  @Get('completed')
  @UseGuards(JwtAuthGuard)
  async getCompletedChallenges(@Request() req) {
    // Update expired challenges first
    await this.challengeService.updateExpiredChallenges();
    return this.challengeService.listCompletedChallenges(req.user.userId);
  }

  @Post('join/:id')
  @UseGuards(JwtAuthGuard)
  async join(@Param('id') id: string, @Request() req, @Body() body) {
    const userId = body.userId || req.query.userId || req.user?._id || '000000000000000000000000';
    console.log('Joining challenge for userId:', userId); // DEBUG LOG
    return this.challengeService.joinChallenge(id, { _id: req.user.userId });
  }

  @Post()
  async create(@Body() body, @Request() req) {
    console.log('req.user:', req.user); // DEBUG LOG
    // Only admin can create challenges (frontend controls UI)
    return this.challengeService.createChallenge(body, req.user || { userId: 'unknown', role: 'admin' });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getChallenge(@Param('id') id: string) {
    return this.challengeService.getChallenge(id);
  }

  @Get('leaderboard/:id')
  @UseGuards(JwtAuthGuard)
  async leaderboard(@Param('id') id: string) {
    return this.challengeService.getLeaderboard(id);
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  async addProgress(@Param('id') id: string, @Body() body: { points: number }, @Request() req) {
    return this.challengeService.addPointsToUser(id, req.user.sub || req.user.userId, body.points);
  }
}
