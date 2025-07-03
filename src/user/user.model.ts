import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserModel {
  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  hashedRefreshToken: string | null;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
