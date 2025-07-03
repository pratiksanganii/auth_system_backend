import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await this.service.registerUser(body);
  }
}
