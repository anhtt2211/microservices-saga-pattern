import { Module } from '@nestjs/common';
import { RabbitMq } from '../rabbitmq/rabbitmq.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandModule } from './commands/command.module';
import { QueryModule } from './queries/query.module';

@Module({
  imports: [RabbitMq, CqrsModule, CommandModule, QueryModule],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
