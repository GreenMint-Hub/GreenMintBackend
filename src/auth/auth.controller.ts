import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  RegisterDto as AuthRegisterDto,
  LoginDto as AuthLoginDto,
  ChangePasswordDto,
  VerifyTokenDto,
  NonceDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: AuthRegisterDto) {
    if (!registerDto.username || !registerDto.email || !registerDto.password) {
      throw new BadRequestException(
        'Username, email, and password are required',
      );
    }
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: AuthLoginDto) {
    if (!loginDto.email && !loginDto.password) {
      throw new BadRequestException('Either email or password is required');
    }
    return this.authService.login(loginDto);
  }

  @Post('login/email')
  async loginWithEmail(@Body() body: { email: string; password: string }) {
    if (!body.email || !body.password) {
      throw new BadRequestException('Email and password are required');
    }
    return this.authService.loginWithEmail(body.email, body.password);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.user.userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Request() req, @Body() body: ChangePasswordDto) {
    if (!body.currentPassword || !body.newPassword) {
      throw new BadRequestException(
        'Current password and new password are required',
      );
    }
    await this.authService.changePassword(
      req.user.userId,
      body.currentPassword,
      body.newPassword,
    );
    return { message: 'Password changed successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    await this.authService.forgotPassword(body.email);
    return { message: 'Password reset email sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    if (!body.token || !body.newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    await this.authService.resetPassword(body.token, body.newPassword);
    return { message: 'Password reset successfully' };
  }

  @Post('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Get('verify-email/:token')
  async verifyEmailGet(@Param('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Post('resend-verification')
  async resendVerification(@Body() body: { email: string }) {
    if (!body.email) {
      throw new BadRequestException('Email is required');
    }
    await this.authService.resendVerificationEmail(body.email);
    return { message: 'Verification email sent' };
  }

  // @Get('nonce')
  // async getNonce(@Body() body: NonceDto) {
  //   if (!body.walletAddress) {
  //     throw new BadRequestException('Wallet address is required');
  //   }
  //   const nonce = this.authService.generateNonce(body.walletAddress);
  //   return {
  //     nonce,
  //     walletAddress: body.walletAddress,
  //   };
  // }

  @Post('verify')
  async verifyToken(@Body() body: VerifyTokenDto) {
    if (!body.token) {
      throw new BadRequestException('Token is required');
    }
    try {
      const user = await this.authService.validateToken(body.token);
      return {
        valid: true,
        user,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    return { message: 'Logged out successfully' };
  }
}
