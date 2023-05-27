import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CustomerEntity } from '../../../entities';
import { FindOneCustomerQuery } from '../impl';

@QueryHandler(FindOneCustomerQuery)
export class FindOneCustomerQueryHandler
  implements IQueryHandler<FindOneCustomerQuery>
{
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async execute({ customerId }: FindOneCustomerQuery): Promise<CustomerEntity> {
    return await this.customerRepository.findOne({ where: { id: customerId } });
  }
}
