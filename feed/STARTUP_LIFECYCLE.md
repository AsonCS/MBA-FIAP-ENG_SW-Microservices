# Feed Service - Application Startup & Lifecycle

## Overview

The Feed Service application implements a well-orchestrated startup sequence that initializes all components in the correct order and provides graceful shutdown handling.

## Startup Sequence

### Step 1: Configuration Loading
```
PORT: 8080 (default) or from $PORT env var
KAFKA_BROKER: localhost:9092 (default) or from $KAFKA_BROKER env var
TOPICS: [sports, healthy, news, food, autos]
```

### Step 2: FeedStore Initialization
- Creates in-memory storage for all topics
- Initializes synchronized lists for each topic
- Thread-safe access via `ConcurrentHashMap`

### Step 3: Kafka Consumer Service
- Connects to Kafka broker
- Subscribes to all topics
- Starts background consumer thread
- Begins polling for messages

### Step 4: Ktor HTTP Server
- Configures routes and endpoints
- Starts embedded Netty server
- Listens on configured port
- Server is now ready to accept requests

## Application Lifecycle

```
┌─────────────────────────────────────────────────┐
│     main() - Application Entry Point             │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Load Configuration from Environment             │
│  - PORT (default: 8080)                         │
│  - KAFKA_BROKER (default: localhost:9092)       │
│  - TOPICS (fixed list)                          │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Initialize FeedStore                            │
│  - Create ConcurrentHashMap for topics           │
│  - Initialize empty message lists                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Start KafkaConsumerService                      │
│  - Connect to Kafka broker                       │
│  - Subscribe to topics                           │
│  - Start consumer thread (background)            │
│  - Begin polling for messages                    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Start Ktor HTTP Server                          │
│  - Configure routes (feedRoutes, docs, etc)      │
│  - Start embedded Netty server                   │
│  - Listen on port 8080 (or configured port)     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Application Ready                               │
│  - API Documentation: /api/docs                 │
│  - Health Check: /health                        │
│  - Feed Endpoints: /api/subjects/{subject}      │
│  - Kafka Consumer: Running in background        │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
   ┌─────────┐      ┌──────────────────┐
   │ Running │      │ Handle Requests  │
   │         │      │ Process Messages │
   └────┬────┘      └────────┬─────────┘
        │                    │
        └────────┬───────────┘
                 │
        [Shutdown Signal Received]
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  Shutdown Handler - Graceful Shutdown            │
└────────────────┬────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
┌─────────────────┐  ┌──────────────────┐
│ Stop Consumer   │  │ Stop HTTP Server │
│ Close Kafka     │  │ Clean resources  │
│ connections     │  │ Flush buffers    │
└────────┬────────┘  └────────┬─────────┘
         │                    │
         └────────┬───────────┘
                  │
                  ▼
        ┌──────────────────┐
        │ Application Exit │
        └──────────────────┘
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP server port |
| `KAFKA_BROKER` | `localhost:9092` | Kafka broker address |

### Topics (Fixed)
- `sports`
- `healthy`
- `news`
- `food`
- `autos`

## Startup Output Example

```
========================================
    FEED SERVICE - INITIALIZATION
========================================
Configuration loaded:
  - Port: 8080
  - Kafka Broker: localhost:9092
  - Topics: sports, healthy, news, food, autos

[1/3] Initializing FeedStore...
✓ FeedStore initialized with 5 topics

[2/3] Starting Kafka Consumer...
✓ Kafka Consumer started successfully

[3/3] Starting Ktor HTTP Server...
✓ Ktor server started on port 8080

========================================
    FEED SERVICE - READY
========================================
API Documentation: http://localhost:8080/api/docs
Health Check: http://localhost:8080/health
OpenAPI Spec: http://localhost:8080/api/openapi.json
========================================
```

## Graceful Shutdown

When the application receives a shutdown signal (SIGTERM, SIGINT, etc.):

1. **Shutdown Hook Activated** - Runtime shutdown hook is invoked
2. **Kafka Consumer Stopped** - Consumer thread stops polling, connections close
3. **Ktor Server Stopped** - Server gracefully stops accepting new requests
   - Grace period: 5000ms (in-flight requests)
   - Timeout: 10000ms (force close)
4. **Resources Released** - All resources cleaned up
5. **Application Exits** - Process terminates

### Shutdown Output Example

```
========================================
    FEED SERVICE - SHUTDOWN INITIATED
========================================
Stopping Kafka Consumer...
✓ Kafka Consumer stopped

Stopping Ktor Server...
✓ Ktor Server stopped

✓ Feed Service shutdown complete
========================================
```

## Error Handling

The application implements comprehensive error handling:

### Startup Errors
- **Kafka Connection Failed**: Logs warning but continues (may retry)
- **Port Already in Use**: Throws exception and exits with code 1
- **Configuration Error**: Logs error and exits with code 1

### Runtime Errors
- **Kafka Consumer Error**: Logged and handled in consumer loop
- **HTTP Handler Errors**: Logged with stack trace, response sent to client
- **FeedStore Access Errors**: Logged and managed gracefully

### Shutdown Errors
- **Consumer Stop Error**: Logged but doesn't block shutdown
- **Server Stop Error**: Logged but doesn't prevent exit

## Health Checks

The application provides a health check endpoint for monitoring:

```bash
curl http://localhost:8080/health
# Response: OK (HTTP 200)
```

This endpoint can be used by:
- Container orchestration platforms (Kubernetes, Docker Compose)
- Load balancers
- Monitoring systems

## Kafka Consumer Behavior

### On Startup
1. Connects to Kafka broker
2. Creates consumer group: `feed-service`
3. Subscribes to all 5 topics
4. Sets auto-offset-reset to `earliest` (processes all messages from beginning)
5. Enables auto-commit of offsets

### During Runtime
1. Polls for messages every 1 second
2. On message arrival:
   - Deserializes JSON to `FeedMessage`
   - Converts to HTML via `HtmlGenerator`
   - Stores in `FeedStore`
3. Handles errors gracefully

### On Shutdown
1. Stops polling
2. Closes consumer connection
3. Completes within 5 second timeout

## Development vs Production

### Development
```bash
# Run locally with Docker Compose
docker-compose up feed

# Or manually with Kafka running
./gradlew run
```

### Production
```bash
# Run as Docker container
docker run -p 8080:8080 \
  -e KAFKA_BROKER=kafka:9092 \
  -e PORT=8080 \
  feed:latest
```

## Monitoring

Key metrics to monitor:

1. **Health Check**: `GET /health` returns 200 OK
2. **Kafka Consumer**: Check logs for consumer thread status
3. **Message Processing**: Monitor FeedStore growth
4. **Response Times**: HTTP endpoint latency (typically < 50ms)
5. **Error Rates**: Check logs for exceptions

## Logging

All startup and shutdown activities are logged at INFO level:
```
logger.info("✓ FeedStore initialized with 5 topics")
logger.info("✓ Kafka Consumer started successfully")
logger.info("✓ Ktor server started on port 8080")
```

Errors are logged at ERROR level with full stack traces for debugging.

## Testing

The application startup is covered by `ApplicationTest.kt`:
- Health check endpoint availability
- Swagger UI endpoint availability
- OpenAPI specification endpoint
- Feed routes inclusion
- Module configuration verification
