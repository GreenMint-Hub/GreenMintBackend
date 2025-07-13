import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChallengeDocument = Challenge & Document;

@Schema({ timestamps: true })
export class Challenge {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: [String], default: [] })
  participants: string[]; // user IDs

  @Prop({ default: false })
  isActive: boolean;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
