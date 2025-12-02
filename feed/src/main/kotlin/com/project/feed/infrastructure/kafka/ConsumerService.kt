package com.project.feed.infrastructure.kafka

import com.fasterxml.jackson.databind.ObjectMapper
import com.project.feed.application.HtmlGenerator
import com.project.feed.domain.models.FeedMessage
import com.project.feed.infrastructure.storage.FeedStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.consumer.KafkaConsumer
import org.apache.kafka.common.serialization.StringDeserializer
import org.slf4j.LoggerFactory
import java.time.Duration
import java.util.Properties

/**
 * Kafka Consumer Service for the Feed application.
 * Subscribes to Kafka topics and processes incoming messages in a background coroutine.
 * Messages are converted to FeedMessage domain objects, formatted as HTML, and stored in FeedStore.
 */
class ConsumerService(
    private val kafkaBrokers: String = "localhost:9092",
    private val groupId: String = "feed-service-group"
) {
    private val logger = LoggerFactory.getLogger(ConsumerService::class.java)
    private val objectMapper = ObjectMapper()

    private val topics = listOf("sports", "healthy", "news", "food", "autos")
    private lateinit var consumer: KafkaConsumer<String, String>
    private var isRunning = false

    /**
     * Initialize the Kafka consumer with properties.
     */
    private fun initializeConsumer() {
        val properties = Properties().apply {
            put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaBrokers)
            put(ConsumerConfig.GROUP_ID_CONFIG, groupId)
            put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer::class.java)
            put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer::class.java)
            put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest")
            put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true")
            put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "1000")
            put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, "30000")
        }
        consumer = KafkaConsumer(properties)
    }

    /**
     * Start consuming messages from Kafka in a background coroutine.
     * This method subscribes to all configured topics and processes messages continuously.
     */
    fun start() {
        runBlocking(Dispatchers.IO) {
            launch {
                try {
                    initializeConsumer()
                    isRunning = true
                    logger.info("Kafka Consumer started, subscribing to topics: $topics")

                    // Initialize FeedStore with all topics
                    FeedStore.initializeTopics(topics)

                    // Subscribe to topics
                    consumer.subscribe(topics)

                    // Polling loop
                    while (isRunning) {
                        val records = consumer.poll(Duration.ofMillis(1000))

                        for (record in records) {
                            try {
                                val feedMessage: FeedMessage = objectMapper.readValue(
                                    record.value(),
                                    FeedMessage::class.java
                                )

                                // Generate HTML from message and store it
                                val htmlItem = HtmlGenerator.generateHtmlItem(feedMessage)
                                FeedStore.add(record.topic(), htmlItem)

                                logger.debug(
                                    "Message processed - Topic: ${record.topic()}, " +
                                            "Username: ${feedMessage.username}, " +
                                            "Content: ${feedMessage.content}"
                                )
                            } catch (e: Exception) {
                                logger.error(
                                    "Error processing message from topic ${record.topic()}: ${e.message}",
                                    e
                                )
                            }
                        }
                    }
                } catch (e: Exception) {
                    logger.error("Fatal error in Kafka consumer: ${e.message}", e)
                    isRunning = false
                } finally {
                    consumer.close()
                    logger.info("Kafka Consumer stopped")
                }
            }
        }
    }

    /**
     * Stop the consumer gracefully.
     */
    fun stop() {
        isRunning = false
        if (::consumer.isInitialized) {
            consumer.close()
        }
    }

    /**
     * Check if the consumer is currently running.
     */
    fun isActive(): Boolean = isRunning
}
