import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  GenerateTokenPayload,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
} from './user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { UserModel } from './user.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { GetUserRole } from 'src/common/auth.decorator';
import { StringValue } from 'ms';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
  ) {}

  async registerUser(body: RegisterDto) {
    // check if email already registered.
    await this.checkExist(body.email, 'register');
    const password = await bcrypt.hash(body.password, 10);
    const email = body.email;
    const user = new this.userModel({ email, password });
    await user.save();
    const { accessToken, refreshToken } = await this.generateTokens({
      email: user.email,
      _id: user.id,
    });
    return { user: { email }, accessToken, refreshToken };
  }

  private async generateTokens(user: GenerateTokenPayload) {
    const accessToken = this.generateToken(user._id);
    const refreshToken = this.generateToken(user._id, true);
    const hashedRefreshToken = await bcrypt.hash(this.sha256(refreshToken), 10);
    // update refresh token
    await this.userModel.findOneAndUpdate(
      { id: user._id },
      { $set: { hashedRefreshToken } },
    );
    return { hashedRefreshToken, accessToken, refreshToken };
  }

  private sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  private generateToken(id: string, isRefresh = false) {
    const secret: string = isRefresh
      ? process.env.JWT_REFRESH_SECRET
      : process.env.JWT_SECRET;
    const expiresIn = (
      isRefresh
        ? (process.env?.JWT_REFRESH_SECRET_EXPIRE_IN ?? '48hr')
        : (process.env?.JWT_SECRET_EXPIRE_IN ?? '8hr')
    ) as StringValue;
    return jwt.sign({ id }, secret, { expiresIn });
  }

  //#region check user exist for login, signup
  private async checkExist(
    email: string,
    type: 'register' | 'login',
  ): Promise<any> {
    // check register
    if (type == 'register') {
      // check if user already exists
      const exist = await this.userModel.countDocuments({ email });
      if (exist) throw new ConflictException('Email already exists');
      else return;
    }
    // check login
    const findUser = await this.userModel.findOne({ email });
    // if user does not exist
    if (!findUser) throw new UnauthorizedException('Invalid email');
    // return plain object
    else return findUser.toJSON();
  }
  //#endregion

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    // check and get user
    const user = await this.checkExist(email, 'login');
    // check password
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) throw new UnauthorizedException('Invalid password');
    // delete password after validating
    delete user.password;
    // generate and store access and refresh token
    const { accessToken, refreshToken } = await this.generateTokens(user);
    // return new tokens
    return {
      accessToken,
      refreshToken,
      user: { email },
      message: 'Login successful',
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto, user: GetUserRole) {
    const find = await this.userModel.findOne({
      id: user.id,
      hashedRefreshToken: { $ne: null },
    });
    if (!find || !find.hashedRefreshToken)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    const refreshTokenValid = await bcrypt.compare(
      this.sha256(refreshTokenDto.refreshToken),
      find.hashedRefreshToken,
    );
    if (!refreshTokenValid)
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    const { accessToken, refreshToken } = await this.generateTokens({
      email: find.email,
      _id: find.id,
    });
    return { accessToken, refreshToken };
  }

  async logout(user: GetUserRole) {
    // update refresh token
    await this.userModel.findOneAndUpdate(
      { id: user.id },
      { $set: { hashedRefreshToken: null } },
    );
    return { message: 'Logout successful' };
  }
}
