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
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        search = request.args.get('search')
        
        # Build query
        query = Domain.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        if search:
            query = query.filter(Domain.name.contains(search))
        
        # Paginate results
        domains = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'domains': [domain.to_dict() for domain in domains.items],
            'total': domains.total,
            'pages': domains.pages,
            'current_page': page,
            'per_page': per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains', methods=['POST'])
@jwt_required()
def create_domain():
    """Create a new domain"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('name'):
            return jsonify({'error': 'Domain name is required'}), 400
        
        domain_name = data['name'].lower().strip()
        
        # Check if domain already exists
        existing_domain = Domain.query.filter_by(
            name=domain_name, 
            user_id=user_id
        ).first()
        
        if existing_domain:
            return jsonify({'error': 'Domain already exists'}), 400
        
        # Validate domain accessibility
        access_result = domain_verification_service.validate_domain_access(domain_name)
        
        # Create domain
        domain = Domain(
            name=domain_name,
            user_id=user_id,
            status='pending',
            verification_method=data.get('verification_method', 'dns'),
            ssl_enabled=data.get('ssl_enabled', True),
            cdn_enabled=data.get('cdn_enabled', False),
            traffic_enabled=data.get('traffic_enabled', True),
            created_at=datetime.utcnow(),
            access_info=json.dumps(access_result)
        )
        
        # Generate verification token
        verification_token = domain_verification_service.generate_verification_token(domain_name)
        domain.verification_token = verification_token
        
        db.session.add(domain)
        db.session.commit()
        
        return jsonify({
            'domain': domain.to_dict(),
            'verification_token': verification_token,
            'verification_instructions': domain_verification_service.get_verification_instructions(
                domain_name, 
                domain.verification_method, 
                verification_token
            )
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>', methods=['GET'])
@jwt_required()
def get_domain(domain_id):
    """Get specific domain details"""
    try:
        user_id = get_jwt_identity()
        domain = Domain.query.filter_by(id=domain_id, user_id=user_id).first()
        
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
        user_id = get_jwt_identity()
        domain = Domain.query.filter_by(id=domain_id, user_id=user_id).first()
        
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
    """Delete domain"""
    try:
        user_id = get_jwt_identity()
        domain = Domain.query.filter_by(id=domain_id, user_id=user_id).first()
        
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
        user_id = get_jwt_identity()
        domain = Domain.query.filter_by(id=domain_id, user_id=user_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        # Perform verification
        verification_result = domain_verification_service.verify_domain_ownership(
            domain.name,
            domain.verification_method,
            domain.verification_token
        )
        
        # Update domain status
        if verification_result['success']:
            domain.status = 'verified'
            domain.verified_at = datetime.utcnow()
        else:
            domain.status = 'failed'
        
        domain.verification_result = json.dumps(verification_result)
        domain.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'domain': domain.to_dict(),
            'verification_result': verification_result
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>/verification-instructions', methods=['GET'])
@jwt_required()
def get_verification_instructions(domain_id):
    """Get verification instructions for domain"""
    try:
        user_id = get_jwt_identity()
        domain = Domain.query.filter_by(id=domain_id, user_id=user_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        instructions = domain_verification_service.get_verification_instructions(
            domain.name,
            domain.verification_method,
            domain.verification_token
        )
        
        return jsonify({
            'domain': domain.name,
            'method': domain.verification_method,
            'token': domain.verification_token,
            'instructions': instructions
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================== RULES MANAGEMENT ENDPOINTS ==================

@rules_bp.route('/rules', methods=['GET'])
@jwt_required()
def get_rules():
    """Get all rules for current user"""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        rule_type = request.args.get('type')
        domain_id = request.args.get('domain_id', type=int)
        
        # Build query
        query = InterceptorRule.query.filter_by(user_id=user_id)
        
        if status:
            query = query.filter_by(status=status)
        
        if rule_type:
            query = query.filter_by(type=rule_type)
        
        if domain_id:
            query = query.filter(InterceptorRule.domains.contains(str(domain_id)))
        
        # Order by priority
        query = query.order_by(InterceptorRule.priority.desc())
        
        # Paginate results
        rules = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        return jsonify({
            'rules': [rule.to_dict() for rule in rules.items],
            'total': rules.total,
            'pages': rules.pages,
            'current_page': page,
            'per_page': per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rules_bp.route('/rules', methods=['POST'])
@jwt_required()
def create_rule():
    """Create a new rule"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('name'):
            return jsonify({'error': 'Rule name is required'}), 400
        
        # Create rule
        rule = InterceptorRule(
            name=data['name'],
            description=data.get('description', ''),
            user_id=user_id,
            type=data.get('type', 'bot_detection'),
            priority=data.get('priority', 1),
            status=data.get('status', 'active'),
            conditions=json.dumps(data.get('conditions', [])),
            actions=json.dumps(data.get('actions', [])),
            domains=json.dumps(data.get('domains', [])),
            created_at=datetime.utcnow()
        )
        
        db.session.add(rule)
        db.session.commit()
        
        return jsonify({'rule': rule.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@rules_bp.route('/rules/<int:rule_id>', methods=['GET'])
@jwt_required()
def get_rule(rule_id):
    """Get specific rule details"""
    try:
        user_id = get_jwt_identity()
        rule = InterceptorRule.query.filter_by(id=rule_id, user_id=user_id).first()
        
        if not rule:
            return jsonify({'error': 'Rule not found'}), 404
        
        return jsonify({'rule': rule.to_dict()})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rules_bp.route('/rules/<int:rule_id>', methods=['PUT'])
@jwt_required()
def update_rule(rule_id):
    """Update rule"""
    try:
        user_id = get_jwt_identity()
        rule = InterceptorRule.query.filter_by(id=rule_id, user_id=user_id).first()
        
        if not rule:
            return jsonify({'error': 'Rule not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            rule.name = data['name']
        if 'description' in data:
            rule.description = data['description']
        if 'type' in data:
            rule.type = data['type']
        if 'priority' in data:
            rule.priority = data['priority']
        if 'status' in data:
            rule.status = data['status']
        if 'conditions' in data:
            rule.conditions = json.dumps(data['conditions'])
        if 'actions' in data:
            rule.actions = json.dumps(data['actions'])
        if 'domains' in data:
            rule.domains = json.dumps(data['domains'])
        
        rule.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'rule': rule.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@rules_bp.route('/rules/<int:rule_id>', methods=['DELETE'])
@jwt_required()
def delete_rule(rule_id):
    """Delete rule"""
    try:
        user_id = get_jwt_identity()
        rule = InterceptorRule.query.filter_by(id=rule_id, user_id=user_id).first()
        
        if not rule:
            return jsonify({'error': 'Rule not found'}), 404
        
        db.session.delete(rule)
        db.session.commit()
        
        return jsonify({'message': 'Rule deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@rules_bp.route('/rules/<int:rule_id>/test', methods=['POST'])
@jwt_required()
def test_rule(rule_id):
    """Test rule against sample requests"""
    try:
        user_id = get_jwt_identity()
        rule = InterceptorRule.query.filter_by(id=rule_id, user_id=user_id).first()
        
        if not rule:
            return jsonify({'error': 'Rule not found'}), 404
        
        data = request.get_json()
        sample_requests = data.get('sample_requests', [])
        
        # Convert rule to dict for testing
        rule_dict = rule.to_dict()
        
        # Test rule
        test_result = traffic_processor.test_rule(rule_dict, sample_requests)
        
        return jsonify({
            'rule': rule_dict,
            'test_result': test_result
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================== TRAFFIC PROCESSING ENDPOINTS ==================

@traffic_bp.route('/traffic/process', methods=['POST'])
@jwt_required()
def process_traffic():
    """Process traffic request through rules engine"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request data is required'}), 400
        
        # Get user's rules
        rules = InterceptorRule.query.filter_by(user_id=user_id, status='active').all()
        rules_data = [rule.to_dict() for rule in rules]
        
        # Process request
        start_time = datetime.utcnow()
        result = traffic_processor.process_request(data, rules_data)
        end_time = datetime.utcnow()
        
        # Calculate processing time
        processing_time = (end_time - start_time).total_seconds() * 1000
        result['processing_time_ms'] = processing_time
        
        # Log traffic (optional)
        if data.get('log_traffic', True):
            traffic_log = TrafficLog(
                user_id=user_id,
                domain=data.get('domain', ''),
                ip=data.get('ip', ''),
                user_agent=data.get('user_agent', ''),
                method=data.get('method', 'GET'),
                path=data.get('path', '/'),
                action=result['final_action'].get('type', 'allow'),
                timestamp=start_time,
                processing_time_ms=processing_time,
                request_data=json.dumps(data),
                response_data=json.dumps(result)
            )
            db.session.add(traffic_log)
            db.session.commit()
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@traffic_bp.route('/traffic/stats', methods=['GET'])
@jwt_required()
def get_traffic_stats():
    """Get current traffic statistics"""
    try:
        stats = traffic_processor.get_traffic_stats()
        return jsonify({'stats': stats})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@traffic_bp.route('/traffic/logs', methods=['GET'])
@jwt_required()
def get_traffic_logs():
    """Get traffic logs for current user"""
    try:
        user_id = get_jwt_identity()
        
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        domain = request.args.get('domain')
        action = request.args.get('action')
        
        # Build query
        query = TrafficLog.query.filter_by(user_id=user_id)
        
        if domain:
            query = query.filter_by(domain=domain)
        
        if action:
            query = query.filter_by(action=action)
        
        # Order by timestamp
        query = query.order_by(TrafficLog.timestamp.desc())
        
        # Paginate results
        logs = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'total': logs.total,
            'pages': logs.pages,
            'current_page': page,
            'per_page': per_page
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
