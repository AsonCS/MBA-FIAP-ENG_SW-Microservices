package com.project.feed.infrastructure.kafka

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
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
import kotlin.concurrent.thread

/**
 * KafkaConsumerService
 * Consumes messages from Kafka topics and updates the FeedStore
 * Runs in a background thread to avoid blocking the main application
 */
class KafkaConsumerService(
    private val brokers: String,
    private val topics: List<String>,
    private val groupId: String = "feed-service"
) {
    private val logger = LoggerFactory.getLogger(KafkaConsumerService::class.java)
    private val objectMapper: ObjectMapper = jacksonObjectMapper().apply {
        registerModule(JavaTimeModule())
    }
    private var consumerThread: Thread? = null
    private var isRunning = false

    /**
     * Start the Kafka consumer in a background thread
     */
    fun start() {
        if (isRunning) {
            logger.warn("Consumer already running")
            return
        }

        isRunning = true
        consumerThread = thread(name = "KafkaConsumer", isDaemon = false) {
            consume()
        }
        logger.info("Kafka consumer started")
    }

    /**
     * Stop the Kafka consumer
     */
    fun stop() {
        isRunning = false
        consumerThread?.join(5000)
        logger.info("Kafka consumer stopped")
    }

    /**
     * Main consumer loop - polls for messages and processes them
     */
    private fun consume() {
        val props = mapOf(
            ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG to brokers,
            ConsumerConfig.GROUP_ID_CONFIG to groupId,
            ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java.name,
            ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG to StringDeserializer::class.java.name,
            ConsumerConfig.AUTO_OFFSET_RESET_CONFIG to "earliest",
            ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG to true,
            ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG to 30000
        )

        try {
            KafkaConsumer<String, String>(props).use { consumer ->
                consumer.subscribe(topics)
                logger.info("Subscribed to topics: $topics")

                while (isRunning) {
                    val records = consumer.poll(Duration.ofSeconds(1))
                    for (record in records) {
                        try {
                            processMessage(record.topic(), record.value())
                        } catch (e: Exception) {
                            logger.error("Error processing message from topic ${record.topic()}", e)
                        }
                    }
                }
            }
        } catch (e: Exception) {
            logger.error("Fatal error in Kafka consumer", e)
        }
    }

    /**
     * Process a message received from Kafka
     *
     * @param topic Topic name
     * @param messageJson JSON string representing FeedMessage
     */
    private fun processMessage(topic: String, messageJson: String) {
        try {
            val message = objectMapper.readValue(messageJson, FeedMessage::class.java)
            val htmlItem = HtmlGenerator.generateHtmlItem(message)
            FeedStore.add(topic, htmlItem)
            logger.debug("Added message to topic '$topic': ${message.username}")
        } catch (e: Exception) {
            logger.error("Failed to parse message: $messageJson", e)
        }
    }
}
