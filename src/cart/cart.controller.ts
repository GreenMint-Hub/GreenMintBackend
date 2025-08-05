import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Request() req) {
    return this.cartService.getCart(req.user.userId || req.user.sub);
  }

  @Post('add')
  async addToCart(@Request() req, @Body() body: any) {
    return this.cartService.addToCart(req.user.userId || req.user.sub, body);
  }

  @Post('remove')
  async removeFromCart(@Request() req, @Body() body: { productId: string }) {
    return this.cartService.removeFromCart(req.user.userId || req.user.sub, body.productId);
  }

  @Post('update')
  async updateQuantity(@Request() req, @Body() body: { productId: string; quantity: number }) {
    return this.cartService.updateQuantity(req.user.userId || req.user.sub, body.productId, body.quantity);
  }

  @Post('clear')
  async clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.userId || req.user.sub);
  }

  @Post('checkout')
  async checkout(@Request() req) {
    return this.cartService.checkout(req.user.userId || req.user.sub);
  }
}