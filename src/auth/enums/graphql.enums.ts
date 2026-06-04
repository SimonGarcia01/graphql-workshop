import { registerEnumType } from '@nestjs/graphql';

import { PermissionNames } from './permission-names.enum';
import { RoleName } from './role-names.enum';

registerEnumType(RoleName, {
    name: 'RoleName',
});

registerEnumType(PermissionNames, {
    name: 'PermissionNames',
});
