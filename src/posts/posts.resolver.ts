import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/auth/users/entities/user.entity';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { PermissionNames } from '@/auth/enums/permission-names.enum';

@Resolver(() => Post)
export class PostsResolver {
    constructor(private readonly postsService: PostsService) {}

    @Permissions(PermissionNames.CREATE_POSTS)
    @Mutation(() => Post)
    async createPost(@Args('createPostInput') createPostInput: CreatePostInput, @CurrentUser() user: User) {
        return await this.postsService.create(createPostInput, user);
    }

    @Permissions(PermissionNames.READ_POSTS)
    @Query(() => [Post], { name: 'posts' })
    async findAll(@CurrentUser() user: User) {
        return await this.postsService.findAll(user);
    }

    @Permissions(PermissionNames.READ_POSTS)
    @Query(() => Post, { name: 'post' })
    async findOne(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: User) {
        return await this.postsService.findOne(id, user);
    }

    @Permissions(PermissionNames.UPDATE_POSTS)
    @Mutation(() => Post)
    async updatePost(@Args('updatePostInput') updatePostInput: UpdatePostInput, @CurrentUser() user: User) {
        return await this.postsService.update(updatePostInput, user);
    }

    @Permissions(PermissionNames.DELETE_POSTS)
    @Mutation(() => Post)
    async removePost(@Args('id', { type: () => Int }) id: number, @CurrentUser() user: User) {
        return await this.postsService.remove(id, user);
    }
}
