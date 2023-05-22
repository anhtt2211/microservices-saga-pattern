import { Controller, Post, Body } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './customer.interface';

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
}
