import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ICreateOrderEvent,
  IProcessPaymentEvent,
  IUpdateInventoryEvent,
  PlaceOrderDto,
} from './saga.interface';
import { v4 } from 'uuid';

@Injectable()
export class SagaCoordinatorService {
  constructor(
    @Inject('orderService')
    private readonly orderService: ClientProxy,

    @Inject('customerService')
    private readonly customerService: ClientProxy,

    @Inject('stockService')
    private readonly stockService: ClientProxy,
  ) {}

  async handleCreateOrder(placeOrderDto: PlaceOrderDto) {
    try {
      const order = await firstValueFrom(
        this.orderService.send({ cmd: 'createOrder' }, { ...placeOrderDto }),
      );
      if (order) {
        this.orderService.emit({ cmd: 'orderCreated' }, order);
      }

      return order;
    } catch (error) {
      Logger.error('handleCreateOrder:error');
      Logger.error(error);
    }
  }

  async processOrderCreated({
    customerId,
    orderId,
    products,
    totalAmount,
  }: ICreateOrderEvent): Promise<void> {
    try {
      const isPay = await firstValueFrom(
        this.customerService.send<boolean>(
          { cmd: 'processPayment' },
          {
            customerId,
            totalAmount,
          },
        ),
      );

      if (isPay) {
        this.customerService.emit(
          { cmd: 'customerValidated' },
          { orderId, customerId, products, totalAmount },
        );
      } else {
        this.customerService.emit({ cmd: 'customerInvalidated' }, { orderId });
      }
    } catch (error) {
      Logger.error('processOrderCreated:error');
      Logger.error(error);
    }
  }

  async processCustomerValidated({
    orderId,
    customerId,
    products,
    totalAmount,
  }: IProcessPaymentEvent): Promise<void> {
    try {
      const isReserveStock = await firstValueFrom(
        this.stockService.send<boolean>(
          { cmd: 'reserveStock' },
          {
            products,
          },
        ),
      );
      if (isReserveStock) {
        this.stockService.emit({ cmd: 'stockReserved' }, { orderId, products });
      } else {
        this.stockService.emit(
          { cmd: 'stockNotAvailable' },
          {
            orderId,
            customerId,
            products,
            totalAmount,
          },
        );
      }
    } catch (error) {
      Logger.error('processCustomerValidated:error');
      Logger.error(error);
    }
  }

  async processCustomerInvalidated(orderId: number): Promise<void> {
    Logger.verbose('processCustomerInvalidated');
    this.orderService.emit({ cmd: 'orderCancelled' }, { orderId });
  }

  async processStockReserved({
    orderId,
    products,
  }: IUpdateInventoryEvent): Promise<void> {
    try {
      const isStockReserve = await firstValueFrom(
        this.stockService.send<boolean>(
          { cmd: 'updateInventory' },
          { products },
        ),
      );
      if (isStockReserve) {
        this.orderService.emit({ cmd: 'orderConfirmed' }, { orderId });
      }
    } catch (error) {
      Logger.error('processStockReserved:error');
      Logger.error(error);
    }
  }

  async processStockNotAvailable({
    orderId,
    customerId,
    totalAmount,
  }: IUpdateInventoryEvent): Promise<void> {
    this.customerService.emit(
      { cmd: 'refundPayment' },
      {
        customerId,
        totalAmount,
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
