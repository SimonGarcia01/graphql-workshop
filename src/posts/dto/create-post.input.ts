import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class CreatePostInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    title!: string;

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @Length(1, 1000)
    content!: string;
}
