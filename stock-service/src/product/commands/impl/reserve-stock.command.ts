import { OrderItemDto } from 'src/product/product.interface';

export class ReserveStockCommand {
  constructor(public readonly products: OrderItemDto[]) {}
}
