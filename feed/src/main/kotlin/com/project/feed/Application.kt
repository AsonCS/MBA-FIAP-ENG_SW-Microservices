package com.project.feed

import com.project.feed.infrastructure.kafka.KafkaConsumerService
import com.project.feed.infrastructure.storage.FeedStore
import com.project.feed.interfaces.http.feedRoutes
import io.ktor.http.ContentType
import io.ktor.server.application.Application
import io.ktor.server.application.call
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("Application")

/**
 * Main Ktor application module
 * Configures routes and initializes HTTP endpoints
 */
fun Application.module() {
    // Configure routes
    routing {
        // Health check endpoint
        get("/health") {
            this.call.respondText("OK")
        }

        // Swagger UI endpoint
        get("/api/docs") {
            val swaggerHtml = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Feed Service API - Swagger UI</title>
                    <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css">
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.js"></script>
                </head>
                <body>
                    <div id="swagger-ui"></div>
                    <script>
                        window.onload = function() {
                            SwaggerUIBundle({
                                url: "/api/openapi.json",
                                dom_id: '#swagger-ui',
                                presets: [
                                    SwaggerUIBundle.presets.apis,
                                    SwaggerUIBundle.SwaggerUIStandalonePreset
                                ],
                                layout: "BaseLayout",
                                requestInterceptor: (request) => {
                                    return request;
                                }
                            })
                        }
                    </script>
                </body>
                </html>
            """.trimIndent()
            this.call.respondText(swaggerHtml, ContentType.Text.Html)
        }

        // OpenAPI specification endpoint
        get("/api/openapi.json") {
            val openApiJson = this::class.java.getResourceAsStream("/openapi.json")?.bufferedReader()?.readText()
                ?: "{\"error\": \"OpenAPI specification not found\"}"
            this.call.respondText(openApiJson, ContentType.Application.Json)
        }

        // API endpoints
        feedRoutes()
    }

    logger.info("✓ Ktor application module configured successfully")
}

/**
 * Application entry point
 * Orchestrates startup sequence: FeedStore initialization → Kafka Consumer → Ktor Server
 * Manages graceful shutdown with proper resource cleanup
 */
fun main() {
    try {
        logger.info("========================================")
        logger.info("    FEED SERVICE - INITIALIZATION")
        logger.info("========================================")

        // Load configuration from environment variables
        val port = System.getenv("PORT")?.toIntOrNull() ?: 8080
        val kafkaBroker = System.getenv("KAFKA_BROKER") ?: "localhost:9092"
        val topics = listOf("sports", "healthy", "news", "food", "autos")

        logger.info("Configuration loaded:")
        logger.info("  - Port: $port")
        logger.info("  - Kafka Broker: $kafkaBroker")
        logger.info("  - Topics: ${topics.joinToString(", ")}")

        // Step 1: Initialize in-memory feed store
        logger.info("\n[1/3] Initializing FeedStore...")
        FeedStore.initializeTopics(topics)
        logger.info("✓ FeedStore initialized with ${topics.size} topics")

        // Step 2: Start Kafka consumer service
        logger.info("\n[2/3] Starting Kafka Consumer...")
        val consumer = KafkaConsumerService(kafkaBroker, topics)
        try {
            consumer.start()
            logger.info("✓ Kafka Consumer started successfully")
        } catch (e: Exception) {
            logger.error("✗ Failed to start Kafka Consumer: ${e.message}", e)
            logger.warn("  Note: If Kafka is not ready, the consumer will retry...")
        }

        // Step 3: Start Ktor HTTP server
        logger.info("\n[3/3] Starting Ktor HTTP Server...")
        val server = embeddedServer(Netty, port) { module() }
        server.start(wait = false)
        logger.info("✓ Ktor server started on port $port")

        logger.info("\n========================================")
        logger.info("    FEED SERVICE - READY")
        logger.info("========================================")
        logger.info("API Documentation: http://localhost:$port/api/docs")
        logger.info("Health Check: http://localhost:$port/health")
        logger.info("OpenAPI Spec: http://localhost:$port/api/openapi.json")
        logger.info("========================================\n")

        // Setup graceful shutdown handler
        Runtime.getRuntime().addShutdownHook(Thread {
            logger.info("\n========================================")
            logger.info("    FEED SERVICE - SHUTDOWN INITIATED")
            logger.info("========================================")

            try {
                logger.info("Stopping Kafka Consumer...")
                consumer.stop()
                logger.info("✓ Kafka Consumer stopped")
            } catch (e: Exception) {
                logger.error("✗ Error stopping Kafka Consumer: ${e.message}", e)
            }

            try {
                logger.info("Stopping Ktor Server...")
                server.stop(gracePeriodMillis = 5000, timeoutMillis = 10000)
                logger.info("✓ Ktor Server stopped")
            } catch (e: Exception) {
                logger.error("✗ Error stopping Ktor Server: ${e.message}", e)
            }

            logger.info("✓ Feed Service shutdown complete")
            logger.info("========================================\n")
        })

        // Keep the application running
        Thread.currentThread().join()

    } catch (e: Exception) {
        logger.error("✗ Fatal error during application startup: ${e.message}", e)
        logger.error("Stack trace:", e)
        System.exit(1)
    }
}
