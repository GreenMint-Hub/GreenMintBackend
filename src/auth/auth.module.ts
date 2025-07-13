import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { EmailService } from '../common/services/email.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-in-production',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        issuer: 'greenmint-api',
        audience: 'greenmint-users',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
