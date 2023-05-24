import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../entities';
import { SagaModule } from '../saga/saga.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), SagaModule],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
