import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/req/create-account.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateAccountDto } from './dto/req/update-account.dto';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export type User = {
  user_id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
};

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAccount(user: User, body: CreateAccountDto): Promise<any> {
    return await this.prisma.account.create({
      data: {
        user_id: user.user_id,
        balance: body.balance,
        type: body.accountType,
      },
    });
  }

  async getAllUserAccounts(user: User): Promise<any> {
    return await this.prisma.account.findMany({
      where: { user_id: user.user_id },
    });
  }

  async getAccountById(user: User, id: number): Promise<any> {
    try {
      const account = await this.prisma.account.findUnique({
        where: {
          account_id: id,
          user_id: user.user_id,
        },
      });
    } catch (error) {
      throw new NotFoundException('Account not found');
    }
  }

  async updateAccount(
    user: User,
    id: number,
    updateData: UpdateAccountDto,
  ): Promise<any> {
    const account = await this.getAccountById(user, id);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return await this.prisma.account.update({
      where: {
        account_id: id,
        user_id: user.user_id,
      },
      data: updateData,
    });
  }

  async removeAccount(user: User, id: number): Promise<any> {
    const account = await this.getAccountById(user, id);

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    return await this.prisma.account.delete({
      where: {
        account_id: id,
        user_id: user.user_id,
      },
    });
  }
}
