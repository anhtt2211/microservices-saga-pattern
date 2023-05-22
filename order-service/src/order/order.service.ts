import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './order.interface';
import { firstValueFrom } from 'rxjs';
import { OrderStatus } from './order.enum';

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
    await firstValueFrom(
      this.sagaClient.emit('orderCreated', {
        orderId: order.id,
        totalAmount: order.totalAmount,
        status: OrderStatus.Pending,
      }),
    );

    return order.id;
  }

  async findOne(orderId: number): Promise<OrderEntity> {
    return await this.orderRepository.findOne({ where: { id: orderId } });
  }

  @EventPattern('customerValidated')
  async handleCustomerValidatedEvent(payload: {
    orderId: number;
  }): Promise<void> {
    const { orderId } = payload;

    console.log(`Customer validated event received for order ID: ${orderId}`);

    await firstValueFrom(this.sagaClient.emit('orderConfirmed', { orderId }));
  }

  @EventPattern('customerInvalidated')
  async handleCustomerInvalidatedEvent(payload: {
    orderId: number;
  }): Promise<void> {
    const { orderId } = payload;

    console.log(`Customer invalidated event received for order ID: ${orderId}`);

    await firstValueFrom(this.sagaClient.emit('orderCancelled', { orderId }));
  }

  @EventPattern('orderConfirmed')
  async handleOrderConfirmedEvent(payload: { orderId: number }): Promise<void> {
    const { orderId } = payload;
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      select: ['id'],
    });
    if (!order) {
      Logger.error(`Order is not exist with orderId: ${orderId}`);
      return;
    }

    Logger.log(`Order confirmed event received for order ID: ${orderId}`);
    await this.orderRepository.save({
      ...order,
      status: OrderStatus.Confirm,
    });
  }

  @EventPattern('orderCancelled')
  async handleOrderCancelledEvent(payload: { orderId: number }): Promise<void> {
    const { orderId } = payload;
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      select: ['id'],
    });
    if (!order) {
      Logger.error(`Order is not exist with orderId: ${orderId}`);
      return;
    }

    Logger.log(`Order cancelled event received for order ID: ${orderId}`);
    await this.orderRepository.save({
      ...order,
      status: OrderStatus.Cancel,
    });
  }
}
