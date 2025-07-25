import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterAuthDto } from 'src/auth/dto/req/register-auth.dto';
import { UpdateUserDto } from './dto/req/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(user): Promise<any> {
    const existedUser = await this.getUserById(user.user_id);

    if (!existedUser) {
      throw new NotFoundException('User not found');
    }

    const { password, ...safeUser } = existedUser;
    return safeUser;
  }

  async updateProfile(user, updateData: UpdateUserDto): Promise<any> {
    const existedUser = this.getUserById(user.user_id);

    if (!existedUser) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { user_id: user.user_id },
      data: updateData,
    });

    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }

  async createUser(user: RegisterAuthDto) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });

    return newUser;
  }

  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: id },
    });

    return user;
  }
}
