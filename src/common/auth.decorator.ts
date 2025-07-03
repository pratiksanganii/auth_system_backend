import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UUID } from 'crypto';

export interface GetUserRole {
  id: UUID;
  email: string;
}

export const GetRole = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return req?.user;
  },
);
