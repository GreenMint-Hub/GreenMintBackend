import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { IUser } from '../../users/interfaces/user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-in-production',
      issuer: 'greenmint-api',
      audience: 'greenmint-users',
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        userId: (user as IUser)._id,
        username: user.username,
        email: user.email,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
