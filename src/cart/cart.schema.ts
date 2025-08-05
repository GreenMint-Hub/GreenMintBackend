import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({
    type: [
      {
        productId: { type: String, required: true },
        title: String,
        price: Number,
        image: String,
        quantity: { type: Number, default: 1 },
      },
    ],
    default: [],
  })
  items: Array<{
    productId: string;
    title: string;
    price: number;
    image?: string;
    quantity: number;
  }>;
}

export const CartSchema = SchemaFactory.createForClass(Cart);