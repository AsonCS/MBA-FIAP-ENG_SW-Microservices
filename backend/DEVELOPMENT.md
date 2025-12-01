# Backend Service - Micro-Feed Platform

A NestJS-based backend service for the Micro-Feed Platform, implementing Domain-Driven Design (DDD) with Hexagonal Architecture principles.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## Overview

**Service Name:** `backend`
**Language:** TypeScript (Node.js)
**Framework:** NestJS
**Database:** MySQL
**Message Broker:** Kafka

### Key Features

- ✅ User authentication with JWT tokens
- ✅ User management (create, read, update, delete)
- ✅ Message publishing to Kafka topics by subject
- ✅ Role-based access control (protected routes)
- ✅ Comprehensive API documentation (Swagger/OpenAPI)
- ✅ Input validation with class-validator
- ✅ Global error handling
- ✅ Health checks and graceful shutdown

## Architecture

The backend follows **Domain-Driven Design (DDD)** principles with **Hexagonal Architecture** (Ports & Adapters):

```
src/
├── shared/                 # Cross-cutting concerns
├── auth/                   # Authentication module
│   ├── application/        # Use cases (AuthService)
│   ├── infrastructure/     # Kafka, JWT strategies
│   └── interfaces/         # HTTP controllers
├── users/                  # User management module
│   ├── domain/             # Entities, Value Objects
│   ├── application/        # Use cases (UsersService)
│   ├── infrastructure/     # Repositories (TypeORM)
│   └── interfaces/         # HTTP controllers, DTOs
└── subjects/               # Subject publishing module
    ├── domain/             # Subject enum, validation
    ├── application/        # Use cases (SubjectsService)
    ├── infrastructure/     # Kafka producer
    └── interfaces/         # HTTP controllers, DTOs
```

### Layers

1. **Domain Layer** - Pure business logic, entities, value objects
2. **Application Layer** - Use cases, orchestration, validation
3. **Infrastructure Layer** - External services (Database, Kafka, Auth)
4. **Interface Layer** - HTTP controllers, request/response DTOs

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- MySQL 8.0+
- Kafka (optional for local development)

### Installation

```bash
cd backend
npm install
```

### Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=secret
DB_NAME=app_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production

# Kafka
KAFKA_BROKER=localhost:9092
```

### Running the Application

**Development mode (with watch):**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm run build
npm run start:prod
```

**Access Swagger UI:**
Open `http://localhost:3000/api/docs` in your browser.

## API Documentation

The API is fully documented with Swagger/OpenAPI. Access the interactive documentation at:

```
http://localhost:3000/api/docs
```

### Core Endpoints

#### Authentication

- `POST /api/auth/login` - Authenticate user and get JWT token

#### Users

- `POST /api/users` - Register new user
- `GET /api/users` - List all users (protected)
- `GET /api/users/:id` - Get user details (protected)
- `PUT /api/users/:id` - Update user (protected)
- `DELETE /api/users/:id` - Delete user (protected)

#### Subjects

- `GET /api/subjects` - List available subjects
- `POST /api/subjects/:subject` - Publish message to subject (protected)

### Authentication

Protected endpoints require a JWT token in the `Authorization` header:

```bash
Authorization: Bearer <jwt-token>
```

**Example Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Using Token:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Development

### Project Structure

```bash
src/
  ├── app.module.ts        # Root module
  ├── app.controller.ts    # Health check endpoint
  ├── app.service.ts       # Application service
  └── main.ts              # Application entry point
test/                      # E2E tests
```

### Code Style

The project uses ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Creating New Modules

To add a new module following DDD:

```bash
mkdir -p src/my-module/{domain,application,infrastructure,interfaces}
```

Then create:
- `domain/` - Entities, value objects, enums
- `application/` - Services, DTOs
- `infrastructure/` - Repositories, external integrations
- `interfaces/` - Controllers, HTTP DTOs

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:cov
```

### Test Structure

Tests are co-located with source files using `.spec.ts` suffix:

```
src/users/
  ├── domain/user.entity.ts
  ├── domain/user.entity.spec.ts
  ├── application/users.service.ts
  ├── application/users.service.spec.ts
  └── ...
```

### Test Coverage

Target: **80%+ code coverage**

Current metrics are displayed after running `npm run test:cov`.

## Deployment

### Docker Build

```bash
docker build -t micro-feed-backend:1.0.0 .
```

### Docker Run

```bash
docker run -p 3000:3000 \
  -e DB_HOST=db \
  -e KAFKA_BROKER=kafka:9092 \
  -e JWT_SECRET=your-secret \
  micro-feed-backend:1.0.0
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update JWT_SECRET to strong random value
- [ ] Configure database with proper credentials
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable rate limiting
- [ ] Configure CORS properly

## CI/CD Pipeline

GitHub Actions workflow runs on every push/PR:

1. **Checkout** - Clone repository
2. **Setup** - Install Node.js and dependencies
3. **Lint** - Run ESLint
4. **Test** - Run Jest tests with coverage
5. **Build** - Compile TypeScript
6. **Docker Build** - Build Docker image (on main push)

View workflow: `.github/workflows/backend.yml`

## Database Migrations

TypeORM is configured with `synchronize: true` in development, which auto-creates tables.

For production, use migrations:

```bash
npm run typeorm migration:generate -- -n CreateUsersTable
npm run typeorm migration:run
```

## Troubleshooting

### Kafka Connection Issues

Ensure Kafka is running:

```bash
docker run -d \
  -e KAFKA_ADVERTISED_HOST_NAME=localhost \
  -e KAFKA_ADVERTISED_PORT=9092 \
  -e KAFKA_ZOOKEEPER_CONNECT=zookeeper:2181 \
  confluentinc/cp-kafka:7.0.0
```

### Database Connection Issues

Test MySQL connection:

```bash
mysql -h localhost -u root -p app_db
```

### Port Already in Use

Change the port:

```bash
PORT=3001 npm run start:dev
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Write tests for new features
3. Follow the existing code style
4. Submit a pull request

## Security

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens expire after 24 hours
- Input validation prevents SQL injection
- Sensitive data (passwords) excluded from API responses
- CORS can be configured per environment

## Performance Optimization

- Request validation happens at global level
- Kafka messages are published asynchronously
- Database queries use TypeORM repository pattern
- Consider adding Redis caching for frequently accessed data

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a detailed bug report
3. Include environment details and reproduction steps

## License

Apache-2.0
