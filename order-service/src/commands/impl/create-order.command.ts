import { PlaceOrderDto } from '../../order/order.interface';

export class CreateOrderCommand {
  constructor(public readonly placeOrderDto: PlaceOrderDto) {}
}
