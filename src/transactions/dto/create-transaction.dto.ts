import { transactionType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({
    description: 'The ID of the account associated with the transaction',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @ApiProperty({
    description: 'The amount of the transaction',
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'The type of the transaction',
    enum: transactionType, // Automatically generates enum values from the Prisma transactionType enum
  })
  @IsNotEmpty()
  @IsEnum(transactionType)
  transactionType: transactionType;

  @ApiProperty({
    description: 'A description of the transaction (optional)',
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
