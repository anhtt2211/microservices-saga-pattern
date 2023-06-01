import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CustomerEntity } from '../entities';
import {
  CompensateProcessPaymentCommand,
  CreateCustomerCommand,
  ProcessPaymentCommand,
} from './commands';
import { CreateCustomerDto } from './customer.interface';
import { FindOneCustomerQuery } from './queries';

@Injectable()
export class CustomerService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async findOne(id: number): Promise<CustomerEntity> {
    return await this.queryBus.execute(new FindOneCustomerQuery(id));
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerEntity> {
    return await this.commandBus.execute(
      new CreateCustomerCommand(createCustomerDto),
    );
  }

  async processPayment(payload: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    return await this.commandBus.execute(
      new ProcessPaymentCommand(payload.customerId, payload.totalAmount),
    );
  }

  async compensateProcessPayment(payload: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    return await this.commandBus.execute(
      new CompensateProcessPaymentCommand(
        payload.customerId,
        payload.totalAmount,
      ),
    );
  }
}
