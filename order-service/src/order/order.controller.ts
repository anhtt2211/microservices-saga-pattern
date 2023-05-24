import { Body, Controller, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PlaceOrderDto } from './order.interface';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() createOrderDto: PlaceOrderDto) {
    const orderId = await this.orderService.createOrder(createOrderDto);

    // Return the created order ID
    return { orderId };
  }

  // ...

  @MessagePattern({ cmd: 'getCustomerId' })
  async handleGetCustomerIdMessage(data: { orderId: number }): Promise<number> {
    const { orderId } = data;

    // Retrieve the customer ID associated with the order from the database
    const order = await this.orderService.findOne(orderId);

    return order.customerId;
  }

  // @MessagePattern('customerInvalidated')
  // async handleCustomerInvalidatedEvent(payload: {
  //   orderId: number;
  // }): Promise<void> {
  //   await this.orderService.handleCustomerInvalidatedEvent(payload);
  // }

  @MessagePattern({ cmd: 'orderConfirmed' })
  async handleOrderConfirmedEvent(payload: { orderId: number }): Promise<void> {
    await this.orderService.handleOrderConfirmedEvent(payload);
  }

  @MessagePattern({ cmd: 'orderCancelled' })
  async handleOrderCancelledEvent(payload: { orderId: number }): Promise<void> {
    await this.orderService.handleOrderCancelledEvent(payload);
  }
}
