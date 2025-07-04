import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

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

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export interface GenerateTokenPayload {
  _id: string;
  email: string;
}
