import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FindAllProductsQuery } from '../impl';
import { ProductEntity } from 'src/entities';

@QueryHandler(FindAllProductsQuery)
export class FindAllProductsQueryHandler
  implements IQueryHandler<FindAllProductsQuery>
{
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async execute(): Promise<ProductEntity[]> {
    return await this.productRepository.find();
  }
}
