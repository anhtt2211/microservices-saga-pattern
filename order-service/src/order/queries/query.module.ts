import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueryHandlers } from '.';
import { OrderEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity]), CqrsModule],
  providers: [...QueryHandlers],
  controllers: [],
})
export class QueryModule {}
