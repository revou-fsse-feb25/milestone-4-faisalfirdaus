import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';
import { Account } from 'src/accounts/entities/account.entity';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Untuk POST bisa pakai params tidak??????
  @Post('deposit')
  async createDeposit(@Body() body: CreateTransactionDto) {
    return this.transactionsService.createTransaction(body);
  }

  @Post('withdraw')
  async createWithdraw(@Body() body: CreateTransactionDto) {
    return this.transactionsService.createTransaction(body);
  }

  @Post('transfer')
  async createTransfer(@Body() body: CreateTransactionDto) {
    return this.transactionsService.createTransaction(body);
  }

  @Get()
  async getALlTransactions(@CurrentUser() user) {
    return this.transactionsService.getAllTransactions(user);
  }

  @Get(':id')
  async getTransactionById(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.getTransactionById(id);
  }
}

// STEP 1. user ngirim request get all transaction dari 1 Account
// STEP 2. service cari semua account berdasarkan user_id
// STEP 3. service mengembalikan list account yang dimiliki user_id tersebut
// STEP 4. sevice mencari semua transaction dari list account
// STEP 5. service
