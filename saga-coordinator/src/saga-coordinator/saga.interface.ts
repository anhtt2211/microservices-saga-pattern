import { IsNotEmpty } from 'class-validator';

export interface ICreateOrderEvent {
  orderId: number;
  customerId: number;
  products: OrderItemDto[];
  totalAmount: number;
}

export interface IProcessPaymentEvent {
  orderId: number;
  customerId: number;
  totalAmount: number;
  products: OrderItemDto[];
}

export interface IUpdateInventoryEvent {
  orderId: number;
  customerId: number;
  products: OrderItemDto[];
  totalAmount: number;
}

interface OrderItemDto {
  productId: number;
  quantity: number;
  price: number;
}

export class PlaceOrderDto {
  @IsNotEmpty()
  customerId: number;

  @IsNotEmpty()
  items: OrderItemDto[];
}
