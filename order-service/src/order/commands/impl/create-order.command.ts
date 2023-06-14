import { PlaceOrderDto } from '../../order.interface';

export class CreateOrderCommand {
  constructor(public readonly placeOrderDto: PlaceOrderDto) {}
}
