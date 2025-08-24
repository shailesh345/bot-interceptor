# API Routes
from flask import request, jsonify
from app.api import api
from app.models import Domain, TrafficLog, BotProfile, User, InterceptorRule
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import asyncio
import re

# Import Phase 2 modules
from .phase2_endpoints import domains_bp, rules_bp, traffic_bp

# Import analytics and export modules
from .analytics import analytics
from .export import export
from .notifications import notifications
from .real_time import real_time
from .ml_management import ml_management

# Register Phase 2 blueprints
api.register_blueprint(domains_bp, url_prefix='/v1')
api.register_blueprint(rules_bp, url_prefix='/v1')
api.register_blueprint(traffic_bp, url_prefix='/v1')

# Register analytics, export, and notifications blueprints
api.register_blueprint(analytics, url_prefix='/analytics')
api.register_blueprint(export, url_prefix='/export')
api.register_blueprint(notifications, url_prefix='/notifications')
api.register_blueprint(real_time, url_prefix='/real-time')
api.register_blueprint(ml_management, url_prefix='/ml')

def get_current_user():
    """Helper function to get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        return User.query.filter_by(uuid=user_id).first()
    except:
        return None

def validate_domain_name(domain_name):
    """Validate domain name format"""
    if not domain_name:
        return False
    
    # Basic domain name validation
    domain_regex = re.compile(
        r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
    )
    return domain_regex.match(domain_name) is not None

@api.route('/domains', methods=['GET'])
@jwt_required()
def get_domains():
    """Get all domains for current user's tenant"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Get filter parameters
        status = request.args.get('status')
        search = request.args.get('search')
        
        # Build query
        query = Domain.query.filter_by(tenant_id=current_user.tenant_id)
        
        # Apply filters
        if status:
            query = query.filter(Domain.status == status)
        
        if search:
            query = query.filter(Domain.domain_name.ilike(f'%{search}%'))
        
        # Order by created_at descending
        query = query.order_by(Domain.created_at.desc())
        
        # Paginate
        domains = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Get traffic statistics for each domain
        domain_stats = {}
        for domain in domains.items:
            # Get basic stats from last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            stats = db.session.query(
                db.func.count(TrafficLog.id).label('total_requests'),
                db.func.sum(db.case([(TrafficLog.action_taken == 'block', 1)], else_=0)).label('blocked_requests'),
                db.func.sum(db.case([(TrafficLog.is_bot == True, 1)], else_=0)).label('bot_requests')
            ).filter(
                TrafficLog.domain_id == domain.id,
                TrafficLog.timestamp >= thirty_days_ago
            ).first()
            
            domain_stats[domain.id] = {
                'total_requests': stats.total_requests or 0,
                'blocked_requests': stats.blocked_requests or 0,
                'bot_requests': stats.bot_requests or 0,
                'revenue': 0  # Placeholder for revenue calculation
            }
        
        return jsonify({
            'domains': [{
                'id': domain.uuid,
                'name': domain.domain_name,
                'domain_name': domain.domain_name,
                'is_verified': domain.is_verified,
                'status': domain.status,
                'ssl_enabled': domain.ssl_enabled,
                'created_at': domain.created_at.isoformat(),
                'updated_at': domain.updated_at.isoformat(),
                'verification_token': domain.verification_token,
                'stats': domain_stats.get(domain.id, {})
            } for domain in domains.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': domains.total,
                'pages': domains.pages,
                'has_next': domains.has_next,
                'has_prev': domains.has_prev
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/domains', methods=['POST'])
@jwt_required()
def create_domain():
    """Create a new domain"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        data = request.get_json()
        
        domain_name = data.get('domain_name', '').strip().lower()
        verification_method = data.get('verification_method', 'dns')
        
        # Validate input
        if not domain_name:
            return jsonify({'message': 'Domain name is required'}), 400
        
        if not validate_domain_name(domain_name):
            return jsonify({'message': 'Invalid domain name format'}), 400
        
        if verification_method not in ['dns', 'file']:
            return jsonify({'message': 'Invalid verification method'}), 400
        
        # Check if domain already exists
        existing_domain = Domain.query.filter_by(
            domain_name=domain_name,
            tenant_id=current_user.tenant_id
        ).first()
        
        if existing_domain:
            return jsonify({'message': 'Domain already exists'}), 400
        
        # Generate verification token
        from app.interceptor.domain_verification import domain_verification_service
        verification_token = domain_verification_service.generate_verification_token(
            domain_name, current_user.uuid
        )
        
        # Create domain
        domain = Domain(
            domain_name=domain_name,
            tenant_id=current_user.tenant_id,
            verification_token=verification_token,
            status='pending',
            is_verified=False
        )
        
        db.session.add(domain)
        db.session.commit()
        
        # Get verification instructions
        instructions = domain_verification_service.get_domain_verification_instructions(
            domain_name, verification_method, verification_token
        )
        
        return jsonify({
            'domain': {
                'id': domain.uuid,
                'name': domain.domain_name,
                'status': domain.status,
                'is_verified': domain.is_verified,
                'verification_method': verification_method,
                'created_at': domain.created_at.isoformat()
            },
            'verification': instructions
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/domains/<domain_id>', methods=['GET'])
@jwt_required()
def get_domain(domain_id):
    """Get a specific domain"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        domain = Domain.query.filter_by(
            uuid=domain_id,
            tenant_id=current_user.tenant_id
        ).first()
        
        if not domain:
            return jsonify({'message': 'Domain not found'}), 404
        
        # Get domain statistics
        thirty_days_ago = datetime.now() - timedelta(days=30)
        stats = db.session.query(
            db.func.count(TrafficLog.id).label('total_requests'),
            db.func.sum(db.case([(TrafficLog.action_taken == 'block', 1)], else_=0)).label('blocked_requests'),
            db.func.sum(db.case([(TrafficLog.is_bot == True, 1)], else_=0)).label('bot_requests')
        ).filter(
            TrafficLog.domain_id == domain.id,
            TrafficLog.timestamp >= thirty_days_ago
        ).first()
        
        # Get domain rules
        rules = InterceptorRule.query.filter_by(domain_id=domain.id).all()
        
        # Get domain health check
        from app.interceptor.domain_verification import domain_verification_service
        health_info = domain_verification_service.check_domain_health(domain.domain_name)
        
        return jsonify({
            'domain': {
                'id': domain.uuid,
                'name': domain.domain_name,
                'status': domain.status,
                'is_verified': domain.is_verified,
                'ssl_enabled': domain.ssl_enabled,
                'created_at': domain.created_at.isoformat(),
                'updated_at': domain.updated_at.isoformat(),
                'verification_token': domain.verification_token
            },
            'stats': {
                'total_requests': stats.total_requests or 0,
                'blocked_requests': stats.blocked_requests or 0,
                'bot_requests': stats.bot_requests or 0,
                'allowed_requests': (stats.total_requests or 0) - (stats.blocked_requests or 0)
            },
            'rules': [{
                'id': rule.uuid,
                'name': rule.name,
                'type': rule.rule_type,
                'is_active': rule.is_active,
                'created_at': rule.created_at.isoformat()
            } for rule in rules],
            'health': health_info
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/domains/<domain_id>/verify', methods=['POST'])
@jwt_required()
def verify_domain(domain_id):
    """Verify domain ownership"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        domain = Domain.query.filter_by(
            uuid=domain_id,
            tenant_id=current_user.tenant_id
        ).first()
        
        if not domain:
            return jsonify({'message': 'Domain not found'}), 404
        
        if domain.is_verified:
            return jsonify({'message': 'Domain already verified'}), 400
        
        data = request.get_json()
        method = data.get('method', 'dns')
        
        if method not in ['dns', 'file']:
            return jsonify({'message': 'Invalid verification method'}), 400
        
        # Perform verification
        from app.interceptor.domain_verification import domain_verification_service
        
        # Run async verification
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(
                domain_verification_service.verify_domain_ownership(
                    domain.domain_name, method, domain.verification_token
                )
            )
        finally:
            loop.close()
        
        # Update domain status
        domain_verification_service.update_domain_verification_status(domain.id, result)
        
        # Refresh domain from database
        db.session.refresh(domain)
        
        return jsonify({
            'verified': result.success,
            'method': result.method,
            'message': result.message,
            'details': result.details,
            'domain': {
                'id': domain.uuid,
                'name': domain.domain_name,
                'status': domain.status,
                'is_verified': domain.is_verified,
                'updated_at': domain.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/domains/<domain_id>', methods=['DELETE'])
@jwt_required()
def delete_domain(domain_id):
    """Delete a domain"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        domain = Domain.query.filter_by(
            uuid=domain_id,
            tenant_id=current_user.tenant_id
        ).first()
        
        if not domain:
            return jsonify({'message': 'Domain not found'}), 404
        
        # Delete associated data
        InterceptorRule.query.filter_by(domain_id=domain.id).delete()
        TrafficLog.query.filter_by(domain_id=domain.id).delete()
        
        # Delete domain
        db.session.delete(domain)
        db.session.commit()
        
        return jsonify({'message': 'Domain deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500
    
    domain = Domain(
        domain_name=data['domain_name'],
        tenant_id=current_user.tenant_id,
        verification_token=generate_verification_token()
    )
    
    db.session.add(domain)
    db.session.commit()
    
    return jsonify({
        'message': 'Domain created successfully',
        'domain': {
            'id': domain.uuid,
            'domain_name': domain.domain_name,
            'verification_token': domain.verification_token,
            'status': domain.status
        }
    }), 201

@api.route('/bot-profiles', methods=['GET'])
@jwt_required()
def get_bot_profiles():
    """Get all bot profiles"""
    profiles = BotProfile.query.all()
    
    return jsonify({
        'bot_profiles': [{
            'id': profile.uuid,
            'name': profile.name,
            'bot_type': profile.bot_type,
            'is_verified': profile.is_verified,
            'is_allowed': profile.is_allowed,
            'user_agent_patterns': profile.user_agent_patterns,
            'created_at': profile.created_at.isoformat()
        } for profile in profiles]
    }), 200

def get_current_user():
    """Helper function to get current user"""
    from app.models import User
    current_user_uuid = get_jwt_identity()
    return User.query.filter_by(uuid=current_user_uuid).first()

def generate_verification_token():
    """Generate domain verification token"""
    import secrets
    return secrets.token_urlsafe(32)
