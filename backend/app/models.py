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
    
    # Relationships
    users = db.relationship('User', backref='tenant', lazy=True)
    domains = db.relationship('Domain', backref='tenant', lazy=True)
    subscriptions = db.relationship('Subscription', backref='tenant', lazy=True)
    
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
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            # Placeholder stats (in production, these would be calculated from traffic logs)
            'monthly_requests': 0,
            'monthly_blocked': 0,
            'monthly_revenue': 0.0
        }
    
    def __repr__(self):
        return f'<Domain {self.domain_name}>'

class Subscription(db.Model):
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    stripe_subscription_id = db.Column(db.String(255))
    plan_name = db.Column(db.String(100), nullable=False)
    plan_type = db.Column(db.String(20), default='monthly')  # monthly, annual
    status = db.Column(db.String(20), default='active')  # active, cancelled, past_due
    current_period_start = db.Column(db.DateTime)
    current_period_end = db.Column(db.DateTime)
    amount = db.Column(db.Numeric(10, 2))
    currency = db.Column(db.String(3), default='USD')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    
    def __repr__(self):
        return f'<Subscription {self.plan_name}>'

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
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<InterceptorRule {self.name}>'

class TrafficLog(db.Model):
    __tablename__ = 'traffic_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    ip_address = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.Text)
    request_method = db.Column(db.String(10))
    request_path = db.Column(db.String(255))
    request_headers = db.Column(db.JSON)
    response_status = db.Column(db.Integer)
    response_size = db.Column(db.BigInteger)
    processing_time = db.Column(db.Float)
    is_bot = db.Column(db.Boolean, default=False)
    bot_type = db.Column(db.String(50))
    country_code = db.Column(db.String(2))
    city = db.Column(db.String(100))
    rule_matched = db.Column(db.String(255))
    action_taken = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    
    def __repr__(self):
        return f'<TrafficLog {self.ip_address}>'

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
