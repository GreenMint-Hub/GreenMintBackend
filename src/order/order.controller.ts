import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getOrders(@Request() req) {
    return this.orderService.getOrders(req.user.userId || req.user.sub);
  }

  @Get(':id')
  async getOrderById(@Request() req, @Param('id') id: string) {
    return this.orderService.getOrderById(req.user.userId || req.user.sub, id);
  }

  @Post()
  async createOrder(@Request() req) {
    return this.orderService.createOrder(req.user.userId || req.user.sub);
  }
}