import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, Length } from 'class-validator';

@InputType()
export class SignupInput {
    @Field(() => String)
    @Length(1, 20)
    fullName!: string;

    @Field(() => String)
    @Length(1, 50)
    @IsEmail()
    email!: string;

    @Field(() => String)
    @Length(6, 255)
    password!: string;
}
