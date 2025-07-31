import { IsNotEmpty, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty({
    description: 'The type of the account',
    enum: AccountType, // This will automatically show the available enum values in Swagger
  })
  @IsNotEmpty()
  @IsEnum(AccountType)
  accountType: AccountType;

  @ApiProperty({
    description: 'The balance of the account',
    type: Number,
    minimum: 0, // Specifies the minimum value of the balance
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  balance: number;
}
