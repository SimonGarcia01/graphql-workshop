import { RoleName } from '@/auth/enums/role-names.enum';
import { RolePermission } from '@/auth/roles-permissions/entities/role-permission.entity';
import { User } from '@/auth/users/entities/user.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'roles' })
export class Role {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => RoleName)
    @Column({ name: 'name', type: 'enum', enum: RoleName, unique: true })
    name!: RoleName;

    @Field(() => String)
    @Column({ name: 'description', length: 255, nullable: true })
    description?: string;

    @Field(() => [User], { nullable: true })
    @OneToMany(() => User, (user) => user.role)
    users!: User[];

    @Field(() => [RolePermission], { nullable: true })
    @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
    rolesPermissions!: RolePermission[];
}
