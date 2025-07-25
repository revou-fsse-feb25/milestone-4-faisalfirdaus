import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/req/create-account.dto';
import { UpdateAccountDto } from './dto/req/update-account.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/common/current-user.decorator';

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

@UseGuards(JwtAuthGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  createAccount(@CurrentUser() user: User, @Body() body: CreateAccountDto) {
    return this.accountsService.createAccount(user, body);
  }

  @Get()
  getAllUserAccounts(@CurrentUser() user: User) {
    return this.accountsService.getAllUserAccounts(user);
  }

  @Get(':id')
  getAccountById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.accountsService.getAccountById(user, id);
  }

  @Patch(':id')
  updateAccount(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAccountDto,
  ) {
    return this.accountsService.updateAccount(user, id, body);
  }

  @Delete(':id')
  removeAccount(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.accountsService.removeAccount(user, id);
  }
}
