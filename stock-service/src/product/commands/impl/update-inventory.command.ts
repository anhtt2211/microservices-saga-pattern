import { OrderItemDto } from 'src/product/product.interface';

export class UpdateInventoryCommand {
  constructor(public readonly products: OrderItemDto[]) {}
}
