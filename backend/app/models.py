# Database Models
from app import db
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token
import uuid
import json

class Tenant(db.Model):
    __tablename__ = 'tenants'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    domain = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active')  # active, suspended, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Stripe integration
    stripe_customer_id = db.Column(db.String(255))
    
    # Relationships
    users = db.relationship('User', backref='tenant', lazy=True)
    domains = db.relationship('Domain', backref='tenant', lazy=True)
    subscriptions = db.relationship('Subscription', lazy=True)
    
    def __repr__(self):
        return f'<Tenant {self.name}>'

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    role = db.Column(db.String(20), default='user')  # super_admin, admin, user
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=True)
    
    # MFA and Security
    mfa_secret = db.Column(db.String(32))
    mfa_enabled = db.Column(db.Boolean, default=False)
    password_changed_at = db.Column(db.DateTime)
    account_locked = db.Column(db.Boolean, default=False)
    failed_login_attempts = db.Column(db.Integer, default=0)
    last_failed_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def generate_tokens(self):
        access_token = create_access_token(identity=self.uuid)
        refresh_token = create_refresh_token(identity=self.uuid)
        return access_token, refresh_token
    
    def __repr__(self):
        return f'<User {self.username}>'

class Domain(db.Model):
    __tablename__ = 'domains'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    domain_name = db.Column(db.String(255), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(255))
    verification_method = db.Column(db.String(50), default='dns')  # dns, file, meta
    ssl_enabled = db.Column(db.Boolean, default=False)
    cdn_enabled = db.Column(db.Boolean, default=False)
    traffic_enabled = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(20), default='active')  # active, suspended, pending
    verified_at = db.Column(db.DateTime, nullable=True)
    
    # Monitoring settings
    monitoring_enabled = db.Column(db.Boolean, default=False)
    monitoring_interval = db.Column(db.Integer, default=60)  # minutes
    monitoring_url = db.Column(db.String(500))  # Custom monitoring URL
    monitoring_content = db.Column(db.Text)  # Content to check for
    monitoring_headers = db.Column(db.Text)  # JSON headers for monitoring
    
    # Security scanning settings
    security_scan_enabled = db.Column(db.Boolean, default=False)
    security_scan_interval = db.Column(db.Integer, default=24)  # hours
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    
    # Relationships
    rules = db.relationship('InterceptorRule', backref='domain', lazy=True)
    traffic_logs = db.relationship('TrafficLog', backref='domain', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'uuid': self.uuid,
            'domain_name': self.domain_name,
            'is_verified': self.is_verified,
            'verification_token': self.verification_token,
            'verification_method': self.verification_method,
            'ssl_enabled': self.ssl_enabled,
            'cdn_enabled': self.cdn_enabled,
            'traffic_enabled': self.traffic_enabled,
            'status': self.status,
            'tenant_id': self.tenant_id,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Placeholder stats (in production, these would be calculated from traffic logs)
            'monthly_requests': 0,
            'monthly_blocked': 0,
            'monthly_revenue': 0.0
        }
    
    def __repr__(self):
        return f'<Domain {self.domain_name}>'



class InterceptorRule(db.Model):
    __tablename__ = 'interceptor_rules'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    rule_type = db.Column(db.String(50), nullable=False)  # bot_detection, rate_limit, content_protection
    conditions = db.Column(db.JSON)  # JSON conditions for rule matching
    actions = db.Column(db.JSON)  # JSON actions to take when rule matches
    priority = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(20), default='active')  # active, inactive, deleted
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'uuid': self.uuid,
            'name': self.name,
            'description': self.description,
            'rule_type': self.rule_type,
            'conditions': self.conditions,
            'actions': self.actions,
            'priority': self.priority,
            'is_active': self.is_active,
            'status': self.status,
            'domain_id': self.domain_id,
            'user_id': self.user_id,
            'tenant_id': self.tenant_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<InterceptorRule {self.name}>'

