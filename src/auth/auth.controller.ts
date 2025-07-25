import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/req/register-auth.dto';
import { LoginAuthrDto } from './dto/req/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: RegisterAuthDto) {
    return this.authService.register(body);
  }

  @Post('login')
  login(@Body() body: LoginAuthrDto) {
    return this.authService.login(body);
  }
}
