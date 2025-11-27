# Implementation Guide: Feed Service (Kotlin Ktor)

**Project:** `micro-feed-platform`
**Service:** `feed`
**Tech Stack:** Kotlin, Ktor, Kafka Client.

## Step 1: Project Setup
* **Action:** Initialize Gradle Kotlin project in `./feed`.
* **Dependencies:** `ktor-server-core`, `ktor-server-netty`, `ktor-jackson`, `kafka-clients`, `logback`.
* **File:** `src/main/resources/application.yaml` (Port configuration).

## Step 2: Domain Model
* **File:** `src/main/kotlin/com/project/feed/domain/models/FeedMessage.kt`.
* **Content:** Data class representing the JSON received from Kafka (`id`, `username`, `content`, `timestamp`).

## Step 3: In-Memory Storage
* **File:** `src/main/kotlin/com/project/feed/infrastructure/storage/FeedStore.kt`.
* **Logic:** Use a `ConcurrentHashMap<String, MutableList<String>>`.
    * Key: Topic name (subject).
    * Value: List of HTML formatted strings (`<li>...</li>`).

## Step 4: HTML Generator (Domain Service)
* **File:** `src/main/kotlin/com/project/feed/application/HtmlGenerator.kt`.
* **Logic:** Function taking a `FeedMessage` and returning a String: `<li>[${timestamp}] <b>${username}</b>: ${content}</li>`.
* **Test:** JUnit test ensuring correct HTML formatting.

## Step 5: Kafka Consumer (Infrastructure)
* **File:** `src/main/kotlin/com/project/feed/infrastructure/kafka/ConsumerService.kt`.
* **Logic:**
    * Initialize KafkaConsumer.
    * Subscribe to list: `['sports', 'healthy', 'news', 'food', 'autos']`.
    * Loop `poll()`.
    * On message: Deserialize JSON -> `HtmlGenerator` -> `FeedStore.add()`.
    * Run in a Coroutine (`launch(Dispatchers.IO)`).

## Step 6: HTTP Routes (Interface)
* **File:** `src/main/kotlin/com/project/feed/interfaces/http/FeedRoutes.kt`.
* **Endpoint:** `GET /api/subjects/{subject}`.
* **Logic:**
    * Get list from `FeedStore` based on parameter.
    * Wrap list in basic `<html><body><ul>...</ul></body></html>`.
    * Respond with `ContentType.Text.Html`.

## Step 7: Application Entry Point
* **File:** `src/main/kotlin/com/project/feed/Application.kt`.
* **Action:** Configure Ktor modules, start Kafka Consumer coroutine on startup.

## Step 8: Docker Production
* **File:** `feed/Dockerfile`.
* **Stages:**
    1.  `build`: Gradle shadowJar/build.
    2.  `runtime`: OpenJDK image, copy jar, CMD `java -jar app.jar`.

## Step 9: CI/CD
* **File:** `.github/workflows/feed.yml`.
* **Steps:** Checkout -> JDK Setup -> `./gradlew test` -> `./gradlew build`.