class TrafficLog(db.Model):
    __tablename__ = 'traffic_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    client_ip = db.Column(db.String(45), nullable=False)  # Renamed from ip_address for consistency
    user_agent = db.Column(db.Text)
    request_method = db.Column(db.String(10))
    request_path = db.Column(db.String(255))
    request_headers = db.Column(db.JSON)
    response_status = db.Column(db.Integer)
    response_size = db.Column(db.BigInteger)
    response_time = db.Column(db.Float)  # Added for performance metrics
    processing_time = db.Column(db.Float)
    is_bot = db.Column(db.Boolean, default=False)
    bot_type = db.Column(db.String(50))
    geo_country = db.Column(db.String(2))  # Renamed from country_code for consistency
    geo_city = db.Column(db.String(100))   # Renamed from city for consistency
    rule_matched = db.Column(db.String(255))
    action_taken = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=True)  # For LLM bot detection
    credits_used = db.Column(db.Integer, default=0)  # Credits consumed for this request
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'client_ip': self.client_ip,
            'user_agent': self.user_agent,
            'request_method': self.request_method,
            'request_path': self.request_path,
            'response_status': self.response_status,
            'response_time': self.response_time,
            'processing_time': self.processing_time,
            'is_bot': self.is_bot,
            'bot_type': self.bot_type,
            'geo_country': self.geo_country,
            'geo_city': self.geo_city,
            'rule_matched': self.rule_matched,
            'action_taken': self.action_taken,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'domain_id': self.domain_id,
            'organization_id': self.organization_id,
            'credits_used': self.credits_used
        }
    
    def __repr__(self):
        return f'<TrafficLog {self.client_ip}>'

class BotProfile(db.Model):
    __tablename__ = 'bot_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    bot_type = db.Column(db.String(50))  # search_engine, ai_trainer, scraper, social_media
    user_agent_patterns = db.Column(db.JSON)
    ip_ranges = db.Column(db.JSON)
    behavior_patterns = db.Column(db.JSON)
    is_verified = db.Column(db.Boolean, default=False)
    is_allowed = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<BotProfile {self.name}>'

class Analytics(db.Model):
    __tablename__ = 'analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    metric_name = db.Column(db.String(100), nullable=False)
    metric_value = db.Column(db.Float, nullable=False)
    dimensions = db.Column(db.JSON)  # Additional dimensions for grouping
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    date = db.Column(db.Date, default=datetime.utcnow().date())
    
    # Foreign Keys
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=True)
    
    def __repr__(self):
        return f'<Analytics {self.metric_name}>'

class ApiKey(db.Model):
    __tablename__ = 'api_keys'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    key_hash = db.Column(db.String(255), nullable=False)
    permissions = db.Column(db.JSON)  # List of permissions
    is_active = db.Column(db.Boolean, default=True)
    last_used = db.Column(db.DateTime)
    expires_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    
    def __repr__(self):
        return f'<ApiKey {self.name}>'

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)  # security, traffic, performance, bot_detection, system
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    data = db.Column(db.JSON)  # Additional data for the notification
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, critical
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='notifications')
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'user_id': self.user_id,
            'notification_type': self.notification_type,
            'title': self.title,
            'message': self.message,
            'data': self.data or {},
            'priority': self.priority,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Notification {self.title}>'

class ContentProtectionRule(db.Model):
    __tablename__ = 'content_protection_rules'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    rule_type = db.Column(db.String(50), nullable=False)  # rate_limit, content_fingerprint, anti_scraping, geo_block
    conditions = db.Column(db.JSON, nullable=False)  # List of conditions to match
    actions = db.Column(db.JSON, nullable=False)  # List of actions to take
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    domain = db.relationship('Domain', backref='protection_rules')
    user = db.relationship('User', backref='protection_rules')
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'name': self.name,
            'description': self.description,
            'rule_type': self.rule_type,
            'conditions': self.conditions,
            'actions': self.actions,
            'priority': self.priority,
            'is_active': self.is_active,
            'domain_id': self.domain_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<ContentProtectionRule {self.name}>'

