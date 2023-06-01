import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCustomerCommand } from '../impl';
import { CustomerEntity } from '../../../entities';

@CommandHandler(CreateCustomerCommand)
export class CreateCustomerCommandHandler
  implements ICommandHandler<CreateCustomerCommand>
{
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async execute({
    createCustomerDto,
  }: CreateCustomerCommand): Promise<CustomerEntity> {
    return await this.customerRepository.save({
      ...createCustomerDto,
    });
  }
}
