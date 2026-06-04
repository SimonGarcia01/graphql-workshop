import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsResolver } from './posts.resolver';
import { Post } from './entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@/auth/users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Post]), UsersModule],
    providers: [PostsResolver, PostsService],
})
export class PostsModule {}
