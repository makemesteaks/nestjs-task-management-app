import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Users } from './users.entity';

export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): Users => {
    const req = ctx.switchToHttp().getRequest();
    // req.user is an object that is generated from the passport.js lib
    return req.user;
  },
);
