import { ProductEntity } from 'src/entities';

export class UpdateProductCommand {
  constructor(
    public readonly productId: number,
    public readonly productData: Partial<ProductEntity>,
  ) {}
}
