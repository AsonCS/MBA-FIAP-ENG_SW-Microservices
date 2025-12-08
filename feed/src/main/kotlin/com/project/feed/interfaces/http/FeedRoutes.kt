package com.project.feed.interfaces.http

import com.project.feed.infrastructure.storage.FeedStore
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import org.slf4j.LoggerFactory

private val logger = LoggerFactory.getLogger("FeedRoutes")
private val validTopics = setOf("sports", "healthy", "news", "food", "autos")

/**
 * FeedRoutes
 * HTTP endpoints for retrieving feed content
 */
fun Route.feedRoutes() {
    /**
     * GET /api/subjects/{subject}
     * Returns HTML-formatted feed for the specified subject/topic
     */
    get("/api/subjects/{subject}") {
        val subject = this.call.parameters["subject"]
        if (subject == null) {
            this.call.respondText(
                "Bad Request: subject parameter missing",
                ContentType.Text.Plain,
                HttpStatusCode.BadRequest
            )
            return@get
        }

        if (subject !in validTopics) {
            this.call.respondText(
                "Bad Request: invalid subject. Valid subjects are: ${validTopics.joinToString(", ")}",
                ContentType.Text.Plain,
                HttpStatusCode.BadRequest
            )
            return@get
        }

        try {
            val messages = FeedStore.getMessages(subject)
            val messageCount = messages.size
            val messagesHtml = if (messages.isEmpty()) {
                "<p>No messages yet for this subject.</p>"
            } else {
                "<ul>\n" + messages.joinToString("\n") + "\n</ul>"
            }

            val capitalizedSubject = subject.replaceFirstChar { it.uppercaseChar() }
            val html = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>$capitalizedSubject Feed</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                            background: #f5f5f5;
                        }
                        h2 {
                            color: #333;
                            border-bottom: 2px solid #007bff;
                            padding-bottom: 10px;
                        }
                        ul {
                            list-style: none;
                            padding: 0;
                            background: white;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        li {
                            padding: 12px 15px;
                            border-bottom: 1px solid #eee;
                            line-height: 1.6;
                        }
                        li:last-child {
                            border-bottom: none;
                        }
                        b {
                            color: #007bff;
                            font-weight: 600;
                        }
                        .message-count {
                            color: #666;
                            font-size: 0.9em;
                            margin-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <h2>$capitalizedSubject Feed</h2>
                    $messagesHtml
                    <div class="message-count">Total messages: $messageCount</div>
                </body>
                </html>
            """.trimIndent()

            logger.debug("Returning feed for subject '$subject' with $messageCount messages")
            this.call.respondText(html, ContentType.Text.Html)
        } catch (e: Exception) {
            logger.error("Error retrieving feed for subject '$subject'", e)
            this.call.respondText(
                "Internal Server Error",
                ContentType.Text.Plain,
                HttpStatusCode.InternalServerError
            )
        }
    }

    /**
     * GET /api/subjects
     * Returns list of all available subjects
     */
    get("/api/subjects") {
        try {
            val topics = FeedStore.getTopics()
            val html = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Available Subjects</title>
                    <style>
                        body {
                            font-family: sans-serif;
                            max-width: 600px;
                            margin: 50px auto;
                        }
                        ul { list-style-type: none; padding: 0; }
                        li { padding: 10px; margin: 5px 0; background: #f0f0f0; border-radius: 4px; }
                        a { text-decoration: none; color: #007bff; }
                        a:hover { text-decoration: underline; }
                    </style>
                </head>
                <body>
                    <h2>Available Feed Subjects</h2>
                    <ul>
                        ${
                topics.map { "<li><a href=\"/api/subjects/$it\">$it</a></li>" }.joinToString("\n")
            }
                    </ul>
                </body>
                </html>
            """.trimIndent()
            this.call.respondText(html, ContentType.Text.Html)
        } catch (e: Exception) {
            logger.error("Error retrieving subjects", e)
            this.call.respondText(
                "Internal Server Error",
                ContentType.Text.Plain,
                HttpStatusCode.InternalServerError
            )
        }
    }
}
