import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum LeaderboardType {
  CARBON_SAVED = 'carbon_saved',
  POINTS = 'points',
  ACTIVITY_COUNT = 'activity_count',
}

export enum LeaderboardPeriod {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  ALL_TIME = 'all_time',
}

export type LeaderboardDocument = Leaderboard & Document;

@Schema()
export class Leaderboard {
  @Prop({ required: true })
  type: LeaderboardType;

  @Prop({ required: true })
  period: LeaderboardPeriod;

  @Prop({ default: [] })
  entries: any[];
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
