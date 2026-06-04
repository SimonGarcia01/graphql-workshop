import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from './entities/role-permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesPermissionsService {
    constructor(
        @InjectRepository(RolePermission) private readonly rolePermissionRepository: Repository<RolePermission>,
    ) {}

    async findAll(): Promise<RolePermission[]> {
        return await this.rolePermissionRepository.find();
    }

    async findOne(id: number): Promise<RolePermission | null> {
        return await this.rolePermissionRepository.findOne({ where: { id } });
    }
}
