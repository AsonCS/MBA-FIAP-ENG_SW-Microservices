# Backend Architecture

## Overview

The backend service follows **Domain-Driven Design (DDD)** principles combined with **Hexagonal Architecture** (Ports & Adapters pattern). This architecture separates concerns and makes the application testable, maintainable, and scalable.

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│         Interface Layer (HTTP)              │
│  Controllers → DTOs → Swagger Docs          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│      Application Layer (Use Cases)          │
│  Services → Business Logic → Orchestration  │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│    Infrastructure Layer (External Services) │
│  Repositories → Kafka → JWT → Databases    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│       Domain Layer (Business Rules)         │
│  Entities → Value Objects → Validation      │
└─────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Domain Layer

The **innermost and most protected layer** containing pure business logic independent of frameworks.

**Contents:**
- **Entities** - Objects with identity and lifecycle
- **Value Objects** - Objects without identity, immutable
- **Enums & Constants** - Business rule definitions

**Example:**
```typescript
// src/users/domain/user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  username: string;
  
  constructor(partial?: Partial<User>) {
    Object.assign(this, partial);
  }
}

// src/users/domain/value-objects/username.vo.ts
export class Username {
  private readonly value: string;
  
  static create(value: string): Username {
    // Validation logic
    return new Username(value);
  }
}
```

**Key Principles:**
- No dependencies on NestJS or external frameworks
- No HTTP concerns
- No database details
- Pure TypeScript classes

### 2. Infrastructure Layer

Implements external services and data access patterns.

**Contents:**
- **Repositories** - Data access patterns using TypeORM
- **Kafka Service** - Message publishing
- **JWT Strategy** - Authentication strategy
- **External APIs** - Third-party integrations

**Example:**
```typescript
// src/users/infrastructure/user.repository.ts
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly typeOrmRepository: Repository<User>,
  ) {}

  async create(user: User): Promise<User> {
    return this.typeOrmRepository.save(user);
  }
}

// src/subjects/infrastructure/kafka.service.ts
@Injectable()
export class KafkaService implements OnModuleInit {
  private producer: Producer;

  async publishMessage(subject: SubjectType, message: object): Promise<any> {
    return this.producer.send({
      topic: subject,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
}
```

**Key Principles:**
- Implements domain interfaces
- Handles external service communication
- Manages lifecycle (connection/disconnection)
- Isolated from business logic

### 3. Application Layer

Orchestrates domain logic and implements use cases.

**Contents:**
- **Services** - Orchestration and business logic
- **DTOs** - Data transfer objects for business logic
- **Use Cases** - Specific business workflows

**Example:**
```typescript
// src/users/application/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Validate
    Username.create(createUserDto.username);
    
    // Check duplicate
    const exists = await this.userRepository.existsByUsername(
      createUserDto.username,
    );
    if (exists) throw new BadRequestException('Username exists');
    
    // Hash & persist
    const hashed = await this.authService.hashPassword(
      createUserDto.password,
    );
    const user = new User({ 
      username: createUserDto.username, 
      password: hashed 
    });
    
    return this.userRepository.create(user);
  }
}
```

**Key Principles:**
- Orchestrates domain and infrastructure
- Implements use cases
- Handles business validations
- Transaction boundaries

### 4. Interface Layer (HTTP)

Handles HTTP requests/responses and API contracts.

**Contents:**
- **Controllers** - HTTP route handlers
- **DTOs** - Request/Response data transfer objects
- **Swagger Decorators** - API documentation
- **Guards** - Authentication/Authorization
- **Pipes** - Input validation

**Example:**
```typescript
// src/users/interfaces/users.controller.ts
@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, type: UserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async findAll(): Promise<UserDto[]> {
    return this.usersService.findAll();
  }
}

// src/users/interfaces/dtos/user.dto.ts
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

**Key Principles:**
- Translates HTTP to domain logic
- Framework-specific concerns
- Request validation
- Response formatting
- Security checks

## Module Structure

### Authentication Module

Handles user authentication and JWT token management.

```
src/auth/
├── application/
│   └── auth.service.ts          # Login, validation, token generation
├── infrastructure/
│   ├── jwt.strategy.ts          # Passport JWT strategy
│   └── jwt-auth.guard.ts        # Route protection guard
├── interfaces/
│   ├── auth.controller.ts       # Login endpoint
│   └── dtos/
│       └── login.dto.ts         # Login request/response
└── auth.module.ts               # Module definition
```

### Users Module

Manages user data, registration, and profile.

```
src/users/
├── domain/
│   ├── user.entity.ts           # User entity
│   └── value-objects/
│       └── username.vo.ts       # Username validation
├── application/
│   ├── users.service.ts         # User use cases
│   └── users.service.spec.ts    # Tests
├── infrastructure/
│   ├── user.repository.ts       # Data access
│   └── user.repository.spec.ts  # Tests
├── interfaces/
│   ├── users.controller.ts      # HTTP endpoints
│   ├── users.controller.spec.ts # Tests
│   └── dtos/
│       └── user.dto.ts          # Request/response DTOs
└── users.module.ts              # Module definition
```

### Subjects Module

Handles message publishing to Kafka topics.

```
src/subjects/
├── domain/
│   └── subject.enum.ts          # Subject type enum
├── application/
│   ├── subjects.service.ts      # Publishing logic
│   └── subjects.service.spec.ts # Tests
├── infrastructure/
│   ├── kafka.service.ts         # Kafka producer
│   └── kafka.service.spec.ts    # Tests (optional)
├── interfaces/
│   ├── subjects.controller.ts   # Publishing endpoint
│   ├── subjects.controller.spec.ts # Tests
│   └── dtos/
│       └── subject.dto.ts       # Request/response DTOs
└── subjects.module.ts           # Module definition
```

## Data Flow

### User Registration Flow

```
Client Request
    ↓
