import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../entities/order.entity';
import { ICreateOrderDto } from './order.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async createOrder(createOrderDto: ICreateOrderDto): Promise<OrderEntity> {
    return await this.orderRepository.save({
      ...createOrderDto,
      orderDate: new Date(),
      status: 'Pending',
    });
  }

  async confirmOrder(orderId: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      // Handle order not found error
      throw new Error('Order not found');
    }

    if (order.status !== 'Pending') {
      // Handle order status validation error
      throw new Error('Order is not in a pending state');
    }

    // Update order status to 'Confirmed'
    order.status = 'Confirmed';
    return this.orderRepository.save(order);
  }

  async cancelOrder(orderId: number): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      // Handle order not found error
      throw new Error('Order not found');
    }

    if (order.status !== 'Pending') {
      // Handle order status validation error
      throw new Error('Order is not in a pending state');
    }

    // Update order status to 'Cancelled'
    order.status = 'Cancelled';
    return this.orderRepository.save(order);
  }
}
