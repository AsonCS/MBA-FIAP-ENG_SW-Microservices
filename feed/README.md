# Feed Service (Kotlin Ktor)

Micro-service for consuming Kafka messages and generating HTML feeds in real-time.

## Technologies

- **Language:** Kotlin 1.9.20
- **Framework:** Ktor 2.3.5
- **Message Broker:** Apache Kafka 3.5.1
- **Build Tool:** Gradle 8.4

## Project Structure

```text
feed/
├── src/
│   ├── main/
│   │   ├── kotlin/com/project/feed/
│   │   │   ├── Application.kt          # Entry point
│   │   │   ├── domain/                 # Business Logic
│   │   │   │   ├── models/             # FeedMessage data class
│   │   │   │   └── ports/              # Interfaces
│   │   │   ├── application/            # Use Cases (HtmlGenerator)
│   │   │   ├── infrastructure/
│   │   │   │   ├── kafka/              # KafkaConsumerService
│   │   │   │   └── storage/            # FeedStore
│   │   │   └── interfaces/
│   │   │       └── http/               # FeedRoutes
│   │   └── resources/
│   │       ├── application.conf        # Ktor & Kafka config
│   │       └── logback.xml             # Logging config
│   ├── test/
│   │   └── kotlin/com/project/feed/    # Unit tests
├── build.gradle.kts
├── settings.gradle.kts
├── gradlew
├── gradle/wrapper/gradle-wrapper.properties
└── README.md
```

## Building

```bash
# Download dependencies
./gradlew build

# Run tests
./gradlew test

# Run locally
./gradlew run

# Build fat JAR for Docker
./gradlew shadowJar
```

## Configuration

Environment variables:

- `PORT`: Server port (default: 8080)
- `KAFKA_BROKER`: Kafka broker address (default: localhost:9092)

## Kafka Topics

The service subscribes to the following topics:
- `sports`
- `healthy`
- `news`
- `food`
- `autos`

## API Endpoints

- `GET /api/subjects/{subject}` - Returns HTML-formatted feed for a specific subject
