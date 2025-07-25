import { IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsEnum(AccountType)
  accountType: AccountType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  balance: number;
}
