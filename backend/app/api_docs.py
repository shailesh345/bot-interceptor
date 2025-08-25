# API Documentation with Swagger/OpenAPI
from flask_restx import Api, Resource, fields, Namespace
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Domain, TrafficLog, InterceptorRule, Tenant, BillingPlan, Subscription
from app import db
from datetime import datetime, timedelta
import json

# Create API documentation
api_doc = Api(
    title='Traffic Interceptor API',
    version='1.0',
    description='Comprehensive API for Traffic Interceptor SaaS Platform',
    doc='/docs',
    authorizations={
        'apikey': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': 'JWT Token: Bearer <token>'
        }
    },
    security='apikey'
)

# Create namespaces for different API sections
auth_ns = Namespace('auth', description='Authentication operations')
domains_ns = Namespace('domains', description='Domain management operations')
traffic_ns = Namespace('traffic', description='Traffic monitoring operations')
rules_ns = Namespace('rules', description='Interceptor rules operations')
analytics_ns = Namespace('analytics', description='Analytics and reporting operations')
billing_ns = Namespace('billing', description='Billing and subscription operations')
admin_ns = Namespace('admin', description='Administrative operations')

# Add namespaces to API
api_doc.add_namespace(auth_ns)
api_doc.add_namespace(domains_ns)
api_doc.add_namespace(traffic_ns)
api_doc.add_namespace(rules_ns)
api_doc.add_namespace(analytics_ns)
api_doc.add_namespace(billing_ns)
api_doc.add_namespace(admin_ns)

# Define API models for documentation
user_model = api_doc.model('User', {
    'id': fields.String(description='User UUID'),
    'email': fields.String(required=True, description='User email'),
    'username': fields.String(required=True, description='Username'),
    'first_name': fields.String(description='First name'),
    'last_name': fields.String(description='Last name'),
    'role': fields.String(description='User role'),
    'is_active': fields.Boolean(description='Account status'),
    'tenant_id': fields.Integer(description='Tenant ID'),
    'created_at': fields.DateTime(description='Creation timestamp')
})

login_model = api_doc.model('Login', {
    'username': fields.String(required=True, description='Username or email'),
    'password': fields.String(required=True, description='Password')
})

login_response = api_doc.model('LoginResponse', {
    'access_token': fields.String(description='JWT access token'),
    'refresh_token': fields.String(description='JWT refresh token'),
    'user': fields.Nested(user_model)
})

domain_model = api_doc.model('Domain', {
    'id': fields.String(description='Domain UUID'),
    'domain_name': fields.String(required=True, description='Domain name'),
    'is_verified': fields.Boolean(description='Verification status'),
    'ssl_enabled': fields.Boolean(description='SSL status'),
    'cdn_enabled': fields.Boolean(description='CDN status'),
    'traffic_enabled': fields.Boolean(description='Traffic monitoring status'),
    'status': fields.String(description='Domain status'),
    'tenant_id': fields.Integer(description='Tenant ID'),
    'created_at': fields.DateTime(description='Creation timestamp')
})

traffic_log_model = api_doc.model('TrafficLog', {
    'id': fields.String(description='Log UUID'),
    'domain_id': fields.Integer(description='Domain ID'),
    'ip_address': fields.String(description='Client IP address'),
    'user_agent': fields.String(description='User agent string'),
    'request_method': fields.String(description='HTTP method'),
    'request_url': fields.String(description='Request URL'),
    'response_status': fields.Integer(description='HTTP status code'),
    'response_time': fields.Float(description='Response time in seconds'),
    'bot_detected': fields.Boolean(description='Bot detection status'),
    'bot_type': fields.String(description='Bot type if detected'),
    'country': fields.String(description='Geographic location'),
    'timestamp': fields.DateTime(description='Request timestamp')
})

rule_model = api_doc.model('InterceptorRule', {
    'id': fields.String(description='Rule UUID'),
    'name': fields.String(required=True, description='Rule name'),
    'description': fields.String(description='Rule description'),
    'rule_type': fields.String(required=True, description='Rule type'),
    'conditions': fields.Raw(description='Rule conditions'),
    'actions': fields.Raw(description='Rule actions'),
    'is_active': fields.Boolean(description='Rule status'),
    'priority': fields.Integer(description='Rule priority'),
    'domain_id': fields.Integer(description='Domain ID'),
    'created_at': fields.DateTime(description='Creation timestamp')
})

analytics_model = api_doc.model('Analytics', {
    'total_requests': fields.Integer(description='Total requests'),
    'unique_visitors': fields.Integer(description='Unique visitors'),
    'bot_requests': fields.Integer(description='Bot requests'),
    'avg_response_time': fields.Float(description='Average response time'),
    'top_countries': fields.Raw(description='Top countries'),
    'top_bots': fields.Raw(description='Top bot types'),
    'hourly_traffic': fields.Raw(description='Hourly traffic data')
})

