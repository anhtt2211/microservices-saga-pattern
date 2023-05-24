// saga-coordinator.controller.ts

import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { SagaCoordinatorService } from './saga-coordinator.service';
import {
  IProcessPaymentEvent,
  ICreateOrderEvent,
  IUpdateInventoryEvent,
} from './saga.interface';

@Controller()
export class SagaCoordinatorController {
  constructor(
    private readonly sagaCoordinatorService: SagaCoordinatorService,
  ) {}

  @MessagePattern('orderCreated')
  async handleOrderCreated(payload: ICreateOrderEvent): Promise<void> {
    await this.sagaCoordinatorService.processOrderCreated(payload);
  }

  @EventPattern('customerValidated')
  async handleCustomerValidated(payload: IProcessPaymentEvent): Promise<void> {
    await this.sagaCoordinatorService.processCustomerValidated(payload);
  }

  @EventPattern('customerInvalidated')
  async handleCustomerInvalidated(
    payload: IProcessPaymentEvent,
  ): Promise<void> {
    await this.sagaCoordinatorService.processCustomerInvalidated(
      payload.orderId,
    );
  }

  @EventPattern('stockReserved')
  async handleStockReserved(payload: IUpdateInventoryEvent): Promise<void> {
    await this.sagaCoordinatorService.processStockReserved(payload.orderId);
  }

  @EventPattern('stockNotAvailable')
  async handleStockNotAvailable(payload: IUpdateInventoryEvent): Promise<void> {
    await this.sagaCoordinatorService.processStockNotAvailable(payload);
  }
}
