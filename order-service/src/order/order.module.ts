import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../entities';
import { OrderItemEntity } from '../entities/order-item.entity';
import { RabbitMq } from '../rabbitmq/rabbitmq.module';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandModule } from './commands/command.module';
import { QueryModule } from './queries/query.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    RabbitMq,
    CqrsModule,
    CommandModule,
    QueryModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
