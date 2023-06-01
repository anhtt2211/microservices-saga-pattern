import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ProductEntity } from 'src/entities';
import {
  CreateProductCommand,
  DeleteProductCommand,
  ReserveStockCommand,
  UpdateInventoryCommand,
  UpdateProductCommand,
} from './commands';
import { OrderItemDto } from './product.interface';
import { FindAllProductsQuery, FindOneProductQuery } from './queries';

@Injectable()
export class ProductService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async getProducts(): Promise<ProductEntity[]> {
    return await this.queryBus.execute(new FindAllProductsQuery());
  }

  async getProductById(productId: number): Promise<ProductEntity> {
    return await this.queryBus.execute(new FindOneProductQuery(productId));
  }

  async createProduct(
    productData: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    return await this.commandBus.execute(new CreateProductCommand(productData));
  }

  async updateProduct(
    productId: number,
    productData: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    return await this.commandBus.execute(
      new UpdateProductCommand(productId, productData),
    );
  }

  async reserveStock(payload: { products: OrderItemDto[] }): Promise<boolean> {
    return await this.commandBus.execute(
      new ReserveStockCommand(payload.products),
    );
  }

  async updateInventory(payload: {
    products: OrderItemDto[];
  }): Promise<boolean> {
    return await this.commandBus.execute(
      new UpdateInventoryCommand(payload.products),
    );
  }

  async deleteProduct(productId: number): Promise<void> {
    return await this.commandBus.execute(new DeleteProductCommand(productId));
  }
}
