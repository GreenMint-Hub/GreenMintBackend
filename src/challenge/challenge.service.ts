import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Challenge, ChallengeDocument } from './challenge.schema';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge.name) private challengeModel: Model<ChallengeDocument>,
  ) {}

  async createChallenge(data: any, user: any) {
    if (user.role !== 'admin') throw new ForbiddenException('Only admin can create challenges');
    const challenge = new this.challengeModel({ ...data, createdBy: user.userId });
    return challenge.save();
  }

  async listAvailableChallenges(userId: string) {
    if (!isValidObjectId(userId)) return this.challengeModel.find({ status: 'active' });
    // List active challenges the user is NOT in
    return this.challengeModel.find({
      status: 'active',
      'participants.user': { $ne: new Types.ObjectId(userId) },
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
  }

  async listMyChallenges(userId: string) {
    if (!isValidObjectId(userId)) return [];
    return this.challengeModel.find({
      'participants.user': new Types.ObjectId(userId),
    });
  }

  async joinChallenge(challengeId: string, user: any) {
    const challenge = await this.challengeModel.findById(challengeId);
    if (!challenge) throw new NotFoundException('Challenge not found');
    if (challenge.participants.some(p => p.user.equals(user._id))) {
      throw new ForbiddenException('Already joined');
    }
    challenge.participants.push({ user: user._id, points: 0, joinedAt: new Date() });
    await challenge.save();
    return challenge;
  }

  async getChallenge(challengeId: string) {
    return this.challengeModel.findById(challengeId).populate('participants.user', 'username email');
  }

  async addPointsToUser(challengeId: string, userId: string, points: number) {
    const challenge = await this.challengeModel.findById(challengeId);
    if (!challenge) throw new NotFoundException('Challenge not found');
    const participant = challenge.participants.find(p => p.user.equals(userId));
    if (!participant) return; // Not in challenge
    participant.points += points;
    // Check for winner
    if (participant.points >= challenge.goalPoints && challenge.status === 'active') {
      challenge.status = 'completed';
      challenge.winner = participant.user;
    }
    await challenge.save();
  }

  async getLeaderboard(challengeId: string) {
    const challenge = await this.challengeModel.findById(challengeId).populate('participants.user', 'username email');
    if (!challenge) throw new NotFoundException('Challenge not found');
    // Sort participants by points descending
    const leaderboard = [...challenge.participants].sort((a, b) => b.points - a.points);
    return leaderboard;
  }
}
