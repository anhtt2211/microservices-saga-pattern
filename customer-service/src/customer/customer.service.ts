import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/entities/customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './customer.interface';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,

    @Inject('customerClient')
    private readonly sagaClient: ClientProxy,
  ) {}

  async findOne(id: number): Promise<CustomerEntity> {
    return await this.customerRepository.findOne({ where: { id } });
  }

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerEntity> {
    // Create the customer in the database
    const customer = await this.customerRepository.save({
      ...createCustomerDto,
    });

    return customer;
  }

  async processPayment(payload: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    const { customerId, totalAmount } = payload;

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (customer.balance < totalAmount) {
      Logger.error('Cannot process payment');
      return false;
    }

    return !!(await this.customerRepository.save({
      ...customer,
      balance: customer.balance - totalAmount,
    }));
  }

  async compensateProcessPayment(payload: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    const { customerId, totalAmount } = payload;

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    return !!(await this.customerRepository.save({
      ...customer,
      balance: customer.balance + totalAmount,
    }));
  }

  async isCustomerValid(
    customerId: number,
    totalMount: number,
  ): Promise<boolean> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    return customer.balance >= totalMount;
  }
}
