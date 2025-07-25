import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

export enum ActivityType {
  WALKING = 'walking',
  BIKING = 'biking',
  CYCLING = 'cycling',
  RECYCLING = 'recycling',
  BUS = 'bus',
  OTHER = 'other',
}

export enum ActivityStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  VOTING = 'voting',
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ActivityType })
  type: ActivityType;

  @Prop()
  title?: string;

  @Prop()
  description?: string;

  @Prop()
  carbonSaved?: number;

  @Prop()
  points?: number;

  @Prop()
  startTime?: Date;

  @Prop()
  endTime?: Date;

  @Prop()
  distance?: number;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', default: null })
  challengeId?: Types.ObjectId | string | null;

  @Prop({ default: ActivityStatus.PENDING })
  status: ActivityStatus;

  @Prop()
  verificationMethod?: string;

  // Media upload fields
  @Prop()
  mediaUrl?: string;

  @Prop()
  mediaType?: string;

  // Voting fields
  @Prop({ type: [String], default: [] })
  assignedVoters: string[];

  @Prop({ type: [{ userId: String, value: String }], default: [] })
  votes: { userId: string; value: string }[];

  @Prop({ default: 5 })
  votingQuorum: number;

  @Prop()
  votingResult?: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
