import { Module } from '@nestjs/common';
import { RolesPermissionsService } from './roles-permissions.service';
import { RolesPermissionsResolver } from './roles-permissions.resolver';
import { Role } from '../roles/entities/role.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { RolePermission } from './entities/role-permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
    providers: [RolesPermissionsResolver, RolesPermissionsService],
    exports: [RolesPermissionsService],
})
export class RolesPermissionsModule {}
