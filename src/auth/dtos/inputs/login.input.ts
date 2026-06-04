import { Field, InputType } from '@nestjs/graphql';

import { IsEmail, Length } from 'class-validator';

@InputType()
export class LoginInput {
    @Field(() => String)
    @IsEmail()
    email!: string;

    @Field(() => String)
    @Length(6, 50)
    password!: string;
}
