import { Module } from '@nestjs/common';
import { SagaCoordinatorModule } from './saga-coordinator/saga-coordinator.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';

@Module({
  imports: [
    DevtoolsModule.register({
      http: true,
    }),
    SagaCoordinatorModule,
  ],
})
export class AppModule {}
