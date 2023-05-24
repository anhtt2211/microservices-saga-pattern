// saga-coordinator.controller.ts

import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import { SagaCoordinatorService } from './saga-coordinator.service';

@Controller()
export class SagaCoordinatorController {
  constructor(
    private readonly sagaCoordinatorService: SagaCoordinatorService,
  ) {}

  @MessagePattern('orderCreated')
  async handleOrderCreated(payload: {
    orderId: number;
    customerId: number;
    totalAmount: number;
  }): Promise<void> {
    await this.sagaCoordinatorService.processOrderCreated(payload);
  }

  @EventPattern('customerValidated')
  async handleCustomerValidated(payload: { orderId: number }): Promise<void> {
    await this.sagaCoordinatorService.processCustomerValidated(payload.orderId);
  }

  @EventPattern('customerInvalidated')
  async handleCustomerInvalidated(payload: { orderId: number }): Promise<void> {
    await this.sagaCoordinatorService.processCustomerInvalidated(
      payload.orderId,
    );
  }

  @EventPattern('stockReserved')
  async handleStockReserved(payload: { orderId: number }): Promise<void> {
    await this.sagaCoordinatorService.processStockReserved(payload.orderId);
  }

  @EventPattern('stockNotAvailable')
  async handleStockNotAvailable(payload: { orderId: number }): Promise<void> {
    await this.sagaCoordinatorService.processStockNotAvailable(payload.orderId);
  }
}
