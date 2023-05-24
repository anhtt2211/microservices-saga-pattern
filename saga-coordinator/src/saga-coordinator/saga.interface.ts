export interface ICreateOrderEvent {
  orderId: number;
  customerId: number;
  products: OrderItemDto[];
  totalAmount: number;
}

export interface IProcessPaymentEvent {
  orderId: number;
  customerId: number;
  products: OrderItemDto[];
}

export interface IUpdateInventoryEvent {
  orderId: number;
  customerId: number;
}

interface OrderItemDto {
  productId: number;
  quantity: number;
  price: number;
}
