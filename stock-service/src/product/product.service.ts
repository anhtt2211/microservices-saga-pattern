import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities';
import { DeepPartial, In, Repository } from 'typeorm';
import { OrderItemDto } from './product.interface';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async getProducts(): Promise<ProductEntity[]> {
    return this.productRepository.find();
  }

  async getProductById(productId: number): Promise<ProductEntity> {
    return this.productRepository.findOne({ where: { id: productId } });
  }

  async createProduct(
    productData: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async updateProduct(
    productId: number,
    productData: Partial<ProductEntity>,
  ): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    Object.assign(product, productData);
    return this.productRepository.save(product);
  }

  async reserveStock(payload: { products: OrderItemDto[] }): Promise<boolean> {
    const { products } = payload;

    const ids = products.map((prd) => prd.productId);
    const productEntities = await this.productRepository.find({
      where: { id: In(ids) },
    });
    if (productEntities.length !== products.length) {
      Logger.error('At least one of product in payload does not match');
      return false;
    }

    const isReserveStock = productEntities.every(
      (product, index) => product.stockQuantity - products[index].quantity >= 0,
    );

    isReserveStock
      ? Logger.log('Can reserveStock')
      : Logger.error('Cannot reserveStock');

    return isReserveStock;
  }

  async updateInventory(payload: {
    products: OrderItemDto[];
  }): Promise<boolean> {
    const { products } = payload;

    const ids = products.map((prd) => prd.productId);
    const productEntities = await this.productRepository.find({
      where: { id: In(ids) },
    });
    if (productEntities.length !== products.length) {
      Logger.error('At least one of product in payload does not match');
      return false;
    }

    const canReserve = productEntities.every(
      (product, index) => product.stockQuantity - products[index].quantity >= 0,
    );
    if (!canReserve) {
      Logger.error('Cannot reserveStock');
      return false;
    }

    Logger.log('Start updateInventory');
    const productsUpdated: DeepPartial<ProductEntity>[] = productEntities.map(
      (product, index) => ({
        id: product.id,
        stockQuantity: product.stockQuantity - products[index].quantity,
      }),
    );

    return !!(await this.productRepository.save(productsUpdated));
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.productRepository.delete(productId);
  }
}
