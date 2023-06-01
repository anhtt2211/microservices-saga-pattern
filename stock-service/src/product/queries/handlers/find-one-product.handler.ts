import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FindOneProductQuery } from '../impl';
import { ProductEntity } from 'src/entities';

@QueryHandler(FindOneProductQuery)
export class FindOneProductQueryHandler
  implements IQueryHandler<FindOneProductQuery>
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async execute({ productId }: FindOneProductQuery): Promise<ProductEntity> {
    return await this.productRepository.findOne({ where: { id: productId } });
  }
}
