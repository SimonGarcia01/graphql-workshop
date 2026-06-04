import { PermissionNames } from '@/auth/enums/permission-names.enum';
import { RolePermission } from '@/auth/roles-permissions/entities/role-permission.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'permissions' })
export class Permission {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => PermissionNames)
    @Column({ name: 'name', type: 'enum', enum: PermissionNames, unique: true, nullable: false })
    name!: PermissionNames;

    @Field(() => String)
    @Column({ name: 'description', length: 255, nullable: true })
    description?: string;

    @Field(() => [RolePermission], { nullable: true })
    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.permission)
    rolesPermissions!: RolePermission[];
}
