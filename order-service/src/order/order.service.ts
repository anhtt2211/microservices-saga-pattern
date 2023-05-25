import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { OrderEntity } from '../entities';
import { OrderItemEntity } from '../entities/order-item.entity';
import { OrderStatus } from './order.enum';
import { PlaceOrderDto } from './order.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async createOrder(placeOrderDto: PlaceOrderDto) {
    try {
      const orderEntity = await this.orderRepository.save(
        {
          ...placeOrderDto,
          status: OrderStatus.Pending,
        },
        {
          transaction: false,
        },
      );
      await this.orderItemRepository.save(
        placeOrderDto.items.map((orderItem) => ({
          ...orderItem,
          order: {
            id: orderEntity.id,
          },
        })),
        {
          transaction: false,
        },
      );

      const totalAmount = placeOrderDto.items.reduce(
        (prev, current) => prev + current.price,
        0,
      );

      return {
        orderId: orderEntity.id,
        customerId: orderEntity.customerId,
        products: placeOrderDto.items,
        totalAmount,
      };
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

    Logger.error(`Order cancelled event received for order ID: ${orderId}`);
    await this.orderRepository.save({
      ...order,
      status: OrderStatus.Cancel,
    });
  }
}
