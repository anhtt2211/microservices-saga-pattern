import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class PlaceOrderDto {
  @IsNotEmpty()
  customerId: number;

  @IsNotEmpty()
  items: OrderItemDto[];
}

export class OrderItemDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  price: number;
}
