# Traffic Interceptor Backend API
## Enterprise-Grade Bot Traffic Management Platform

### 🚀 Overview

The Traffic Interceptor Backend is a **high-performance Flask-based API** that powers an enterprise SaaS platform for bot traffic management, content protection, and revenue optimization. Built with scalability, security, and multi-tenancy at its core.

### 📋 Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Performance](#performance)
- [Security](#security)
- [Contributing](#contributing)

### ✨ Features

#### 🔐 Authentication & Authorization
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (Super Admin, Admin, User)
- **Multi-factor authentication** support
- **API key management** for third-party integrations
- **Session management** with Redis

#### 🏢 Multi-Tenant Architecture
- **Complete tenant isolation** at data and resource level
- **Subscription management** with Stripe integration
- **Usage tracking** and billing automation
- **Resource quotas** and throttling per tenant
- **Custom domain support** for white-label deployments

#### 🤖 Bot Detection & Management
- **Advanced bot classification** using machine learning
- **Real-time traffic analysis** and pattern recognition
- **Behavioral fingerprinting** and device analysis
- **Custom rule engine** for traffic management
- **Bot relationship management** with AI companies

#### 📊 Analytics & Reporting
- **Real-time traffic monitoring** with WebSocket updates
- **Geographic analytics** with GeoIP integration
- **Revenue tracking** and forecasting
- **Custom report generation** with scheduled delivery
- **Data export** in multiple formats (CSV, JSON, PDF)

#### 💰 Billing & Monetization
- **Stripe integration** for subscription management
- **Usage-based billing** with overage handling
- **Invoice generation** and payment processing
- **Revenue optimization** algorithms
- **Credit system** for API access monetization

### 🏗️ Architecture

#### System Components
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                  Flask Application                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │    Auth     │ │   API       │ │    Background Tasks     ││
│  │   Service   │ │  Endpoints  │ │       (Celery)          ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                     Data Layer                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │ PostgreSQL  │ │    Redis    │ │      Message Queue      ││
│  │ (Primary)   │ │   (Cache)   │ │       (Celery)          ││
│  └─────────────┘ └─────────────┘ └─────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### Technology Stack
- **Framework**: Flask 2.3.3 with Blueprints
- **Database**: PostgreSQL 15+ with SQLAlchemy ORM
- **Cache**: Redis 7.x for sessions and rate limiting
- **Queue**: Celery with Redis broker
- **Authentication**: JWT with Flask-JWT-Extended
- **Billing**: Stripe Python SDK
- **API Documentation**: OpenAPI/Swagger
- **Monitoring**: Structured logging with JSON format

### 🚀 Quick Start

#### Prerequisites
```bash
# System Requirements
Python 3.11+
PostgreSQL 15+
Redis 7+
Node.js 18+ (for frontend)
```

#### 1. Clone and Setup
```bash
git clone <repository-url>
cd traffic-interceptor/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env with your configuration (see Configuration section)
```

#### 3. Database Setup
```bash
# Create database
createdb traffic_interceptor

# Run migrations
flask db upgrade

# Seed initial data
python run.py seed-data

# Create super admin user
python run.py create-super-admin
```

#### 4. Start Development Server
```bash
# Start Redis (in separate terminal)
redis-server

# Start Celery worker (in separate terminal)
celery -A app.celery worker --loglevel=info

# Start Flask application
python run.py
```

### 📦 Installation

#### Development Environment
```bash
# 1. Virtual Environment
python -m venv venv
source venv/bin/activate

# 2. Install Dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies

# 3. Pre-commit Hooks (Optional)
pre-commit install
```

#### Docker Development
```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in detached mode
docker-compose up -d

# View logs
docker-compose logs -f backend
```

#### Production Dependencies
```bash
# Core production requirements
pip install -r requirements.txt

# Additional production tools
pip install gunicorn supervisor
```

### ⚙️ Configuration

#### Environment Variables
```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/traffic_interceptor
SQLALCHEMY_TRACK_MODIFICATIONS=False

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_STARTER=price_starter_plan_id
STRIPE_PRICE_ID_PRO=price_pro_plan_id
STRIPE_PRICE_ID_ENTERPRISE=price_enterprise_plan_id

# Email Configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Security Configuration
BCRYPT_LOG_ROUNDS=12
JWT_ACCESS_TOKEN_EXPIRES=15
JWT_REFRESH_TOKEN_EXPIRES=30

# API Configuration
API_RATE_LIMIT=1000
API_RATE_LIMIT_PERIOD=3600
CORS_ORIGINS=http://localhost:9889,https://yourdomain.com

# Monitoring & Logging
LOG_LEVEL=INFO
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-api-key

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=your-s3-bucket-name
AWS_REGION=us-east-1

# GeoIP Configuration
GEOIP_DATABASE_PATH=/path/to/GeoLite2-City.mmdb
```

#### Configuration Classes
```python
# config.py
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    REDIS_URL = os.environ.get('REDIS_URL')
    
class DevelopmentConfig(Config):
    DEBUG = True
    TESTING = False
    
class ProductionConfig(Config):
    DEBUG = False
    TESTING = False
    
class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
```

### 📡 API Documentation

#### Authentication Endpoints

##### User Authentication
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe"
}

Response: 201
{
  "message": "User created successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200
{
  "access_token": "jwt-access-token",
  "refresh_token": "jwt-refresh-token",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Domain Management Endpoints

##### Domain CRUD Operations
```http
GET /api/domains
Authorization: Bearer <access_token>

Response: 200
{
  "domains": [
    {
      "id": "domain-uuid",
      "domain_name": "example.com",
      "is_verified": true,
      "status": "active",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

```http
POST /api/domains
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "domain_name": "newdomain.com",
  "verification_method": "dns"
}

Response: 201
{
  "domain": {
    "id": "new-domain-uuid",
    "domain_name": "newdomain.com",
    "verification_token": "verification-token",
    "verification_method": "dns",
    "is_verified": false
  }
}
```

#### Traffic Rules Endpoints

##### Rule Management
```http
GET /api/domains/{domain_id}/rules
Authorization: Bearer <access_token>

Response: 200
{
  "rules": [
    {
      "id": "rule-uuid",
      "name": "Block AI Scrapers",
      "rule_type": "bot_detection",
      "conditions": {
        "user_agent": "contains:bot",
        "request_rate": ">100/hour"
      },
      "actions": {
        "block": true,
        "charge_credits": 10
      },
      "priority": 1,
      "is_active": true
    }
  ]
}
```

```http
POST /api/domains/{domain_id}/rules
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Rate Limit API",
  "rule_type": "rate_limiting",
  "conditions": {
    "path": "starts_with:/api/",
    "request_rate": ">1000/hour"
  },
  "actions": {
    "rate_limit": "100/hour",
    "charge_credits": 1
  },
  "priority": 2
}
```

#### Analytics Endpoints

##### Traffic Analytics
```http
GET /api/analytics/traffic?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <access_token>

Response: 200
{
  "traffic_summary": {
    "total_requests": 1500000,
    "bot_requests": 450000,
    "blocked_requests": 50000,
    "revenue_generated": 2500.00
  },
  "daily_breakdown": [
    {
      "date": "2024-01-01",
      "requests": 50000,
      "bots": 15000,
      "revenue": 85.50
    }
  ]
}
```

##### Bot Analytics
```http
GET /api/analytics/bots?timeframe=30d
Authorization: Bearer <access_token>

Response: 200
{
  "bot_categories": {
    "search_engines": 65.2,
    "ai_trainers": 20.1,
    "scrapers": 10.3,
    "social_media": 4.4
  },
  "top_bots": [
    {
      "name": "Googlebot",
      "requests": 100000,
      "revenue": 0,
      "status": "allowed"
    },
    {
      "name": "OpenAI GPTBot",
      "requests": 50000,
      "revenue": 1250.00,
      "status": "monetized"
    }
  ]
}
```

#### Billing Endpoints

##### Subscription Management
```http
GET /api/billing/subscription
Authorization: Bearer <access_token>

Response: 200
{
  "subscription": {
    "id": "sub_uuid",
    "plan_name": "Professional",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "amount": 99.00,
    "currency": "USD"
  },
  "usage": {
    "requests_current_period": 250000,
    "requests_limit": 1000000,
    "overage_charges": 0
  }
}
```

#### Admin Endpoints

##### User Management (Admin Only)
```http
GET /api/admin/users?page=1&limit=50
Authorization: Bearer <admin_access_token>

Response: 200
{
  "users": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "user",
      "is_active": true,
      "tenant": {
        "name": "Company ABC",
        "plan": "Professional"
      },
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 10,
    "per_page": 50,
    "total": 500
  }
}
```

### 🗄️ Database Schema

#### Core Tables Overview

```sql
-- Multi-tenant architecture with proper isolation
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User management with role-based access
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    tenant_id INTEGER REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Domain management with verification
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    domain_name VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_method VARCHAR(50) DEFAULT 'dns',
    tenant_id INTEGER REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Flexible rule engine for traffic management
