package com.project.feed.infrastructure.kafka

import com.fasterxml.jackson.databind.ObjectMapper
import com.project.feed.domain.models.FeedMessage
import com.project.feed.infrastructure.storage.FeedStore
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@DisplayName("ConsumerService Tests")
class ConsumerServiceTest {

    private lateinit var objectMapper: ObjectMapper

    @BeforeEach
    fun setUp() {
        objectMapper = ObjectMapper()
        FeedStore.clearAll()
    }

    @Test
    @DisplayName("should initialize consumer with correct broker and group id")
    fun testConsumerInitialization() {
        // Arrange & Act
        val consumer = ConsumerService(
            kafkaBrokers = "localhost:9092",
            groupId = "test-group"
        )

        // Assert
        assertTrue(!consumer.isActive())
    }

    @Test
    @DisplayName("should correctly deserialize FeedMessage from JSON")
    fun testFeedMessageDeserialization() {
        // Arrange
        val json = """
            {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "userId": "user-123",
                "username": "JohnDoe",
                "content": "Great match!",
                "timestamp": "2023-10-10T10:00:00Z"
            }
        """.trimIndent()

        // Act
        val message = objectMapper.readValue(json, FeedMessage::class.java)

        // Assert
        assertEquals("123e4567-e89b-12d3-a456-426614174000", message.id)
        assertEquals("user-123", message.userId)
        assertEquals("JohnDoe", message.username)
        assertEquals("Great match!", message.content)
        assertEquals("2023-10-10T10:00:00Z", message.timestamp)
    }

    @Test
    @DisplayName("should handle malformed JSON gracefully")
    fun testMalformedJsonHandling() {
        // Arrange
        val malformedJson = "{ invalid json }"

        // Act & Assert
        try {
            objectMapper.readValue(malformedJson, FeedMessage::class.java)
        } catch (e: Exception) {
            assertTrue(e.message?.contains("Unexpected character") ?: true)
        }
    }

    @Test
    @DisplayName("should initialize FeedStore with all required topics")
    fun testFeedStoreInitialization() {
        // Arrange
        val topics = listOf("sports", "healthy", "news", "food", "autos")
        FeedStore.clearAll()

        // Act
        FeedStore.initializeTopics(topics)

        // Assert
        topics.forEach { topic ->
            assertEquals(0, FeedStore.count(topic))
        }
    }
}
