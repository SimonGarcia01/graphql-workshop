import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const gql = (app: INestApplication) => request(app.getHttpServer()).post('/graphql');

const authed = (app: INestApplication, token: string) => gql(app).set('Authorization', `Bearer ${token}`);

// ─────────────────────────────────────────────────────────────────────────────
// Suite
// ─────────────────────────────────────────────────────────────────────────────

describe('GraphQL API (e2e)', () => {
    let app: INestApplication;

    // Superadmin credentials come from your seed (runSeed sets these up)
    const SUPERADMIN_EMAIL = 'superadmin@example.com';
    const SUPERADMIN_PASSWORD = 'superadmin123';

    // Regular user created during tests
    const USER_EMAIL = 'regularuser@example.com';
    const USER_PASSWORD = 'password123';

    let superadminToken: string;
    let userToken: string;
    let superadminId: number;
    let regularUserId: number;
    let postId: number;
    let roleId: number;
    let permissionId: number;
    let rolePermissionId: number;

    // ───────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ───────────────────────────────────────────────────────────────────────────

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    // ───────────────────────────────────────────────────────────────────────────
    // AUTH
    // ───────────────────────────────────────────────────────────────────────────

    describe('Auth', () => {
        it('signup — creates a new regular user and returns token', async () => {
            const mutation = `
        mutation Signup($input: SignupInput!) {
          signup(signupInput: $input) {
            token
            user { id email fullName role { name } }
          }
        }
      `;

            const res = await gql(app).send({
                query: mutation,
                variables: {
                    input: { fullName: 'Regular User', email: USER_EMAIL, password: USER_PASSWORD },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.signup.token).toBeDefined();
            expect(res.body.data.signup.user.email).toBe(USER_EMAIL);
            // signup should assign USER role by default
            expect(res.body.data.signup.user.role.name).toBe('USER');

            userToken = res.body.data.signup.token;
            regularUserId = res.body.data.signup.user.id;
        });

        it('signup — rejects duplicate email', async () => {
            const mutation = `
        mutation Signup($input: SignupInput!) {
          signup(signupInput: $input) { token }
        }
      `;

            const res = await gql(app).send({
                query: mutation,
                variables: {
                    input: { fullName: 'Dupe', email: USER_EMAIL, password: USER_PASSWORD },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('login — superadmin logs in and receives token', async () => {
            const mutation = `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) {
            token
            user { id email role { name } }
          }
        }
      `;

            const res = await gql(app).send({
                query: mutation,
                variables: {
                    input: { email: SUPERADMIN_EMAIL, password: SUPERADMIN_PASSWORD },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.login.token).toBeDefined();
            expect(res.body.data.login.user.role.name).toBe('SUPER_ADMIN');

            superadminToken = res.body.data.login.token;
            superadminId = res.body.data.login.user.id;
        });

        it('login — regular user logs in', async () => {
            const mutation = `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) {
            token
            user { id email }
          }
        }
      `;

            const res = await gql(app).send({
                query: mutation,
                variables: {
                    input: { email: USER_EMAIL, password: USER_PASSWORD },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.login.token).toBeDefined();
        });

        it('login — rejects wrong password', async () => {
            const mutation = `
        mutation Login($input: LoginInput!) {
          login(loginInput: $input) { token }
        }
      `;

            const res = await gql(app).send({
                query: mutation,
                variables: {
                    input: { email: USER_EMAIL, password: 'wrong-password' },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });
    });

    // ───────────────────────────────────────────────────────────────────────────
    // USERS
    // ───────────────────────────────────────────────────────────────────────────

    describe('Users', () => {
        it('users — unauthenticated request is rejected', async () => {
            const query = `query { users { id email } }`;

            const res = await gql(app).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('users — superadmin gets all users', async () => {
            const query = `query { users { id email fullName isActive role { name } } }`;

            const res = await authed(app, superadminToken).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(Array.isArray(res.body.data.users)).toBe(true);
            expect(res.body.data.users.length).toBeGreaterThanOrEqual(2);
        });

        it('users — regular user is forbidden (READ_USERS permission required)', async () => {
            const query = `query { users { id email } }`;

            const res = await authed(app, userToken).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('user(id) — superadmin fetches any user by id', async () => {
            const query = `
        query User($id: Int!) {
          user(id: $id) { id email fullName isActive role { name } }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query,
                variables: { id: regularUserId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.user.id).toBe(regularUserId);
            expect(res.body.data.user.email).toBe(USER_EMAIL);
        });

        it('user(id) — returns 404-style error for non-existent id', async () => {
            const query = `
        query User($id: Int!) {
          user(id: $id) { id email }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query,
                variables: { id: 999999 },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('createUser — superadmin creates a user with explicit role', async () => {
            const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(createUserInput: $input) {
            id email fullName isActive role { name }
          }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query: mutation,
                variables: {
                    input: {
                        fullName: 'Created By Admin',
                        email: 'created@example.com',
                        password: 'password123',
                        roleName: 'USER',
                        isActive: true,
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.createUser.email).toBe('created@example.com');
            expect(res.body.data.createUser.role.name).toBe('USER');
        });

        it('createUser — regular user is forbidden', async () => {
            const mutation = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(createUserInput: $input) { id }
        }
      `;

            const res = await authed(app, userToken).send({
                query: mutation,
                variables: {
                    input: {
                        fullName: 'Should Fail',
                        email: 'fail@example.com',
                        password: 'password123',
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('updateUser — superadmin updates another user', async () => {
            const mutation = `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(updateUserInput: $input) {
            id email fullName
          }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query: mutation,
                variables: {
                    input: {
                        id: regularUserId,
                        fullName: 'Updated Name',
                    },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.updateUser.fullName).toBe('Updated Name');
        });

        it('updateUser — regular user cannot update other users', async () => {
            const mutation = `
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(updateUserInput: $input) { id }
        }
      `;

            const res = await authed(app, userToken).send({
                query: mutation,
                variables: {
                    input: { id: superadminId, fullName: 'Hacker' },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('removeUser — superadmin can delete a user', async () => {
            // Create a throwaway user first so we don't delete regularUser (needed later)
            const create = `
        mutation CreateUser($input: CreateUserInput!) {
          createUser(createUserInput: $input) { id }
        }
      `;
            const createRes = await authed(app, superadminToken).send({
                query: create,
                variables: {
                    input: {
                        fullName: 'To Delete',
                        email: 'todelete@example.com',
                        password: 'password123',
                        roleName: 'USER',
                    },
                },
            });
            const deleteId = createRes.body.data.createUser.id;

            const mutation = `
        mutation RemoveUser($id: Int!) {
          removeUser(id: $id) { id email }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query: mutation,
                variables: { id: deleteId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.removeUser.id).toBe(deleteId);
        });

        it('removeUser — regular user is forbidden', async () => {
            const mutation = `
        mutation RemoveUser($id: Int!) {
          removeUser(id: $id) { id }
        }
      `;

            const res = await authed(app, userToken).send({
                query: mutation,
                variables: { id: superadminId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });
    });

    // ───────────────────────────────────────────────────────────────────────────
    // ROLES
    // ───────────────────────────────────────────────────────────────────────────

    describe('Roles', () => {
        it('roles — unauthenticated request is rejected', async () => {
            const res = await gql(app).send({ query: `query { roles { id name } }` });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('roles — superadmin gets all roles', async () => {
            const query = `
        query {
          roles {
            id name description
            rolesPermissions { id permission { name } }
          }
        }
      `;

            const res = await authed(app, superadminToken).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(Array.isArray(res.body.data.roles)).toBe(true);
            expect(res.body.data.roles.length).toBeGreaterThan(0);

            // Capture a role id for subsequent tests
            roleId = res.body.data.roles[0].id;
        });

        it('role(id) — superadmin fetches single role', async () => {
            const query = `
        query Role($id: Int!) {
          role(id: $id) { id name description }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query,
                variables: { id: roleId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.role.id).toBe(roleId);
        });

        it('role(id) — regular user is forbidden', async () => {
            const query = `
        query Role($id: Int!) {
          role(id: $id) { id name }
        }
      `;

            const res = await authed(app, userToken).send({
                query,
                variables: { id: roleId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });
    });

    // ───────────────────────────────────────────────────────────────────────────
    // PERMISSIONS
    // ───────────────────────────────────────────────────────────────────────────

    describe('Permissions', () => {
        it('permissions — unauthenticated request is rejected', async () => {
            const res = await gql(app).send({ query: `query { permissions { id name } }` });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('permissions — superadmin gets all permissions', async () => {
            const query = `
        query {
          permissions { id name description }
        }
      `;

            const res = await authed(app, superadminToken).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(Array.isArray(res.body.data.permissions)).toBe(true);
            expect(res.body.data.permissions.length).toBeGreaterThan(0);

            permissionId = res.body.data.permissions[0].id;
        });

        it('permission(id) — superadmin fetches single permission', async () => {
            const query = `
        query Permission($id: Int!) {
          permission(id: $id) { id name description }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query,
                variables: { id: permissionId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.permission.id).toBe(permissionId);
        });

        it('permission(id) — regular user is forbidden', async () => {
            const query = `
        query Permission($id: Int!) {
          permission(id: $id) { id name }
        }
      `;

            const res = await authed(app, userToken).send({
                query,
                variables: { id: permissionId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });
    });

    // ───────────────────────────────────────────────────────────────────────────
    // ROLE PERMISSIONS
    // ───────────────────────────────────────────────────────────────────────────

    describe('RolePermissions', () => {
        it('RolePermissions — superadmin gets all rolePermissions', async () => {
            const query = `
        query {
          RolePermissions {
            id
            role { id name }
            permission { id name }
          }
        }
      `;

            const res = await authed(app, superadminToken).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(Array.isArray(res.body.data.RolePermissions)).toBe(true);
            expect(res.body.data.RolePermissions.length).toBeGreaterThan(0);

            rolePermissionId = res.body.data.RolePermissions[0].id;
        });

        it('RolePermission(id) — superadmin fetches single rolePermission', async () => {
            const query = `
        query RolePermission($id: Int!) {
          RolePermission(id: $id) {
            id
            role { name }
            permission { name }
          }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query,
                variables: { id: rolePermissionId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.RolePermission.id).toBe(rolePermissionId);
        });

        it('RolePermissions — regular user is forbidden', async () => {
            const query = `query { RolePermissions { id } }`;

            const res = await authed(app, userToken).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });
    });

    // ───────────────────────────────────────────────────────────────────────────
    // POSTS
    // ───────────────────────────────────────────────────────────────────────────

    describe('Posts', () => {
        it('createPost — unauthenticated request is rejected', async () => {
            const mutation = `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(createPostInput: $input) { id }
        }
      `;

            const res = await gql(app).send({
                query: mutation,
                variables: { input: { title: 'Ghost Post', content: 'No auth' } },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('createPost — regular user creates their own post', async () => {
            const mutation = `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(createPostInput: $input) {
            id title content author { id email }
          }
        }
      `;

            const res = await authed(app, userToken).send({
                query: mutation,
                variables: { input: { title: 'My first post', content: 'Hello world' } },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.createPost.title).toBe('My first post');
            expect(res.body.data.createPost.author.id).toBe(regularUserId);

            postId = res.body.data.createPost.id;
        });

        it('createPost — superadmin can also create posts', async () => {
            const mutation = `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(createPostInput: $input) { id title author { id } }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query: mutation,
                variables: { input: { title: 'Admin post', content: 'Admin content' } },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.createPost.author.id).toBe(superadminId);
        });

        it('posts — unauthenticated request is rejected', async () => {
            const res = await gql(app).send({ query: `query { posts { id title } }` });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('posts — regular user sees posts (scoped to their own)', async () => {
            const query = `query { posts { id title author { id } } }`;

            const res = await authed(app, userToken).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(Array.isArray(res.body.data.posts)).toBe(true);
            // Every returned post should belong to the regular user
            res.body.data.posts.forEach((post: any) => {
                expect(post.author.id).toBe(regularUserId);
            });
        });

        it('posts — superadmin sees all posts', async () => {
            const query = `query { posts { id title author { id } } }`;

            const res = await authed(app, superadminToken).send({ query });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(Array.isArray(res.body.data.posts)).toBe(true);
            // Should contain posts from multiple authors
            const authorIds = [...new Set(res.body.data.posts.map((p: any) => p.author.id))];
            expect(authorIds.length).toBeGreaterThan(1);
        });

        it('post(id) — user fetches their own post', async () => {
            const query = `
        query Post($id: Int!) {
          post(id: $id) { id title content author { id } }
        }
      `;

            const res = await authed(app, userToken).send({
                query,
                variables: { id: postId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.post.id).toBe(postId);
        });

        it('post(id) — superadmin fetches any post by id', async () => {
            const query = `
        query Post($id: Int!) {
          post(id: $id) { id title author { id } }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query,
                variables: { id: postId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.post.id).toBe(postId);
        });

        it('post(id) — returns error for non-existent id', async () => {
            const query = `
        query Post($id: Int!) {
          post(id: $id) { id title }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query,
                variables: { id: 999999 },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeDefined();
        });

        it('updatePost — author can update their own post', async () => {
            const mutation = `
        mutation UpdatePost($input: UpdatePostInput!) {
          updatePost(updatePostInput: $input) { id title content }
        }
      `;

            const res = await authed(app, userToken).send({
                query: mutation,
                variables: {
                    input: { id: postId, title: 'Updated title', content: 'Updated content' },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.updatePost.title).toBe('Updated title');
        });

        it('updatePost — superadmin can update any post', async () => {
            const mutation = `
        mutation UpdatePost($input: UpdatePostInput!) {
          updatePost(updatePostInput: $input) { id title }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query: mutation,
                variables: {
                    input: { id: postId, title: 'Admin updated title' },
                },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.updatePost.title).toBe('Admin updated title');
        });

        it('removePost — author can delete their own post', async () => {
            // Create a disposable post so the main postId survives for superadmin delete test
            const create = `
        mutation CreatePost($input: CreatePostInput!) {
          createPost(createPostInput: $input) { id }
        }
      `;
            const createRes = await authed(app, userToken).send({
                query: create,
                variables: { input: { title: 'To delete', content: 'bye' } },
            });
            const disposableId = createRes.body.data.createPost.id;

            const mutation = `
        mutation RemovePost($id: Int!) {
          removePost(id: $id) { id }
        }
      `;

            const res = await authed(app, userToken).send({
                query: mutation,
                variables: { id: disposableId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.removePost.id).toBe(disposableId);
        });

        it('removePost — superadmin can delete any post', async () => {
            const mutation = `
        mutation RemovePost($id: Int!) {
          removePost(id: $id) { id }
        }
      `;

            const res = await authed(app, superadminToken).send({
                query: mutation,
                variables: { id: postId },
            });

            expect(res.status).toBe(200);
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.removePost.id).toBe(postId);
        });
    });
});