CREATE TABLE interceptor_rules (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    conditions JSONB,
    actions JSONB,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    domain_id INTEGER REFERENCES domains(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Comprehensive traffic logging
CREATE TABLE traffic_logs (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(255),
    is_bot BOOLEAN DEFAULT FALSE,
    bot_type VARCHAR(50),
    action_taken VARCHAR(50),
    domain_id INTEGER REFERENCES domains(id),
    timestamp TIMESTAMP DEFAULT NOW()
);
```

#### Indexes for Performance
```sql
-- Performance optimization indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_domains_tenant_id ON domains(tenant_id);
CREATE INDEX idx_traffic_logs_timestamp ON traffic_logs(timestamp);
CREATE INDEX idx_traffic_logs_domain_id ON traffic_logs(domain_id);
CREATE INDEX idx_analytics_date ON analytics(date);
```

### 🧪 Testing

#### Test Structure
```
tests/
├── unit/
│   ├── test_models.py
│   ├── test_auth.py
│   ├── test_domains.py
│   └── test_billing.py
├── integration/
│   ├── test_api_endpoints.py
│   ├── test_stripe_integration.py
│   └── test_domain_verification.py
├── e2e/
│   ├── test_user_journey.py
│   └── test_admin_workflows.py
└── fixtures/
    ├── sample_data.py
    └── mock_responses.py
```

#### Running Tests
```bash
# Install test dependencies
pip install -r requirements-dev.txt

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test suite
pytest tests/unit/test_auth.py

# Run with verbose output
pytest -v

# Run integration tests (requires running services)
pytest tests/integration/ --integration
```

#### Test Configuration
```python
# conftest.py
import pytest
from app import create_app, db

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    # Create test user and return auth headers
    response = client.post('/auth/login', json={
        'email': 'test@example.com',
        'password': 'testpassword'
    })
    token = response.json['access_token']
    return {'Authorization': f'Bearer {token}'}
```

#### Example Test Cases
```python
# tests/unit/test_auth.py
def test_user_registration(client):
    response = client.post('/auth/register', json={
        'email': 'newuser@example.com',
        'password': 'securepassword',
        'first_name': 'John',
        'last_name': 'Doe'
    })
    assert response.status_code == 201
    assert 'user' in response.json

def test_user_login(client):
    # First register a user
    client.post('/auth/register', json={
        'email': 'test@example.com',
        'password': 'testpassword'
    })
    
    # Then login
    response = client.post('/auth/login', json={
        'email': 'test@example.com',
        'password': 'testpassword'
    })
    assert response.status_code == 200
    assert 'access_token' in response.json
```

### 🚀 Deployment

#### Docker Deployment
```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

# Expose port
EXPOSE 8960

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:8960", "--workers", "4", "run:app"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8960:8960"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/traffic_interceptor
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=traffic_interceptor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  celery:
    build: .
    command: celery -A app.celery worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/traffic_interceptor
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
```

#### Production Deployment (AWS)
```bash
# 1. Build and push Docker image
docker build -t traffic-interceptor-backend .
docker tag traffic-interceptor-backend:latest your-registry/traffic-interceptor-backend:latest
docker push your-registry/traffic-interceptor-backend:latest

# 2. Deploy with ECS/EKS
# Use provided Kubernetes manifests or ECS task definitions

# 3. Set up RDS for PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier traffic-interceptor-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 100

# 4. Set up ElastiCache for Redis
aws elasticache create-replication-group \
  --replication-group-id traffic-interceptor-redis \
  --description "Redis cluster for Traffic Interceptor" \
  --num-cache-clusters 2 \
  --cache-node-type cache.t3.micro
```

### ⚡ Performance

#### Performance Optimizations
```python
# Database query optimization
from sqlalchemy.orm import joinedload

# Use eager loading to avoid N+1 queries
domains = Domain.query.options(
    joinedload(Domain.rules),
    joinedload(Domain.traffic_logs)
).filter_by(tenant_id=tenant_id).all()

# Use database indexes
class TrafficLog(db.Model):
    # Composite index for frequent queries
    __table_args__ = (
        db.Index('idx_traffic_domain_timestamp', 'domain_id', 'timestamp'),
    )
```

#### Caching Strategy
```python
# Redis caching for expensive operations
from flask_caching import Cache

cache = Cache()

@cache.memoize(timeout=300)  # 5 minutes
def get_domain_analytics(domain_id, start_date, end_date):
    # Expensive analytics calculation
    return analytics_data

# Cache invalidation
def update_domain(domain_id, data):
    domain = Domain.query.get(domain_id)
    # Update domain
    cache.delete_memoized(get_domain_analytics, domain_id)
```

#### Rate Limiting
```python
# Rate limiting with Redis
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379",
    default_limits=["1000 per hour"]
)

@app.route('/api/analytics')
@limiter.limit("100 per minute")
def get_analytics():
    return analytics_data
```

### 🔒 Security

#### Security Features
```python
# Input validation and sanitization
from marshmallow import Schema, fields, validate

class DomainSchema(Schema):
    domain_name = fields.Str(
        required=True,
        validate=validate.Regexp(
            r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
        )
    )

# SQL injection prevention (SQLAlchemy ORM automatically handles this)
# XSS prevention
from markupsafe import escape

def safe_output(user_input):
    return escape(user_input)

# CSRF protection
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect()
csrf.init_app(app)
```

#### Authentication Security
```python
# Password hashing with bcrypt
from werkzeug.security import generate_password_hash, check_password_hash

def set_password(self, password):
    self.password_hash = generate_password_hash(
        password, 
        method='pbkdf2:sha256:50000'
    )

# JWT token security
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
```

### 🤝 Contributing

#### Development Setup
```bash
# 1. Fork the repository
git clone your-fork-url
cd traffic-interceptor/backend

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Set up development environment
python -m venv venv
source venv/bin/activate
pip install -r requirements-dev.txt

# 4. Install pre-commit hooks
pre-commit install

# 5. Run tests before committing
pytest
```

#### Code Style Guidelines
```python
# Follow PEP 8 standards
# Use Black for code formatting
black app/ tests/

# Use isort for import sorting
isort app/ tests/

# Use flake8 for linting
flake8 app/ tests/

# Type hints are encouraged
def process_traffic(request_data: dict) -> dict:
    """Process incoming traffic request."""
    pass
```

#### Pull Request Process
1. **Create Feature Branch**: `git checkout -b feature/description`
2. **Write Tests**: Add comprehensive test coverage
3. **Update Documentation**: Update relevant README sections
4. **Run Quality Checks**: `pytest && black . && flake8`
5. **Submit PR**: Include detailed description and test results

### 📞 Support & Maintenance

#### Monitoring & Logging
```python
# Structured logging
import logging
import json

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s %(levelname)s %(name)s %(message)s'
    )

