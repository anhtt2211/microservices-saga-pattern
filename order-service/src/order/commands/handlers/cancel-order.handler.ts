import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelOrderCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../../../entities';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { OrderStatus } from '../../order.enum';

@CommandHandler(CancelOrderCommand)
export class CancelOrderCommandHandler
  implements ICommandHandler<CancelOrderCommand>
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async execute({ orderId }: CancelOrderCommand): Promise<boolean> {
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

    Logger.error(`Order cancelled event received for order ID: ${orderId}`);
    return !!(await this.orderRepository.save({
      ...order,
      status: OrderStatus.Cancel,
    }));
  }
}
