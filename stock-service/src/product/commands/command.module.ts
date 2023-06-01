import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommandHandlers } from '.';
import { ProductEntity } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), CqrsModule],
  providers: [...CommandHandlers],
})
export class CommandModule {}
