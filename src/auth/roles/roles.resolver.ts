import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Role } from './entities/role.entity';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionNames } from '../enums/permission-names.enum';

@Resolver(() => Role)
export class RolesResolver {
    constructor(private readonly rolesService: RolesService) {}

    @Query(() => [Role], { name: 'roles' })
    findAll() {
        return this.rolesService.findAll();
    }

    @Permissions(PermissionNames.ADMIN_SUPER_POWER)
    @Query(() => Role, { name: 'role' })
    findOne(@Args('id', { type: () => Int }) id: number) {
        return this.rolesService.findOne(id);
    }
}
