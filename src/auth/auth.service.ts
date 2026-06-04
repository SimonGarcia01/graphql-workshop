import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users/users.service';
import { RolesService } from './roles/roles.service';
import { LoginInput } from './dtos/inputs/login.input';
import { SignupInput } from './dtos/inputs/signup.input';
import { AuthResponse } from './dtos/outputs/auth-response.output';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RoleName } from './enums/role-names.enum';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly rolesService: RolesService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        const { email, password } = loginInput;

        const user = await this.usersService.findOneByEmail(email);

        if (!user) throw new NotFoundException(`User with email ${email} not found`);

        if (!bcrypt.compareSync(password, user.encryptedPassword))
            throw new UnauthorizedException('Invalid credentials');

        const token: string = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            permissions: user.role.rolesPermissions.map((rp) => rp.permission.name),
        });

        return new AuthResponse(user, token);
    }

    async signup(signupInput: SignupInput): Promise<AuthResponse> {
        const existingUser: User | null = await this.userRepository.findOne({ where: { email: signupInput.email } });

        if (existingUser) throw new BadRequestException(`User with email ${signupInput.email} already exists`);

        const role = await this.rolesService.findOneByName(RoleName.USER);

        if (!role) throw new NotFoundException(`Default role ${RoleName.USER} not found`);

        const saltRounds: number = Number(this.configService.get<number>('SALT_ROUNDS') ?? 10);

        const encryptedPassword: string = await bcrypt.hash(signupInput.password, saltRounds);

        const newUser = this.userRepository.create({
            ...signupInput,
            encryptedPassword,
            role: role,
        });

        await this.userRepository.save(newUser);

        const token: string = this.jwtService.sign({
            sub: newUser.id,
            email: newUser.email,
            permissions: role.rolesPermissions.map((rp) => rp.permission.name),
        });

        return new AuthResponse(newUser, token);
    }
}
