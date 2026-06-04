import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { User } from '@/auth/users/entities/user.entity';
import { isSuperAdmin } from '@/auth/utils/super-admin-check.util';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
    ) {}

    async create(createPostInput: CreatePostInput, author: User): Promise<Post> {
        const { title, content } = createPostInput;

        const post = this.postRepository.create({
            title,
            content,
            author,
        });

        return await this.postRepository.save(post);
    }

    async findAll(currentUser: User): Promise<Post[]> {
        if (isSuperAdmin(currentUser)) {
            return await this.postRepository.find();
        }

        return await this.postRepository.find({
            where: { author: { id: currentUser.id } },
        });
    }

    async findOne(id: number, currentUser: User): Promise<Post> {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['author'],
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        if (!this.canAccessPost(currentUser, post)) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        return post;
    }

    async update(updatePostInput: UpdatePostInput, currentUser: User): Promise<Post> {
        const { id, title, content } = updatePostInput;

        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['author'],
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        if (!this.canAccessPost(currentUser, post)) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        await this.postRepository.update(id, {
            title: title ?? post.title,
            content: content ?? post.content,
        });

        return await this.postRepository.findOneByOrFail({ id });
    }

    async remove(id: number, currentUser: User): Promise<Post> {
        const post = await this.postRepository.findOne({
            where: { id },
            relations: ['author'],
        });

        if (!post) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        if (!this.canAccessPost(currentUser, post)) {
            throw new NotFoundException(`Post with ID ${id} not found`);
        }

        await this.postRepository.delete(id);
        return post;
    }

    private canAccessPost(user: User, post: Post): boolean {
        return isSuperAdmin(user) || post.author.id === user.id;
    }
}
