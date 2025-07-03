import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginDto, RefreshTokenDto, RegisterDto } from './user.dto';
import { UserService } from './user.service';
import { GetRole, GetUserRole } from 'src/common/auth.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await this.service.registerUser(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.service.login(body);
  }

  @Post('refreshToken')
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @GetRole() user: GetUserRole,
  ) {
    return await this.service.refreshToken(refreshTokenDto, user);
  }

  @Post('logout')
  async logout(@GetRole() user: GetUserRole) {
    return await this.service.logout(user);
  }

  @Get('me')
  async getUser(@GetRole() user: GetUserRole) {
    return user;
  }
}