class ProtectionLog(db.Model):
    __tablename__ = 'protection_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    client_ip = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.Text)
    request_path = db.Column(db.String(255))
    request_method = db.Column(db.String(10))
    rule_matched = db.Column(db.Integer, db.ForeignKey('content_protection_rules.id'))
    action_taken = db.Column(db.Text)  # JSON string of actions taken
    allowed = db.Column(db.Boolean, default=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    domain = db.relationship('Domain', backref='protection_logs')
    rule = db.relationship('ContentProtectionRule', backref='protection_logs')
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'domain_id': self.domain_id,
            'client_ip': self.client_ip,
            'user_agent': self.user_agent,
            'request_path': self.request_path,
            'request_method': self.request_method,
            'rule_matched': self.rule_matched,
            'action_taken': self.action_taken,
            'allowed': self.allowed,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<ProtectionLog {self.client_ip}>'

class BillingPlan(db.Model):
    __tablename__ = 'billing_plans'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    price = db.Column(db.Numeric(10, 2), nullable=False)  # Price in USD
    billing_cycle = db.Column(db.String(20), nullable=False)  # monthly, annual
    features = db.Column(db.JSON, nullable=False)  # Plan features and limits
    stripe_price_id = db.Column(db.String(255))  # Stripe price ID
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = db.relationship('User', backref='created_plans')
    subscriptions = db.relationship('Subscription', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'name': self.name,
            'description': self.description,
            'price': float(self.price),
            'billing_cycle': self.billing_cycle,
            'features': self.features,
            'stripe_price_id': self.stripe_price_id,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<BillingPlan {self.name}>'

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    stripe_subscription_id = db.Column(db.String(255), unique=True)
    status = db.Column(db.String(20), default='active')  # active, past_due, canceled, incomplete
    current_period_start = db.Column(db.DateTime, nullable=False)
    current_period_end = db.Column(db.DateTime, nullable=False)
    canceled_at = db.Column(db.DateTime)
    last_payment_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    plan_id = db.Column(db.Integer, db.ForeignKey('billing_plans.id'), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    tenant = db.relationship('Tenant', lazy=True, overlaps="subscriptions")
    plan = db.relationship('BillingPlan', lazy=True, overlaps="subscriptions")
    creator = db.relationship('User', backref='created_subscriptions')
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'stripe_subscription_id': self.stripe_subscription_id,
            'status': self.status,
            'current_period_start': self.current_period_start.isoformat() if self.current_period_start else None,
            'current_period_end': self.current_period_end.isoformat() if self.current_period_end else None,
            'canceled_at': self.canceled_at.isoformat() if self.canceled_at else None,
            'last_payment_date': self.last_payment_date.isoformat() if self.last_payment_date else None,
            'tenant_id': self.tenant_id,
            'plan_id': self.plan_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Subscription {self.uuid}>'

class UsageRecord(db.Model):
    __tablename__ = 'usage_records'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    metric_name = db.Column(db.String(100), nullable=False)  # requests, bandwidth, storage, etc.
    usage_value = db.Column(db.Float, nullable=False)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=True)
    
    # Relationships
    tenant = db.relationship('Tenant', lazy=True)
    domain = db.relationship('Domain', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'metric_name': self.metric_name,
            'usage_value': self.usage_value,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None,
            'tenant_id': self.tenant_id,
            'domain_id': self.domain_id
        }
    
    def __repr__(self):
        return f'<UsageRecord {self.metric_name}: {self.usage_value}>'

class Invoice(db.Model):
    __tablename__ = 'invoices'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    stripe_invoice_id = db.Column(db.String(255), unique=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(20), default='pending')  # pending, paid, failed, void
    paid_at = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    
    # Relationships
    tenant = db.relationship('Tenant', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'stripe_invoice_id': self.stripe_invoice_id,
            'amount': float(self.amount),
            'currency': self.currency,
            'status': self.status,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'tenant_id': self.tenant_id
        }
    
    def __repr__(self):
        return f'<Invoice {self.uuid}>'

class Role(db.Model):
    __tablename__ = 'roles'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    permissions = db.Column(db.JSON, nullable=False)  # List of permission strings
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    creator = db.relationship('User', backref='created_roles')
    user_roles = db.relationship('UserRole', backref='role_ref', overlaps="role_ref,user_roles")
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'name': self.name,
            'description': self.description,
            'permissions': self.permissions,
            'is_active': self.is_active,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<Role {self.name}>'

class UserRole(db.Model):
    __tablename__ = 'user_roles'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)
    assigned_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships
    user = db.relationship('User', foreign_keys=[user_id], backref='user_roles')
    role = db.relationship('Role', backref='user_roles_ref', overlaps="role_ref,user_roles")
    assigner = db.relationship('User', foreign_keys=[assigned_by], backref='assigned_roles')
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'user_id': self.user_id,
            'role_id': self.role_id,
            'assigned_at': self.assigned_at.isoformat() if self.assigned_at else None,
            'assigned_by': self.assigned_by
        }
    
    def __repr__(self):
        return f'<UserRole {self.user_id}:{self.role_id}>'

