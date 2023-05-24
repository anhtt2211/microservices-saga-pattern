import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductEntity } from '../entities';
import { MessagePattern } from '@nestjs/microservices';
import { DeepPartial } from 'typeorm';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get(':id')
  async getProductById(@Param('id') id: number): Promise<ProductEntity> {
    return this.productService.getProductById(id);
  }

  @Post()
  async createProduct(
    @Body() productData: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    return this.productService.createProduct(productData);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: number,
    @Body() productData: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    return this.productService.updateProduct(id, productData);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number): Promise<void> {
    return this.productService.deleteProduct(id);
  }

  @MessagePattern('reserveStock')
  async reserveStock(payload: {
    products: DeepPartial<ProductEntity>[];
  }): Promise<boolean> {
    return await this.productService.reserveStock(payload);
  }

  @MessagePattern('stockReserved')
  async updateInventory(payload: {
    products: DeepPartial<ProductEntity>[];
  }): Promise<boolean> {
    return await this.productService.updateInventory(payload);
  }
}
