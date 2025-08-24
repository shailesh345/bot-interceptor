# Traffic Interceptor Database Schema
## Comprehensive Database Design & Migration Guide

### 🎯 Overview

The Traffic Interceptor platform uses a **multi-tenant PostgreSQL database** designed for high performance, scalability, and data isolation. This document provides comprehensive documentation of the database schema, relationships, indexes, and migration scripts.

### 📋 Table of Contents
- [Architecture Overview](#architecture-overview)
- [Core Tables](#core-tables)
- [Advanced Tables](#advanced-tables)
- [Relationships](#relationships)
- [Indexes & Performance](#indexes--performance)
- [Migration Scripts](#migration-scripts)
- [Data Seeding](#data-seeding)
- [Backup & Recovery](#backup--recovery)
- [Monitoring & Maintenance](#monitoring--maintenance)

### 🏗️ Architecture Overview

#### Multi-Tenant Design
```
┌─────────────────────────────────────────────────────────────┐
│                    Tenant Isolation                        │
├─────────────────────────────────────────────────────────────┤
│  Tenant A     │  Tenant B     │  Tenant C     │  Shared     │
│  ┌─────────┐  │  ┌─────────┐  │  ┌─────────┐  │  ┌───────┐  │
│  │ Users   │  │  │ Users   │  │  │ Users   │  │  │ Bot   │  │
│  │ Domains │  │  │ Domains │  │  │ Domains │  │  │ Profiles│ │
│  │ Rules   │  │  │ Rules   │  │  │ Rules   │  │  │ System │  │
│  │ Traffic │  │  │ Traffic │  │  │ Traffic │  │  │ Config │  │
│  └─────────┘  │  └─────────┘  │  └─────────┘  │  └───────┘  │
└─────────────────────────────────────────────────────────────┘
```

#### Database Technologies
- **Primary Database**: PostgreSQL 15+
- **Connection Pooling**: PgBouncer
- **Read Replicas**: For analytics queries
- **Backup**: Continuous WAL archiving
- **Monitoring**: pg_stat_statements, pgAdmin

### 📊 Core Tables

#### 1. Tenants Table
```sql
-- Multi-tenant organization management
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    subdomain VARCHAR(100),
    
    -- Contact Information
    billing_email VARCHAR(255),
    support_email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Address Information
    address JSONB DEFAULT '{}',
    tax_info JSONB DEFAULT '{}',
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    quotas JSONB DEFAULT '{}',
    
    -- Status & Lifecycle
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
    trial_ends_at TIMESTAMP,
    onboarded_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes for tenants
CREATE UNIQUE INDEX idx_tenants_uuid ON tenants(uuid);
CREATE UNIQUE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_created_at ON tenants(created_at);

-- Comments
COMMENT ON TABLE tenants IS 'Multi-tenant organizations with complete isolation';
COMMENT ON COLUMN tenants.settings IS 'Tenant-specific configuration settings';
COMMENT ON COLUMN tenants.features IS 'Feature flags and enabled features per tenant';
COMMENT ON COLUMN tenants.quotas IS 'Resource quotas and limits';
```

#### 2. Users Table
```sql
-- User management with role-based access control
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Security
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('super_admin', 'admin', 'user', 'viewer')),
    permissions JSONB DEFAULT '[]',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    
    -- Status & Activity
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    
    -- Foreign Keys
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    invited_by INTEGER REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes for users
CREATE UNIQUE INDEX idx_users_uuid ON users(uuid);
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_last_login ON users(last_login);

-- Comments
COMMENT ON TABLE users IS 'User accounts with role-based access control';
COMMENT ON COLUMN users.permissions IS 'User-specific permissions array';
COMMENT ON COLUMN users.preferences IS 'User interface and behavior preferences';
```

#### 3. Domains Table
```sql
-- Domain management with verification and SSL
CREATE TABLE domains (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Domain Information
    domain_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100),
    port INTEGER DEFAULT 443,
    protocol VARCHAR(10) DEFAULT 'https' CHECK (protocol IN ('http', 'https')),
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_method VARCHAR(50) DEFAULT 'dns' CHECK (verification_method IN ('dns', 'file', 'meta', 'manual')),
    verification_attempts INTEGER DEFAULT 0,
    last_verification_attempt TIMESTAMP,
    verified_at TIMESTAMP,
    
    -- SSL & Security
    ssl_enabled BOOLEAN DEFAULT FALSE,
    ssl_certificate JSONB,
    ssl_expires_at TIMESTAMP,
    hsts_enabled BOOLEAN DEFAULT FALSE,
    
    -- DNS Configuration
    dns_records JSONB DEFAULT '{}',
    dns_provider VARCHAR(100),
    dns_last_check TIMESTAMP,
    
    -- CDN & Performance
    cdn_enabled BOOLEAN DEFAULT FALSE,
    cdn_provider VARCHAR(100),
    cdn_config JSONB DEFAULT '{}',
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    analytics_config JSONB DEFAULT '{}',
    bot_config JSONB DEFAULT '{}',
    monetization_config JSONB DEFAULT '{}',
    
    -- Status & Performance
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending', 'deleted')),
    health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
    uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
    avg_response_time INTEGER, -- milliseconds
    
    -- Foreign Keys
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes for domains
CREATE UNIQUE INDEX idx_domains_uuid ON domains(uuid);
CREATE UNIQUE INDEX idx_domains_tenant_domain ON domains(tenant_id, domain_name);
CREATE INDEX idx_domains_tenant_id ON domains(tenant_id);
CREATE INDEX idx_domains_status ON domains(status);
CREATE INDEX idx_domains_is_verified ON domains(is_verified);
CREATE INDEX idx_domains_ssl_expires ON domains(ssl_expires_at);

-- Comments
COMMENT ON TABLE domains IS 'Domain management with verification and SSL configuration';
COMMENT ON COLUMN domains.settings IS 'Domain-specific configuration settings';
COMMENT ON COLUMN domains.bot_config IS 'Bot-specific rules and configuration';
```

#### 4. Interceptor Rules Table
```sql
-- Flexible rule engine for traffic management
CREATE TABLE interceptor_rules (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Rule Definition
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rule_type VARCHAR(50) NOT NULL CHECK (rule_type IN ('bot_detection', 'rate_limiting', 'geo_blocking', 'content_protection', 'whitelist', 'blacklist', 'custom')),
    category VARCHAR(100),
    
    -- Rule Logic
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    fallback_action VARCHAR(50) DEFAULT 'allow',
    
    -- Configuration
    priority INTEGER DEFAULT 0,
    weight DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    is_template BOOLEAN DEFAULT FALSE,
    
    -- Performance & Testing
    test_mode BOOLEAN DEFAULT FALSE,
    dry_run BOOLEAN DEFAULT FALSE,
    sample_rate DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
    
    -- Analytics & Monitoring
    execution_count BIGINT DEFAULT 0,
    match_count BIGINT DEFAULT 0,
    last_matched TIMESTAMP,
    avg_execution_time DECIMAL(8,3), -- milliseconds
    error_count INTEGER DEFAULT 0,
    
    -- Scheduling
    schedule JSONB, -- Cron-like scheduling
    effective_from TIMESTAMP DEFAULT NOW(),
    effective_until TIMESTAMP,
    
    -- A/B Testing
    ab_test_config JSONB,
    ab_test_variant VARCHAR(50),
    
    -- Foreign Keys
    domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    parent_rule_id INTEGER REFERENCES interceptor_rules(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Indexes for rules
CREATE UNIQUE INDEX idx_rules_uuid ON interceptor_rules(uuid);
CREATE INDEX idx_rules_domain_id ON interceptor_rules(domain_id);
CREATE INDEX idx_rules_type ON interceptor_rules(rule_type);
CREATE INDEX idx_rules_priority ON interceptor_rules(priority DESC);
CREATE INDEX idx_rules_active ON interceptor_rules(is_active);
CREATE INDEX idx_rules_effective ON interceptor_rules(effective_from, effective_until);
CREATE INDEX idx_rules_performance ON interceptor_rules(avg_execution_time);

-- Comments
COMMENT ON TABLE interceptor_rules IS 'Flexible rule engine for traffic management and bot control';
COMMENT ON COLUMN interceptor_rules.conditions IS 'JSON conditions for rule matching';
COMMENT ON COLUMN interceptor_rules.actions IS 'JSON actions to execute when rule matches';
```

### 🤖 Bot Management Tables

#### 5. Bot Profiles Table
```sql
-- Comprehensive bot database with ML features
CREATE TABLE bot_profiles (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Bot Identity
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    official_name VARCHAR(255),
    description TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    
    -- Classification
    bot_type VARCHAR(50) NOT NULL CHECK (bot_type IN ('search_engine', 'ai_trainer', 'scraper', 'social_media', 'monitoring', 'security', 'seo', 'academic', 'malicious', 'unknown')),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Detection Patterns
    user_agent_patterns JSONB DEFAULT '[]',
    ip_ranges JSONB DEFAULT '[]',
    reverse_dns_patterns JSONB DEFAULT '[]',
    http_headers JSONB DEFAULT '{}',
    behavioral_patterns JSONB DEFAULT '{}',
    
    -- Detection Methods
    detection_methods JSONB DEFAULT '{}',
    confidence_threshold DECIMAL(3,2) DEFAULT 0.8,
    false_positive_rate DECIMAL(5,4),
    accuracy_score DECIMAL(5,4),
    
    -- Bot Characteristics
    crawl_rate INTEGER, -- requests per minute
    respect_robots_txt BOOLEAN,
    follows_sitemap BOOLEAN,
    javascript_capable BOOLEAN DEFAULT FALSE,
    renders_content BOOLEAN DEFAULT FALSE,
    
    -- Business Information
    is_verified BOOLEAN DEFAULT FALSE,
    is_commercial BOOLEAN DEFAULT FALSE,
    requires_payment BOOLEAN DEFAULT FALSE,
    api_available BOOLEAN DEFAULT FALSE,
    
    -- Relationship Management
    contact_attempts INTEGER DEFAULT 0,
    last_contact_date TIMESTAMP,
    relationship_status VARCHAR(50) DEFAULT 'unknown' CHECK (relationship_status IN ('unknown', 'contacted', 'negotiating', 'partner', 'blocked')),
    
    -- Reputation & Trust
    reputation_score INTEGER DEFAULT 50 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    trust_level VARCHAR(20) DEFAULT 'unknown' CHECK (trust_level IN ('unknown', 'low', 'medium', 'high', 'verified')),
    
    -- Activity Tracking
    first_seen TIMESTAMP,
    last_seen TIMESTAMP,
    detection_count BIGINT DEFAULT 0,
    total_requests BIGINT DEFAULT 0,
    
    -- ML Features
    ml_features JSONB DEFAULT '{}',
    ml_model_version VARCHAR(50),
    ml_confidence DECIMAL(5,4),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'monitoring')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for bot profiles
CREATE UNIQUE INDEX idx_bot_profiles_uuid ON bot_profiles(uuid);
CREATE INDEX idx_bot_profiles_name ON bot_profiles(name);
CREATE INDEX idx_bot_profiles_company ON bot_profiles(company);
CREATE INDEX idx_bot_profiles_type ON bot_profiles(bot_type);
CREATE INDEX idx_bot_profiles_status ON bot_profiles(status);
CREATE INDEX idx_bot_profiles_trust ON bot_profiles(trust_level);
CREATE INDEX idx_bot_profiles_reputation ON bot_profiles(reputation_score);

-- Comments
COMMENT ON TABLE bot_profiles IS 'Comprehensive bot database with ML-driven classification';
COMMENT ON COLUMN bot_profiles.ml_features IS 'Machine learning feature vector for bot classification';
```

### 📊 Analytics & Logging Tables

#### 6. Traffic Logs Table
```sql
-- Comprehensive traffic logging with partitioning
CREATE TABLE traffic_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Request Information
    ip_address INET NOT NULL,
    user_agent TEXT,
    request_method VARCHAR(10) NOT NULL,
    request_path TEXT NOT NULL,
    request_query TEXT,
    request_headers JSONB DEFAULT '{}',
    request_body_size BIGINT,
    
    -- Response Information
    response_status INTEGER NOT NULL,
    response_headers JSONB DEFAULT '{}',
    response_size BIGINT,
    response_time INTEGER, -- milliseconds
    
    -- Geographic Information
    country_code VARCHAR(2),
    region VARCHAR(100),
    city VARCHAR(100),
    timezone VARCHAR(50),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Device & Browser Information
    device_type VARCHAR(50),
    device_brand VARCHAR(100),
    device_model VARCHAR(100),
    browser VARCHAR(50),
    browser_version VARCHAR(50),
    os VARCHAR(50),
    os_version VARCHAR(50),
    screen_resolution VARCHAR(20),
    
    -- Bot Detection
    is_bot BOOLEAN DEFAULT FALSE,
    bot_confidence DECIMAL(3,2),
    bot_type VARCHAR(50),
    detection_method VARCHAR(100),
    
    -- Rule Processing
    rules_processed JSONB DEFAULT '[]',
    rule_matched VARCHAR(255),
    action_taken VARCHAR(50),
    block_reason TEXT,
    
    -- Security Information
    threat_level VARCHAR(20) DEFAULT 'none' CHECK (threat_level IN ('none', 'low', 'medium', 'high', 'critical')),
    security_flags JSONB DEFAULT '[]',
    honeypot_triggered BOOLEAN DEFAULT FALSE,
    
    -- Session Information
    session_id VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    fingerprint_id VARCHAR(255),
    
    -- Business Information
    monetization_applied BOOLEAN DEFAULT FALSE,
    credits_charged DECIMAL(10,2),
    revenue_generated DECIMAL(10,2),
    
    -- Processing Information
    processing_time DECIMAL(6,3), -- milliseconds
    cache_hit BOOLEAN DEFAULT FALSE,
    edge_location VARCHAR(100),
    
    -- Foreign Keys
    domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
    bot_profile_id INTEGER REFERENCES bot_profiles(id),
    
    -- Timestamp
    timestamp TIMESTAMP DEFAULT NOW(),
    date_partition DATE GENERATED ALWAYS AS (timestamp::date) STORED
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions (example for 2024)
CREATE TABLE traffic_logs_2024_01 PARTITION OF traffic_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE traffic_logs_2024_02 PARTITION OF traffic_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- Continue for all months...

-- Indexes for traffic logs
CREATE INDEX idx_traffic_logs_timestamp ON traffic_logs(timestamp);
CREATE INDEX idx_traffic_logs_domain_id ON traffic_logs(domain_id);
CREATE INDEX idx_traffic_logs_ip ON traffic_logs(ip_address);
CREATE INDEX idx_traffic_logs_bot ON traffic_logs(is_bot, bot_type);
CREATE INDEX idx_traffic_logs_status ON traffic_logs(response_status);
CREATE INDEX idx_traffic_logs_country ON traffic_logs(country_code);
CREATE INDEX idx_traffic_logs_session ON traffic_logs(session_id);

-- Comments
COMMENT ON TABLE traffic_logs IS 'Comprehensive traffic logging with monthly partitioning';
```

#### 7. Analytics Table
```sql
-- Pre-aggregated analytics for fast reporting
CREATE TABLE analytics (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Metric Definition
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('counter', 'gauge', 'histogram', 'rate')),
    metric_value DECIMAL(15,4) NOT NULL,
    
    -- Dimensions
    dimensions JSONB DEFAULT '{}',
    tags JSONB DEFAULT '{}',
    
    -- Aggregation Information
    aggregation_level VARCHAR(50) NOT NULL CHECK (aggregation_level IN ('minute', 'hour', 'day', 'week', 'month')),
    aggregation_function VARCHAR(20) DEFAULT 'sum' CHECK (aggregation_function IN ('sum', 'avg', 'min', 'max', 'count')),
    sample_count BIGINT,
    
    -- Time Information
    timestamp TIMESTAMP NOT NULL,
    date_key DATE GENERATED ALWAYS AS (timestamp::date) STORED,
    hour_key INTEGER GENERATED ALWAYS AS (EXTRACT(hour FROM timestamp)) STORED,
    
    -- Foreign Keys
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    domain_id INTEGER REFERENCES domains(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions for analytics
CREATE TABLE analytics_2024_01 PARTITION OF analytics
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes for analytics
CREATE INDEX idx_analytics_tenant_id ON analytics(tenant_id);
CREATE INDEX idx_analytics_domain_id ON analytics(domain_id);
CREATE INDEX idx_analytics_metric ON analytics(metric_name, timestamp);
CREATE INDEX idx_analytics_date ON analytics(date_key);
CREATE INDEX idx_analytics_level ON analytics(aggregation_level, timestamp);

-- Comments
COMMENT ON TABLE analytics IS 'Pre-aggregated analytics data for fast reporting';
```

### 💰 Billing & Subscription Tables

#### 8. Subscription Plans Table
```sql
-- Flexible subscription plan management
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Plan Definition
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    plan_type VARCHAR(50) NOT NULL CHECK (plan_type IN ('free', 'starter', 'professional', 'enterprise', 'custom')),
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_interval VARCHAR(20) NOT NULL CHECK (billing_interval IN ('monthly', 'yearly', 'one_time')),
    setup_fee DECIMAL(10,2) DEFAULT 0,
    
    -- Features & Limits
    features JSONB NOT NULL DEFAULT '{}',
    limits JSONB NOT NULL DEFAULT '{}',
    quotas JSONB NOT NULL DEFAULT '{}',
    
    -- Trial Configuration
    trial_period_days INTEGER DEFAULT 0,
    trial_limits JSONB DEFAULT '{}',
    
    -- Visibility & Availability
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT TRUE,
    is_recommended BOOLEAN DEFAULT FALSE,
    available_from DATE,
    available_until DATE,
    
    -- Stripe Integration
    stripe_price_id VARCHAR(255),
    stripe_product_id VARCHAR(255),
    
    -- Metadata
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for subscription plans
CREATE UNIQUE INDEX idx_plans_uuid ON subscription_plans(uuid);
CREATE UNIQUE INDEX idx_plans_slug ON subscription_plans(slug);
CREATE INDEX idx_plans_type ON subscription_plans(plan_type);
CREATE INDEX idx_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_plans_price ON subscription_plans(price);

-- Comments
COMMENT ON TABLE subscription_plans IS 'Flexible subscription plan definitions with feature gates';
```

#### 9. Subscriptions Table
```sql
-- Active subscription management
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Subscription Details
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled', 'unpaid', 'paused')),
    
    -- Billing Periods
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    
    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP,
    cancellation_reason TEXT,
    ended_at TIMESTAMP,
    
    -- Pricing
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    tax_rate DECIMAL(5,4) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Usage & Overage
    usage_reset_date DATE,
    overage_charges DECIMAL(10,2) DEFAULT 0,
    
    -- Stripe Integration
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    
    -- Payment Method
    payment_method JSONB DEFAULT '{}',
    billing_cycle_anchor INTEGER, -- Day of month
    
    -- Proration
    proration_behavior VARCHAR(20) DEFAULT 'create_prorations',
    
    -- Foreign Keys
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for subscriptions
CREATE UNIQUE INDEX idx_subscriptions_uuid ON subscriptions(uuid);
CREATE UNIQUE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Comments
COMMENT ON TABLE subscriptions IS 'Active subscription management with Stripe integration';
```

#### 10. Credit Transactions Table
```sql
-- Credit-based monetization tracking
CREATE TABLE credit_transactions (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Transaction Details
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus', 'adjustment', 'expiration')),
    amount DECIMAL(10,2) NOT NULL, -- Can be negative for usage
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Credits
    credits_amount INTEGER NOT NULL, -- Can be negative
    credits_before INTEGER NOT NULL,
    credits_after INTEGER NOT NULL,
    
    -- Description & Context
    description TEXT,
    reference_type VARCHAR(50), -- 'traffic_log', 'subscription', 'manual', etc.
    reference_id VARCHAR(255),
    
    -- Bot & Traffic Context
    bot_requests INTEGER,
    api_calls INTEGER,
    data_transfer_mb DECIMAL(10,3),
    
    -- Billing Context
    invoice_id VARCHAR(255),
    invoice_line_item_id VARCHAR(255),
    
    -- Foreign Keys
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    domain_id INTEGER REFERENCES domains(id) ON DELETE SET NULL,
    bot_profile_id INTEGER REFERENCES bot_profiles(id) ON DELETE SET NULL,
    processed_by INTEGER REFERENCES users(id),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE credit_transactions_2024_01 PARTITION OF credit_transactions
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes for credit transactions
CREATE INDEX idx_credit_tenant ON credit_transactions(tenant_id);
CREATE INDEX idx_credit_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_created ON credit_transactions(created_at);
CREATE INDEX idx_credit_domain ON credit_transactions(domain_id);

-- Comments
COMMENT ON TABLE credit_transactions IS 'Credit-based monetization tracking with monthly partitioning';
```

### 🔐 Security & API Tables

#### 11. API Keys Table
```sql
-- API key management with permissions
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Key Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    key_prefix VARCHAR(20) NOT NULL, -- First 8 chars for identification
    key_hash VARCHAR(255) NOT NULL, -- Hashed full key
    
    -- Permissions & Scope
    permissions JSONB NOT NULL DEFAULT '[]',
    scopes JSONB NOT NULL DEFAULT '[]',
    allowed_ips JSONB DEFAULT '[]',
    allowed_domains JSONB DEFAULT '[]',
    
    -- Rate Limiting
    rate_limit_per_minute INTEGER DEFAULT 1000,
    rate_limit_per_hour INTEGER DEFAULT 10000,
    rate_limit_per_day INTEGER DEFAULT 100000,
    
    -- Usage Tracking
    total_requests BIGINT DEFAULT 0,
    last_used TIMESTAMP,
    last_ip_address INET,
    
    -- Status & Expiration
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    
    -- Foreign Keys
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for API keys
CREATE UNIQUE INDEX idx_api_keys_uuid ON api_keys(uuid);
CREATE UNIQUE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_api_keys_expires ON api_keys(expires_at);

-- Comments
COMMENT ON TABLE api_keys IS 'API key management with granular permissions and rate limiting';
```

#### 12. Audit Logs Table
```sql
-- Comprehensive audit logging
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    
    -- Event Information
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('auth', 'domain', 'rule', 'billing', 'admin', 'api', 'security')),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    
    -- Actor Information
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('user', 'api_key', 'system', 'webhook')),
    actor_id VARCHAR(255),
    actor_ip INET,
    actor_user_agent TEXT,
    
    -- Context
    description TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB DEFAULT '{}',
    
    -- Request Context
    request_id VARCHAR(255),
    session_id VARCHAR(255),
    correlation_id VARCHAR(255),
    
    -- Result
    success BOOLEAN NOT NULL,
    error_message TEXT,
    
    -- Foreign Keys
    tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes for audit logs
CREATE INDEX idx_audit_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_event ON audit_logs(event_type, created_at);
CREATE INDEX idx_audit_category ON audit_logs(event_category);
CREATE INDEX idx_audit_actor ON audit_logs(actor_type, actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);

-- Comments
COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging with monthly partitioning';
```

### 🔄 Migration Scripts

#### Initial Migration
```sql
-- migrations/001_initial_setup.sql
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user', 'viewer');
CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'cancelled', 'trial');
CREATE TYPE domain_status AS ENUM ('active', 'suspended', 'pending', 'deleted');

-- Create domains for common patterns
CREATE DOMAIN email AS VARCHAR(255) CHECK (VALUE ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
CREATE DOMAIN slug AS VARCHAR(100) CHECK (VALUE ~* '^[a-z0-9-]+$');

-- Set timezone
SET timezone = 'UTC';

-- Create initial tables (core tables from above)
-- ... (Include all table creation statements)
```

#### Feature Enhancement Migration
```sql
-- migrations/002_enhanced_analytics.sql
-- Add analytics enhancements
ALTER TABLE traffic_logs ADD COLUMN ml_score DECIMAL(5,4);
ALTER TABLE traffic_logs ADD COLUMN features_vector JSONB DEFAULT '{}';

-- Create materialized views for common queries
CREATE MATERIALIZED VIEW daily_traffic_stats AS
SELECT 
    domain_id,
    DATE(timestamp) as date,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE is_bot = true) as bot_requests,
    COUNT(*) FILTER (WHERE response_status >= 400) as error_requests,
    AVG(response_time) as avg_response_time,
    SUM(response_size) as total_bytes
FROM traffic_logs
WHERE timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY domain_id, DATE(timestamp);

CREATE UNIQUE INDEX ON daily_traffic_stats (domain_id, date);

-- Refresh schedule
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_traffic_stats;
END;
$$ LANGUAGE plpgsql;
```

#### Performance Optimization Migration
```sql
-- migrations/003_performance_optimization.sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_traffic_logs_composite 
ON traffic_logs (domain_id, timestamp, is_bot) 
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days';

-- Partition management function
CREATE OR REPLACE FUNCTION create_monthly_partition(table_name TEXT, start_date DATE)
RETURNS void AS $$
DECLARE
    partition_name TEXT;
    end_date DATE;
BEGIN
    partition_name := table_name || '_' || to_char(start_date, 'YYYY_MM');
    end_date := start_date + INTERVAL '1 month';
    
    EXECUTE format('CREATE TABLE %I PARTITION OF %I FOR VALUES FROM (%L) TO (%L)',
                   partition_name, table_name, start_date, end_date);
    
    EXECUTE format('CREATE INDEX ON %I (timestamp)', partition_name);
END;
$$ LANGUAGE plpgsql;

-- Create partitions for next 12 months
SELECT create_monthly_partition('traffic_logs', date_trunc('month', CURRENT_DATE) + (n || ' month')::interval)
FROM generate_series(0, 11) n;
```

### 🌱 Data Seeding

#### Development Seed Data
```sql
-- seed/development_data.sql
-- Insert default tenant
INSERT INTO tenants (name, slug, domain, status) VALUES
('Demo Company', 'demo-company', 'demo.traffic-interceptor.com', 'active');

-- Insert super admin user
INSERT INTO users (email, username, password_hash, first_name, last_name, role, is_active, is_verified, tenant_id) VALUES
('admin@demo.com', 'admin', '$2b$12$hashed_password', 'Admin', 'User', 'super_admin', true, true, 1);

-- Insert sample domains
INSERT INTO domains (domain_name, is_verified, tenant_id, created_by) VALUES
('example.com', true, 1, 1),
('test-site.com', true, 1, 1);

-- Insert subscription plans
INSERT INTO subscription_plans (name, slug, plan_type, price, billing_interval, features, limits) VALUES
('Free', 'free', 'free', 0, 'monthly', 
 '{"domains": 1, "rules": 5, "analytics": true}',
 '{"requests_per_month": 10000}'),
('Professional', 'professional', 'professional', 99, 'monthly',
 '{"domains": 10, "rules": 50, "analytics": true, "api_access": true}',
 '{"requests_per_month": 1000000}'),
('Enterprise', 'enterprise', 'enterprise', 499, 'monthly',
 '{"domains": 100, "rules": 500, "analytics": true, "api_access": true, "white_label": true}',
 '{"requests_per_month": 10000000}');

-- Insert common bot profiles
INSERT INTO bot_profiles (name, company, bot_type, user_agent_patterns, reputation_score, trust_level) VALUES
('Googlebot', 'Google', 'search_engine', 
 '["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"]',
 95, 'verified'),
('GPTBot', 'OpenAI', 'ai_trainer',
 '["Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)"]',
 80, 'high'),
('Bingbot', 'Microsoft', 'search_engine',
 '["Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)"]',
 90, 'verified');
```

#### Production Seed Data
```sql
-- seed/production_data.sql
-- Essential configuration only
INSERT INTO subscription_plans (name, slug, plan_type, price, billing_interval, features, limits, stripe_price_id) VALUES
('Starter', 'starter', 'starter', 29, 'monthly',
 '{"domains": 3, "rules": 20, "analytics": true}',
 '{"requests_per_month": 100000}',
 'price_starter_monthly'),
('Professional', 'professional', 'professional', 99, 'monthly',
 '{"domains": 10, "rules": 100, "analytics": true, "api_access": true}',
 '{"requests_per_month": 1000000}',
 'price_professional_monthly'),
('Enterprise', 'enterprise', 'enterprise', 499, 'monthly',
 '{"domains": -1, "rules": -1, "analytics": true, "api_access": true, "white_label": true}',
 '{"requests_per_month": -1}',
 'price_enterprise_monthly');

-- Load verified bot profiles from external source
-- This would typically be done via a script that loads from a curated database
```

### 🗄️ Backup & Recovery

#### Backup Strategy
```bash
#!/bin/bash
# scripts/backup.sh
BACKUP_DIR="/backups"
DB_NAME="traffic_interceptor"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="traffic-interceptor-backups"

# Full database backup
pg_dump $DB_NAME | gzip > $BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz

# Table-specific backups for large tables
pg_dump $DB_NAME -t traffic_logs | gzip > $BACKUP_DIR/traffic_logs_$TIMESTAMP.sql.gz
pg_dump $DB_NAME -t analytics | gzip > $BACKUP_DIR/analytics_$TIMESTAMP.sql.gz

# Upload to S3
aws s3 cp $BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz s3://$S3_BUCKET/daily/
aws s3 cp $BACKUP_DIR/traffic_logs_$TIMESTAMP.sql.gz s3://$S3_BUCKET/tables/

# Clean up local backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete

# Verify backup integrity
gunzip -t $BACKUP_DIR/full_backup_$TIMESTAMP.sql.gz
if [ $? -eq 0 ]; then
    echo "Backup verification successful"
else
    echo "Backup verification failed" | mail -s "Backup Error" admin@traffic-interceptor.com
fi
```

#### Point-in-Time Recovery
```sql
-- Enable WAL archiving for PITR
-- postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'aws s3 cp %p s3://traffic-interceptor-wal/%f'
max_wal_size = 1GB
checkpoint_completion_target = 0.9

-- Recovery script
-- recovery.conf (for restore)
restore_command = 'aws s3 cp s3://traffic-interceptor-wal/%f %p'
recovery_target_time = '2024-01-15 14:30:00'
recovery_target_action = promote
```

### 📊 Monitoring & Maintenance

#### Performance Monitoring
```sql
-- Create monitoring views
CREATE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Table size monitoring
CREATE VIEW table_sizes AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage monitoring
CREATE VIEW index_usage AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### Maintenance Tasks
```sql
-- Automated maintenance function
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS void AS $$
BEGIN
    -- Update table statistics
    ANALYZE;
    
    -- Refresh materialized views
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_traffic_stats;
    
    -- Clean up old partitions (keep 90 days of traffic logs)
    PERFORM drop_old_partitions('traffic_logs', 90);
    
    -- Clean up old audit logs (keep 1 year)
    DELETE FROM audit_logs WHERE created_at < CURRENT_DATE - INTERVAL '1 year';
    
    -- Update bot profile statistics
    UPDATE bot_profiles SET 
        detection_count = (
            SELECT COUNT(*) FROM traffic_logs 
            WHERE bot_profile_id = bot_profiles.id 
            AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
        ),
        last_seen = (
            SELECT MAX(timestamp) FROM traffic_logs 
            WHERE bot_profile_id = bot_profiles.id
        );
        
    -- Log maintenance completion
    INSERT INTO audit_logs (event_type, event_category, action, description, success, actor_type, actor_id)
    VALUES ('maintenance', 'system', 'daily_maintenance', 'Daily maintenance completed', true, 'system', 'cron');
END;
$$ LANGUAGE plpgsql;

-- Schedule daily maintenance
SELECT cron.schedule('daily-maintenance', '0 2 * * *', 'SELECT daily_maintenance();');
```

#### Health Checks
```sql
-- Database health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
    db_size bigint;
    connection_count int;
    oldest_xact interval;
BEGIN
    -- Get database size
    SELECT pg_database_size(current_database()) INTO db_size;
    
    -- Get connection count
    SELECT count(*) FROM pg_stat_activity INTO connection_count;
    
    -- Get oldest transaction
    SELECT COALESCE(max(now() - xact_start), '0'::interval) 
    FROM pg_stat_activity 
    WHERE state = 'active' INTO oldest_xact;
    
    result := jsonb_build_object(
        'database_size_bytes', db_size,
        'database_size_pretty', pg_size_pretty(db_size),
        'active_connections', connection_count,
        'oldest_transaction', oldest_xact,
        'timestamp', now()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎯 Quick Reference

### Common Queries
```sql
-- Get tenant usage summary
SELECT 
    t.name,
    COUNT(DISTINCT d.id) as domains,
    COUNT(DISTINCT u.id) as users,
    COUNT(tl.id) as total_requests,
    SUM(ct.credits_amount) as total_credits
FROM tenants t
LEFT JOIN domains d ON t.id = d.tenant_id
LEFT JOIN users u ON t.id = u.tenant_id
LEFT JOIN traffic_logs tl ON d.id = tl.domain_id AND tl.timestamp >= CURRENT_DATE - 30
LEFT JOIN credit_transactions ct ON t.id = ct.tenant_id AND ct.created_at >= CURRENT_DATE - 30
GROUP BY t.id, t.name;

-- Get bot detection statistics
SELECT 
    bp.name,
    bp.company,
    COUNT(tl.id) as detections,
    SUM(ct.credits_amount) as revenue
FROM bot_profiles bp
LEFT JOIN traffic_logs tl ON bp.id = tl.bot_profile_id AND tl.timestamp >= CURRENT_DATE - 7
LEFT JOIN credit_transactions ct ON bp.id = ct.bot_profile_id AND ct.created_at >= CURRENT_DATE - 7
GROUP BY bp.id, bp.name, bp.company
ORDER BY detections DESC;
```

### Maintenance Commands
```sql
-- Create new monthly partition
SELECT create_monthly_partition('traffic_logs', '2024-12-01');

-- Drop old partitions
DROP TABLE traffic_logs_2023_01;

-- Refresh statistics
ANALYZE traffic_logs;

-- Vacuum large tables
VACUUM ANALYZE traffic_logs;
```

---

**Database Schema designed for enterprise scale and performance** 🚀
