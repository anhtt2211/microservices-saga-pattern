import { Body, Controller, Post } from '@nestjs/common';
import { MessagePattern, Transport } from '@nestjs/microservices';
import { CreateCustomerDto } from './customer.interface';
import { CustomerService } from './customer.service';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customerService.createCustomer(
      createCustomerDto,
    );

    return { customer };
  }

  @MessagePattern({ cmd: 'checkCustomerValidity' }, Transport.RMQ)
  async handleCheckCustomerValidity(payload: {
    orderId: number;
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    return await this.customerService.isCustomerValid(
      payload.customerId,
      payload.totalAmount,
    );
  }

  @MessagePattern({ cmd: 'customerValidated' }, Transport.RMQ)
  async processPayment(payload: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    return await this.customerService.processPayment(payload);
  }

  @MessagePattern({ cmd: 'refundPayment' }, Transport.RMQ)
  async compensateProcessPayment(payload: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    return await this.customerService.compensateProcessPayment(payload);
  }
}
