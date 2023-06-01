import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { QueryHandlers } from '.';
import { CustomerEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity]), CqrsModule],
  providers: [...QueryHandlers],
  controllers: [],
})
export class QueryModule {}
