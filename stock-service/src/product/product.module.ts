import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from '../entities';
import { SagaModule } from '../saga/saga.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity]), SagaModule],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
