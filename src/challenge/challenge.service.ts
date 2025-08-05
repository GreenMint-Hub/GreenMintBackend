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
    if (!isValidObjectId(userId)) {
      // Return all challenges (active and completed) if no valid userId
      return this.challengeModel.find({}).sort({ endDate: -1 });
    }
    
    // List all challenges (active and completed) that the user is NOT in
    return this.challengeModel.find({
      'participants.user': { $ne: new Types.ObjectId(userId) },
    }).sort({ endDate: -1 });
  }

  async listMyChallenges(userId: string) {
    if (!isValidObjectId(userId)) return [];
    return this.challengeModel.find({
      'participants.user': new Types.ObjectId(userId),
    });
  }

  async listCompletedChallenges(userId: string) {
    if (!isValidObjectId(userId)) return [];
    return this.challengeModel.find({
      'participants.user': new Types.ObjectId(userId),
      $or: [
        { status: 'completed' },
        { endDate: { $lt: new Date() } }
      ]
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

  // Method to check and update expired challenges
  async updateExpiredChallenges() {
    const now = new Date();
    const expiredChallenges = await this.challengeModel.find({
      status: 'active',
      endDate: { $lt: now }
    });

    for (const challenge of expiredChallenges) {
      challenge.status = 'completed';
      // Find the participant with the highest points as winner
      if (challenge.participants.length > 0) {
        const winner = challenge.participants.reduce((prev, current) => 
          (prev.points > current.points) ? prev : current
        );
        challenge.winner = winner.user;
      }
      await challenge.save();
    }

    return expiredChallenges.length;
  }
}



