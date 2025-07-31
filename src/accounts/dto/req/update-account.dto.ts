import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';
import { AccountType } from '@prisma/client';

export class UpdateAccountDto {
  @ApiProperty({
    description: 'The type of the account (optional)',
    enum: AccountType,
    required: false,
  })
  accountType?: AccountType;

  @ApiProperty({
    description: 'The balance of the account (optional)',
    type: Number,
    minimum: 0,
    required: false,
  })
  balance?: number;
}
