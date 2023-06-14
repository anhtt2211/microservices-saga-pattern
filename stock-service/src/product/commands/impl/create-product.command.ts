import { ProductEntity } from 'src/entities';

export class CreateProductCommand {
  constructor(public readonly productData: Partial<ProductEntity>) {}
}
