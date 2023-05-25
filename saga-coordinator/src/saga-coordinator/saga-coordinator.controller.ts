// saga-coordinator.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import {
  EventPattern,
  MessagePattern,
  Payload,
  Transport,
} from '@nestjs/microservices';
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

  @EventPattern({ cmd: 'orderCreated' }, Transport.RMQ)
  async handleOrderCreated(
    @Payload() payload: ICreateOrderEvent,
  ): Promise<void> {
    await this.sagaCoordinatorService.processOrderCreated(payload);
  }

  @EventPattern({ cmd: 'customerValidated' }, Transport.RMQ)
  async handleCustomerValidated(
    @Payload() payload: IProcessPaymentEvent,
  ): Promise<void> {
    await this.sagaCoordinatorService.processCustomerValidated(payload);
  }

  @EventPattern({ cmd: 'customerInvalidated' }, Transport.RMQ)
  async handleCustomerInvalidated(
    @Payload() payload: IProcessPaymentEvent,
  ): Promise<void> {
    await this.sagaCoordinatorService.processCustomerInvalidated(
      payload.orderId,
    );
  }

  @EventPattern({ cmd: 'stockReserved' }, Transport.RMQ)
  async handleStockReserved(
    @Payload() payload: IUpdateInventoryEvent,
  ): Promise<void> {
    await this.sagaCoordinatorService.processStockReserved(payload);
  }

  @EventPattern({ cmd: 'stockNotAvailable' }, Transport.RMQ)
  async handleStockNotAvailable(
    @Payload() payload: IUpdateInventoryEvent,
  ): Promise<void> {
    await this.sagaCoordinatorService.processStockNotAvailable(payload);
  }
}
