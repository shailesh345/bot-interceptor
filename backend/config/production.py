#!/usr/bin/env python3
"""
Production Configuration
Production-specific settings for security, performance, and deployment
"""

import os
from datetime import timedelta

class ProductionConfig:
    """Production configuration class"""
    
    # Basic Flask settings
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-super-secret-production-key-change-this'
    
    # Database settings
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///production.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 20,
        'pool_recycle': 3600,
        'pool_pre_ping': True,
        'max_overflow': 30
    }
    
    # JWT settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret-key-change-this'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_ERROR_MESSAGE_KEY = 'error'
    
    # Security settings
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = 3600
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Rate limiting
    RATELIMIT_ENABLED = True
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379'
    RATELIMIT_DEFAULT = "100 per hour"
    RATELIMIT_STORAGE_OPTIONS = {
        'socket_connect_timeout': 5,
        'socket_timeout': 5,
        'retry_on_timeout': True
    }
    
    # Cache settings
    CACHE_TYPE = 'redis'
    CACHE_REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379'
    CACHE_DEFAULT_TIMEOUT = 300
    CACHE_KEY_PREFIX = 'traffic_interceptor:'
    
    # Logging
    LOG_LEVEL = 'INFO'
    LOG_FILE = '/var/log/traffic_interceptor/app.log'
    LOG_MAX_BYTES = 10485760  # 10MB
    LOG_BACKUP_COUNT = 5
    
    # File upload settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    UPLOAD_FOLDER = '/var/uploads/traffic_interceptor'
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv', 'json'}
    
    # Email settings
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER')
    
    # Stripe settings
    STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
    STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
    STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')
    
    # Monitoring and analytics
    SENTRY_DSN = os.environ.get('SENTRY_DSN')
    NEW_RELIC_LICENSE_KEY = os.environ.get('NEW_RELIC_LICENSE_KEY')
    
    # Performance settings
    COMPRESS_MIMETYPES = [
        'text/html', 'text/css', 'text/xml', 'application/json', 'application/javascript'
    ]
    COMPRESS_LEVEL = 6
    COMPRESS_MIN_SIZE = 500
    
    # CORS settings
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'https://yourdomain.com').split(',')
    CORS_SUPPORTS_CREDENTIALS = True
    
    # API settings
    API_RATE_LIMIT_DEFAULT = 100
    API_RATE_LIMIT_WINDOW = 3600
    API_RATE_LIMIT_AUTH = 10
    API_RATE_LIMIT_ANALYTICS = 50
    API_RATE_LIMIT_ADMIN = 200
    
    # WebSocket settings
    SOCKETIO_ASYNC_MODE = 'eventlet'
    SOCKETIO_PING_TIMEOUT = 60
    SOCKETIO_PING_INTERVAL = 25
    SOCKETIO_MAX_HTTP_BUFFER_SIZE = 1000000
    
    # ML Model settings
    ML_MODEL_PATH = '/var/ml_models/traffic_interceptor'
    ML_MODEL_UPDATE_INTERVAL = 86400  # 24 hours
    
    # Backup settings
    BACKUP_ENABLED = True
    BACKUP_SCHEDULE = '0 2 * * *'  # Daily at 2 AM
    BACKUP_RETENTION_DAYS = 30
    BACKUP_PATH = '/var/backups/traffic_interceptor'
    
    # Health check settings
    HEALTH_CHECK_ENABLED = True
    HEALTH_CHECK_INTERVAL = 300  # 5 minutes
    HEALTH_CHECK_TIMEOUT = 30
    
    # Metrics and monitoring
    METRICS_ENABLED = True
    METRICS_INTERVAL = 60  # 1 minute
    PROMETHEUS_MULTIPROC_DIR = '/tmp/prometheus_multiproc'
    
    # Error reporting
    ERROR_REPORTING_ENABLED = True
    ERROR_REPORTING_EMAIL = os.environ.get('ERROR_REPORTING_EMAIL')
    
    # Maintenance mode
    MAINTENANCE_MODE = False
    MAINTENANCE_MESSAGE = 'System is under maintenance. Please try again later.'
    
    # Feature flags
    FEATURE_FLAGS = {
        'advanced_analytics': True,
        'ml_bot_detection': True,
        'content_protection': True,
        'real_time_monitoring': True,
        'api_gateway': True,
        'advanced_reporting': True
    }
    
    # Security headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
    
    # Session security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_MAX_AGE = 86400  # 24 hours
    
    # Password policy
    PASSWORD_MIN_LENGTH = 12
    PASSWORD_REQUIRE_UPPERCASE = True
    PASSWORD_REQUIRE_LOWERCASE = True
    PASSWORD_REQUIRE_DIGITS = True
    PASSWORD_REQUIRE_SPECIAL = True
    PASSWORD_HISTORY_COUNT = 5
    
    # Account lockout
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = 900  # 15 minutes
    LOCKOUT_THRESHOLD = 3
    
    # Audit logging
    AUDIT_LOG_ENABLED = True
    AUDIT_LOG_LEVEL = 'INFO'
    AUDIT_LOG_RETENTION_DAYS = 365
    
    # Data retention
    DATA_RETENTION_DAYS = {
        'traffic_logs': 90,
        'analytics': 365,
        'security_logs': 730,
        'audit_logs': 1095
    }
    
    # Backup and recovery
    BACKUP_ENABLED = True
    BACKUP_SCHEDULE = '0 2 * * *'  # Daily at 2 AM
    BACKUP_RETENTION_DAYS = 30
    BACKUP_PATH = '/var/backups/traffic_interceptor'
    BACKUP_COMPRESSION = True
    BACKUP_ENCRYPTION = True
    
    # Monitoring and alerting
    MONITORING_ENABLED = True
    ALERTING_ENABLED = True
    ALERT_EMAILS = os.environ.get('ALERT_EMAILS', '').split(',')
    ALERT_SLACK_WEBHOOK = os.environ.get('ALERT_SLACK_WEBHOOK')
    
    # Performance tuning
    WORKER_PROCESSES = int(os.environ.get('WORKER_PROCESSES') or 4)
    WORKER_THREADS = int(os.environ.get('WORKER_THREADS') or 2)
    WORKER_CONNECTIONS = int(os.environ.get('WORKER_CONNECTIONS') or 1000)
    WORKER_TIMEOUT = int(os.environ.get('WORKER_TIMEOUT') or 30)
    
    # Database connection pooling
    DB_POOL_SIZE = int(os.environ.get('DB_POOL_SIZE') or 20)
    DB_MAX_OVERFLOW = int(os.environ.get('DB_MAX_OVERFLOW') or 30)
    DB_POOL_RECYCLE = int(os.environ.get('DB_POOL_RECYCLE') or 3600)
    DB_POOL_PRE_PING = True
    
    # Redis connection settings
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379'
    REDIS_MAX_CONNECTIONS = int(os.environ.get('REDIS_MAX_CONNECTIONS') or 50)
    REDIS_SOCKET_TIMEOUT = int(os.environ.get('REDIS_SOCKET_TIMEOUT') or 5)
    REDIS_SOCKET_CONNECT_TIMEOUT = int(os.environ.get('REDIS_SOCKET_CONNECT_TIMEOUT') or 5)
    
    # SSL/TLS settings
    SSL_ENABLED = True
    SSL_CERT_FILE = os.environ.get('SSL_CERT_FILE') or '/etc/ssl/certs/traffic_interceptor.crt'
    SSL_KEY_FILE = os.environ.get('SSL_KEY_FILE') or '/etc/ssl/private/traffic_interceptor.key'
    SSL_CA_FILE = os.environ.get('SSL_CA_FILE')
    
    # Load balancer settings
    LOAD_BALANCER_ENABLED = True
    LOAD_BALANCER_HEALTH_CHECK_PATH = '/health'
    LOAD_BALANCER_HEALTH_CHECK_INTERVAL = 30
    LOAD_BALANCER_HEALTH_CHECK_TIMEOUT = 5
    LOAD_BALANCER_HEALTH_CHECK_THRESHOLD = 3
    
    # CDN settings
    CDN_ENABLED = True
    CDN_DOMAIN = os.environ.get('CDN_DOMAIN')
    CDN_SSL_ENABLED = True
    CDN_CACHE_HEADERS = {
        'static': 'public, max-age=31536000',
        'dynamic': 'public, max-age=300',
        'api': 'no-cache'
    }
    
    # Queue settings
    QUEUE_ENABLED = True
    QUEUE_BROKER_URL = os.environ.get('QUEUE_BROKER_URL') or 'redis://localhost:6379/1'
    QUEUE_RESULT_BACKEND = os.environ.get('QUEUE_RESULT_BACKEND') or 'redis://localhost:6379/2'
    QUEUE_TASK_ALWAYS_EAGER = False
    QUEUE_TASK_EAGER_PROPAGATES = True
    
    # Scheduled tasks
    SCHEDULER_ENABLED = True
    SCHEDULER_API_ENABLED = True
    SCHEDULER_TIMEZONE = 'UTC'
    
    # External services
    EXTERNAL_SERVICES = {
        'geolocation': {
            'enabled': True,
            'api_key': os.environ.get('GEOIP_API_KEY'),
            'timeout': 5
        },
        'email_verification': {
            'enabled': True,
            'api_key': os.environ.get('EMAIL_VERIFICATION_API_KEY'),
            'timeout': 10
        },
        'captcha': {
            'enabled': True,
            'site_key': os.environ.get('RECAPTCHA_SITE_KEY'),
            'secret_key': os.environ.get('RECAPTCHA_SECRET_KEY')
        }
    }
