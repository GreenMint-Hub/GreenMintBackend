import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ type: String, default: null })
  verificationToken: string | null;

  @Prop({ type: String, default: null })
  resetToken: string | null;

  @Prop({ default: 0 })
  ecoPoints: number;

  @Prop({ type: String, enum: ['user', 'admin'], default: 'user' })
  role: 'user' | 'admin';
}

export const UserSchema = SchemaFactory.createForClass(User);
