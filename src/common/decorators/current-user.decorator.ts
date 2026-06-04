import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '@/auth/users/entities/user.entity';
import { GqlExecutionContext } from '@nestjs/graphql';

//This decorator @CurrentUser() will be used to access the current authenticated user c:
//This is so you don't have to do the whole @Request and get the user every time
//Even though the data is not used, the createParamDecorator needs it
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
});
