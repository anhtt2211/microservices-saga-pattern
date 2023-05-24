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
    const { orderId, customerId, totalAmount } = payload;

    const customer = await this.customerService.findOne(customerId);
    if (!customer) {
      Logger.error('Customer is not exist');
      return false;
    }
    return customer.balance >= totalAmount;
  }
}
