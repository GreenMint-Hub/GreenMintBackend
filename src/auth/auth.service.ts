import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { UsersService } from '../users/users.service';
import { IUser } from '../users/interfaces/user.interface';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../common/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      isVerified: false,
      verificationToken: uuidv4(),
      role: registerDto.role || 'user', // Default to 'user' if not provided
    });

    const payload = { sub: newUser['_id'], email: newUser.email, role: newUser.role };
    const accessToken = this.jwtService.sign(payload);

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        newUser.email,
        newUser.username,
        newUser.verificationToken!
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error here, user can still use the app
    }

    return { 
      message: 'Registered successfully. Please check your email to verify your account.', 
      user: newUser,
      accessToken 
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user['_id'], email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      user,
      accessToken,
    };
  }

  async loginWithEmail(email: string, password: string) {
    return this.login({ email, password });
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return {
      accessToken: this.jwtService.sign({ sub: user['_id'], email: user.email }),
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(userId, { password: hashedPassword });
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const resetToken = uuidv4();
    await this.usersService.update(user['_id'], { resetToken });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.username,
        resetToken
      );
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error here, user can still request again
    }
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) throw new UnauthorizedException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user['_id'], { 
      password: hashedPassword, 
      resetToken: null 
    });
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new UnauthorizedException('Invalid verification token');

    await this.usersService.update(user['_id'], { 
      isVerified: true, 
      verificationToken: null 
    });
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');

    const verificationToken = uuidv4();
    await this.usersService.update(user['_id'], { verificationToken });

    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.username,
        verificationToken
      );
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't throw error here, user can still request again
    }
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
