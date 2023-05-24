import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './customer.interface';
import { MessagePattern } from '@nestjs/microservices';

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

  @MessagePattern({ cmd: 'checkCustomerValidity' })
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

  @MessagePattern({ cmd: 'customerValidated' })
  async processPayment(payload: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    return await this.customerService.processPayment(payload);
  }

  @MessagePattern({ cmd: 'refundPayment' })
  async compensateProcessPayment(payload: {
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    return await this.customerService.compensateProcessPayment(payload);
  }
}
