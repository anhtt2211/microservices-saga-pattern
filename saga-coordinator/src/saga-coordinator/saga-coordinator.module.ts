import { Module } from '@nestjs/common';
import { SagaCoordinatorController } from './saga-coordinator.controller';
import { SagaCoordinatorService } from './saga-coordinator.service';

@Module({
  controllers: [SagaCoordinatorController],
  providers: [SagaCoordinatorService],
})
export class SagaCoordinatorModule {}
