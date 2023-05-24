import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom, tap } from 'rxjs';

@Injectable()
export class SagaCoordinatorService {
  private readonly orderService: ClientProxy;
  private readonly customerService: ClientProxy;
  private readonly stockService: ClientProxy;

  constructor() {
    // Initialize the client proxies for communication with other services
    this.orderService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'queue-saga',
        queueOptions: {
          durable: true,
        },
      },
    });

    this.customerService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'queue-saga',
        queueOptions: {
          durable: true,
        },
      },
    });

    this.stockService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'queue-saga',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async processOrderCreated({
    orderId,
    customerId,
    totalAmount,
  }: {
    orderId: number;
    customerId: number;
    totalAmount: number;
  }): Promise<void> {
    // Perform necessary actions for the orderCreated event
    // Example: Start the saga workflow by checking customer validity
    const isValid$ = this.customerService.send<boolean>(
      { cmd: 'checkCustomerValidity' },
      {
        orderId,
        customerId,
        totalAmount,
      },
    );
    const isValid = await firstValueFrom(isValid$);

    if (isValid) {
      this.customerService.emit('customerValidated', { orderId });
    } else {
      this.customerService.emit('customerInvalidated', { orderId });
    }
  }

  async processCustomerValidated(orderId: number): Promise<void> {
    // Perform necessary actions for the customerValidated event
    // Example: Reserve the stock for the order
    const isStockReserved = await firstValueFrom(
      this.stockService.send<boolean>('reserveStock', { orderId }),
    );
    if (isStockReserved) {
      this.stockService.emit('stockReserved', { orderId });
    } else {
      this.stockService.emit('stockNotAvailable', { orderId });
    }
  }

  async processCustomerInvalidated(orderId: number): Promise<void> {
    console.log({ orderId });

    // Perform necessary actions for the customerInvalidated event
    // Example: Handle customer invalidation in the saga workflow
    // ...
  }

  async processStockReserved(orderId: number): Promise<void> {
    // Perform necessary actions for the stockReserved event
    // Example: Confirm the order
    await firstValueFrom(this.orderService.emit('orderConfirmed', { orderId }));
  }

  async processStockNotAvailable(orderId: number): Promise<void> {
    // Perform necessary actions for the stockNotAvailable event
    // Example: Cancel the order
    await firstValueFrom(this.orderService.emit('orderCancelled', { orderId }));
  }
}
