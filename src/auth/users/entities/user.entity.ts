import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '@/auth/roles/entities/role.entity';
import { Post } from '@/posts/entities/post.entity';

@ObjectType()
@Entity({ name: 'users' })
export class User {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ name: 'full_name', length: 20, nullable: false })
    fullName!: string;

    @Field(() => String)
    @Column({ name: 'email', length: 50, nullable: false, unique: true })
    email!: string;

    @Column({ name: 'encrypted_password', length: 255, nullable: false })
    encryptedPassword!: string;

    @Field(() => Boolean)
    @Column({ name: 'is_active', default: true })
    isActive!: boolean;

    @Field(() => Role, { nullable: false })
    @ManyToOne(() => Role, (role) => role.users, { nullable: false, eager: true })
    @JoinColumn({ name: 'role_id' })
    role!: Role;

    @Field(() => [Post], { nullable: true })
    @OneToMany(() => Post, (post) => post.author, { cascade: true })
    posts?: Post[];
}