# Health check endpoint
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'database': check_database_connection(),
        'redis': check_redis_connection(),
        'timestamp': datetime.utcnow().isoformat()
    }
```

#### Maintenance Tasks
```python
# Database maintenance
@app.cli.command()
def cleanup_old_logs():
    """Remove traffic logs older than 90 days."""
    cutoff_date = datetime.utcnow() - timedelta(days=90)
    TrafficLog.query.filter(TrafficLog.timestamp < cutoff_date).delete()
    db.session.commit()

# Analytics aggregation
@app.cli.command()
def aggregate_daily_stats():
    """Aggregate daily statistics for faster reporting."""
    # Implementation for daily stats aggregation
    pass
```

#### Backup Strategy
```bash
# Database backup
pg_dump traffic_interceptor > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="traffic_interceptor"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

pg_dump $DB_NAME | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

---

## 🎯 Quick Reference

### Common Commands
```bash
# Development
python run.py                    # Start development server
flask db migrate -m "message"   # Create migration
flask db upgrade                 # Apply migrations
celery -A app.celery worker     # Start background worker

# Testing
pytest                          # Run all tests
pytest --cov=app               # Run with coverage
pytest -v tests/unit/          # Run specific test suite

# Database
python run.py seed-data        # Seed initial data
python run.py create-super-admin # Create admin user
flask shell                    # Interactive shell
ok@
# Production
gunicorn run:app              # Production server
supervisorctl restart all     # Restart all services
```

### Environment URLs
- **Development**: http://localhost:8960
- **API Documentation**: http://localhost:8960/docs
- **Health Check**: http://localhost:8960/health
- **Metrics**: http://localhost:8960/metrics

### Support Contacts
- **Technical Issues**: dev-team@traffic-interceptor.com
- **Documentation**: docs@traffic-interceptor.com
- **Security**: security@traffic-interceptor.com

---

**Built with ❤️ for enterprise-grade bot traffic management**
