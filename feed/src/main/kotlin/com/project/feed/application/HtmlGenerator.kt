package com.project.feed.application

import com.project.feed.domain.models.FeedMessage

/**
 * Domain service responsible for generating HTML-formatted message fragments.
 * Converts FeedMessage domain objects into HTML list items for display in the feed.
 */
object HtmlGenerator {

    /**
     * Convert a FeedMessage into an HTML list item.
     *
     * Format: <li>[${timestamp}] <b>${username}</b>: ${content}</li>
     *
     * @param message FeedMessage to convert
     * @return HTML-formatted string ready to be added to a feed list
     */
    fun generateHtmlItem(message: FeedMessage): String {
        return "<li>[${message.timestamp}] <b>${escapeHtml(message.username)}</b>: ${escapeHtml(message.content)}</li>"
    }

    /**
     * Escape HTML special characters to prevent XSS attacks.
     * Replaces: &, <, >, ", '
     *
     * @param text Text to escape
     * @return HTML-safe escaped string
     */
    private fun escapeHtml(text: String): String {
        return text
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;")
    }
}
