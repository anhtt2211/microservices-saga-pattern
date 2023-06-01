import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOneOrderQuery } from '../impl';
import { OrderEntity } from '../../../entities';

@QueryHandler(FindOneOrderQuery)
export class FindOneOrderQueryHandler
  implements IQueryHandler<FindOneOrderQuery>
{
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
  ) {}

  async execute({ orderId }: FindOneOrderQuery): Promise<OrderEntity> {
    return await this.orderRepository.findOne({ where: { id: orderId } });
  }
}
