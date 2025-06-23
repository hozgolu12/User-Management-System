import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
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
  @IsOptional()
  role?: string = 'user';

  @IsOptional()
  isApproved?: boolean;
}