[Interface Layer] UsersController.create(CreateUserDto)
    ↓
[Application Layer] UsersService.create()
    - Validate using Username.create()
    - Check existsByUsername()
    - Hash password
    ↓
[Domain Layer] User entity instantiation
    ↓
[Infrastructure Layer] UserRepository.create()
    - TypeORM save
    ↓
[Interface Layer] Convert to UserResponseDto (no password)
    ↓
HTTP 201 Response
```

### Message Publishing Flow

```
Client Request (with JWT)
    ↓
[Interface Layer] JwtAuthGuard validates token
    ↓
[Interface Layer] SubjectsController.publishMessage()
    ↓
[Application Layer] SubjectsService.publishMessage()
    - Validate subject using isValidSubject()
    - Validate message length
    - Create SubjectMessage payload
    ↓
[Infrastructure Layer] KafkaService.publishMessage()
    - JSON serialize message
    - Send to Kafka broker
    ↓
[Interface Layer] Return success response
    ↓
HTTP 201 Response
```

## Design Patterns Used

### 1. Repository Pattern

Abstracts data access logic.

```typescript
// Domain doesn't know about database
export interface IUserRepository {
  create(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
}

// Infrastructure implements it
@Injectable()
export class UserRepository implements IUserRepository {
  // TypeORM implementation
}
```

### 2. Service Locator (Dependency Injection)

NestJS handles DI automatically.

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {} // Dependencies injected
}
```

### 3. Value Object Pattern

Encapsulates validation logic.

```typescript
export class Username {
  static create(value: string): Username {
    // Validation
    return new Username(value);
  }
}
```

### 4. Guard Pattern (Authentication)

Protects routes from unauthorized access.

```typescript
@UseGuards(JwtAuthGuard)
async findAll(): Promise<UserDto[]> {
  // Only executed if JWT is valid
}
```

### 5. DTO Pattern

Separates API contracts from internal models.

```typescript
// What clients send
export class CreateUserDto {
  username: string;
  password: string;
}

// What API returns
export class UserResponseDto {
  id: string;
  username: string;
  createdAt: Date;
  // password NOT included
}
```

## Dependency Direction

All dependencies flow **inward** toward the domain:

```
Interfaces → Application → Infrastructure → Domain
                                ↓
                         (Domain is independent)
```

This ensures:
- Easy to test (mock infrastructure)
- Easy to change frameworks (swap controllers)
- Business logic is isolated
- Clear separation of concerns

## Cross-Cutting Concerns

### Error Handling

Global error handling in `main.ts`:

```typescript
// All exceptions automatically formatted
// Validation errors → 400
// Unauthorized → 401
// Not Found → 404
// Unhandled → 500
```

### Logging

Services use NestJS Logger:

```typescript
private readonly logger = new Logger(MyService.name);
this.logger.error('Message', error);
```

### Validation

Global validation pipe in `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

## Scalability Considerations

### Horizontal Scaling

- Stateless services (no in-memory state)
- Database handles persistence
- Kafka for async processing
- JWT tokens don't require server-side sessions

### Vertical Scaling

- Efficient TypeORM queries
- Kafka batch processing
- Connection pooling configured

### Future Improvements

- Redis caching layer
- GraphQL alternative to REST
- Event sourcing
- CQRS pattern
- Microservices per module

## Testing Strategy

### Unit Tests

Test single units in isolation:

```
Repository → Mock database
Service → Mock repository
Controller → Mock service
```

### Integration Tests

Test module interactions:

```
Controller → Real service → Mock repository
```

### E2E Tests

Test full request-response cycle (future):

```
HTTP request → Full application → HTTP response
```

## Security Architecture

### Authentication

- JWT tokens with 24h expiration
- Passwords hashed with bcrypt (10 rounds)

### Authorization

- JWT guard on protected routes
- Role-based checks in controllers

### Input Validation

- DTO validation with class-validator
- Whitelist unknown properties
- Type transformation

### Data Protection

- Passwords never returned in API responses
- Sensitive error messages
- SQL injection prevention via TypeORM

## Performance Considerations

### Database Queries

- Repository pattern for efficient queries
- TypeORM relationships for joins
- Index on username (unique constraint)

### Caching

- JWT tokens cached in browser
- Consider Redis for high-traffic endpoints

### Async Processing

- Kafka for async message publishing
- Non-blocking I/O throughout

## References

- [Domain-Driven Design by Eric Evans](https://www.domainlanguage.com/ddd/)
- [Hexagonal Architecture Pattern](https://alistair.cockburn.us/hexagonal-architecture/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
