import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type VerificationDocument = Verification & Document;

export enum VerificationType {
  TRANSPORT_RECEIPT = 'transport_receipt',
  TRANSPORT_API = 'transport_api',
  MANUAL_VERIFICATION = 'manual_verification',
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSING = 'processing',
}

export enum TransportProvider {
  T_MONEY = 't_money',
  CASHBEE = 'cashbee',
  SEOUL_METRO = 'seoul_metro',
  BUSAN_METRO = 'busan_metro',
  KORAIL = 'korail',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Verification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Activity', required: true })
  activityId: Types.ObjectId;

  @Prop({ required: true, enum: VerificationType })
  type: VerificationType;

  @Prop({
    required: true,
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Prop({ enum: TransportProvider })
  transportProvider?: TransportProvider;

  @Prop()
  receiptUrl?: string; // S3 URL for uploaded receipt

  @Prop()
  receiptHash?: string; // IPFS hash for blockchain storage

  @Prop()
  apiTransactionId?: string; // External API transaction ID

  @Prop({ type: MongooseSchema.Types.Mixed })
  apiResponse?: any; // Raw API response data

  @Prop({ type: Number })
  amount?: number; // Transaction amount

  @Prop()
  currency?: string; // Transaction currency

  @Prop()
  route?: string; // Transport route (e.g., "Line 2: Gangnam → Hongdae")

  @Prop({ type: Date })
  transactionDate?: Date;

  @Prop()
  verifiedBy?: string; // Admin or system that verified

  @Prop({ type: Date })
  verifiedAt?: Date;

  @Prop()
  rejectionReason?: string; // Reason if rejected

  @Prop()
  blockchainTxHash?: string; // Blockchain transaction hash

  @Prop()
  notes?: string; // Additional notes

  @Prop({ type: Number })
  carbonSaved?: number; // Calculated carbon savings

  @Prop({ type: Number })
  points?: number; // Points awarded
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);
