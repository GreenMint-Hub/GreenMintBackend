import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;

export enum ActivityType {
  BIKING = 'biking',
  WALKING = 'walking',
  PUBLIC_TRANSPORT = 'public_transport',
  DRIVING = 'driving',
}

export enum ActivityStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ActivityType })
  type: ActivityType;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ type: Number, required: true })
  distance: number; // in kilometers

  @Prop({ type: Number, required: true })
  carbonSaved: number; // in kg CO2

  @Prop({ type: Number, required: true })
  points: number;

  @Prop({ type: [Number], required: true })
  startLocation: number[]; // [latitude, longitude]

  @Prop({ type: [Number], required: true })
  endLocation: number[]; // [latitude, longitude]

  @Prop({ type: [Number] })
  route?: number[][]; // array of [latitude, longitude] points

  @Prop({ type: Number })
  averageSpeed?: number; // in km/h

  @Prop({ type: Number })
  maxSpeed?: number; // in km/h

  @Prop({ type: String, enum: ActivityStatus, default: ActivityStatus.PENDING })
  status: ActivityStatus;

  @Prop()
  verificationMethod?: string; // 'sensor', 'manual', 'receipt'

  @Prop()
  receiptUrl?: string; // for public transport receipts

  @Prop()
  blockchainTxHash?: string; // transaction hash when logged to blockchain

  @Prop()
  notes?: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
