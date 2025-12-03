package com.project.feed.infrastructure.storage

import java.util.concurrent.ConcurrentHashMap
import java.util.Collections

/**
 * In-memory storage for feed messages.
 * Maintains a thread-safe collection of HTML-formatted message fragments
 * organized by subject topic.
 *
 * Key: Topic name (subject: sports, healthy, news, food, autos)
 * Value: Mutable list of HTML-formatted strings (e.g., <li>...</li>)
 *
 * Uses ConcurrentHashMap to ensure thread-safe access from multiple Kafka consumer threads.
 */
object FeedStore {
    private val store: ConcurrentHashMap<String, MutableList<String>> = ConcurrentHashMap()

    /**
     * Initialize storage for a topic if it doesn't already exist.
     * @param topic The subject topic name
     */
    fun initialize(topic: String) {
        store.putIfAbsent(topic, Collections.synchronizedList(mutableListOf()))
    }

    /**
     * Initialize multiple topics at once.
     * @param topics List of topic names
     */
    fun initializeTopics(topics: List<String>) {
        topics.forEach { topic ->
            store.putIfAbsent(topic, Collections.synchronizedList(mutableListOf()))
        }
    }

    /**
     * Add an HTML-formatted message fragment to a specific topic.
     * @param topic The subject topic name
     * @param htmlMessage The HTML-formatted message (e.g., <li>[timestamp] <b>username</b>: content</li>)
     */
    fun add(topic: String, htmlMessage: String) {
        initialize(topic)
        store[topic]?.add(htmlMessage)
    }

    /**
     * Retrieve all messages for a specific topic.
     * @param topic The subject topic name
     * @return List of HTML-formatted messages, or empty list if topic doesn't exist
     */
    fun getMessages(topic: String): List<String> {
        return store[topic]?.toList() ?: emptyList()
    }

    /**
     * Clear all messages for a specific topic.
     * @param topic The subject topic name
     */
    fun clear(topic: String) {
        store[topic]?.clear()
    }

    /**
     * Clear all messages across all topics.
     */
    fun clearAll() {
        store.clear()
    }

    /**
     * Get the total number of messages for a specific topic.
     * @param topic The subject topic name
     */
    fun count(topic: String): Int {
        return store[topic]?.size ?: 0
    }

    /**
     * Get all available topics.
     * @return Set of topic names
     */
    fun getTopics(): Set<String> {
        return store.keys
    }
}
