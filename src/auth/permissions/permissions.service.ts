import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
    constructor(@InjectRepository(Permission) private readonly permissionRepository: Repository<Permission>) {}

    async findAll(): Promise<Permission[]> {
        return await this.permissionRepository.find();
    }

    async findOne(id: number): Promise<Permission | null> {
        return await this.permissionRepository.findOne({ where: { id } });
    }
}
