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
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a new account' })
  @ApiBody({ type: CreateAccountDto })
  @ApiResponse({ status: 201, description: 'Account created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createAccount(@CurrentUser() user: User, @Body() body: CreateAccountDto) {
    return this.accountsService.createAccount(user, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accounts for the logged-in user' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved accounts' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAllUserAccounts(@CurrentUser() user: User) {
    return this.accountsService.getAllUserAccounts(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an account by its ID' })
  @ApiParam({ name: 'id', description: 'Account ID', type: Number })
  @ApiResponse({ status: 200, description: 'Account retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getAccountById(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.accountsService.getAccountById(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an account by its ID' })
  @ApiParam({ name: 'id', description: 'Account ID', type: Number })
  @ApiBody({ type: UpdateAccountDto })
  @ApiResponse({ status: 200, description: 'Account updated successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateAccount(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAccountDto,
  ) {
    return this.accountsService.updateAccount(user, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an account by its ID' })
  @ApiParam({ name: 'id', description: 'Account ID', type: Number })
  @ApiResponse({ status: 200, description: 'Account deleted successfully' })
  @ApiResponse({ status: 404, description: 'Account not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeAccount(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.accountsService.removeAccount(user, id);
  }
}
