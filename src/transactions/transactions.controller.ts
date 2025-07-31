import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Create a deposit transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Deposit transaction created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createDeposit(@Body() body: CreateTransactionDto) {
    return this.transactionsService.createTransaction(body);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Create a withdrawal transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Withdrawal transaction created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createWithdraw(@Body() body: CreateTransactionDto) {
    return this.transactionsService.createTransaction(body);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Create a transfer transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: 201,
    description: 'Transfer transaction created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTransfer(@Body() body: CreateTransactionDto) {
    return this.transactionsService.createTransaction(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions for the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all transactions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllTransactions(@CurrentUser() user) {
    return this.transactionsService.getAllTransactions(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific transaction by its ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Transaction retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactionById(@Param('id', ParseIntPipe) id: number) {
    return this.transactionsService.getTransactionById(id);
  }
}
