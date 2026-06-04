import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from './users/entities/user.entity';
import { LoginInput } from './dtos/inputs/login.input';
import { AuthService } from './auth.service';
import { Public } from '@/common/decorators/public.decorator';
import { SignupInput } from './dtos/inputs/signup.input';
import { AuthResponse } from './dtos/outputs/auth-response.output';

@Public()
@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @Mutation(() => AuthResponse)
    async login(@Args('loginInput') loginInput: LoginInput): Promise<AuthResponse> {
        return await this.authService.login(loginInput);
    }

    @Mutation(() => AuthResponse)
    async signup(@Args('signupInput') signupInput: SignupInput): Promise<AuthResponse> {
        return await this.authService.signup(signupInput);
    }
}