billing_plan_model = api_doc.model('BillingPlan', {
    'id': fields.String(description='Plan UUID'),
    'name': fields.String(required=True, description='Plan name'),
    'description': fields.String(description='Plan description'),
    'price': fields.Float(required=True, description='Plan price'),
    'billing_cycle': fields.String(description='Billing cycle'),
    'features': fields.Raw(description='Plan features'),
    'is_active': fields.Boolean(description='Plan status')
})

# Authentication endpoints
@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    @auth_ns.response(200, 'Login successful', login_response)
    @auth_ns.response(401, 'Invalid credentials')
    def post(self):
        """User login endpoint"""
        data = request.get_json()
        
        if not data or not data.get('username') or not data.get('password'):
            return {'message': 'Username and password are required'}, 400
        
        user = User.query.filter(
            (User.username == data['username']) | (User.email == data['username'])
        ).first()
        
        if user and user.check_password(data['password']):
            if not user.is_active:
                return {'message': 'Account is deactivated'}, 401
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            # Generate tokens
            access_token, refresh_token = user.generate_tokens()
            
            return {
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': user.uuid,
                    'email': user.email,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'role': user.role,
                    'is_active': user.is_active,
                    'tenant_id': user.tenant_id,
                    'created_at': user.created_at.isoformat() if user.created_at else None
                }
            }, 200
        
        return {'message': 'Invalid credentials'}, 401

