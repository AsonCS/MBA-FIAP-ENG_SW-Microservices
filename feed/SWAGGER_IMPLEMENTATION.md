# Swagger/OpenAPI Implementation for Feed Service

## Overview

Swagger/OpenAPI documentation has been implemented for the Feed Service to provide comprehensive API documentation and an interactive API explorer.

## Components Implemented

### 1. OpenAPI Specification (`openapi.json`)
- **Location**: `feed/src/main/resources/openapi.json`
- **Format**: OpenAPI 3.0.0 specification
- **Contents**:
  - API information and metadata
  - Server definitions (local and Docker Compose)
  - All endpoint definitions with request/response schemas
  - Component schemas (FeedMessage model)
  - Error response examples

### 2. Swagger UI Integration
- **Endpoint**: `GET /api/docs`
- **Description**: Interactive web-based API documentation
- **Features**:
  - Beautiful UI powered by Swagger UI 4.15.5
  - Try-it-out functionality to test endpoints
  - Real-time API exploration
  - Responsive design

### 3. OpenAPI JSON Endpoint
- **Endpoint**: `GET /api/openapi.json`
- **Description**: Serves the raw OpenAPI specification in JSON format
- **Usage**: Can be imported into API clients, code generators, or other tools

### 4. Comprehensive API Documentation
- **Location**: `feed/API.md`
- **Contents**:
  - Overview and base URLs
  - All available endpoints with examples
  - Data models and field descriptions
  - Usage examples with curl commands
  - HTTP status codes reference
  - Error handling guidelines
  - Security considerations
  - Performance notes

## Endpoint Documentation

All endpoints are now fully documented:

### GET /api/subjects
- Lists all available feed subjects
- Returns: HTML page with subject links
- Status: 200 OK or 500 Error

### GET /api/subjects/{subject}
- Retrieves feed for a specific subject
- Parameters: subject (sports, healthy, news, food, autos)
- Returns: HTML page with feed messages
- Status: 200 OK, 400 Bad Request, or 500 Error

### GET /health
- Health check endpoint
- Returns: "OK"
- Status: 200 OK

### GET /api/docs
- Swagger UI interactive documentation
- Returns: HTML page with Swagger UI
- Status: 200 OK

### GET /api/openapi.json
- OpenAPI specification
- Returns: JSON specification
- Status: 200 OK

## Files Modified

1. **Application.kt**
   - Added Swagger UI route (`/api/docs`)
   - Added OpenAPI JSON endpoint (`/api/openapi.json`)
   - Loads `openapi.json` from classpath resources
   - Uses CDN-hosted Swagger UI libraries

2. **openapi.json** (Created)
   - Complete OpenAPI 3.0.0 specification
   - Documents all endpoints and data models
   - Provides examples and descriptions

3. **API.md** (Created)
   - Markdown documentation for API
   - Human-readable format
   - Includes usage examples and guidelines

## Features

✅ **Interactive Documentation**: Swagger UI at `/api/docs`
✅ **Machine-Readable Spec**: OpenAPI JSON at `/api/openapi.json`
✅ **Try-It-Out**: Test endpoints directly from Swagger UI
✅ **Complete Examples**: Request/response examples for all endpoints
✅ **Data Models**: Fully documented schema definitions
✅ **Error Documentation**: All error scenarios documented
✅ **No Additional Dependencies**: Uses CDN for Swagger UI library

## Accessing Documentation

### Via Swagger UI
1. Start the Feed Service: `docker-compose up feed`
2. Navigate to: `http://localhost:8080/api/docs`
3. Explore and test endpoints interactively

### Via Command Line
```bash
# Get OpenAPI specification
curl http://localhost:8080/api/openapi.json | jq

# Get Swagger UI
curl http://localhost:8080/api/docs
```

### View API Markdown Documentation
Open `feed/API.md` in your editor

## Integration with API Tools

The OpenAPI specification can be used with:
- **Postman**: Import `/api/openapi.json`
- **Insomnia**: Import `/api/openapi.json`
- **Swagger Codegen**: Generate client/server stubs
- **Redoc**: Alternative API documentation UI
- **OpenAPI.Tools**: Various utilities and validators

## Production Considerations

1. **CDN Dependencies**: Swagger UI is loaded from CDN. Consider hosting locally for offline access.
2. **Documentation Updates**: Update `openapi.json` when adding new endpoints
3. **Schema Validation**: Use OpenAPI validators to ensure specification compliance
4. **API Versioning**: Consider adding version information to URLs and specification

## Future Enhancements

- [ ] Add request/response header documentation
- [ ] Document deprecated endpoints (if any)
- [ ] Add example payloads for complex requests
- [ ] Implement API versioning in OpenAPI spec
- [ ] Host Swagger UI locally instead of from CDN
- [ ] Add API security schemes documentation
- [ ] Create API changelog endpoint
