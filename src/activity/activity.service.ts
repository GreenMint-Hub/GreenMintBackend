import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Activity,
  ActivityDocument,
  ActivityType,
  ActivityStatus,
} from './schemas/activity.schema';
import { Vote, VoteDocument } from './schemas/vote.schema';
import { BlockchainService } from '../blockchain/blockchain.service';
import { UsersService } from '../users/users.service';
import * as cron from 'node-cron';
import { ChallengeService } from '../challenge/challenge.service';
import { Challenge, ChallengeDocument } from '../challenge/challenge.schema';

export interface SensorData {
  speed: number; // km/h
  latitude: number;
  longitude: number;
  timestamp: Date;
  acceleration?: number; // m/s²
  altitude?: number; // meters
}

export interface ActivityDetectionResult {
  type: ActivityType;
  confidence: number;
  carbonSaved: number;
  points: number;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Vote.name) private voteModel: Model<VoteDocument>,
    private readonly blockchainService: BlockchainService,
    private readonly usersService: UsersService,
    @InjectModel(Challenge.name) private challengeModel: Model<ChallengeDocument>,
    private readonly challengeService: ChallengeService,
  ) {
    // Schedule a job to run every hour to delete expired voting actions
    cron.schedule('0 * * * *', async () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const expired = await this.activityModel.find({
        status: 'voting',
        createdAt: { $lte: twoDaysAgo },
      });
      for (const act of expired) {
        await this.activityModel.findByIdAndDelete(act._id);
        console.log(`Deleted expired voting action ${act._id}`);
      }
    });
  }

  /**
   * Detect activity type based on speed and sensor data
   * Biking: 10-30 km/h
   * Walking: 3-8 km/h
   * CYCLING: 40+ km/h
   * Public Transport: varies
   */
  detectActivity(sensorData: SensorData[]): ActivityDetectionResult {
    if (!sensorData || sensorData.length === 0) {
      throw new BadRequestException('Sensor data is required');
    }

    // Calculate average speed
    const speeds = sensorData.map((data) => data.speed);
    const avgSpeed =
      speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);

    // Activity classification based on speed
    let type: ActivityType;
    let confidence: number;
    let carbonSaved: number;
    let points: number;

    if (avgSpeed >= 40) {
      type = ActivityType.CYCLING;
      confidence = 0.9;
      carbonSaved = 0; // No carbon saved for cycling
      points = 0;
    } else if (avgSpeed >= 10 && avgSpeed <= 30) {
      type = ActivityType.BIKING;
      confidence = 0.85;
      carbonSaved = this.calculateCarbonSaved(avgSpeed, 'biking');
      points = this.calculatePoints(avgSpeed, 'biking');
    } else if (avgSpeed >= 3 && avgSpeed <= 8) {
      type = ActivityType.WALKING;
      confidence = 0.8;
      carbonSaved = this.calculateCarbonSaved(avgSpeed, 'walking');
      points = this.calculatePoints(avgSpeed, 'walking');
    } else {
      // Default to walking for low speeds
      type = ActivityType.WALKING;
      confidence = 0.6;
      carbonSaved = this.calculateCarbonSaved(avgSpeed, 'walking');
      points = this.calculatePoints(avgSpeed, 'walking');
    }

    return {
      type,
      confidence,
      carbonSaved,
      points,
    };
  }

  /**
   * Calculate carbon saved based on activity type and distance
   */
  private calculateCarbonSaved(speed: number, activityType: string): number {
    // Simplified carbon calculation
    // In a real implementation, this would be more sophisticated
    const baseCarbonPerKm = {
      cycling: 0.2, // kg CO2 saved per km vs cycling
      walking: 0.3, // kg CO2 saved per km vs cycling
      public_transport: 0.15, // kg CO2 saved per km vs cycling
    };

    return baseCarbonPerKm[activityType] || 0;
  }

  /**
   * Calculate points based on activity type and speed
   */
  private calculatePoints(speed: number, activityType: string): number {
    // Points system: more points for more sustainable activities
    // Reduced thresholds for easier testing
    const basePoints = {
      biking: 10, // Points per 5 meters (reduced from larger distances)
      walking: 15, // Points per 5 steps (reduced from larger distances)
      public_transport: 8,
    };

    return basePoints[activityType] || 0;
  }

  /**
   * Create a new activity record
   */
  async createActivity(
    userId: string,
    sensorData: SensorData[],
    detectionResult: ActivityDetectionResult,
  ): Promise<Activity> {
    const startTime = sensorData[0].timestamp;
    const endTime = sensorData[sensorData.length - 1].timestamp;

    // Calculate distance (simplified - in real app would use proper GPS distance calculation)
    const distance = this.calculateDistance(sensorData);

    const activity = new this.activityModel({
      userId: new Types.ObjectId(userId),
      type: detectionResult.type,
      startTime,
      endTime,
      distance,
      carbonSaved: detectionResult.carbonSaved * distance,
      points: detectionResult.points,
      startLocation: [sensorData[0].latitude, sensorData[0].longitude],
      endLocation: [
        sensorData[sensorData.length - 1].latitude,
        sensorData[sensorData.length - 1].longitude,
      ],
      route: sensorData.map((data) => [data.latitude, data.longitude]),
      averageSpeed:
        sensorData.reduce((sum, data) => sum + data.speed, 0) /
        sensorData.length,
      maxSpeed: Math.max(...sensorData.map((data) => data.speed)),
      status: ActivityStatus.PENDING,
      verificationMethod: 'sensor',
    });

    return await activity.save();
  }

  /**
   * Calculate total distance from GPS coordinates
   */
  private calculateDistance(sensorData: SensorData[]): number {
    if (sensorData.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < sensorData.length; i++) {
      const prev = sensorData[i - 1];
      const curr = sensorData[i];

      // Haversine formula for distance calculation
      const distance = this.haversineDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      );
      totalDistance += distance;
    }

    return totalDistance;
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   */
  private haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get all activities for a user
   */
  async getUserActivities(userId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  /**
   * Get activity by ID
   */
  async getActivityById(activityId: string): Promise<Activity> {
    const activity = await this.activityModel.findById(activityId).exec();
    if (!activity) {
      throw new BadRequestException('Activity not found');
    }
    return activity;
  }

  /**
   * Log a new activity manually
   */
  async logActivity(userId: string, activityData: any): Promise<Activity> {
    // Add points to user
    await this.usersService.addPoints(userId, activityData.points || 0);

    // If user is in an active challenge, add points to challenge
    const activeChallenge = await this.challengeModel.findOne({
      'participants.user': userId,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });
    let challengeId: string | null = null;
    if (activeChallenge) {
      await this.challengeService.addPointsToUser(String(activeChallenge._id), userId, activityData.points || 0);
      challengeId = String(activeChallenge._id);
    }

    // Save activity with challengeId if applicable
    const activity = new this.activityModel({
      ...activityData,
      userId,
      challengeId,
    });
    // Update user stats
    await this.updateUserStats(
      userId,
      activityData.co2Saved || 0,
      activityData.points || 0,
    );
    return await activity.save();
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<any> {
    const activities = await this.activityModel.find({
      userId: new Types.ObjectId(userId),
    });

    const totalCarbonSaved = activities.reduce(
      (sum, activity) => sum + (activity.carbonSaved || 0),
      0,
    );
    const totalPoints = activities.reduce(
      (sum, activity) => sum + (activity.points || 0),
      0,
    );
    const totalActivities = activities.length;

    return {
      totalCarbonSaved,
      totalPoints,
      totalActivities,
      activities: activities.slice(0, 10), // Return last 10 activities
    };
  }

  /**
   * Update user stats when activity is logged
   */
  private async updateUserStats(
    userId: string,
    carbonSaved: number,
    points: number,
  ): Promise<void> {
    // This would typically update the user model
    // For now, we'll just log the update
    console.log(
      `Updating user ${userId} stats: +${carbonSaved}kg CO2, +${points} points`,
    );
  }

  /**
   * Update activity status
   */
  async updateActivityStatus(
    activityId: string,
    status: ActivityStatus,
  ): Promise<Activity> {
    const activity = await this.activityModel
      .findByIdAndUpdate(activityId, { status }, { new: true })
      .exec();

    if (!activity) {
      throw new BadRequestException('Activity not found');
    }
    return activity;
  }

  async createMediaActivity({ userId, actionType, mediaUrl, mediaType, description }: {
    userId: string;
    actionType: string;
    mediaUrl: string;
    mediaType: string;
    description?: string;
  }): Promise<Activity> {
    const activity = new this.activityModel({
      userId: new Types.ObjectId(userId),
      type: actionType,
      mediaUrl,
      mediaType,
      description,
      status: 'voting',
      assignedVoters: [],
      votes: [],
      votingQuorum: 5,
    });
    return await activity.save();
  }

  async assignVoters(activityId: Types.ObjectId) {
    // TODO: Select 5-10 random users (excluding uploader)
    // For now, just leave assignedVoters empty
    // In production, implement random user selection
    await this.activityModel.findByIdAndUpdate(activityId, {
      assignedVoters: [],
    });
  }

  async voteOnAction(actionId: string, userId: string, value: 'yes' | 'no' | 'fake' | 'spam') {
    // 1. Save vote
    const vote = new this.voteModel({
      actionId: new Types.ObjectId(actionId),
      userId: new Types.ObjectId(userId),
      value,
    });
    await vote.save();
    // 2. Add to activity votes
    const activity = await this.activityModel.findById(actionId);
    if (!activity) throw new Error('Activity not found');
    activity.votes.push({ userId, value });
    // 3. Check for quorum
    if (activity.votes.length >= activity.votingQuorum) {
      // Calculate result
      const yesVotes = activity.votes.filter(v => v.value === 'yes').length;
      const validPercent = yesVotes / activity.votes.length;
      if (validPercent >= 0.8) {
        activity.status = ActivityStatus.VERIFIED;
        activity.votingResult = 'valid';
        // Award 50 points to the user for verified media action
        await this.awardPointsToUser(activity.userId, 50);
        // Mint NFT and/or send tokens
        try {
          const txHash = await this.blockchainService.mintNFT(
            '0x' + activity.userId.toString(), // Replace with actual user wallet address
            activity.mediaUrl || '' // Use mediaUrl as metadata URI
          );
          activity['blockchainTxHash'] = txHash;
        } catch (err) {
          // Log error but don't block
          console.error('Blockchain mint error:', err);
        }
      } else {
        activity.status = ActivityStatus.REJECTED;
        activity.votingResult = 'rejected';
      }
    }
    await activity.save();
    return activity;
  }

  // Add this helper to award points to user
  private async awardPointsToUser(userId: Types.ObjectId, points: number) {
    // Actually increment ecoPoints for the user
    await this.usersService.incrementEcoPoints(userId.toString(), points);
  }

  async getCommunityActions(userId: string): Promise<Activity[]> {
    return this.activityModel
      .find({ status: 'voting', userId: { $ne: new Types.ObjectId(userId) } })
      .exec();
  }
}
