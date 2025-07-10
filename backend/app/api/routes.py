# API Routes
from flask import request, jsonify
from app.api import api
from app.models import Domain, TrafficLog, BotProfile
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

@api.route('/domains', methods=['GET'])
@jwt_required()
def get_domains():
    """Get all domains for current user's tenant"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    domains = Domain.query.filter_by(tenant_id=current_user.tenant_id).all()
    
    return jsonify({
        'domains': [{
            'id': domain.uuid,
            'domain_name': domain.domain_name,
            'is_verified': domain.is_verified,
            'status': domain.status,
            'created_at': domain.created_at.isoformat(),
            'ssl_enabled': domain.ssl_enabled
        } for domain in domains]
    }), 200

@api.route('/domains', methods=['POST'])
@jwt_required()
def create_domain():
    """Create a new domain"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('domain_name'):
        return jsonify({'message': 'Domain name is required'}), 400
    
    # Check if domain already exists
    existing_domain = Domain.query.filter_by(
        domain_name=data['domain_name'],
        tenant_id=current_user.tenant_id
    ).first()
    
    if existing_domain:
        return jsonify({'message': 'Domain already exists'}), 400
    
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
