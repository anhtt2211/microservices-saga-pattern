import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from 'src/entities/customer.entity';
import { Repository } from 'typeorm';
import { CreateCustomerDto } from './customer.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,

    @Inject('SAGA_CLIENT')
    private readonly sagaClient: ClientProxy,
  ) {}

  async findOne(id: number): Promise<CustomerEntity> {
    return await this.customerRepository.findOne({ where: { id } });
  }

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<number> {
    // Create the customer in the database
    const customer = await this.customerRepository.save({
      ...createCustomerDto,
    });

    // Emit the 'customerCreated' event to continue the saga
    await firstValueFrom(
      this.sagaClient.emit('customerCreated', { customerId: customer.id }),
    );

    return customer.id;
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
    orderId: number;
    totalAmount: number;
  }): Promise<boolean> {
    const { customerId, totalAmount } = payload;

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    if (customer.balance < totalAmount) {
      Logger.error('Cannot compensate process payment');
      return false;
    }

    return !!(await this.customerRepository.save({
      ...customer,
      balance: customer.balance + totalAmount,
    }));
  }

  @EventPattern('orderCreated')
  async handleOrderCreatedEvent(payload: {
    orderId: number;
    totalAmout: number;
  }): Promise<void> {
    const { orderId, totalAmout } = payload;

    // Perform customer-related actions in response to the orderCreated event
    // For example, you can check customer validity, update customer information, etc.
    Logger.log(`Order created event received for order ID: ${orderId}`);

    // Get the customer ID associated with the order
    const customerId = await this.getCustomerFromOrder(orderId);

    // Perform customer validity check and check customer balance
    const isCustomerValid = await this.isCustomerValid(customerId, totalAmout);

    if (isCustomerValid) {
      // Emit the 'customerApproved' event to proceed with the saga workflow
      await firstValueFrom(
        this.sagaClient.emit('customerValidated', { orderId }),
      );
    } else {
      // Emit the 'customerRejected' event to proceed with the saga workflow
      await firstValueFrom(
        this.sagaClient.emit('customerInvalidated', { orderId }),
      );
    }
  }

  @EventPattern('checkCustomerValidity')
  async checkCustomerValid({
    customerId,
    totalAmount,
  }: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    return customer.balance >= totalAmount;
  }

  private async getCustomerFromOrder(orderId: number): Promise<number> {
    // Emit a request to the Order service to get the customer ID associated with the order
    const response = await firstValueFrom(
      this.sagaClient.send<number>('getCustomerId', { orderId }),
    );

    return response;
  }

  private async isCustomerValid(
    customerId: number,
    totalMount: number,
  ): Promise<boolean> {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });
    return customer.balance >= totalMount;
  }
}
