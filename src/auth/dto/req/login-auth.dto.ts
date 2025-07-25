import { IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthrDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
