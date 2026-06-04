import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { RolesPermissionsService } from './roles-permissions.service';
import { RolePermission } from './entities/role-permission.entity';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionNames } from '../enums/permission-names.enum';

@Resolver(() => RolePermission)
export class RolesPermissionsResolver {
    constructor(private readonly RolesPermissionsService: RolesPermissionsService) {}

    @Permissions(PermissionNames.ADMIN_SUPER_POWER)
    @Query(() => [RolePermission], { name: 'RolePermissions' })
    findAll() {
        return this.RolesPermissionsService.findAll();
    }

    @Permissions(PermissionNames.ADMIN_SUPER_POWER)
    @Query(() => RolePermission, { name: 'RolePermission' })
    findOne(@Args('id', { type: () => Int }) id: number) {
        return this.RolesPermissionsService.findOne(id);
    }
}
