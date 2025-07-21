import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChallengeDocument = Challenge & Document;

@Schema({ timestamps: true })
export class Challenge {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  goalPoints: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: [
      {
        user: { type: Types.ObjectId, ref: 'User', required: true },
        points: { type: Number, default: 0 },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  participants: Array<{ user: Types.ObjectId; points: number; joinedAt: Date }>;

  @Prop({ type: String, enum: ['active', 'completed'], default: 'active' })
  status: 'active' | 'completed';

  @Prop({ type: Types.ObjectId, ref: 'User' })
  winner?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const ChallengeSchema = SchemaFactory.createForClass(Challenge);
