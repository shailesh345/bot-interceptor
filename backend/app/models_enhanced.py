# Enhanced models for LLM Bot Detection and Credit System
from app import db
from datetime import datetime, timedelta
import uuid
import json

class Organization(db.Model):
    """Organization model for AI companies"""
    __tablename__ = 'organizations'
    
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False)
    website = db.Column(db.String(255))
    is_ai_company = db.Column(db.Boolean, default=False)
    company_type = db.Column(db.String(50))  # openai, google, anthropic, perplexity, other
    api_key = db.Column(db.String(255))  # Generated API key for access
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    credit_purchases = db.relationship('CreditPurchase', backref='organization', lazy=True)
    credit_balance = db.relationship('CreditBalance', backref='organization', uselist=False)
    traffic_logs = db.relationship('TrafficLog', backref='organization', lazy=True)
    outreach_history = db.relationship('CompanyOutreach', backref='organization', lazy=True)


class CreditPackage(db.Model):
    """Pre-defined credit packages"""
    __tablename__ = 'credit_packages'
    
    id = db.Column(db.Integer, primary_key=True)
    package_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='usd')
    description = db.Column(db.Text)
    features = db.Column(db.JSON)  # List of features
    validity_days = db.Column(db.Integer, default=30)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CreditPurchase(db.Model):
    """Credit purchase history"""
    __tablename__ = 'credit_purchases'
    
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    package_id = db.Column(db.String(50), nullable=False)
    package_name = db.Column(db.String(100))
    credits = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='usd')
    stripe_payment_id = db.Column(db.String(255))
    status = db.Column(db.String(20), default='pending')  # pending, completed, failed
    purchased_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    
    def is_active(self):
        return self.status == 'completed' and self.expires_at > datetime.utcnow()


class CreditBalance(db.Model):
    """Current credit balance for organizations"""
    __tablename__ = 'credit_balances'
    
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), unique=True, nullable=False)
    total_credits = db.Column(db.Integer, default=0)
    used_credits = db.Column(db.Integer, default=0)
    remaining_credits = db.Column(db.Integer, default=0)
    last_used_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LLMBotDetection(db.Model):
    """Log of detected LLM/AI bots"""
    __tablename__ = 'llm_bot_detections'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    request_path = db.Column(db.String(500))
    request_method = db.Column(db.String(10))
    is_llm_bot = db.Column(db.Boolean, default=False)
    confidence = db.Column(db.Float)
    bot_company = db.Column(db.String(100))  # OpenAI, Google, Perplexity, etc.
    bot_type = db.Column(db.String(50))
    detection_methods = db.Column(db.JSON)  # List of detection methods used
    evidence = db.Column(db.JSON)  # Detection evidence
    action_taken = db.Column(db.String(50))  # blocked, redirected, allowed
    credits_charged = db.Column(db.Integer, default=0)
    
    # Foreign keys
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'))
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'))
    
    # Relationships
    domain = db.relationship('Domain', backref='llm_detections')
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'request_path': self.request_path,
            'is_llm_bot': self.is_llm_bot,
            'confidence': self.confidence,
            'bot_company': self.bot_company,
            'bot_type': self.bot_type,
            'detection_methods': self.detection_methods,
            'action_taken': self.action_taken,
            'credits_charged': self.credits_charged
        }


class CompanyOutreach(db.Model):
    """Track outreach to AI companies"""
    __tablename__ = 'company_outreach'
    
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'))
    company_name = db.Column(db.String(255), nullable=False)
    contact_email = db.Column(db.String(255))
    bot_type = db.Column(db.String(100))
    detection_count = db.Column(db.Integer, default=0)
    first_detected = db.Column(db.DateTime, default=datetime.utcnow)
    last_detected = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Outreach tracking
    initial_outreach_sent = db.Column(db.DateTime)
    follow_up_sent = db.Column(db.DateTime)
    response_received = db.Column(db.DateTime)
    response_type = db.Column(db.String(50))  # positive, negative, no_response
    
    # Communication history
    message_type = db.Column(db.String(50))  # initial_contact, follow_up, custom
    message_content = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending, sent, responded, converted
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    sent_at = db.Column(db.DateTime)


class PaymentHistory(db.Model):
    """Payment history for all transactions"""
    __tablename__ = 'payment_history'
    
    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'))
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'))
    amount = db.Column(db.Float, nullable=False)
    currency = db.Column(db.String(3), default='usd')
    description = db.Column(db.String(255))
    stripe_payment_id = db.Column(db.String(255))
    stripe_invoice_id = db.Column(db.String(255))
    payment_method = db.Column(db.String(50))
    status = db.Column(db.String(20))  # succeeded, failed, pending
    payment_metadata = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class CaptchaChallenge(db.Model):
    """CAPTCHA challenges for human verification"""
    __tablename__ = 'captcha_challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.String(100), unique=True, nullable=False)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    challenge_type = db.Column(db.String(50))  # recaptcha, hcaptcha, custom
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    attempted_at = db.Column(db.DateTime)
    solved_at = db.Column(db.DateTime)
    is_solved = db.Column(db.Boolean, default=False)
    attempts = db.Column(db.Integer, default=0)
    score = db.Column(db.Float)  # CAPTCHA score
    
    def is_expired(self):
        # Challenge expires after 5 minutes
        return datetime.utcnow() - self.created_at > timedelta(minutes=5)
