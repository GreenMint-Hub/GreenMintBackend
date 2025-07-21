import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoteDocument = Vote & Document;

@Schema({ timestamps: true })
export class Vote {
  @Prop({ type: Types.ObjectId, required: true })
  actionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  value: 'yes' | 'no' | 'fake' | 'spam';
}

export const VoteSchema = SchemaFactory.createForClass(Vote); 