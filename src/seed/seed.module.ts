import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedResolver } from './seed.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/auth/users/entities/user.entity';
import { Role } from '@/auth/roles/entities/role.entity';
import { RolePermission } from '@/auth/roles-permissions/entities/role-permission.entity';
import { Permission } from '@/auth/permissions/entities/permission.entity';
import { Post } from '@/posts/entities/post.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Role, RolePermission, Permission, Post])],
    providers: [SeedResolver, SeedService],
})
export class SeedModule {}
