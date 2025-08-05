import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
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

  @Prop({ type: Number, required: true })
  total: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);