import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/req/update-user.dto';
import { CurrentUser } from 'src/common/current-user.decorator';
import { Role, Roles } from 'src/common/user-role.decorator';
import { RoleGuard } from 'src/auth/guards/user-role.guard';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.USER, Role.ADMIN)
  @Get('profile')
  @ApiOperation({ summary: 'Get the profile of the logged-in user' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the user profile',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user) {
    console.log(user);
    return this.usersService.getProfile(user);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update the profile of the logged-in user' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the user profile',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async updateProfile(@CurrentUser() user, @Body() body: UpdateUserDto) {
    return this.usersService.updateProfile(user, body);
  }
}
