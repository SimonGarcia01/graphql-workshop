import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from '../roles/roles.module';
import { User } from './entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User]), RolesModule],
    providers: [UsersResolver, UsersService],
    exports: [UsersService],
})
export class UsersModule {}
