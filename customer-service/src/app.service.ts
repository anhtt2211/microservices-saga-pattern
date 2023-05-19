import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  create(dto: any) {
    console.log({ dto });
    return 'Create customer';
  }

  confirmCustomer(dto: any) {
    console.log({ dto });
    return 'Confirm customer';
  }

  deleteCustomer(dto: any) {
    console.log({ dto });
    return 'Delete customer';
  }
}
