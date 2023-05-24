import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  fullName: string;
}
