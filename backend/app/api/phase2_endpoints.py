"""
Enhanced API endpoints for Phase 2: Domain & Rules Management
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json
from ..models import Domain, InterceptorRule, User, TrafficLog
from ..interceptor.domain_verification_enhanced import domain_verification_service
from ..interceptor.traffic_processor_enhanced import traffic_processor
from .. import db

# Create blueprints
domains_bp = Blueprint('domains', __name__)
rules_bp = Blueprint('rules', __name__)
traffic_bp = Blueprint('traffic', __name__)

# ================== DOMAIN MANAGEMENT ENDPOINTS ==================

@domains_bp.route('/domains', methods=['GET'])
@jwt_required()
def get_domains():
    """Get all domains for current user"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        return jsonify({
            'domains': [domain.to_dict() for domain in domains]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains', methods=['POST'])
@jwt_required()
def create_domain():
    """Create a new domain"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data or 'domain_name' not in data:
            return jsonify({'error': 'Domain name is required'}), 400
        
        domain_name = data['domain_name'].strip().lower()
        
        # Check if domain already exists
        existing_domain = Domain.query.filter_by(domain_name=domain_name).first()
        if existing_domain:
            return jsonify({'error': 'Domain already exists'}), 409
        
        # Create new domain
        domain = Domain(
            domain_name=domain_name,
            tenant_id=user.tenant_id,
            ssl_enabled=data.get('ssl_enabled', False),
            cdn_enabled=data.get('cdn_enabled', False),
            traffic_enabled=data.get('traffic_enabled', True),
            verification_method=data.get('verification_method', 'dns'),
            status='pending',
            created_at=datetime.utcnow()
        )
        
        db.session.add(domain)
        db.session.commit()
        
        return jsonify({
            'message': 'Domain created successfully',
            'domain': domain.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating domain: {str(e)}")
        current_app.logger.error(f"User tenant_id: {user.tenant_id}")
        current_app.logger.error(f"Request data: {data}")
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>', methods=['GET'])
@jwt_required()
def get_domain(domain_id):
    """Get a specific domain"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        return jsonify({'domain': domain.to_dict()})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>', methods=['PUT'])
@jwt_required()
def update_domain(domain_id):
    """Update domain settings"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'ssl_enabled' in data:
            domain.ssl_enabled = data['ssl_enabled']
        if 'cdn_enabled' in data:
            domain.cdn_enabled = data['cdn_enabled']
        if 'traffic_enabled' in data:
            domain.traffic_enabled = data['traffic_enabled']
        if 'verification_method' in data:
            domain.verification_method = data['verification_method']
        
        domain.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'domain': domain.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>', methods=['DELETE'])
@jwt_required()
def delete_domain(domain_id):
    """Delete a domain"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        db.session.delete(domain)
        db.session.commit()
        
        return jsonify({'message': 'Domain deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>/verify', methods=['POST'])
@jwt_required()
def verify_domain(domain_id):
    """Verify domain ownership"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        # For now, just mark as verified (in production, this would check DNS records, etc.)
        domain.is_verified = True
        domain.status = 'verified'
        domain.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Domain verified successfully',
            'domain': domain.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ================== INTERCEPTOR RULES MANAGEMENT ==================

@rules_bp.route('/rules', methods=['GET'])
@jwt_required()
def get_rules():
    """Get all rules for current user"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        rules = InterceptorRule.query.filter_by(tenant_id=user.tenant_id).all()
        return jsonify({
            'rules': [rule.to_dict() for rule in rules]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rules_bp.route('/rules', methods=['POST'])
@jwt_required()
def create_rule():
    """Create a new interceptor rule"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['domain_id', 'rule_type', 'conditions']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Verify domain ownership
        domain = Domain.query.filter_by(id=data['domain_id'], tenant_id=user.tenant_id).first()
        if not domain:
            return jsonify({'error': 'Domain not found or not owned by user'}), 404
        
        # Create new rule
        rule = InterceptorRule(
            tenant_id=user.tenant_id,
            domain_id=data['domain_id'],
            rule_type=data['rule_type'],
            conditions=json.dumps(data['conditions']),
            actions=json.dumps(data.get('actions', {})),
            priority=data.get('priority', 100),
            enabled=data.get('enabled', True),
            created_at=datetime.utcnow()
        )
        
        db.session.add(rule)
        db.session.commit()
        
        return jsonify({
            'message': 'Rule created successfully',
            'rule': rule.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# Export blueprints
__all__ = ['domains_bp', 'rules_bp', 'traffic_bp']