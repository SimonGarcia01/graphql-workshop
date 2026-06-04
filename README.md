# GraphQL Workshop

Simon Garcia

## Technologies

NestJS, TypeORM, GraphQL, Apollo Server

---

## Overview

This project is a GraphQL Workshop API built with NestJS, TypeORM, GraphQL, and Apollo Server. It demonstrates authentication, authorization, and role-based access control using JWT.

---

## Getting Started

### Install dependencies

It is recommended to use Bun:

```bash
bun install
```

### Run the project

```bash
bun start
```

---

## Authentication & Authorization

The system uses JWT-based authentication.

### Public operations (no authentication required):

- runSeed
- signup
- login

All other queries and mutations require:

Authorization: Bearer <token>

---

## Roles & Permissions Model

### Roles

- SUPER_ADMIN
- USER

### Permissions

- ADMIN_SUPER_POWER
- READ_USERS
- CREATE_POSTS
- READ_POSTS
- UPDATE_POSTS
- DELETE_POSTS

---

## Role → Permission Mapping

| Role        | Permissions                                                      |
| ----------- | ---------------------------------------------------------------- |
| SUPER_ADMIN | ADMIN_SUPER_POWER                                                |
| USER        | READ_USERS, CREATE_POSTS, READ_POSTS, UPDATE_POSTS, DELETE_POSTS |

---

## Authorization Rules

- SUPER_ADMIN
    - Has full system access
    - Can access all entities (users, roles, permissions, posts)
    - Can perform all mutations without restriction

- USER
    - Can only perform CRUD on their own posts
    - Has limited access based on permissions

---

## GraphQL API Overview

### Auth

- `login(loginInput)` — email, password
- `signup(signupInput)` — fullName, email, password

### Users

- `users` — returns all users
- `user(id)` — returns a single user by ID
- `createUser(createUserInput)` — fullName, email, password, roleName (optional), isActive (optional, default: true)
- `updateUser(updateUserInput)` — id, fullName (optional), email (optional), password (optional), roleName (optional), isActive (optional)
- `removeUser(id)` — removes a user by ID

### Posts

- `posts` — returns all posts
- `post(id)` — returns a single post by ID
- `createPost(createPostInput)` — title, content
- `updatePost(updatePostInput)` — id, title (optional), content (optional)
- `removePost(id)` — removes a post by ID

### Seed

- `runSeed` — seeds the database with initial data

---

## Endpoint Examples (Apollo / Postman)

All requests are sent as **POST** to `http://localhost:3001/graphql` with `Content-Type: application/json`.

Use the `query` field for queries/mutations and the `variables` field for input values.

---

### Login

```json
{
    "query": "mutation Login($loginInput: LoginInput!) { login(loginInput: $loginInput) { token user { id fullName email role { name } } } }",
    "variables": {
        "loginInput": {
            "email": "admin@example.com",
            "password": "password123"
        }
    }
}
```

---

### Signup

```json
{
    "query": "mutation Signup($signupInput: SignupInput!) { signup(signupInput: $signupInput) { token user { id fullName email role { name } } } }",
    "variables": {
        "signupInput": {
            "fullName": "Jane Doe",
            "email": "jane@example.com",
            "password": "password123"
        }
    }
}
```

---

### Create User

Requires: `Authorization: Bearer <token>`

```json
{
    "query": "mutation CreateUser($createUserInput: CreateUserInput!) { createUser(createUserInput: $createUserInput) { id fullName email isActive role { name } } }",
    "variables": {
        "createUserInput": {
            "fullName": "John Smith",
            "email": "john@example.com",
            "password": "password123",
            "roleName": "USER"
        }
    }
}
```

---

### Get All Users

Requires: `Authorization: Bearer <token>`

```json
{
    "query": "query { users { id fullName email isActive role { name } } }"
}
```

---

### Create Post

Requires: `Authorization: Bearer <token>`

```json
{
    "query": "mutation CreatePost($createPostInput: CreatePostInput!) { createPost(createPostInput: $createPostInput) { id title content author { id fullName } } }",
    "variables": {
        "createPostInput": {
            "title": "My First Post",
            "content": "This is the content of the post."
        }
    }
}
```

---

### Get One Post

Requires: `Authorization: Bearer <token>`

```json
{
    "query": "query GetPost($id: Int!) { post(id: $id) { id title content author { id fullName } } }",
    "variables": {
        "id": 1
    }
}
```

---

## Postman Collection

A full collection is also available in:
GraqhQl-workshop.postman_collection.json
