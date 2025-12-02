package com.project.feed.domain.models

import com.fasterxml.jackson.annotation.JsonProperty

/**
 * FeedMessage
 * Domain model representing a message consumed from Kafka.
 * Corresponds to the Subject Message Object sent by the backend service.
 *
 * @property id Unique message identifier (UUID v4)
 * @property userId User who posted the message (UUID v4)
 * @property username Username of the poster
 * @property content Message content
 * @property timestamp When the message was posted (ISO-8601 string)
 */
data class FeedMessage(
    @JsonProperty("id")
    val id: String,

    @JsonProperty("userId")
    val userId: String,

    @JsonProperty("username")
    val username: String,

    @JsonProperty("content")
    val content: String,

    @JsonProperty("timestamp")
    val timestamp: String
)
