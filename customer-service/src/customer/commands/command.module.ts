import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandHandlers } from '.';
import { CustomerEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity]), CqrsModule],
  providers: [...CommandHandlers],
})
export class CommandModule {}
