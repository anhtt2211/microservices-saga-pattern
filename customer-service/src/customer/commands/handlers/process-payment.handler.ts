import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ProcessPaymentCommand } from '../impl';
import { CustomerEntity } from '../../../entities';

@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentCommandHandler
  implements ICommandHandler<ProcessPaymentCommand>
{
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
  ) {}

  async execute({
    customerId,
    totalAmount,
  }: ProcessPaymentCommand): Promise<boolean> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (customer.balance < totalAmount) {
      Logger.error('Cannot process payment');
      return false;
    }

    Logger.log('Start process payment');
    return !!(await this.customerRepository.save({
      ...customer,
      balance: customer.balance - totalAmount,
    }));
  }
}
