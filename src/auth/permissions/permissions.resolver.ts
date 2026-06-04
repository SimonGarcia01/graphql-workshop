import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { PermissionsService } from './permissions.service';
import { Permission } from './entities/permission.entity';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionNames } from '../enums/permission-names.enum';

@Resolver(() => Permission)
export class PermissionsResolver {
    constructor(private readonly permissionsService: PermissionsService) {}

    @Query(() => [Permission], { name: 'permissions' })
    findAll() {
        return this.permissionsService.findAll();
    }

    @Permissions(PermissionNames.ADMIN_SUPER_POWER)
    @Query(() => Permission, { name: 'permission' })
    findOne(@Args('id', { type: () => Int }) id: number) {
        return this.permissionsService.findOne(id);
    }
}
