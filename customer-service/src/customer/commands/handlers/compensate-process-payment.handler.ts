import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

import { CustomerEntity } from '../../../entities';
import { CompensateProcessPaymentCommand } from '../impl';

@CommandHandler(CompensateProcessPaymentCommand)
export class CompensateProcessPaymentCommandHandler
  implements ICommandHandler<CompensateProcessPaymentCommand>
{
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async execute({
    customerId,
    totalAmount,
  }: CompensateProcessPaymentCommand): Promise<boolean> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      select: ['id', 'balance'],
    });

    Logger.error('Start compensation process payment');
    return !!(await this.customerRepository.save({
      id: customer.id,
      balance: customer.balance + totalAmount,
    }));
  }
}
