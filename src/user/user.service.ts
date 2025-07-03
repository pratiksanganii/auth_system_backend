import { Injectable } from '@nestjs/common';
import { RegisterDto } from './user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from './user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
  ) {}

  async registerUser(body: RegisterDto) {
    const { accessToken, refreshToken, hashedRefreshToken } =
      await this.generateTokens(body.email);
    const password = await bcrypt.hash(body.password, 10);
    const email = body.email;
    const user = new this.userModel({ email, password, hashedRefreshToken });
    await user.save();
    return { email, accessToken, refreshToken };
  }

  private async generateTokens(email: string) {
    const accessToken = this.generateToken(email);
    const refreshToken = this.generateToken(email, true);
    const hashedRefreshToken = await bcrypt.hash(this.sha256(refreshToken), 10);
    return { hashedRefreshToken, accessToken, refreshToken };
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private generateToken(email: string, isRefresh = false) {
    const secret =
      process.env?.[isRefresh ? 'JWT_REFRESH_SECRET' : 'JWT_SECRET'];
    const expiresIn = isRefresh ? '48hr' : '8hr';
    return jwt.sign({ email }, secret, { expiresIn });
  }
}
