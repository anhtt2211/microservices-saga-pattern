import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueryHandlers } from '.';
import { ProductEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), CqrsModule],
  providers: [...QueryHandlers],
  controllers: [],
})
export class QueryModule {}
