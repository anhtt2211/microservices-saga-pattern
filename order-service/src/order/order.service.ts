import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entities';
import { OrderStatus } from './order.enum';
import { CreateOrderDto } from './order.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,

    @Inject('SAGA_CLIENT')
    private readonly sagaClient: ClientProxy,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    const order = await this.orderRepository.save({
      ...createOrderDto,
      status: OrderStatus.Pending,
    });

    // Emit the 'orderCreated' event to continue the saga
    this.sagaClient.emit('orderCreated', {
      orderId: order.id,
      customerId: order.customerId,
      totalAmount: order.totalAmount,
      status: OrderStatus.Pending,
    });

    return order;
  }

  async confirmOrder(orderId: number): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      Logger.error(`Order is not exist with orderId: ${orderId}`);
      return false;
    }

    if (order.status !== OrderStatus.Pending) {
      Logger.error(
        `Order cannot confirm because current status is ${order.status}`,
      );
      return false;
    }

    return !!(await this.orderRepository.save({
      ...order,
      status: OrderStatus.Confirm,
    }));
  }

  async cancelOrder(orderId: number): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      Logger.error(`Order is not exist with orderId: ${orderId}`);
      return false;
    }

    if (order.status !== OrderStatus.Pending) {
      Logger.error(
        `Order cannot cancel because current status is ${order.status}`,
      );
      return false;
    }

    return !!(await this.orderRepository.save({
      ...order,
      status: OrderStatus.Cancel,
    }));
  }

  async findOne(orderId: number): Promise<OrderEntity> {
    return await this.orderRepository.findOne({ where: { id: orderId } });
  }

  async handleCustomerValidatedEvent(payload: {
    orderId: number;
  }): Promise<void> {
    const { orderId } = payload;

    console.log(`Customer validated event received for order ID: ${orderId}`);

    this.sagaClient.emit('orderConfirmed', { orderId });
  }

  // @EventPattern('customerInvalidated')
  async handleCustomerInvalidatedEvent(payload: {
    orderId: number;
  }): Promise<void> {
    const { orderId } = payload;

    console.log(`Customer invalidated event received for order ID: ${orderId}`);

    this.sagaClient.emit('orderCancelled', { orderId });
  }

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
