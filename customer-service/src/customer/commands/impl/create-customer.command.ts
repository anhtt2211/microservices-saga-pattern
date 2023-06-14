import { CreateCustomerDto } from '../../customer.interface';

export class CreateCustomerCommand {
  constructor(public readonly createCustomerDto: CreateCustomerDto) {}
}
