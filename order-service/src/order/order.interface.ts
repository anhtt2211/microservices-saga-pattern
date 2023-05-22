import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class ICreateOrderDto {
  @IsNotEmpty()
  customerId: number;

  @IsNotEmpty()
  stockId: number;

  @IsNumber()
  @IsPositive()
  totalAmount: number;
}