class SecurityLog(db.Model):
    __tablename__ = 'security_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    event_type = db.Column(db.String(100), nullable=False)  # login_success, login_failed, mfa_enabled, etc.
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    details = db.Column(db.JSON)  # Additional event details
    severity = db.Column(db.String(20), default='info')  # info, warning, error, critical
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='security_logs')
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'event_type': self.event_type,
            'user_id': self.user_id,
            'details': self.details,
            'severity': self.severity,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<SecurityLog {self.event_type}:{self.user_id}>'

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    action = db.Column(db.String(100), nullable=False)  # create, read, update, delete
    resource_type = db.Column(db.String(100), nullable=False)  # user, domain, rule, etc.
    resource_id = db.Column(db.Integer, nullable=True)  # ID of the affected resource
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    details = db.Column(db.JSON)  # Additional action details
    ip_address = db.Column(db.String(45))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='audit_logs')
    
    def to_dict(self):
        return {
            'id': self.uuid,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'user_id': self.user_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    def __repr__(self):
        return f'<AuditLog {self.action}:{self.resource_type}:{self.resource_id}>'

class UptimeCheck(db.Model):
    """Uptime monitoring check results"""
    __tablename__ = 'uptime_checks'
    
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # success, failure, error
    response_time = db.Column(db.Float)  # in milliseconds
    status_code = db.Column(db.Integer)
    error_message = db.Column(db.Text)
    content_check_passed = db.Column(db.Boolean, default=True)
    checked_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    domain = db.relationship('Domain', backref='uptime_checks')
    
    def to_dict(self):
        return {
            'id': self.id,
            'domain_id': self.domain_id,
            'status': self.status,
            'response_time': self.response_time,
            'status_code': self.status_code,
            'error_message': self.error_message,
            'content_check_passed': self.content_check_passed,
            'checked_at': self.checked_at.isoformat() if self.checked_at else None
        }

class UptimeAlert(db.Model):
    """Uptime monitoring alerts"""
    __tablename__ = 'uptime_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    alert_type = db.Column(db.String(50), nullable=False)
    message = db.Column(db.Text, nullable=False)
    details = db.Column(db.Text)
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    resolved_by = db.Column(db.String(100))
    
    # Relationships
    domain = db.relationship('Domain', backref='uptime_alerts')
    
    def to_dict(self):
        return {
            'id': self.id,
            'domain_id': self.domain_id,
            'alert_type': self.alert_type,
            'message': self.message,
            'details': self.details,
            'severity': self.severity,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolved_by': self.resolved_by
        }

class SecurityScan(db.Model):
    """Security scan results"""
    __tablename__ = 'security_scans'
    
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    scan_type = db.Column(db.String(50), nullable=False)  # full, ssl, web, vulnerability, threat
    status = db.Column(db.String(20), default='running')  # running, completed, failed
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    results = db.Column(db.Text)  # JSON results
    error_message = db.Column(db.Text)
    
    # Relationships
    domain = db.relationship('Domain', backref='security_scans')
    
    def to_dict(self):
        return {
            'id': self.id,
            'domain_id': self.domain_id,
            'scan_type': self.scan_type,
            'status': self.status,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'results': self.results,
            'error_message': self.error_message
        }

class SecurityVulnerability(db.Model):
    """Security vulnerabilities found"""
    __tablename__ = 'security_vulnerabilities'
    
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    scan_id = db.Column(db.Integer, db.ForeignKey('security_scans.id'), nullable=False)
    vulnerability_type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    description = db.Column(db.Text, nullable=False)
    cve_id = db.Column(db.String(20))
    cvss_score = db.Column(db.Float)
    details = db.Column(db.Text)  # JSON details
    discovered_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    resolved_by = db.Column(db.String(100))
    
    # Relationships
    domain = db.relationship('Domain', backref='security_vulnerabilities')
    scan = db.relationship('SecurityScan', backref='vulnerabilities')
    
    def to_dict(self):
        return {
            'id': self.id,
            'domain_id': self.domain_id,
            'scan_id': self.scan_id,
            'vulnerability_type': self.vulnerability_type,
            'severity': self.severity,
            'description': self.description,
            'cve_id': self.cve_id,
            'cvss_score': self.cvss_score,
            'details': self.details,
            'discovered_at': self.discovered_at.isoformat() if self.discovered_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolved_by': self.resolved_by
        }

class SecurityThreat(db.Model):
    """Security threats detected"""
    __tablename__ = 'security_threats'
    
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    scan_id = db.Column(db.Integer, db.ForeignKey('security_scans.id'))
    threat_type = db.Column(db.String(100), nullable=False)
    severity = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    description = db.Column(db.Text, nullable=False)
    source = db.Column(db.String(100))
    confidence = db.Column(db.String(20))  # low, medium, high
    details = db.Column(db.Text)  # JSON details
    discovered_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime)
    resolved_by = db.Column(db.String(100))
    
    # Relationships
    domain = db.relationship('Domain', backref='security_threats')
    scan = db.relationship('SecurityScan', backref='threats')
    
    def to_dict(self):
        return {
            'id': self.id,
            'domain_id': self.domain_id,
            'scan_id': self.scan_id,
            'threat_type': self.threat_type,
            'severity': self.severity,
            'description': self.description,
            'source': self.source,
            'confidence': self.confidence,
            'details': self.details,
            'discovered_at': self.discovered_at.isoformat() if self.discovered_at else None,
            'resolved_at': self.resolved_at.isoformat() if self.resolved_at else None,
            'resolved_by': self.resolved_by
        }
