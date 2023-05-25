import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { MessagePattern, Transport } from '@nestjs/microservices';
import { ProductEntity } from '../entities';
import { OrderItemDto } from './product.interface';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('')
  async getProducts(): Promise<ProductEntity[]> {
    return this.productService.getProducts();
  }

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

  @MessagePattern({ cmd: 'reserveStock' }, Transport.RMQ)
  async reserveStock(payload: { products: OrderItemDto[] }): Promise<boolean> {
    return await this.productService.reserveStock(payload);
  }

  @MessagePattern({ cmd: 'updateInventory' }, Transport.RMQ)
  async updateInventory(payload: {
    products: OrderItemDto[];
  }): Promise<boolean> {
    return await this.productService.updateInventory(payload);
  }
}
