import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities';
import { DeepPartial, In, Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

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

  async updateInventory(payload: {
    products: DeepPartial<ProductEntity>[];
  }): Promise<boolean> {
    const { products } = payload;

    const ids = products.map((prd) => prd.id);
    const productEntities = await this.productRepository.find({
      where: { id: In(ids) },
    });
    if (productEntities.length !== products.length) {
      Logger.error('At least one of product in payload does not match');
      return false;
    }

    const productsUpdated = productEntities.map((product, index) => ({
      id: product.id,
      quantity: product.stockQuantity - products[index].stockQuantity,
    }));

    return !!(await this.productRepository.save(productsUpdated));
  }

  async compensateUpdateInventory(payload: {
    products: DeepPartial<ProductEntity>[];
  }): Promise<boolean> {
    const { products } = payload;

    const ids = products.map((prd) => prd.id);
    const productEntities = await this.productRepository.find({
      where: { id: In(ids) },
    });
    if (productEntities.length !== products.length) {
      Logger.error('At least one of product in payload does not match');
      return false;
    }

    const productsUpdated = productEntities.map((product, index) => ({
      id: product.id,
      quantity: product.stockQuantity + products[index].stockQuantity,
    }));

    return !!(await this.productRepository.save(productsUpdated));
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.productRepository.delete(productId);
  }
}
