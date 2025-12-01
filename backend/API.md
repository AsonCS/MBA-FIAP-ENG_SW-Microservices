# Backend API Documentation

## Overview

The Micro-Feed Platform Backend API provides endpoints for:
- User authentication and management
- Message publishing to subject-based topics
- Subject/topic discovery

**Base URL:** `http://localhost:3000`
**API Version:** 1.0.0
**Documentation:** `http://localhost:3000/api/docs`

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication.

### Token Acquisition

**Endpoint:** `POST /api/auth/login`

Authenticate a user and receive a JWT token.

**Request:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJqb2huX2RvZSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid credentials
- `401 Unauthorized` - User not found or password incorrect

### Using the Token

Include the token in the `Authorization` header as a Bearer token:

```
Authorization: Bearer <your-jwt-token>
```

**Example:**
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  http://localhost:3000/api/users
```

### Token Expiration

Tokens expire after **24 hours**. After expiration, users must login again to obtain a new token.

## API Endpoints

### Authentication Endpoints

#### Login

- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Authentication:** None
- **Description:** Authenticate user with credentials

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Responses:**
- `200 OK` - Login successful
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Invalid credentials

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}'
```

---

### User Endpoints

#### Create User (Register)

- **Method:** `POST`
- **Path:** `/api/users`
- **Authentication:** None
- **Description:** Register a new user

**Request Body:**
```json
{
  "username": "string (3-50 chars, alphanumeric/_/-)",
  "password": "string (min 6 chars)"
}
```

**Response (201 Created):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "createdAt": "2025-12-01T10:00:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Validation error or username already exists

**Example:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"password123"}'
```

---

#### Get All Users

- **Method:** `GET`
- **Path:** `/api/users`
- **Authentication:** Required (JWT)
- **Description:** List all registered users

**Response (200 OK):**
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "john_doe",
    "createdAt": "2025-12-01T10:00:00.000Z"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "username": "jane_smith",
    "createdAt": "2025-12-01T11:00:00.000Z"
  }
]
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token

**Example:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <token>"
```

---

#### Get User by ID

- **Method:** `GET`
- **Path:** `/api/users/:id`
- **Authentication:** Required (JWT)
- **Description:** Get details of a specific user

**Path Parameters:**
- `id` - User UUID

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "john_doe",
  "createdAt": "2025-12-01T10:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

**Example:**
```bash
curl -X GET http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

#### Update User

- **Method:** `PUT`
- **Path:** `/api/users/:id`
- **Authentication:** Required (JWT)
- **Description:** Update user information

**Path Parameters:**
- `id` - User UUID

**Request Body (all fields optional):**
```json
{
  "username": "string (3-50 chars, alphanumeric/_/-)",
  "password": "string (min 6 chars)"
}
```

**Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "username": "updated_name",
  "createdAt": "2025-12-01T10:00:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

**Example:**
```bash
curl -X PUT http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"username":"new_username"}'
```

---

#### Delete User

- **Method:** `DELETE`
- **Path:** `/api/users/:id`
- **Authentication:** Required (JWT)
- **Description:** Delete a user

**Path Parameters:**
- `id` - User UUID

**Response (204 No Content):**
Empty body

**Errors:**
- `401 Unauthorized` - Missing or invalid token
- `404 Not Found` - User not found

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/users/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <token>"
```

---

### Subject Endpoints

#### Get Available Subjects

- **Method:** `GET`
- **Path:** `/api/subjects`
- **Authentication:** None
- **Description:** List all available subject/topic names

**Response (200 OK):**
```json
{
  "subjects": [
    "sports",
    "healthy",
    "news",
    "food",
    "autos"
  ]
}
```

**Example:**
```bash
curl http://localhost:3000/api/subjects
```

---

#### Publish Message to Subject

- **Method:** `POST`
- **Path:** `/api/subjects/:subject`
- **Authentication:** Required (JWT)
- **Description:** Publish a message to a specific subject topic

**Path Parameters:**
- `subject` - Subject name (sports, healthy, news, food, autos)

**Request Body:**
```json
{
  "message": "string (1-500 chars, required)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Message published to sports topic"
}
```

**Errors:**
- `400 Bad Request` - Invalid subject or message validation error
- `401 Unauthorized` - Missing or invalid token
- `500 Internal Server Error` - Kafka connection or publishing failure

**Example:**
```bash
curl -X POST http://localhost:3000/api/subjects/sports \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Amazing game yesterday!"}'
```

---

## Error Handling

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common Status Codes

| Status Code | Meaning |
|---|---|
| `200` | OK - Request successful |
| `201` | Created - Resource created successfully |
| `204` | No Content - Successful deletion or update |
| `400` | Bad Request - Invalid input or validation error |
| `401` | Unauthorized - Missing or invalid authentication |
| `404` | Not Found - Resource not found |
| `500` | Internal Server Error - Server error |

---

## Validation Rules

### Username

- **Length:** 3-50 characters
- **Characters:** Alphanumeric, underscore (`_`), hyphen (`-`) only
- **Uniqueness:** Must be unique across all users

### Password

- **Minimum Length:** 6 characters
- **Hashing:** Bcrypt with 10 rounds
- **Never Returned:** Password is never returned in API responses

### Message

- **Length:** 1-500 characters
- **Required:** Cannot be empty or whitespace only
- **Format:** Plain text

---

## Rate Limiting

Currently, there is no built-in rate limiting. For production, consider implementing:
- Per-IP rate limiting
- Per-user rate limiting
- Sliding window rate limiting

---

## Pagination

Currently, all list endpoints return all results. For production, consider adding:
- `limit` parameter (default: 10, max: 100)
- `offset` parameter (default: 0)
- `sort` parameter (default: created_at DESC)

---

## Examples

### Complete User Flow

```bash
# 1. Register a new user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}')

echo "User created: $REGISTER_RESPONSE"

# 2. Login to get JWT token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 3. Get all users (protected)
curl -s -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" | jq

# 4. Publish a message to sports topic
curl -s -X POST http://localhost:3000/api/subjects/sports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Go team!"}' | jq

# 5. Publish message to another topic
curl -s -X POST http://localhost:3000/api/subjects/news \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Breaking news!"}' | jq
```

---

## API Versioning

Current version: **1.0.0**

Future versions will maintain backward compatibility. Breaking changes will result in a new major version.

---

## Support & Feedback

For issues, questions, or suggestions:
1. Check the [Swagger UI](http://localhost:3000/api/docs)
2. Review this documentation
3. Check existing issues on GitHub
4. Create a new issue with detailed information
