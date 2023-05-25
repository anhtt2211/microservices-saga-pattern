import { Body, Controller, Post } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
import { PlaceOrderDto } from './order.interface';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern({ cmd: 'createOrder' }, Transport.RMQ)
  async createOrder(@Payload() createOrderDto: PlaceOrderDto): Promise<any> {
    return await this.orderService.createOrder(createOrderDto);
  }

  @EventPattern({ cmd: 'orderConfirmed' }, Transport.RMQ)
  async handleOrderConfirmedEvent(
    @Payload() payload: { orderId: number },
  ): Promise<void> {
    await this.orderService.handleOrderConfirmedEvent(payload);
  }

  @EventPattern({ cmd: 'orderCancelled' }, Transport.RMQ)
  async handleOrderCancelledEvent(
    @Payload() payload: { orderId: number },
  ): Promise<void> {
    await this.orderService.handleOrderCancelledEvent(payload);
  }
}
