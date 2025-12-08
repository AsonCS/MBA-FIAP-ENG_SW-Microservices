package com.project.feed.application

import com.project.feed.domain.models.FeedMessage
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@DisplayName("HtmlGenerator Tests")
class HtmlGeneratorTest {

    @Test
    @DisplayName("should generate correct HTML item format")
    fun testGenerateHtmlItem() {
        // Arrange
        val message = FeedMessage(
            id = "123e4567-e89b-12d3-a456-426614174000",
            userId = "user-id-123",
            username = "JohnDoe",
            content = "Did you see that goal?",
            timestamp = "2023-10-10T10:00:00Z"
        )

        // Act
        val htmlItem = HtmlGenerator.generateHtmlItem(message)

        // Assert
        assertEquals(
            "<li>[2023-10-10T10:00:00Z] <b>JohnDoe</b>: Did you see that goal?</li>",
            htmlItem
        )
    }

    @Test
    @DisplayName("should escape HTML special characters in username")
    fun testEscapeHtmlInUsername() {
        // Arrange
        val message = FeedMessage(
            id = "123e4567-e89b-12d3-a456-426614174000",
            userId = "user-id-123",
            username = "User<Script>Alert</Script>",
            content = "Normal content",
            timestamp = "2023-10-10T10:00:00Z"
        )

        // Act
        val htmlItem = HtmlGenerator.generateHtmlItem(message)

        // Assert
        assertTrue(htmlItem.contains("&lt;Script&gt;Alert&lt;/Script&gt;"))
        assertTrue(htmlItem.contains("Normal content"))
    }

    @Test
    @DisplayName("should escape HTML special characters in content")
    fun testEscapeHtmlInContent() {
        // Arrange
        val message = FeedMessage(
            id = "123e4567-e89b-12d3-a456-426614174000",
            userId = "user-id-123",
            username = "JohnDoe",
            content = "Check this: <img src=x onerror='alert(1)'>",
            timestamp = "2023-10-10T10:00:00Z"
        )

        // Act
        val htmlItem = HtmlGenerator.generateHtmlItem(message)

        // Assert
        assertTrue(htmlItem.contains("&lt;img"))
        assertTrue(htmlItem.contains("&gt;"))
        assertTrue(htmlItem.contains("&#39;"))
    }

    @Test
    @DisplayName("should escape ampersand character")
    fun testEscapeAmpersand() {
        // Arrange
        val message = FeedMessage(
            id = "123e4567-e89b-12d3-a456-426614174000",
            userId = "user-id-123",
            username = "User & Admin",
            content = "A & B & C",
            timestamp = "2023-10-10T10:00:00Z"
        )

        // Act
        val htmlItem = HtmlGenerator.generateHtmlItem(message)

        // Assert
        assertTrue(htmlItem.contains("User &amp; Admin"))
        assertTrue(htmlItem.contains("A &amp; B &amp; C"))
    }

    @Test
    @DisplayName("should escape quotes")
    fun testEscapeQuotes() {
        // Arrange
        val message = FeedMessage(
            id = "123e4567-e89b-12d3-a456-426614174000",
            userId = "user-id-123",
            username = "User\"Name",
            content = "Content with 'single' and \"double\" quotes",
            timestamp = "2023-10-10T10:00:00Z"
        )

        // Act
        val htmlItem = HtmlGenerator.generateHtmlItem(message)

        // Assert
        assertTrue(htmlItem.contains("User&quot;Name"))
        assertTrue(htmlItem.contains("&#39;single&#39;"))
        assertTrue(htmlItem.contains("&quot;double&quot;"))
    }
}