@auth_ns.route('/register')
class Register(Resource):
    @auth_ns.expect(user_model)
    @auth_ns.response(201, 'User registered successfully')
    @auth_ns.response(400, 'Validation error')
    def post(self):
        """User registration endpoint"""
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('username') or not data.get('password'):
            return {'message': 'Email, username, and password are required'}, 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return {'message': 'Email already registered'}, 400
        
        if User.query.filter_by(username=data['username']).first():
            return {'message': 'Username already taken'}, 400
        
        # Create new user
        user = User(
            email=data['email'],
            username=data['username'],
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            role='user'
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        return {'message': 'User registered successfully', 'user_id': user.uuid}, 201

# Domain management endpoints
@domains_ns.route('/')
class DomainList(Resource):
    @jwt_required()
    @domains_ns.doc(security='apikey')
    @domains_ns.response(200, 'Success', [domain_model])
    def get(self):
        """Get all domains for current user's tenant"""
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return {'message': 'User not found'}, 404
        
        domains = Domain.query.filter_by(tenant_id=current_user.tenant_id).all()
        return [{
            'id': domain.uuid,
            'domain_name': domain.domain_name,
            'is_verified': domain.is_verified,
            'ssl_enabled': domain.ssl_enabled,
            'cdn_enabled': domain.cdn_enabled,
            'traffic_enabled': domain.traffic_enabled,
            'status': domain.status,
            'tenant_id': domain.tenant_id,
            'created_at': domain.created_at.isoformat() if domain.created_at else None
        } for domain in domains], 200

    @jwt_required()
    @domains_ns.doc(security='apikey')
    @domains_ns.expect(domain_model)
    @domains_ns.response(201, 'Domain created successfully')
    def post(self):
        """Create a new domain"""
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return {'message': 'User not found'}, 404
        
        data = request.get_json()
        if not data or not data.get('domain_name'):
            return {'message': 'Domain name is required'}, 400
        
        # Check if domain already exists for this tenant
        existing_domain = Domain.query.filter_by(
            domain_name=data['domain_name'],
            tenant_id=current_user.tenant_id
        ).first()
        
        if existing_domain:
            return {'message': 'Domain already exists'}, 400
        
        domain = Domain(
            domain_name=data['domain_name'],
            tenant_id=current_user.tenant_id
        )
        
        db.session.add(domain)
        db.session.commit()
        
        return {'message': 'Domain created successfully', 'domain_id': domain.uuid}, 201

# Traffic monitoring endpoints
@traffic_ns.route('/logs')
class TrafficLogs(Resource):
    @jwt_required()
    @traffic_ns.doc(security='apikey')
    @traffic_ns.response(200, 'Success', [traffic_log_model])
    def get(self):
        """Get traffic logs for current user's domains"""
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return {'message': 'User not found'}, 404
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Get domain filter
        domain_id = request.args.get('domain_id', type=int)
        
        # Build query
        query = TrafficLog.query.join(Domain).filter(Domain.tenant_id == current_user.tenant_id)
        
        if domain_id:
            query = query.filter(TrafficLog.domain_id == domain_id)
        
        # Get logs with pagination
        logs = query.order_by(TrafficLog.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return [{
            'id': log.uuid,
            'domain_id': log.domain_id,
            'ip_address': log.ip_address,
            'user_agent': log.user_agent,
            'request_method': log.request_method,
            'request_url': log.request_url,
            'response_status': log.response_status,
            'response_time': log.response_time,
            'bot_detected': log.bot_detected,
            'bot_type': log.bot_type,
            'country': log.country,
            'timestamp': log.timestamp.isoformat() if log.timestamp else None
        } for log in logs.items], 200

# Analytics endpoints
@analytics_ns.route('/dashboard')
class AnalyticsDashboard(Resource):
    @jwt_required()
    @analytics_ns.doc(security='apikey')
    @analytics_ns.response(200, 'Success', analytics_model)
    def get(self):
        """Get analytics dashboard data"""
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return {'message': 'User not found'}, 404
        
        # Get time range
        days = request.args.get('days', 7, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=current_user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        if not domain_ids:
            return {
                'total_requests': 0,
                'unique_visitors': 0,
                'bot_requests': 0,
                'avg_response_time': 0,
                'top_countries': [],
                'top_bots': [],
                'hourly_traffic': []
            }, 200
        
        # Get traffic data
        traffic_logs = TrafficLog.query.filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date,
            TrafficLog.timestamp <= end_date
        ).all()
        
        # Calculate analytics
        total_requests = len(traffic_logs)
        unique_visitors = len(set(log.ip_address for log in traffic_logs if log.ip_address))
        bot_requests = len([log for log in traffic_logs if log.bot_detected])
        avg_response_time = sum(log.response_time for log in traffic_logs) / total_requests if total_requests > 0 else 0
        
        # Top countries
        country_counts = {}
        for log in traffic_logs:
            if log.country:
                country_counts[log.country] = country_counts.get(log.country, 0) + 1
        top_countries = sorted(country_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Top bots
        bot_counts = {}
        for log in traffic_logs:
            if log.bot_detected and log.bot_type:
                bot_counts[log.bot_type] = bot_counts.get(log.bot_type, 0) + 1
        top_bots = sorted(bot_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Hourly traffic
        hourly_traffic = {}
        for log in traffic_logs:
            hour = log.timestamp.hour if log.timestamp else 0
            hourly_traffic[hour] = hourly_traffic.get(hour, 0) + 1
        
        return {
            'total_requests': total_requests,
            'unique_visitors': unique_visitors,
            'bot_requests': bot_requests,
            'avg_response_time': round(avg_response_time, 3),
            'top_countries': [{'country': country, 'count': count} for country, count in top_countries],
            'top_bots': [{'bot_type': bot_type, 'count': count} for bot_type, count in top_bots],
            'hourly_traffic': [{'hour': hour, 'count': count} for hour, count in sorted(hourly_traffic.items())]
        }, 200

# Billing endpoints
@billing_ns.route('/plans')
class BillingPlans(Resource):
    @jwt_required()
    @billing_ns.doc(security='apikey')
    @billing_ns.response(200, 'Success', [billing_plan_model])
    def get(self):
        """Get available billing plans"""
        plans = BillingPlan.query.filter_by(is_active=True).all()
        return [{
            'id': plan.uuid,
            'name': plan.name,
            'description': plan.description,
            'price': float(plan.price),
            'billing_cycle': plan.billing_cycle,
            'features': plan.features,
            'is_active': plan.is_active
        } for plan in plans], 200

# Admin endpoints
@admin_ns.route('/users')
class AdminUsers(Resource):
    @jwt_required()
    @admin_ns.doc(security='apikey')
    @admin_ns.response(200, 'Success', [user_model])
    def get(self):
        """Get all users (admin only)"""
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user or current_user.role not in ['admin', 'super_admin']:
            return {'message': 'Admin access required'}, 403
        
        users = User.query.all()
        return [{
            'id': user.uuid,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_active': user.is_active,
            'tenant_id': user.tenant_id,
            'created_at': user.created_at.isoformat() if user.created_at else None
        } for user in users], 200

# Real-time testing endpoint
@api_doc.route('/test')
class APITest(Resource):
    @api_doc.response(200, 'API test successful')
    def get(self):
        """Test endpoint for API connectivity"""
        return {
            'status': 'success',
            'message': 'API is working correctly',
            'timestamp': datetime.utcnow().isoformat(),
            'version': '1.0'
        }, 200

    @api_doc.expect(api_doc.model('TestData', {
        'message': fields.String(description='Test message'),
        'data': fields.Raw(description='Test data')
    }))
    @api_doc.response(200, 'Test data received')
    def post(self):
        """Test endpoint for POST requests"""
        data = request.get_json()
        return {
            'status': 'success',
            'received_data': data,
            'timestamp': datetime.utcnow().isoformat()
        }, 200
