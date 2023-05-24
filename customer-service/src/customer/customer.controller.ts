import { Controller, Post, Body, Logger } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './customer.interface';
import { MessagePattern } from '@nestjs/microservices';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async createCustomer(@Body() createCustomerDto: CreateCustomerDto) {
    const customerId = await this.customerService.createCustomer(
      createCustomerDto,
    );

    // Return the created customer ID
    return { customerId };
  }

  @MessagePattern({ cmd: 'checkCustomerValidity' })
  async handleCheckCustomerValidity(payload: {
    orderId: number;
    customerId: number;
    totalAmount: number;
  }): Promise<boolean> {
    return await this.customerService.processPayment(payload);
  }
}
