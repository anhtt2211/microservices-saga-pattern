import { Module } from '@nestjs/common';
import { SagaCoordinatorModule } from './saga-coordinator/saga-coordinator.module';

@Module({
  imports: [SagaCoordinatorModule],
})
export class AppModule {}
