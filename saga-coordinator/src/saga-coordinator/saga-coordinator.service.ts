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
        queue: 'order-queue',
        queueOptions: {
          durable: false,
        },
      },
    });

    this.customerService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'queue-saga',
        queueOptions: {
          durable: false,
        },
      },
    });

    this.stockService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'queue-saga',
        queueOptions: {
          durable: false,
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
    const isCustomerValid = await firstValueFrom(isCustomerValid$); // BUG here

    if (isCustomerValid) {
      await firstValueFrom(
        this.customerService.emit(
          { cmd: 'customerValidated' },
          {
            orderId,
            products,
          },
        ),
      );
    } else {
      await firstValueFrom(
        this.customerService.emit(
          { cmd: 'customerInvalidated' },
          {
            orderId,
            customerId,
          },
        ),
      );
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
      this.stockService.send<boolean>(
        { cmd: 'reserveStock' },
        {
          products,
        },
      ),
    );
    if (isStockReserved) {
      this.stockService.emit({ cmd: 'stockReserved' }, { orderId });
    } else {
      this.stockService.emit(
        { cmd: 'stockNotAvailable' },
        {
          orderId,
          customerId,
          products,
        },
      );
    }
  }

  async processCustomerInvalidated(orderId: number): Promise<void> {
    this.stockService.emit({ cmd: 'orderCancelled' }, { orderId });
  }

  async processStockReserved(orderId: number): Promise<void> {
    // Perform necessary actions for the stockReserved event
    // Example: Confirm the order
    this.orderService.emit({ cmd: 'orderConfirmed' }, { orderId });
  }

  async processStockNotAvailable({
    orderId,
    customerId,
  }: IUpdateInventoryEvent): Promise<void> {
    this.customerService.emit(
      { cmd: 'refundPayment' },
      {
        orderId,
        customerId,
      },
    );

    this.orderService.emit(
      { cmd: 'orderCancelled' },
      {
        orderId,
      },
    );
  }
}
