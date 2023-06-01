import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { OrderEntity } from '../entities';
import {
  CancelOrderCommand,
  ConfirmOrderCommand,
  CreateOrderCommand,
} from './commands';
import { PlaceOrderDto } from './order.interface';
import { FindOneOrderQuery } from './queries';

@Injectable()
export class OrderService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createOrder(placeOrderDto: PlaceOrderDto) {
    return await this.commandBus.execute(new CreateOrderCommand(placeOrderDto));
  }

  async findOne(orderId: number): Promise<OrderEntity> {
    return await this.queryBus.execute(new FindOneOrderQuery(orderId));
  }

  async handleOrderConfirmedEvent(payload: { orderId: number }): Promise<void> {
    return await this.commandBus.execute(
      new ConfirmOrderCommand(payload.orderId),
    );
  }

  async handleOrderCancelledEvent(payload: { orderId: number }): Promise<void> {
    return await this.commandBus.execute(
      new CancelOrderCommand(payload.orderId),
    );
  }
}
