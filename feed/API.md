# Feed Service API Documentation

## Overview

The Feed Service API provides access to pre-rendered HTML feeds consumed from Kafka topics. Messages are processed in real-time and stored in memory for efficient retrieval.

## Base URLs

- **Local Development**: `http://localhost:8080`
- **Docker Compose**: `http://feed:8080`

## Available Subjects

The Feed Service maintains feeds for the following subjects:
- `sports`
- `healthy`
- `news`
- `food`
- `autos`

## Endpoints

### 1. Get All Subjects

**Endpoint**: `GET /api/subjects`

**Description**: Retrieves a list of all available feed subjects with their current message counts.

**Response**: `200 OK`
```
Content-Type: text/html

<!DOCTYPE html>
<html>
<head>
    <title>Available Subjects</title>
</head>
<body>
    <h2>Available Feed Subjects</h2>
    <ul>
        <li><a href="/api/subjects/sports">sports</a></li>
        <li><a href="/api/subjects/healthy">healthy</a></li>
        <li><a href="/api/subjects/news">news</a></li>
        <li><a href="/api/subjects/food">food</a></li>
        <li><a href="/api/subjects/autos">autos</a></li>
    </ul>
</body>
</html>
```

**Error Responses**:
- `500 Internal Server Error` - Server error occurred while retrieving subjects

---

### 2. Get Feed for Subject

**Endpoint**: `GET /api/subjects/{subject}`

**Description**: Retrieves the pre-rendered HTML feed for a specific subject. Each message in the feed is formatted as:
```html
<li>[timestamp] <b>username</b>: content</li>
```

**Parameters**:
| Parameter | Type   | Required | Description                                       |
|-----------|--------|----------|---------------------------------------------------|
| subject   | string | Yes      | Subject name: `sports`, `healthy`, `news`, `food`, or `autos` |

**Response**: `200 OK`
```
Content-Type: text/html

<!DOCTYPE html>
<html>
<head>
    <title>Sports Feed</title>
    <style>
        /* styling */
    </style>
</head>
<body>
    <h2>Sports Feed</h2>
    <ul>
        <li>[2023-10-10T10:00:00Z] <b>JohnDoe</b>: Did you see that goal?</li>
        <li>[2023-10-10T10:05:00Z] <b>JaneSmith</b>: Incredible match!</li>
    </ul>
    <div class="message-count">Total messages: 2</div>
</body>
</html>
```

**Error Responses**:
- `400 Bad Request` - Subject parameter is missing or invalid
  ```
  Bad Request: invalid subject. Valid subjects are: sports, healthy, news, food, autos
  ```
- `500 Internal Server Error` - Server error occurred while retrieving feed

---

### 3. Health Check

**Endpoint**: `GET /health`

**Description**: Simple health check endpoint to verify the service is running.

**Response**: `200 OK`
```
OK
```

---

### 4. OpenAPI Specification

**Endpoint**: `GET /api/openapi.json`

**Description**: Retrieves the OpenAPI 3.0.0 specification for the Feed Service API in JSON format.

**Response**: `200 OK`
```
Content-Type: application/json

{
  "openapi": "3.0.0",
  "info": {
    "title": "Feed Service API",
    "version": "1.0.0",
    ...
  },
  ...
}
```

---

### 5. Swagger UI

**Endpoint**: `GET /api/docs`

**Description**: Interactive API documentation using Swagger UI. Provides a web-based interface for exploring and testing the API.

**Response**: `200 OK` (HTML page with interactive documentation)

---

## Data Models

### FeedMessage

Represents a message consumed from Kafka and rendered in the feed.

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "userId": "user-id-uuid",
  "username": "JohnDoe",
  "content": "This is my message",
  "timestamp": "2023-10-10T10:00:00Z"
}
```

**Fields**:
| Field     | Type   | Description                    |
|-----------|--------|--------------------------------|
| id        | string | Unique message identifier (UUID v4) |
| userId    | string | UUID of the user who posted the message |
| username  | string | Username of the poster         |
| content   | string | Message text content           |
| timestamp | string | ISO-8601 formatted timestamp   |

---

## Message Flow

1. **Backend Service** publishes a message to a Kafka topic (e.g., `sports`)
2. **Kafka Consumer** (running in Feed Service) receives the message
3. **HTML Generator** converts the message to HTML format: `<li>[timestamp] <b>username</b>: content</li>`
4. **FeedStore** (in-memory storage) appends the HTML to the topic's message list
5. **Client** requests `/api/subjects/{subject}` and receives the complete HTML feed

---

## Usage Examples

### Retrieve all subjects
```bash
curl -X GET http://localhost:8080/api/subjects
```

### Get feed for a specific subject
```bash
curl -X GET http://localhost:8080/api/subjects/sports
```

### Get OpenAPI specification
```bash
curl -X GET http://localhost:8080/api/openapi.json | jq
```

### Access Swagger UI
```
http://localhost:8080/api/docs
```

---

## HTTP Status Codes

| Status Code | Meaning                          | Description                              |
|-------------|----------------------------------|------------------------------------------|
| 200         | OK                               | Request successful                       |
| 400         | Bad Request                      | Invalid or missing parameters            |
| 500         | Internal Server Error            | Server-side error occurred                |

---

## CORS

The Feed Service does not explicitly enable CORS headers by default. When used behind a reverse proxy or API Gateway, CORS should be configured at that level.

---

## Rate Limiting

Currently, the Feed Service does not implement rate limiting. It is recommended to configure rate limiting at the API Gateway or reverse proxy level for production deployments.

---

## Error Handling

All error responses include a descriptive message. Common errors include:

- **Missing/Invalid Subject**: Subject must be one of: `sports`, `healthy`, `news`, `food`, `autos`
- **Server Errors**: Server-side errors are logged with detailed stack traces

---

## Security Considerations

1. **HTML Escaping**: All user-provided content (username, message content) is HTML-escaped to prevent XSS attacks
2. **No Authentication**: The Feed Service is read-only and does not require authentication
3. **No Rate Limiting**: Consider implementing rate limiting for production use
4. **Input Validation**: Subject parameter is validated against a whitelist

---

## Performance Notes

- Messages are stored in-memory using `ConcurrentHashMap` for thread-safe access
- HTML rendering happens once at message ingestion time
- Response times are typically < 50ms for feeds with hundreds of messages
- No database queries are performed; all data is served from memory

---

## Contact & Support

For issues or questions regarding the Feed Service API, please refer to the project repository or contact the development team.
