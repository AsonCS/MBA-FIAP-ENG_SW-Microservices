# Implementation Guide: Backend Service (NestJS)

**Project:** `micro-feed-platform`
**Service:** `backend`
**Tech Stack:** NestJS, TypeORM, Kafka, Passport (JWT).

## Step 1: Setup & Configuration
* **Action:** Initialize NestJS app in `./backend`.
* **Action:** Install dependencies: `typeorm`, `mysql2`, `@nestjs/microservices`, `kafkajs`, `@nestjs/passport`, `passport-jwt`, `@nestjs/swagger`.
* **File:** `backend/src/app.module.ts` - Configure TypeORM with env variables.

## Step 2: Domain Layer - Users
* **Action:** Create `src/users/domain/user.entity.ts`.
* **Details:** Class `User` with properties: `id` (UUID), `username` (string), `password` (string), `createdAt`.
* **Action:** Create Value Objects if necessary (e.g., `Username` validation).

## Step 3: Infrastructure Layer - Users
* **Action:** Create `src/users/infrastructure/user.repository.ts`.
* **Details:** Implement TypeORM repository pattern for User entity.
* **Test:** Create `user.repository.spec.ts` (Mock TypeORM).

## Step 4: Application Layer - Auth Use Cases
* **Action:** Create `src/auth/application/auth.service.ts`.
* **Logic:**
    * `validateUser(username, pass)`: Compare hash.
    * `login(user)`: Return JWT.
* **Infrastructure:** Implement `JwtStrategy` in `src/auth/infrastructure/jwt.strategy.ts`.

## Step 5: Application Layer - User Use Cases
* **Action:** Create `src/users/application/users.service.ts`.
* **Logic:**
    * `create(createUserDto)`: Hash password, save to Repo.
    * `findOne(username)`: Fetch from Repo.
* **Test:** Unit test services mocking the repository.

## Step 6: Interface Layer - Controllers (Auth & Users)
* **Action:** Create `AuthController` (`POST /api/auth/login`).
* **Action:** Create `UsersController` (`POST /api/users`, `GET /api/users`).
* **DTOs:** Define `CreateUserDto`, `LoginDto` using `class-validator`.
* **Validation:** Use Postman to register and login.

## Step 7: Subject Module (Kafka Producer)
* **Action:** Configure Kafka Client in `src/subjects/infrastructure/kafka.module.ts`.
* **Action:** Create `SubjectsService`.
* **Logic:**
    * Method `publishMessage(subject, message, user)`.
    * Validate `subject` against Enum.
    * Construct JSON payload.
    * Emit to Kafka topic.
* **Controller:** `SubjectsController` (`POST /api/subjects/:subject`).

## Step 8: Documentation
* **Action:** Setup Swagger in `main.ts`.
* **Details:** Decorate controllers with `@ApiTags`, `@ApiOperation`, `@ApiResponse`.
* **URL:** Verify access at `/api/docs`.

## Step 9: Docker Production
* **File:** `backend/Dockerfile`
* **Stages:**
    1.  `build`: Copy source, run `npm run build`.
    2.  `production`: Copy `dist` and `node_modules`, CMD `node dist/main`.

## Step 10: CI/CD
* **File:** `.github/workflows/backend.yml`.
* **Steps:** Checkout -> Install -> Lint -> Test -> Build.
