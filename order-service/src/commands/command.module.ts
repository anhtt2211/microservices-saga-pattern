import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandHandlers } from '.';
import { OrderEntity, OrderItemEntity } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    CqrsModule,
  ],
  providers: [...CommandHandlers],
})
export class CommandModule {}
