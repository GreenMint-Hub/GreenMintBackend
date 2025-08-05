import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { Cart, CartDocument } from '../cart/cart.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async createOrder(userId: string) {
    const cart = await this.cartModel.findOne({ user: userId });
    if (!cart || cart.items.length === 0) throw new NotFoundException('Cart is empty');
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const order = await this.orderModel.create({
      user: userId,
      items: cart.items,
      total,
    });
    cart.items = [];
    await cart.save();
    return order;
  }

  async getOrders(userId: string) {
    return this.orderModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderModel.findOne({ _id: orderId, user: userId });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}