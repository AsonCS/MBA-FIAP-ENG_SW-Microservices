# Stage 1: Build Stage
# Uses Gradle with JDK 17 to compile and build the application
FROM gradle:8.5-jdk17 AS build

WORKDIR /build

# Copy gradle configuration files
COPY build.gradle.kts settings.gradle.kts gradlew* ./
COPY gradle/ gradle/

# Copy source code
COPY src/ src/

# Build the application (skip tests for faster builds, run them separately)
RUN gradle build -x test --no-daemon

# Stage 2: Runtime Stage
# Uses lightweight JDK 17 runtime image
FROM openjdk:26-ea-17-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the built JAR from builder stage
COPY --from=build /build/build/libs/feed-1.0.0-all.jar /app/feed.jar

# Expose port
EXPOSE 8080

# Environment variables (can be overridden at runtime)
ENV PORT=8080 \
    KAFKA_BROKER=kafka:9092 \
    JAVA_OPTS="-Xmx512m -Xms256m"

# Health check endpoint
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Set entrypoint to run the application
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app/feed.jar"]

# Run the application
CMD ["java", "-jar", "app.jar"]
