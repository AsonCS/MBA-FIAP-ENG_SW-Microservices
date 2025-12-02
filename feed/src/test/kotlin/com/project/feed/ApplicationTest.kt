package com.project.feed

import com.project.feed.infrastructure.storage.FeedStore
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.server.testing.testApplication
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test

@DisplayName("Application Module Tests")
class ApplicationTest {

    @BeforeEach
    fun setUp() {
        FeedStore.clearAll()
        FeedStore.initializeTopics(listOf("sports", "healthy", "news", "food", "autos"))
    }

    @Test
    @DisplayName("should configure module with health check endpoint")
    fun testHealthCheckEndpoint() = testApplication {
        application {
            module()
        }

        // Act
        val response = client.get("/health")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        assertEquals("OK", response.bodyAsText())
    }

    @Test
    @DisplayName("should serve Swagger UI at /api/docs")
    fun testSwaggerUIEndpoint() = testApplication {
        application {
            module()
        }

        // Act
        val response = client.get("/api/docs")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("<!DOCTYPE html>"))
        assertTrue(body.contains("Swagger UI"))
        assertTrue(body.contains("swagger-ui"))
        assertTrue(body.contains("api/openapi.json"))
    }

    @Test
    @DisplayName("should serve OpenAPI specification at /api/openapi.json")
    fun testOpenApiEndpoint() = testApplication {
        application {
            module()
        }

        // Act
        val response = client.get("/api/openapi.json")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("openapi"))
        assertTrue(body.contains("3.0.0"))
        assertTrue(body.contains("Feed Service"))
        assertTrue(body.contains("/api/subjects"))
    }

    @Test
    @DisplayName("should have proper application module structure")
    fun testModuleStructure() = testApplication {
        application {
            module()
        }

        // Test all configured endpoints exist and are accessible

        // Health check
        val healthResponse = client.get("/health")
        assertEquals(HttpStatusCode.OK, healthResponse.status)

        // Swagger UI
        val swaggerResponse = client.get("/api/docs")
        assertEquals(HttpStatusCode.OK, swaggerResponse.status)

        // OpenAPI spec
        val openApiResponse = client.get("/api/openapi.json")
        assertEquals(HttpStatusCode.OK, openApiResponse.status)

        // Feed routes (should be configured)
        val subjectsResponse = client.get("/api/subjects")
        assertEquals(HttpStatusCode.OK, subjectsResponse.status)
    }

    @Test
    @DisplayName("should have all required documentation endpoints")
    fun testDocumentationEndpoints() = testApplication {
        application {
            module()
        }

        // API documentation endpoints should be available
        val endpoints = listOf(
            "/api/docs",
            "/api/openapi.json"
        )

        for (endpoint in endpoints) {
            val response = client.get(endpoint)
            assertEquals(
                HttpStatusCode.OK,
                response.status,
                "Endpoint $endpoint should return 200 OK"
            )
        }
    }

    @Test
    @DisplayName("should include feed routes in module")
    fun testFeedRoutesIncluded() = testApplication {
        application {
            module()
        }

        // Feed endpoints should be available
        val response = client.get("/api/subjects")
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("Available Feed Subjects") || body.contains("sports"))
    }
}
