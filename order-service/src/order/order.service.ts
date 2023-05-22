import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './order.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @Inject('SAGA_CLIENT')
    private readonly sagaClient: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<number> {
    // Create the order in the database
    const order = await this.orderRepository.save({ ...createOrderDto });

    // Emit the 'orderCreated' event to continue the saga
    this.sagaClient.emit('orderCreated', { orderId: order.id });

    return order.id;
  }

  @EventPattern('customerValidated')
  async handleCustomerValidatedEvent(payload: {
    orderId: number;
  }): Promise<void> {
    const { orderId } = payload;

    // Perform order-related actions in response to the customerValidated event
    // For example, you can update order status, trigger payment process, etc.
    console.log(`Customer validated event received for order ID: ${orderId}`);

    // Emit the 'orderConfirmed' event to proceed with the saga workflow
    this.sagaClient.emit('orderConfirmed', { orderId });
  }

  @EventPattern('customerInvalidated')
  async handleCustomerInvalidatedEvent(payload: {
    orderId: number;
  }): Promise<void> {
    const { orderId } = payload;

    // Perform order-related actions in response to the customerInvalidated event
    // For example, you can update order status, notify the customer, etc.
    console.log(`Customer invalidated event received for order ID: ${orderId}`);

    // Emit the 'orderCancelled' event to proceed with the saga workflow
    this.sagaClient.emit('orderCancelled', { orderId });
  }
}
