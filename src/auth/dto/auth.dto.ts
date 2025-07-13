import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEthereumAddress,
  MinLength,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class VerifyTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class NonceDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  walletAddress: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
