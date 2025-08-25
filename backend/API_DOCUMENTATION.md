# Traffic Interceptor API Documentation

## Overview

The Traffic Interceptor API is a comprehensive REST API for managing traffic interception, bot detection, analytics, and domain management. This API provides real-time monitoring, analytics, and administrative capabilities for the Traffic Interceptor SaaS platform.

## Base URL

```
http://localhost:5002
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Quick Start

### 1. Interactive API Testing

Visit the real-time API testing interface:
```
http://localhost:5002/test-api
```

### 2. Swagger Documentation

Access the interactive Swagger documentation:
```
http://localhost:5002/docs
```

### 3. Quick Login

Use the default admin credentials:
- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication

#### POST /auth/login
User login endpoint.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "user-uuid",
    "email": "admin@trafficinterceptor.com",
    "username": "admin",
    "first_name": "Super",
    "last_name": "Admin",
    "role": "super_admin",
    "is_active": true,
    "tenant_id": 1,
    "created_at": "2024-01-01T00:00:00"
  }
}
```

#### POST /auth/register
User registration endpoint.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user_id": "user-uuid"
}
```

### Domain Management

#### GET /domains
Get all domains for the current user's tenant.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (active, suspended, pending)
- `search` (optional): Search by domain name

**Response:**
```json
[
  {
    "id": "domain-uuid",
    "domain_name": "example.com",
    "is_verified": true,
    "ssl_enabled": false,
    "cdn_enabled": false,
    "traffic_enabled": true,
    "status": "active",
    "tenant_id": 1,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

#### POST /domains
Create a new domain.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "domain_name": "newdomain.com"
}
```

**Response:**
```json
{
  "message": "Domain created successfully",
  "domain_id": "domain-uuid"
}
```

### Traffic Monitoring

#### GET /traffic/logs
Get traffic logs for the current user's domains.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 50, max: 100)
- `domain_id` (optional): Filter by specific domain
- `start_date` (optional): Filter by start date (ISO format)
- `end_date` (optional): Filter by end date (ISO format)

**Response:**
```json
[
  {
    "id": "log-uuid",
    "domain_id": 1,
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "request_method": "GET",
    "request_url": "/api/data",
    "response_status": 200,
    "response_time": 0.125,
    "bot_detected": false,
    "bot_type": null,
    "country": "United States",
    "timestamp": "2024-01-01T12:00:00"
  }
]
```

### Analytics

#### GET /analytics/dashboard
Get analytics dashboard data.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `days` (optional): Number of days to analyze (default: 7)

**Response:**
```json
{
  "total_requests": 1500,
  "unique_visitors": 250,
  "bot_requests": 45,
  "avg_response_time": 0.234,
  "top_countries": [
    {
      "country": "United States",
      "count": 450
    },
    {
      "country": "United Kingdom",
      "count": 120
    }
  ],
  "top_bots": [
    {
      "bot_type": "Googlebot",
      "count": 25
    },
    {
      "bot_type": "Bingbot",
      "count": 15
    }
  ],
  "hourly_traffic": [
    {
      "hour": 0,
      "count": 45
    },
    {
      "hour": 1,
      "count": 32
    }
  ]
}
```

### Billing

#### GET /billing/plans
Get available billing plans.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "plan-uuid",
    "name": "Starter",
    "description": "Perfect for small websites",
    "price": 29.99,
    "billing_cycle": "monthly",
    "features": [
      "Up to 10 domains",
      "Basic bot detection",
      "Daily analytics"
    ],
    "is_active": true
  }
]
```

### Admin Operations

#### GET /admin/users
Get all users (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_active": true,
    "tenant_id": 1,
    "created_at": "2024-01-01T00:00:00"
  }
]
```

### Testing

#### GET /test
Test API connectivity.

**Response:**
```json
{
  "status": "success",
  "message": "API is working correctly",
  "timestamp": "2024-01-01T12:00:00",
  "version": "1.0"
}
```

#### POST /test
Test POST endpoint.

**Request Body:**
```json
{
  "message": "Hello API",
  "data": {
    "key": "value"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "received_data": {
    "message": "Hello API",
    "data": {
      "key": "value"
    }
  },
  "timestamp": "2024-01-01T12:00:00"
}
```

## Error Responses

### Standard Error Format
```json
{
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Example Error Responses

**401 Unauthorized:**
```json
{
  "message": "Authorization token is required"
}
```

**400 Bad Request:**
```json
{
  "message": "Domain name is required"
}
```

**404 Not Found:**
```json
{
  "message": "User not found"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default limits:** 10,000 requests per day, 5,000 requests per hour
- **Authentication endpoints:** 100 requests per hour
- **Admin endpoints:** 1,000 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (default: 1)
- `per_page`: Items per page (default varies by endpoint, max: 100)

Pagination metadata is included in responses:
```json
{
  "items": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

## WebSocket Support

The API includes WebSocket support for real-time updates:

**Connection:**
```
ws://localhost:5002/socket.io
```

**Events:**
- `traffic_update`: Real-time traffic data
- `analytics_update`: Real-time analytics updates
- `system_alert`: System notifications

## SDK Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5002',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Login
const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Get domains
const getDomains = async (token) => {
  const response = await api.get('/domains', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```

### Python
```python
import requests

BASE_URL = 'http://localhost:5002'

def login(username, password):
    response = requests.post(f'{BASE_URL}/auth/login', json={
        'username': username,
        'password': password
    })
    return response.json()

def get_domains(token):
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{BASE_URL}/domains', headers=headers)
    return response.json()
```

### cURL Examples

**Login:**
```bash
curl -X POST http://localhost:5002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Get Domains:**
```bash
curl -X GET http://localhost:5002/domains \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Create Domain:**
```bash
curl -X POST http://localhost:5002/domains \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain_name": "example.com"}'
```

## Development

### Running the API

1. Install dependencies:
```bash
pip install -r requirements_working.txt
```

2. Initialize the database:
```bash
python init_database.py
```

3. Start the server:
```bash
python app.py
```

### Environment Variables

- `FLASK_CONFIG`: Configuration environment (development, production, testing)
- `SECRET_KEY`: Flask secret key
- `JWT_SECRET_KEY`: JWT signing key
- `DATABASE_URL`: Database connection string
- `REDIS_URL`: Redis connection string

### Testing

Use the interactive testing interface at `http://localhost:5002/test-api` or the Swagger documentation at `http://localhost:5002/docs`.

## Support

For API support and questions:
- Interactive testing: `http://localhost:5002/test-api`
- Swagger documentation: `http://localhost:5002/docs`
- Health check: `http://localhost:5002/health`
