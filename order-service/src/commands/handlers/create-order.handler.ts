import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OrderEntity } from '../../../entities';
import { OrderStatus } from '../../order.enum';
import { OrderItemEntity } from '../../../entities/order-item.entity';
import { CreateOrderCommand } from '../impl';

@CommandHandler(CreateOrderCommand)
export class CreateOrderCommandHandler
  implements ICommandHandler<CreateOrderCommand>
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async execute({ placeOrderDto }: CreateOrderCommand): Promise<any> {
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
}