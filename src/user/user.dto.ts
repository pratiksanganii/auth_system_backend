import { IsEmail, IsNotEmpty, Length } from 'class-validator';

class CommonDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8)
  password: string;
}

export class RegisterDto extends CommonDto {}

export class LoginDto extends CommonDto {}
