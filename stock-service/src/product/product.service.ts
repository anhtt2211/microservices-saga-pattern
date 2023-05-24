import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities';
import { In, Repository } from 'typeorm';

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

  async checkProductAvailability(ids: number[]): Promise<boolean> {
    return true;
  }

  async deleteProduct(productId: number): Promise<void> {
    await this.productRepository.delete(productId);
  }
}
