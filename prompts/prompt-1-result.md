Here is the comprehensive specification for your micro-services project, formatted as a detailed Markdown file suitable for use as context in GenAI prompts.

-----

# Project Specification: Micro-Services Content Platform

## 1\. Project Overview

**Project Name:** `micro-feed-platform`
**Architecture:** Micro-services using Docker
**Pattern:** Domain-Driven Design (DDD)
**Core Concept:** A web platform allowing users to register, login, and post messages to specific subject channels. The feed consumption utilizes "eventual consistency" by rendering static HTML chunks generated from Kafka streams, displayed via iframes on the client side.

![Image of microservices architecture diagram for high level overview](prompt-1-result-img1.jpg "Microservices Architecture")

-----

## 2\. Infrastructure & Orchestration

### Docker Composition

The project runs via a single `docker-compose.yaml` file orchestrating the following containers. All services must utilize **Health Checks** to ensure dependency readiness.

  * **Network:** `app-network` (Bridge driver)

### Service Definitions

#### 1\. `db` (Database)

  * **Image:** `mysql:8.0`
  * **Environment:**
      * `MYSQL_ROOT_PASSWORD`: (secret)
      * `MYSQL_DATABASE`: `app_db`
  * **Volume:** Persistent storage `db_data:/var/lib/mysql`
  * **Healthcheck:** `mysqladmin ping -h localhost`

#### 2\. `kafka` (Message Broker)

  * **Image:** `confluentinc/cp-kafka:latest` (or Bitnami)
  * **Dependencies:** Zookeeper (if not using KRaft mode)
  * **Configuration:** Auto-create topics enabled or init-script.
  * **Topics:** `sports`, `healthy`, `news`, `food`, `autos`

-----

## 3\. Service: `backend` (NestJS)

**Role:** Authentication, User Management, and Message Publishing.
**Language:** TypeScript (Node.js)
**Framework:** NestJS
**Architecture:** Domain-Driven Design (DDD) with Hexagonal Architecture principles.

### Folder Structure

```text
backend/
├── src/
│   ├── shared/                 # Shared logic, kernels, base classes
│   ├── auth/                   # Auth Module
│   │   ├── application/        # Use Cases (Login, Validate)
│   │   ├── infrastructure/     # Passport strategies, JWT
│   │   └── interfaces/         # Controllers
│   ├── users/                  # Users Module
│   │   ├── domain/             # Entities (User), Value Objects
│   │   │   └── user.entity.ts
│   │   ├── application/        # Use Cases (CreateUser, FindUser)
│   │   ├── infrastructure/     # Repositories (TypeORM/Prisma)
│   │   └── interfaces/         # Http Controllers, DTOs
│   └── subjects/               # Subjects Module
│       ├── application/        # Use Cases (PostMessage)
│       └── infrastructure/     # Kafka Producer implementation
├── test/                       # E2E Tests
├── Dockerfile
└── package.json
```

### Data Dictionary (JSON Notation)

**User Object:**

```json
{
  "id": "uuid-v4-string",
  "username": "string (unique)",
  "password": "hashed-string",
  "createdAt": "ISO-8601"
}
```

**Subject Message Object (Sent to Kafka):**

```json
{
  "id": "uuid-v4-string",
  "userId": "uuid-v4-string",
  "username": "string",
  "content": "string",
  "timestamp": "ISO-8601"
}
```

### API Endpoints

#### Authentication

**POST** `/api/auth/login`

  * **Description:** Validates credentials and returns JWT.
  * **Body:** `{ "username": "...", "password": "..." }`
  * **Response:** `{ "accessToken": "jwt-string" }`

#### Users

**POST** `/api/users`

  * **Description:** Register a new user.
  * **Body:** `{ "username": "...", "password": "..." }`
  * **Response:** `{ "id": "...", "username": "..." }`

**GET** `/api/users`

  * **Description:** List users (Protected).
  * **Response:** `[ { "id": "...", "username": "..." } ]`

**GET** `/api/users/{id}`

  * **Description:** Get specific user details.

**PUT** `/api/users/{id}`

  * **Description:** Update user data.
  * **Body:** `{ "username": "new-name" }`

#### Subjects (Publishing)

**POST** `/api/subjects/{subject}`

  * **Params:** `subject` (Enum: sports, healthy, news, food, autos)
  * **Body:** `{ "message": "Hello world" }`
  * **Logic:**
    1.  Validate JWT.
    2.  Validate `subject` is in allow-list.
    3.  Construct JSON payload.
    4.  Produce message to Kafka Topic matching the subject.
  * **Response:** `201 Created`

### Testing & CI/CD

  * **Unit Tests:** Jest (`.spec.ts` files co-located).
  * **Integration Tests:** Supertest with in-memory DB.
  * **CI:** GitHub Action runs `npm test` and `npm run lint`.

-----

## 4\. Service: `feed` (Kotlin Ktor)

