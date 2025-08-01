import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/req/register-auth.dto';
import { LoginAuthrDto } from './dto/req/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(body: RegisterAuthDto): Promise<any> {
    // Check if user already exists
    const existingUser = await this.userService.getUserByEmail(body.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Optionally hash the password (not done here per your request)
    const newUser = await this.userService.createUser({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
    });

    // Remove password before returning response
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(body: LoginAuthrDto): Promise<any> {
    // Find the user
    const user = await this.userService.getUserByEmail(body.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Prepare JWT payload
    const payload = { email: user.email, sub: user.user_id, role: user.role };

    // Generate and return JWT token
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
