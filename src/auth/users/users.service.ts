import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '../roles/roles.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly configService: ConfigService,
        private readonly rolesService: RolesService,
    ) {}

    async create(createUserInput: CreateUserInput): Promise<User> {
        const { fullName, email, password, roleName, isActive } = createUserInput;

        //Check if a user with the same email already exists
        const user: User | null = await this.userRepository.findOne({ where: { email } });
        if (user) throw new BadRequestException(`User with email ${email} already exists`);

        let role: Role | null = null;

        if (roleName) {
            role = await this.rolesService.findOneByName(roleName);
            if (!role) throw new NotFoundException(`Role ${roleName} not found`);
        }

        const saltRounds: number = Number(this.configService.get<number>('SALT_ROUNDS') ?? 10);

        const encryptedPassword: string = await bcrypt.hash(password, saltRounds);

        const newUser: User = this.userRepository.create({
            fullName,
            email,
            encryptedPassword,
            isActive: isActive ?? true,
            role: role!,
        });

        return await this.userRepository.save(newUser);
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
    }

    async update(updateUserInput: UpdateUserInput): Promise<User> {
        const { id, fullName, email, password, roleName, isActive } = updateUserInput;

        const user: User = await this.findOne(id);

        if (email && email !== user.email) {
            const existingUser: User | null = await this.userRepository.findOne({ where: { email } });
            if (existingUser) throw new BadRequestException(`User with email ${email} already exists`);
        }

        const role: Role = roleName ? await this.rolesService.findOneByName(roleName) : user.role;

        const saltRounds: number = this.configService.get<number>('SALT_ROUNDS') ?? 10;

        await this.userRepository.update(id, {
            fullName: fullName ?? user.fullName,
            email: email ?? user.email,
            isActive: isActive ?? user.isActive,
            role,
            encryptedPassword: password ? await bcrypt.hash(password, saltRounds) : user.encryptedPassword,
        });

        return await this.findOne(id);
    }

    async remove(id: number): Promise<User> {
        const user = await this.findOne(id);

        user.isActive = false;

        return await this.userRepository.save(user);
    }

    async findOneUser(userId: number): Promise<User> {
        const user: User | null = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role', 'role.rolesPermissions', 'role.rolesPermissions.permission'],
        });

        if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

        return user;
    }

    async findOneByEmail(email: string): Promise<User> {
        const user: User | null = await this.userRepository.findOne({
            where: { email },
            relations: ['role', 'role.rolesPermissions', 'role.rolesPermissions.permission'],
        });

        if (!user) throw new NotFoundException(`User with email ${email} not found`);

        return user;
    }
}
