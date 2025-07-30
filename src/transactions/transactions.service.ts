import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Assuming you are using Prisma as ORM
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Prisma } from '@prisma/client'; // Assuming Prisma enum for transaction type

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new transaction (deposit, withdrawal, transfer)
  async createTransaction(body: CreateTransactionDto) {
    const { amount, transactionType, description, account_id } = body;

    const account = await this.prisma.account.findUnique({
      where: { account_id: account_id },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    let updatedBalance = account.balance;

    if (transactionType === 'DEPOSIT') {
      updatedBalance = updatedBalance.add(amount);
    } else if (transactionType === 'WITHDRAWAL') {
      if (account.balance.lessThan(new Prisma.Decimal(amount))) {
        throw new Error('Insufficient funds');
      }
      updatedBalance = updatedBalance.sub(amount);
    } else if (transactionType === 'TRANSFER') {
      if (account.balance.lessThan(new Prisma.Decimal(amount))) {
        throw new Error('Insufficient funds');
      }
      updatedBalance = updatedBalance.sub(amount);
    } else {
      throw new Error('Invalid transaction type');
    }

    // Create the transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        amount,
        type: transactionType,
        description,
        account_id,
      },
    });

    // Update the account balance after the transaction
    await this.prisma.account.update({
      where: { account_id },
      data: { balance: updatedBalance },
    });

    return transaction;
  }

  // Get all transactions
  async getAllTransactions(user) {
    const accounts = await this.prisma.account.findMany({
      where: { user_id: user.user_id },
      select: { account_id: true },
    });

    console.log(accounts);

    const accountIds = accounts.map((account) => account.account_id);

    console.log(accountIds);

    return this.prisma.transaction.findMany({
      where: {
        account_id: { in: accountIds },
      },
      include: {
        account: true,
      },
      orderBy: { transaction_at: 'desc' },
    });
  }

  // Get a single transaction by ID
  async getTransactionById(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { transaction_id: id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }
}
