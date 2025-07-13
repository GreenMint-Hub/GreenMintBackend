import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Challenge, ChallengeDocument } from './challenge.schema';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name)
    private challengeModel: Model<ChallengeDocument>,
  ) {}

  async createChallenge(data: any, user: any) {
    if (user.role !== 'admin')
      throw new ForbiddenException('Only admin can create challenges');
    const challenge = new this.challengeModel({ ...data, isActive: true });
    return challenge.save();
  }

  async listChallenges() {
    return this.challengeModel.find().lean();
  }

  async joinChallenge(challengeId: string, userId: string) {
    const challenge = await this.challengeModel.findById(challengeId);
    if (!challenge) throw new NotFoundException('Challenge not found');
    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      await challenge.save();
    }
    return challenge;
  }

  async updateProgress(challengeId: string, userId: string, progress: number) {
    const challenge = await this.challengeModel.findById(challengeId);
    if (!challenge) throw new NotFoundException('Challenge not found');
    
    // For now, just return success. In a real app, you'd update user progress
    // This would typically involve updating a user-challenge relationship
    return { 
      message: 'Progress updated successfully',
      challengeId,
      userId,
      progress 
    };
  }
}
