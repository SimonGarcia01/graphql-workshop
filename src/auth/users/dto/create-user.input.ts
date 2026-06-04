import { RoleName } from '@/auth/enums/role-names.enum';
import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class CreateUserInput {
    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @Length(1, 20)
    fullName!: string;

    @Field(() => String)
    @IsEmail()
    @Length(1, 50)
    email!: string;

    @Field(() => String)
    @IsString()
    @IsNotEmpty()
    @Length(8, 100)
    password!: string;

    @Field(() => RoleName, { nullable: true })
    @IsEnum(RoleName)
    @IsOptional()
    roleName?: RoleName;

    @Field(() => Boolean, { nullable: true, defaultValue: true })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