**Role:** Message Consumer and HTML Generator.
**Language:** Kotlin
**Framework:** Ktor
**Architecture:** DDD / Clean Architecture.

### Folder Structure

```text
feed/
├── src/
│   ├── main/
│   │   ├── kotlin/com/project/feed/
│   │   │   ├── Application.kt      # Entry point
│   │   │   ├── domain/             # Business Logic
│   │   │   │   ├── models/         # Message, Feed
│   │   │   │   └── ports/          # Interfaces for Repo/Consumer
│   │   │   ├── application/        # Use Cases (ProcessMessage, GenerateHtml)
│   │   │   ├── infrastructure/
│   │   │   │   ├── kafka/          # Kafka Consumer impl
│   │   │   │   └── storage/        # In-Memory Storage (ConcurrentHashMap)
│   │   │   └── interfaces/
│   │   │       └── http/           # Ktor Routes
│   │   └── resources/
│   │       └── application.yaml
├── Dockerfile
└── build.gradle.kts
```

### Core Logic

1.  **Kafka Consumer:** Runs in a background coroutine. Subscribes to `sports`, `healthy`, `news`, `food`, `autos`.
2.  **State Management:** Maintains an in-memory List of Strings (HTML fragments) per topic.
3.  **HTML Generation:** When a message arrives, it is formatted into an HTML list item (`<li>User: Message</li>`) and appended to the relevant subject's list.

### API Endpoints

**GET** `/api/subjects/{subject}`

  * **Params:** `subject` (Enum)
  * **Response:** `Content-Type: text/html`
  * **Payload Example:**
    ```html
    <!DOCTYPE html>
    <html>
    <body>
        <h2>Sports Feed</h2>
        <ul>
            <li>[2023-10-10 10:00] <b>JohnDoe</b>: Did you see that goal?</li>
            <li>[2023-10-10 10:05] <b>Jane</b>: Incredible match!</li>
        </ul>
    </body>
    </html>
    ```

### Testing & CI/CD

  * **Unit Tests:** JUnit 5 / MockK.
  * **Integration Tests:** TestContainers (Kafka).
  * **CI:** GitHub Action runs `./gradlew test`.

-----

## 5\. Service: `frontend` (NextJS)

**Role:** User Interface.
**Framework:** NextJS (React)
**Styling:** Tailwind CSS (Mobile First).

### Folder Structure

```text
frontend/
├── src/
│   ├── app/                    # App Router
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── page.tsx            # Home/Dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   ├── AuthForm.tsx
│   │   ├── SubjectSelector.tsx # Buttons for topics
│   │   └── FeedFrame.tsx       # Iframe wrapper
│   ├── services/
│   │   └── api.ts              # Axios/Fetch wrapper for backend
│   └── styles/
├── Dockerfile
└── package.json
```

### UI Specifications

#### 1\. Auth Pages

  * **Login:** Form (Username/Password). Stores JWT in HttpOnly cookie or LocalStorage.
  * **Register:** Form to create user using `backend:api/users`.

#### 2\. Home Page (Dashboard)

  * **Header:** Shows current user, Logout button.
  * **Subject Navigation:** Horizontal scrollable list or Grid of buttons: `[Sports] [Healthy] [News] [Food] [Autos]`.
  * **Compose Area:**
      * Input field + "Post" button.
      * sends POST to `backend:api/subjects/{selectedSubject}`.
      * *Note:* Posting does **not** automatically refresh the feed (Eventual Consistency).
  * **Feed Viewer:**
      * Component: `<iframe>`
      * Source: `http://localhost:KTOR_PORT/api/subjects/{selectedSubject}`.
      * **Manual Refresh:** The feed is static. The user must switch tabs or click a "Refresh Feed" button (which reloads the iframe src) to see new messages processed by the Ktor service.

### Testing & CI/CD

  * **UI Tests:** Cypress or Playwright.
  * **Unit Tests:** React Testing Library.
  * **CI:** GitHub Action runs build and test scripts.

-----

## 6\. General Requirements

### Documentation

  * **Swagger/OpenAPI:**
      * `backend` must expose `/api/docs`.
      * `feed` must expose `/api/docs`.

### CI/CD Pipelines (GitHub Actions)

Each service has a `.github/workflows/{service}.yml` file that triggers on push to `main` or `PR`.
Steps:

1.  Checkout code.
2.  Setup environment (Node/Java/Docker).
3.  Install dependencies.
4.  Run Linter.
5.  Run Unit Tests.
6.  Build Docker Image (optional/dry-run).

### Domain Driven Design (DDD) Checklist

  * **Bounded Contexts:** Strictly separated by service (`backend` handles User context, `feed` handles Display context).
  * **Ubiquitous Language:** Use consistent terms (e.g., "Subject", "Post", "Feed") across code and DB.
  * **Anti-Corruption Layer:** The `feed` service interprets Kafka JSON messages (from Backend) and converts them into its own Domain Model before HTML generation.

-----

**Would you like me to proceed by generating the `docker-compose.yaml` file based on this specification?**
