import { IsEmail, IsString, IsEnum, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  address: string;

  @IsEnum(['user', 'admin'])
  role: string;
}
