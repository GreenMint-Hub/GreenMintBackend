import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NFTDocument = NFT & Document;

@Schema({ timestamps: true })
export class NFT {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  contractTx: string;

  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  metadataUri: string;
}

export const NFTSchema = SchemaFactory.createForClass(NFT); 