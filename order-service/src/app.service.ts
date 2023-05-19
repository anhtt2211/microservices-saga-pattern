import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  create(dto: any) {
    console.log({ dto });
    return 'Create Order';
  }

  confirmOrder(dto: any) {
    console.log({ dto });
    return 'Confirm Order';
  }

  cancelOrder(dto: any) {
    console.log({ dto });
    return 'Cancel Order';
  }
}
