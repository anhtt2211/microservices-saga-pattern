// saga-coordinator.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { EventPattern, MessagePattern, Transport } from '@nestjs/microservices';
import { SagaCoordinatorService } from './saga-coordinator.service';
import {
  ICreateOrderEvent,
  IProcessPaymentEvent,
  IUpdateInventoryEvent,
  PlaceOrderDto,
} from './saga.interface';

@Controller()
export class SagaCoordinatorController {
  constructor(
    private readonly sagaCoordinatorService: SagaCoordinatorService,
  ) {}

  @Post('/orders')
  async createOrder(@Body() createOrderDto: PlaceOrderDto) {
    return await this.sagaCoordinatorService.handleCreateOrder(createOrderDto);
  }

  @MessagePattern({ cmd: 'orderCreated' }, Transport.RMQ)
  async handleOrderCreated(payload: ICreateOrderEvent): Promise<void> {
    await this.sagaCoordinatorService.processOrderCreated(payload);
  }

  @EventPattern({ cmd: 'customerValidated' }, Transport.RMQ)
  async handleCustomerValidated(payload: IProcessPaymentEvent): Promise<void> {
    await this.sagaCoordinatorService.processCustomerValidated(payload);
  }

  @EventPattern({ cmd: 'customerInvalidated' }, Transport.RMQ)
  async handleCustomerInvalidated(
    payload: IProcessPaymentEvent,
  ): Promise<void> {
    await this.sagaCoordinatorService.processCustomerInvalidated(
      payload.orderId,
    );
  }

  @EventPattern({ cmd: 'stockReserved' }, Transport.RMQ)
  async handleStockReserved(payload: IUpdateInventoryEvent): Promise<void> {
    await this.sagaCoordinatorService.processStockReserved(payload.orderId);
  }

  @EventPattern({ cmd: 'stockNotAvailable' }, Transport.RMQ)
  async handleStockNotAvailable(payload: IUpdateInventoryEvent): Promise<void> {
    await this.sagaCoordinatorService.processStockNotAvailable(payload);
  }
}
