import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmOrderCommand } from '../impl';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from '../../../entities';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { OrderStatus } from '../../order.enum';

@CommandHandler(ConfirmOrderCommand)
export class ConfirmOrderCommandHandler
  implements ICommandHandler<ConfirmOrderCommand>
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async execute({ orderId }: ConfirmOrderCommand): Promise<boolean> {
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
}
