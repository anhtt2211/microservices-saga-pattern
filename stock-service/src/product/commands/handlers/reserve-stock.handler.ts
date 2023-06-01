import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ProductEntity } from '../../../entities';
import { ReserveStockCommand } from '../impl';

@CommandHandler(ReserveStockCommand)
export class ReserveStockCommandHandler
  implements ICommandHandler<ReserveStockCommand>
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async execute({ products }: ReserveStockCommand): Promise<boolean> {
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
}
