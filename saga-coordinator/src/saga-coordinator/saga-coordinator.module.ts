import { Module } from '@nestjs/common';
import { SagaCoordinatorController } from './saga-coordinator.controller';
import { SagaCoordinatorService } from './saga-coordinator.service';
import { RabbitMq } from 'src/rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitMq],
  controllers: [SagaCoordinatorController],
  providers: [SagaCoordinatorService],
})
export class SagaCoordinatorModule {}
