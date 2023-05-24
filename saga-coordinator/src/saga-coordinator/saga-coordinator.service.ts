import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  IProcessPaymentEvent,
  ICreateOrderEvent,
  IUpdateInventoryEvent,
} from './saga.interface';

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
    customerId,
    orderId,
    products,
    totalAmount,
  }: ICreateOrderEvent): Promise<void> {
    // Perform necessary actions for the orderCreated event
    // Example: Start the saga workflow by checking customer validity
    const isCustomerValid$ = this.customerService.send<boolean>(
      { cmd: 'checkCustomerValidity' },
      {
        customerId,
        totalAmount,
      },
    );
    const isCustomerValid = await firstValueFrom(isCustomerValid$);

    if (isCustomerValid) {
      this.customerService.emit('customerValidated', {
        orderId,
        products,
      });
    } else {
      this.customerService.emit('customerInvalidated', {
        orderId,
        customerId,
      });
    }
  }

  async processCustomerValidated({
    orderId,
    customerId,
    products,
  }: IProcessPaymentEvent): Promise<void> {
    // Perform necessary actions for the customerValidated event
    // Example: Reserve the stock for the order
    const isStockReserved = await firstValueFrom(
      this.stockService.send<boolean>('reserveStock', {
        products,
      }),
    );
    if (isStockReserved) {
      this.stockService.emit('stockReserved', { orderId });
    } else {
      this.stockService.emit('stockNotAvailable', {
        orderId,
        customerId,
        products,
      });
    }
  }

  async processCustomerInvalidated(orderId: number): Promise<void> {
    this.stockService.emit('orderCancelled', { orderId });
  }

  async processStockReserved(orderId: number): Promise<void> {
    // Perform necessary actions for the stockReserved event
    // Example: Confirm the order
    this.orderService.emit('orderConfirmed', { orderId });
  }

  async processStockNotAvailable({
    orderId,
    customerId,
  }: IUpdateInventoryEvent): Promise<void> {
    this.customerService.emit('refundPayment', {
      orderId,
      customerId,
    });

    this.orderService.emit('orderCancelled', {
      orderId,
    });
  }
}
