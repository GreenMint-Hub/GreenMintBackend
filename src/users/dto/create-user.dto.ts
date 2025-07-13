import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  verificationToken?: string | null;

  @IsOptional()
  @IsString()
  resetToken?: string | null;
} 