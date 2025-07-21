import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  role?: 'user' | 'admin';

  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  verificationToken?: string | null;

  @IsString()
  @IsOptional()
  resetToken?: string | null;
}

export class UpdateUserDto {
  @IsOptional()
  username?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  password?: string;

  @IsOptional()
  role?: 'user' | 'admin';

  @IsOptional()
  isVerified?: boolean;

  @IsString()
  @IsOptional()
  verificationToken?: string | null;

  @IsString()
  @IsOptional()
  resetToken?: string | null;
} 