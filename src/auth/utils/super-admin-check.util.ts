import { PermissionNames } from '../enums/permission-names.enum';
import { User } from '../users/entities/user.entity';

export const isSuperAdmin = (user: User): boolean => {
    return user.role.rolesPermissions.some((rp) => rp.permission.name === PermissionNames.ADMIN_SUPER_POWER);
};
