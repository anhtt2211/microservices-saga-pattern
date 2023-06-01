import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';

import { ProductEntity } from '../../../entities';
import { UpdateInventoryCommand } from '../impl';

@CommandHandler(UpdateInventoryCommand)
export class UpdateInventoryCommandHandler
  implements ICommandHandler<UpdateInventoryCommand>
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async execute({ products }: UpdateInventoryCommand): Promise<boolean> {
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
}
