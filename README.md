# MBA-FIAP-ENG_SW-Microservices

---

# Micro-Feed Platform

A scalable, micro-service-based content platform demonstrating **Domain-Driven Design (DDD)** and **Eventual Consistency**.

This project allows users to register, login, and post messages to specific subject channels (Sports, Healthy, News, Food, Autos). The unique feature of this architecture is the decoupling of writing (posting) and reading (feed consumption). Messages are streamed via Kafka to a dedicated Feed service that pre-renders static HTML for high-performance consumption via iframes.

-----

## 🏗 Architecture Overview

The system is composed of three main application services and infrastructure components, orchestrated via Docker.

### 1\. **Frontend (`frontend`)**

  * **Tech:** NextJS 14, Tailwind CSS.
  * **Role:** User Interface for authentication and composing messages.
  * **Integration:**
      * Connects to `backend` for Auth and Publishing.
      * Embeds `feed` content via `<iframe />`.

### 2\. **Backend (`backend`)**

  * **Tech:** NestJS, TypeScript, TypeORM.
  * **Role:** The command center. Handles User Identity (MySQL) and Message Ingestion.
  * **Pattern:** Hexagonal Architecture / DDD.
  * **Flow:** Validates requests and produces events to **Kafka** topics.

### 3\. **Feed Service (`feed`)**

  * **Tech:** Kotlin, Ktor.
  * **Role:** The read model. Consumes Kafka streams and maintains an in-memory state of pre-rendered HTML fragments.
  * **Performance:** Delivers static HTML with near-zero latency.

### 4\. **Infrastructure**

  * **Kafka:** Message broker handling topics: `sports`, `healthy`, `news`, `food`, `autos`.
  * **MySQL:** Persistent storage for user credentials.

-----

## 🚀 Getting Started

### Prerequisites

  * [Docker](https://www.docker.com/) and Docker Compose installed.
  * Git.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/micro-feed-platform.git
    cd micro-feed-platform
    ```

2.  **Environment Setup:**
    Create a `.env` file in the root directory (or rename `.env.example`).

    ```bash
    # Database
    MYSQL_ROOT_PASSWORD=secret
    MYSQL_DATABASE=app_db

    # Kafka
    KAFKA_BROKER=kafka:9092
    ```

3.  **Run the application:**

    ```bash
    docker-compose up --build -d
    ```

    *Note: The first run may take a few minutes as Docker images are built and dependencies (Kotlin/Node) are downloaded.*

4.  **Verify Status:**
    Ensure all containers (`db`, `kafka`, `backend`, `feed`, `frontend`) are `healthy` or `running`.

    ```bash
    docker-compose ps
    ```

-----

## 🖥️ Usage Guide

### Access Points

| Service | URL | Description |
| :--- | :--- | :--- |
| **Frontend** | `http://localhost:3000` | Main User Interface |
| **Backend API** | `http://localhost:3001` | REST API & Swagger Docs (`/api/docs`) |
| **Feed API** | `http://localhost:8080` | HTML Feed Generator |

### User Flow

1.  **Register:** Go to the Frontend, click "Register". Create a user.
2.  **Login:** Log in with your new credentials.
3.  **Select Subject:** Click on a subject button (e.g., "Sports").
4.  **Post:** Type a message and hit "Send".
      * *Behind the scenes:* The backend validates the user and sends a message to the `sports` Kafka topic.
5.  **View Feed:**
      * The iframe below displays the feed.
      * **Note on Eventual Consistency:** The feed does not update instantly. The Kotlin service must consume the message from Kafka first.
      * **Refresh:** Click the "Refresh Feed" button (or reload the page) to fetch the updated HTML from the Feed service.

-----

## 📡 API Reference

### Backend Service (`NodeJS`)

**Authentication**

  * `POST /api/auth/login`: Returns JWT Token.
  * `POST /api/users`: Creates a new user.

**Publishing**

  * `POST /api/subjects/{subject}`
      * **Headers:** `Authorization: Bearer <token>`
      * **Body:** `{ "message": "Your text here" }`
      * **Description:** Publishes message to the specific Kafka topic.

### Feed Service (`Kotlin`)

**Consumption**

  * `GET /api/subjects/{subject}`
      * **Response:** `Content-Type: text/html`
      * **Description:** Returns a full HTML page with the list of latest messages for that subject.

-----

## 📂 Project Structure

```text
micro-feed-platform/
├── backend/                # NestJS Application
│   ├── src/
│   │   ├── auth/           # Authentication Module
│   │   ├── users/          # User Domain & Repo
│   │   └── subjects/       # Kafka Producer Logic
│   └── Dockerfile
├── feed/                   # Kotlin Ktor Application
│   ├── src/main/kotlin/    # Domain & Consumer Logic
│   └── Dockerfile
├── frontend/               # NextJS Application
│   ├── src/app/            # Pages & Routing
│   └── Dockerfile
├── docker-compose.yaml     # Orchestration
└── README.md
```

-----

## 🧪 Development & Testing

If you wish to run services individually for development:

### Backend

```bash
cd backend
npm install
npm test          # Run Unit Tests
npm run start:dev # Run locally (requires running DB/Kafka)
```

### Feed

```bash
cd feed
./gradlew test    # Run Unit Tests
./gradlew run     # Run locally (requires running Kafka)
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

-----

## 📜 License

This project is licensed under the Apache-2.0 license.
