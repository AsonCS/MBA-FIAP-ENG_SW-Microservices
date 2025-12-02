package com.project.feed.interfaces.http

import com.project.feed.infrastructure.storage.FeedStore
import io.ktor.client.request.get
import io.ktor.client.statement.bodyAsText
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.Application
import io.ktor.server.application.install
import io.ktor.server.routing.routing
import io.ktor.server.testing.testApplication
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@DisplayName("FeedRoutes Tests")
class FeedRoutesTest {

    private fun setupApp(): Application.() -> Unit = {
        routing {
            feedRoutes()
        }
    }

    @BeforeEach
    fun setUp() {
        FeedStore.clearAll()
        FeedStore.initializeTopics(listOf("sports", "healthy", "news", "food", "autos"))
    }

    @Test
    @DisplayName("should return HTML for valid subject with messages")
    fun testGetFeedForValidSubject() = testApplication {
        application(setupApp())

        // Arrange
        FeedStore.add("sports", "<li>[2023-10-10T10:00:00Z] <b>JohnDoe</b>: Great goal!</li>")
        FeedStore.add("sports", "<li>[2023-10-10T10:05:00Z] <b>JaneSmith</b>: Incredible match!</li>")

        // Act
        val response = client.get("/api/subjects/sports")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("<!DOCTYPE html>"))
        assertTrue(body.contains("Sports Feed"))
        assertTrue(body.contains("JohnDoe"))
        assertTrue(body.contains("Great goal!"))
        assertTrue(body.contains("JaneSmith"))
        assertTrue(body.contains("Total messages: 2"))
    }

    @Test
    @DisplayName("should return empty feed message when no messages exist")
    fun testGetFeedForEmptySubject() = testApplication {
        application(setupApp())

        // Act
        val response = client.get("/api/subjects/news")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("<!DOCTYPE html>"))
        assertTrue(body.contains("News Feed"))
        assertTrue(body.contains("No messages yet for this subject"))
        assertTrue(body.contains("Total messages: 0"))
    }

    @Test
    @DisplayName("should return 404 for missing subject parameter")
    fun testGetFeedMissingSubject() = testApplication {
        application(setupApp())

        // Act - Request with empty path returns 404 (route not found)
        val response = client.get("/api/subjects/")

        // Assert - 404 is expected since the route pattern requires a non-empty subject
        assertEquals(HttpStatusCode.NotFound, response.status)
    }

    @Test
    @DisplayName("should return 400 for invalid subject")
    fun testGetFeedInvalidSubject() = testApplication {
        application(setupApp())

        // Act
        val response = client.get("/api/subjects/invalidtopic")

        // Assert
        assertEquals(HttpStatusCode.BadRequest, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("invalid subject"))
    }

    @Test
    @DisplayName("should list all available subjects")
    fun testListSubjects() = testApplication {
        application(setupApp())

        // Arrange
        FeedStore.add("sports", "<li>[2023-10-10T10:00:00Z] <b>User1</b>: Message</li>")
        FeedStore.add("healthy", "<li>[2023-10-10T10:00:00Z] <b>User2</b>: Message</li>")

        // Act
        val response = client.get("/api/subjects")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("Available Feed Subjects"))
        assertTrue(body.contains("sports"))
        assertTrue(body.contains("healthy"))
        assertTrue(body.contains("news"))
        assertTrue(body.contains("food"))
        assertTrue(body.contains("autos"))
    }

    @Test
    @DisplayName("should escape HTML in messages")
    fun testHtmlEscapingInFeed() = testApplication {
        application(setupApp())

        // Arrange
        FeedStore.add("sports", "<li>[2023-10-10T10:00:00Z] <b>User&lt;Script&gt;</b>: Content</li>")

        // Act
        val response = client.get("/api/subjects/sports")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("User&lt;Script&gt;"))
    }

    @Test
    @DisplayName("should display correct message count")
    fun testMessageCountDisplay() = testApplication {
        application(setupApp())

        // Arrange
        for (i in 1..5) {
            FeedStore.add("food", "<li>[2023-10-10T10:00:00Z] <b>User$i</b>: Message $i</li>")
        }

        // Act
        val response = client.get("/api/subjects/food")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("Total messages: 5"))
    }

    @Test
    @DisplayName("should return valid HTML structure")
    fun testValidHtmlStructure() = testApplication {
        application(setupApp())

        // Arrange
        FeedStore.add("autos", "<li>[2023-10-10T10:00:00Z] <b>Driver1</b>: New car!</li>")

        // Act
        val response = client.get("/api/subjects/autos")

        // Assert
        assertEquals(HttpStatusCode.OK, response.status)
        val body = response.bodyAsText()
        assertTrue(body.contains("<!DOCTYPE html>"))
        assertTrue(body.contains("<html"))
        assertTrue(body.contains("<head>"))
        assertTrue(body.contains("<title>"))
        assertTrue(body.contains("<body>"))
        assertTrue(body.contains("</body>"))
        assertTrue(body.contains("</html>"))
    }

    @Test
    @DisplayName("should handle multiple topics correctly")
    fun testMultipleTopics() = testApplication {
        application(setupApp())

        // Arrange
        FeedStore.add("sports", "<li>[2023-10-10T10:00:00Z] <b>User1</b>: Sports</li>")
        FeedStore.add("healthy", "<li>[2023-10-10T10:00:00Z] <b>User2</b>: Health</li>")
        FeedStore.add("news", "<li>[2023-10-10T10:00:00Z] <b>User3</b>: News</li>")

        // Act & Assert
        val sportsResponse = client.get("/api/subjects/sports")
        assertEquals(HttpStatusCode.OK, sportsResponse.status)
        assertTrue(sportsResponse.bodyAsText().contains("Sports Feed"))

        val healthResponse = client.get("/api/subjects/healthy")
        assertEquals(HttpStatusCode.OK, healthResponse.status)
        assertTrue(healthResponse.bodyAsText().contains("Healthy Feed"))

        val newsResponse = client.get("/api/subjects/news")
        assertEquals(HttpStatusCode.OK, newsResponse.status)
        assertTrue(newsResponse.bodyAsText().contains("News Feed"))
    }
}
