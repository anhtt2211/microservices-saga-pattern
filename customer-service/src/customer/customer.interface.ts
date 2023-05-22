import { IsNotEmpty, IsEmail, Length } from 'class-validator';

export class CreateCustomerDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(5, 100)
  address: string;
}
