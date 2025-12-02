# Feed Service - Docker Production Build

## Overview

The Feed Service is containerized using a multi-stage Docker build that optimizes image size and build time by:
1. Building the application in a container with Gradle and JDK
2. Creating a minimal runtime image with only the compiled JAR and runtime dependencies
3. Providing health checks and environment variable support

## Multi-Stage Build Process

### Stage 1: Build Stage
```dockerfile
FROM gradle:8.5-jdk17 AS build
```

**Purpose**: Compile and package the application
- **Base Image**: `gradle:8.5-jdk17` (includes Gradle and JDK 17)
- **Operations**:
  - Copy Gradle configuration files
  - Copy source code
  - Execute `gradle shadowJar` to build a fat JAR with all dependencies
  - Test execution is skipped (`-x test`) for faster builds
  - No Gradle daemon (`--no-daemon`) for clean builds

**Output**: Fat JAR file at `/build/build/libs/feed-1.0.0-all.jar`

### Stage 2: Runtime Stage
```dockerfile
FROM openjdk:17-slim
```

**Purpose**: Minimal production runtime
- **Base Image**: `openjdk:17-slim` (lightweight JRE only)
- **Size Reduction**: ~800MB → ~300MB (vs full SDK image)
- **Operations**:
  - Install `curl` for health checks
  - Copy pre-built JAR from build stage
  - Configure environment variables
  - Set up health checks
  - Define entry point

**Final Image Size**: ~350-400MB

## Building the Docker Image

### Build the image locally:
```bash
# From the feed directory
docker build -t feed:latest .

# Or with specific version tag
docker build -t feed:1.0.0 .
docker build -t feed:1.0.0 -t feed:latest .
```

### Build options:
```bash
# Build without cache (fresh build)
docker build --no-cache -t feed:latest .

# Build with build arguments
docker build \
  --build-arg JAR_FILE=build/libs/feed-1.0.0-all.jar \
  -t feed:latest .
```

## Running the Container

### Basic execution:
```bash
docker run -p 8080:8080 feed:latest
```

### With environment variables:
```bash
docker run \
  -p 8080:8080 \
  -e PORT=8080 \
  -e KAFKA_BROKER=kafka:9092 \
  feed:latest
```

### With Docker Compose:
```yaml
services:
  feed:
    build: ./feed
    ports:
      - "8080:8080"
    environment:
      PORT: 8080
      KAFKA_BROKER: kafka:9092
    depends_on:
      kafka:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 30s
```

### With Kubernetes:
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: feed-service
spec:
  containers:
  - name: feed
    image: feed:latest
    ports:
    - containerPort: 8080
    env:
    - name: PORT
      value: "8080"
    - name: KAFKA_BROKER
      value: "kafka:9092"
    livenessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 30
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /health
        port: 8080
      initialDelaySeconds: 5
      periodSeconds: 5
```

## Environment Variables

| Variable | Default | Description | Example |
|----------|---------|-------------|---------|
| `PORT` | `8080` | HTTP server port | `8080`, `3000` |
| `KAFKA_BROKER` | `kafka:9092` | Kafka broker address | `localhost:9092`, `kafka:9092` |
| `JAVA_OPTS` | `-Xmx512m -Xms256m` | JVM options | `-Xmx2g -Xms1g` |

## Health Check

The container includes a built-in health check that:
- **Endpoint**: `GET /health`
- **Interval**: 10 seconds
- **Timeout**: 5 seconds
- **Start Period**: 30 seconds (grace period before first check)
- **Retries**: 3 consecutive failures mark container as unhealthy

### Manual health check:
```bash
docker exec <container_id> curl -f http://localhost:8080/health

# Response
OK
```

## Image Verification

### Inspect image:
```bash
docker inspect feed:latest
```

### View image layers:
```bash
docker history feed:latest
```

### Check image size:
```bash
docker images | grep feed
```

### Test the running container:
```bash
# Start container
docker run -d --name feed-test -p 8080:8080 feed:latest

# Wait for startup
sleep 5

# Test endpoints
curl http://localhost:8080/health
curl http://localhost:8080/api/docs
curl http://localhost:8080/api/subjects

# Stop and remove
docker stop feed-test
docker rm feed-test
```

## Dockerfile Best Practices Implemented

✅ **Multi-stage builds**: Separates build and runtime layers
✅ **Lightweight base image**: Uses `-slim` variant
✅ **Minimal final image**: Only includes runtime + application
✅ **Layer caching**: Copies configuration before source code
✅ **Security**: No build tools in runtime image
✅ **Health checks**: Automatic monitoring
✅ **Environment variables**: Configuration through env vars
✅ **Explicit ENTRYPOINT**: Clear application execution

## Troubleshooting

### Image build fails with "gradle not found":
```bash
# Ensure you're in the feed directory
cd feed

# Try building with explicit context
docker build -f Dockerfile -t feed:latest .
```

### Container exits immediately:
```bash
# Check logs
docker logs <container_id>

# Run with interactive terminal
docker run -it feed:latest sh
```

### Health check fails:
```bash
# Check if port is listening
docker exec <container_id> netstat -tlnp | grep 8080

# Check application logs
docker logs <container_id>
```

### Out of memory:
```bash
# Increase JVM heap
docker run \
  -e JAVA_OPTS="-Xmx2g -Xms1g" \
  -m 2500m \
  feed:latest
```

## Optimization Tips

### For CI/CD:
```bash
# Build with specific tag
docker build -t feed:${CI_COMMIT_SHA:0:8} .
docker tag feed:${CI_COMMIT_SHA:0:8} feed:latest
```

### For faster rebuilds:
```bash
# Use BuildKit for faster builds
DOCKER_BUILDKIT=1 docker build -t feed:latest .
```

### For production:
```bash
# Use specific version tags, not "latest"
docker build -t myregistry.azurecr.io/feed:1.0.0 .
docker push myregistry.azurecr.io/feed:1.0.0
```

## Registry Deployment

### Push to Docker Hub:
```bash
docker tag feed:latest myusername/feed:latest
docker push myusername/feed:latest
```

### Push to Azure Container Registry:
```bash
az acr login --name myregistry

docker tag feed:latest myregistry.azurecr.io/feed:1.0.0
docker push myregistry.azurecr.io/feed:1.0.0
```

### Push to AWS ECR:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag feed:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/feed:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/feed:latest
```

## Files Modified

- **Dockerfile**: Updated multi-stage build with shadowJar
- **build.gradle.kts**: Added shadowJar plugin and configuration
