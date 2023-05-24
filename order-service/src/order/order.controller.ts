import { Body, Controller, Post } from '@nestjs/common';
import { MessagePattern, Transport } from '@nestjs/microservices';
import { PlaceOrderDto } from './order.interface';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'createOrder' }, Transport.RMQ)
  async createOrder(createOrderDto: PlaceOrderDto): Promise<any> {
    return await this.orderService.createOrder(createOrderDto);
  }

  @MessagePattern({ cmd: 'orderConfirmed' }, Transport.RMQ)
  async handleOrderConfirmedEvent(payload: { orderId: number }): Promise<void> {
    await this.orderService.handleOrderConfirmedEvent(payload);
  }

  @MessagePattern({ cmd: 'orderCancelled' }, Transport.RMQ)
  async handleOrderCancelledEvent(payload: { orderId: number }): Promise<void> {
    await this.orderService.handleOrderCancelledEvent(payload);
  }
}
