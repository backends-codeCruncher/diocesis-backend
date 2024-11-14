import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) throw new InternalServerErrorException('Something went wrong');

    return !data ? user : user[data];
  },
);
