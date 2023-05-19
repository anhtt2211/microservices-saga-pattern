import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  create(dto: any) {
    console.log({ dto });
    return 'Create Stock';
  }

  confirmStock(dto: any) {
    console.log({ dto });
    return 'Confirm Stock';
  }

  deleteStock(dto: any) {
    console.log({ dto });
    return 'Delete Stock';
  }
}
