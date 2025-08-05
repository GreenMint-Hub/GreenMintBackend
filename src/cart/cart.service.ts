import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from './cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ user: userId });
    if (!cart) {
      cart = await this.cartModel.create({ user: userId, items: [] });
    }
    return cart;
  }

  async addToCart(userId: string, item: any) {
    const cart = await this.getCart(userId);
    const existing = cart.items.find((i) => i.productId === item.productId);
    if (existing) {
      existing.quantity += item.quantity || 1;
    } else {
      cart.items.push({ ...item, quantity: item.quantity || 1 });
    }
    await cart.save();
    return cart;
  }

  async removeFromCart(userId: string, productId: string) {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    await cart.save();
    return cart;
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) throw new NotFoundException('Item not found in cart');
    item.quantity = Math.max(1, quantity);
    await cart.save();
    return cart;
  }

  async clearCart(userId: string) {
    const cart = await this.getCart(userId);
    cart.items = [];
    await cart.save();
    return cart;
  }

  async checkout(userId: string) {
    // For now, just clear the cart and return success
    const cart = await this.getCart(userId);
    cart.items = [];
    await cart.save();
    return { success: true };
  }
}