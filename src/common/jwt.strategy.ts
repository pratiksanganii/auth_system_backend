import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Model } from 'mongoose';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserModel } from 'src/user/user.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      expiresIn: process.env?.JWT_SECRET_EXPIRE_IN ?? '8h',
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('payload?.id', payload);
    if (!payload?.id) throw new UnauthorizedException('User not found');
    const user = await this.userModel.findOne({ id: payload.id });
    if (!user) throw new UnauthorizedException('User not found');

    return { id: user.id, email: user.email };
  }
}
