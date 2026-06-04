import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsResolver } from './permissions.resolver';
import { Permission } from './entities/permission.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [TypeOrmModule.forFeature([Permission])],
    providers: [PermissionsResolver, PermissionsService],
})
export class PermissionsModule {}
