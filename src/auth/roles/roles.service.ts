import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { RoleName } from '../enums/role-names.enum';

@Injectable()
export class RolesService {
    constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {}

    async findAll(): Promise<Role[]> {
        return await this.roleRepository.find();
    }

    async findOne(id: number): Promise<Role | null> {
        return await this.roleRepository.findOne({ where: { id } });
    }

    async findOneByName(name: RoleName): Promise<Role> {
        const role: Role | null = await this.roleRepository.findOne({
            where: { name },
            relations: ['rolesPermissions', 'rolesPermissions.permission'],
        });

        if (!role) throw new Error(`Role with name ${name} not found`);

        return role;
    }
}
