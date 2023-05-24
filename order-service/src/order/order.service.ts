import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { OrderEntity } from '../entities';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from './order.enum';
import { PlaceOrderDto } from './order.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,

    @Inject('SAGA_CLIENT')
    private readonly sagaClient: ClientProxy,
  ) {}

  async createOrder(
    placeOrderDto: PlaceOrderDto,
  ): Promise<DeepPartial<OrderEntity>> {
    try {
      const orderEntity: DeepPartial<OrderEntity> = {
        ...placeOrderDto,
        status: OrderStatus.Pending,
      };

      await this.orderRepository.save(orderEntity);
      await this.orderItemRepository.save(
        placeOrderDto.items.map((orderItem) => ({
          ...orderItem,
          order: {
            id: orderEntity.id,
          },
        })),
      );

      const totalAmount = placeOrderDto.items.reduce(
        (prev, current) => prev + current.price,
        0,
      );

      // // Emit the 'orderCreated' event to continue the saga
      this.sagaClient.emit('orderCreated', {
        orderId: orderEntity.id,
        customerId: orderEntity.customerId,
        products: placeOrderDto.items,
        totalAmount,
        status: OrderStatus.Pending,
      });

      return orderEntity;
    } catch (error) {
      throw new Error(error);
    }
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

  // async handleCustomerValidatedEvent(payload: {
  //   orderId: number;
  // }): Promise<void> {
  //   const { orderId } = payload;

  //   console.log(`Customer validated event received for order ID: ${orderId}`);

  //   this.sagaClient.emit('orderConfirmed', { orderId });
  // }

  // @EventPattern('customerInvalidated')
  // async handleCustomerInvalidatedEvent(payload: {
  //   orderId: number;
  // }): Promise<void> {
  //   const { orderId } = payload;

  //   console.log(`Customer invalidated event received for order ID: ${orderId}`);

  //   this.sagaClient.emit('orderCancelled', { orderId });
  // }

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
