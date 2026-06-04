import { User } from '@/auth/users/entities/user.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity({ name: 'posts' })
export class Post {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    id!: number;

    @Field(() => String)
    @Column({ name: 'title', length: 255, nullable: false })
    title!: string;

    @Field(() => String)
    @Column({ name: 'content', type: 'text', nullable: false })
    content!: string;

    @Field(() => User, { nullable: false })
    @ManyToOne(() => User, (user) => user.posts, { nullable: false, eager: true })
    @JoinColumn({ name: 'author_id' })
    author!: User;
}
