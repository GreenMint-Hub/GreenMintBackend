import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SetMetadata } from '@nestjs/common';

@Controller('challenges')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @Get()
  async listChallenges() {
    return this.challengeService.listChallenges();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @SetMetadata('role', 'admin')
  async createChallenge(@Body() body: any, @Request() req) {
    return this.challengeService.createChallenge(body, req.user);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  async joinChallenge(@Param('id') id: string, @Request() req) {
    return this.challengeService.joinChallenge(
      id,
      req.user.userId || req.user.sub,
    );
  }

  @Patch(':id/progress')
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @Param('id') id: string,
    @Body() body: { progress: number },
    @Request() req,
  ) {
    return this.challengeService.updateProgress(
      id,
      req.user.userId || req.user.sub,
      body.progress,
    );
  }
}
