import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SagaModule } from './saga.module';

@Module({
  imports: [SagaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
