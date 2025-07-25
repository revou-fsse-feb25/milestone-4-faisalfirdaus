import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
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
  async getProfile(@CurrentUser() user) {
    console.log(user);
    return this.usersService.getProfile(user);
  }

  @Patch('profile')
  async updateProfile(@CurrentUser() user, @Body() body: UpdateUserDto) {
    return this.usersService.updateProfile(user, body);
  }
}
