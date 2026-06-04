import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionNames } from '../enums/permission-names.enum';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Permissions(PermissionNames.ADMIN_SUPER_POWER)
    @Mutation(() => User)
    async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
        return await this.usersService.create(createUserInput);
    }

    @Permissions(PermissionNames.READ_USERS)
    @Query(() => [User], { name: 'users' })
    async findAll(): Promise<User[]> {
        return await this.usersService.findAll();
    }

    @Permissions(PermissionNames.READ_USERS)
    @Query(() => User, { name: 'user' })
    async findOne(@Args('id', { type: () => Int }) id: number): Promise<User> {
        return await this.usersService.findOne(id);
    }

    @Permissions(PermissionNames.ADMIN_SUPER_POWER)
    @Mutation(() => User)
    async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput): Promise<User> {
        return await this.usersService.update(updateUserInput);
    }

    @Permissions(PermissionNames.ADMIN_SUPER_POWER)
    @Mutation(() => User)
    async removeUser(@Args('id', { type: () => Int }) id: number): Promise<User> {
        return await this.usersService.remove(id);
    }
}
