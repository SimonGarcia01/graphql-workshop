import { Permission } from '@/auth/permissions/entities/permission.entity';
import { PermissionNames } from '@/auth/enums/permission-names.enum';
import { RolePermission } from '@/auth/roles-permissions/entities/role-permission.entity';
import { RoleName } from '@/auth/enums/role-names.enum';
import { Role } from '@/auth/roles/entities/role.entity';
import { User } from '@/auth/users/entities/user.entity';
import { Post } from '@/posts/entities/post.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hashSync } from 'bcrypt';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
        @InjectRepository(RolePermission) private readonly rolePermissionRepository: Repository<RolePermission>,
        @InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>,
        @InjectRepository(Post) private readonly postRepository: Repository<Post>,
    ) {}

    async runSeed(): Promise<string> {
        const superAdminRole = await this.roleRepository.save(
            this.roleRepository.create({
                name: RoleName.SUPER_ADMIN,
                description: 'Super administrator with full access',
            }),
        );
        const userRole = await this.roleRepository.save(
            this.roleRepository.create({ name: RoleName.USER, description: 'Regular user with limited access' }),
        );

        const permissionDefinitions = [
            { name: PermissionNames.ADMIN_SUPER_POWER, description: 'Full access to every resource and action' },
            { name: PermissionNames.READ_USERS, description: 'Read users' },
            { name: PermissionNames.CREATE_POSTS, description: 'Create posts' },
            { name: PermissionNames.READ_POSTS, description: 'Read posts' },
            { name: PermissionNames.UPDATE_POSTS, description: 'Update posts' },
            { name: PermissionNames.DELETE_POSTS, description: 'Delete posts' },
        ];

        const permissions = await Promise.all(
            permissionDefinitions.map((def) => this.permissionRepository.save(this.permissionRepository.create(def))),
        );

        const userPermissionNames = [
            PermissionNames.CREATE_POSTS,
            PermissionNames.READ_POSTS,
            PermissionNames.UPDATE_POSTS,
            PermissionNames.DELETE_POSTS,
        ];

        for (const permission of permissions) {
            if (permission.name === PermissionNames.ADMIN_SUPER_POWER) {
                await this.rolePermissionRepository.save(
                    this.rolePermissionRepository.create({ role: superAdminRole, permission }),
                );
            } else if (userPermissionNames.includes(permission.name)) {
                await this.rolePermissionRepository.save(
                    this.rolePermissionRepository.create({ role: userRole, permission }),
                );
            }
        }

        const superAdminUser = await this.userRepository.save(
            this.userRepository.create({
                fullName: 'Super Admin',
                email: 'superadmin@example.com',
                encryptedPassword: hashSync('superadmin123', 10),
                role: superAdminRole,
            }),
        );

        const regularUser = await this.userRepository.save(
            this.userRepository.create({
                fullName: 'Regular User',
                email: 'user@example.com',
                encryptedPassword: hashSync('user12345', 10),
                role: userRole,
            }),
        );

        await this.postRepository.save([
            this.postRepository.create({
                title: 'Welcome from the Super Admin',
                content: 'This is the first seeded post created by the super admin account.',
                author: superAdminUser,
            }),
            this.postRepository.create({
                title: 'Regular User Introduction',
                content: 'This seeded post belongs to the regular user account.',
                author: regularUser,
            }),
            this.postRepository.create({
                title: 'System Announcement',
                content: 'This third seeded post shows the application content after seeding.',
                author: superAdminUser,
            }),
        ]);

        return 'Seed completed successfully';
    }
}
