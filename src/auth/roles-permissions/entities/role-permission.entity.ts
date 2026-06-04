import { Permission } from '@/auth/permissions/entities/permission.entity';
import { Role } from '@/auth/roles/entities/role.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'roles_permissions' })
export class RolePermission {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => Role, { nullable: false })
    @ManyToOne(() => Role, (role) => role.rolesPermissions, { nullable: false, eager: true })
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @Field(() => Permission, { nullable: false })
    @ManyToOne(() => Permission, (permission) => permission.rolesPermissions, { nullable: false, eager: true })
    @JoinColumn({ name: 'permission_id' })
    permission!: Permission;
}
