import { RegisterAuthDto } from 'src/auth/dto/req/register-auth.dto';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(RegisterAuthDto) {
  @ApiProperty({
    description: 'The name of the user (optional)',
    type: String,
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'The email of the user (optional)',
    type: String,
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'The password of the user (optional)',
    type: String,
    required: false,
  })
  password?: string;
}
