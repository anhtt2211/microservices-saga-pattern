import { Injectable, Logger } from '@nestjs/common';
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
  PlaceOrderDto,
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
        urls: ['amqp://localhost'],
        queue: 'order-queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    this.customerService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost'],
        queue: 'customer-queue',
        queueOptions: {
          durable: true,
        },
      },
    });

    this.stockService = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost'],
        queue: 'stock-queue',
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async handleCreateOrder(placeOrderDto: PlaceOrderDto) {
    const order = await firstValueFrom(
      this.orderService.send({ cmd: 'createOrder' }, placeOrderDto),
    );
    if (order) {
      this.orderService.emit({ cmd: 'orderCreated' }, order);
    }

    return order;
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
            customerId,
            totalAmount,
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
    totalAmount,
  }: IProcessPaymentEvent): Promise<void> {
    // Example: Reserve the stock for the order

    const isProcessPayment = await firstValueFrom(
      this.customerService.send<boolean>(
        { cmd: 'customerValidated' },
        {
          customerId,
          totalAmount,
        },
      ),
    );
    if (isProcessPayment) {
      const isStockReserved = await firstValueFrom(
        this.stockService.send<boolean>(
          { cmd: 'reserveStock' },
          {
            products,
          },
        ),
      );
      if (isStockReserved) {
        Logger.log('Start update inventory');
        this.stockService.send({ cmd: 'stockReserved' }, { orderId });

        this.stockService.emit({ cmd: 'stockReserved' }, { orderId });
      } else {
        Logger.error('Stock cannot reserve');
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
  }

  async processCustomerInvalidated(orderId: number): Promise<void> {
    this.orderService.emit({ cmd: 'orderCancelled' }, { orderId });
  }

  async processStockReserved(orderId: number): Promise<void> {
    // Perform necessary actions for the stockReserved event
    // Example: Confirm the order
    this.orderService.emit({ cmd: 'orderConfirmed' }, { orderId });
  }

  async processStockNotAvailable({
    orderId,
    customerId,
    totalAmount,
  }: IUpdateInventoryEvent): Promise<void> {
    Logger.error('Refund payment');
    this.customerService.emit(
      { cmd: 'refundPayment' },
      {
        customerId,
        totalAmount,
      },
    );

    Logger.error('Cancel order');
    this.orderService.emit(
      { cmd: 'orderCancelled' },
      {
        orderId,
      },
    );
  }
}
