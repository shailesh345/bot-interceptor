# Rules Management API
from flask import request, jsonify, current_app
from app.api import api
from app.models import InterceptorRule, Domain, User, TrafficLog
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json

def get_current_user():
    """Helper function to get current user from JWT token"""
    try:
        user_id = get_jwt_identity()
        return User.query.filter_by(uuid=user_id).first()
    except:
        return None

def validate_rule_conditions(conditions):
    """Validate rule conditions structure"""
    if not isinstance(conditions, list):
        return False
    
    valid_fields = ['user_agent', 'ip', 'ip_range', 'path', 'method', 'country', 'requests_per_minute', 'is_bot', 'bot_type']
    valid_operators = ['equals', 'contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'in', 'regex']
    
    for condition in conditions:
        if not isinstance(condition, dict):
            return False
        
        field = condition.get('field')
        operator = condition.get('operator')
        value = condition.get('value')
        
        if field not in valid_fields:
            return False
        
        if operator not in valid_operators:
            return False
        
        if value is None:
            return False
    
    return True

def validate_rule_actions(actions):
    """Validate rule actions structure"""
    if not isinstance(actions, list):
        return False
    
    valid_action_types = ['block_request', 'allow_request', 'rate_limit', 'redirect', 'challenge', 'log_only']
    
    for action in actions:
        if not isinstance(action, dict):
            return False
        
        action_type = action.get('type')
        if action_type not in valid_action_types:
            return False
    
    return True

@api.route('/rules', methods=['GET'])
@jwt_required()
def get_rules():
    """Get all rules for current user's tenant"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 20, type=int), 100)
        
        # Get filter parameters
        domain_id = request.args.get('domain_id')
        rule_type = request.args.get('rule_type')
        is_active = request.args.get('is_active')
        
        # Get tenant domains
        tenant_domains = Domain.query.filter_by(tenant_id=current_user.tenant_id).all()
        domain_ids = [domain.id for domain in tenant_domains]
        
        if not domain_ids:
            return jsonify({
                'rules': [],
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': 0,
                    'pages': 0,
                    'has_next': False,
                    'has_prev': False
                }
            })
        
        # Build query
        query = InterceptorRule.query.filter(InterceptorRule.domain_id.in_(domain_ids))
        
        # Apply filters
        if domain_id:
            # Find domain by UUID
            domain = Domain.query.filter_by(uuid=domain_id, tenant_id=current_user.tenant_id).first()
            if domain:
                query = query.filter(InterceptorRule.domain_id == domain.id)
        
        if rule_type:
            query = query.filter(InterceptorRule.rule_type == rule_type)
        
        if is_active is not None:
            query = query.filter(InterceptorRule.is_active == (is_active.lower() == 'true'))
        
        # Order by priority and created_at
        query = query.order_by(InterceptorRule.priority.desc(), InterceptorRule.created_at.desc())
        
        # Paginate
        rules = query.paginate(page=page, per_page=per_page, error_out=False)
        
        # Get statistics for each rule
        rule_stats = {}
        for rule in rules.items:
            # Get hits in last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            hits = TrafficLog.query.filter(
                TrafficLog.rule_matched == rule.name,
                TrafficLog.timestamp >= thirty_days_ago
            ).count()
            
            rule_stats[rule.id] = {
                'hits_30_days': hits,
                'last_triggered': None  # Would implement actual last triggered time
            }
        
        return jsonify({
            'rules': [{
                'id': rule.uuid,
                'name': rule.name,
                'description': rule.description,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority,
                'is_active': rule.is_active,
                'domain': {
                    'id': rule.domain.uuid,
                    'name': rule.domain.domain_name
                },
                'stats': rule_stats.get(rule.id, {'hits_30_days': 0, 'last_triggered': None}),
                'created_at': rule.created_at.isoformat(),
                'updated_at': rule.updated_at.isoformat()
            } for rule in rules.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': rules.total,
                'pages': rules.pages,
                'has_next': rules.has_next,
                'has_prev': rules.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get rules: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/rules', methods=['POST'])
@jwt_required()
def create_rule():
    """Create a new rule"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'rule_type', 'conditions', 'actions', 'domain_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Validate domain belongs to user's tenant
        domain = Domain.query.filter_by(
            uuid=data['domain_id'],
            tenant_id=current_user.tenant_id
        ).first()
        
        if not domain:
            return jsonify({'message': 'Domain not found'}), 404
        
        # Validate rule type
        valid_rule_types = ['bot_detection', 'rate_limit', 'content_protection', 'geo_blocking', 'custom']
        if data['rule_type'] not in valid_rule_types:
            return jsonify({'message': 'Invalid rule type'}), 400
        
        # Validate conditions and actions
        if not validate_rule_conditions(data['conditions']):
            return jsonify({'message': 'Invalid rule conditions'}), 400
        
        if not validate_rule_actions(data['actions']):
            return jsonify({'message': 'Invalid rule actions'}), 400
        
        # Check for duplicate rule name within domain
        existing_rule = InterceptorRule.query.filter_by(
            name=data['name'],
            domain_id=domain.id
        ).first()
        
        if existing_rule:
            return jsonify({'message': 'Rule name already exists for this domain'}), 400
        
        # Create rule
        rule = InterceptorRule(
            name=data['name'],
            description=data.get('description', ''),
            rule_type=data['rule_type'],
            conditions=data['conditions'],
            actions=data['actions'],
            priority=data.get('priority', 0),
            is_active=data.get('is_active', True),
            domain_id=domain.id
        )
        
        db.session.add(rule)
        db.session.commit()
        
        return jsonify({
            'rule': {
                'id': rule.uuid,
                'name': rule.name,
                'description': rule.description,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority,
                'is_active': rule.is_active,
                'domain': {
                    'id': domain.uuid,
                    'name': domain.domain_name
                },
                'created_at': rule.created_at.isoformat(),
                'updated_at': rule.updated_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        current_app.logger.error(f"Failed to create rule: {e}")
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/rules/<rule_id>', methods=['GET'])
@jwt_required()
def get_rule(rule_id):
    """Get a specific rule"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get rule and verify it belongs to user's tenant
        rule = db.session.query(InterceptorRule).join(Domain).filter(
            InterceptorRule.uuid == rule_id,
            Domain.tenant_id == current_user.tenant_id
        ).first()
        
        if not rule:
            return jsonify({'message': 'Rule not found'}), 404
        
        # Get rule statistics
        thirty_days_ago = datetime.now() - timedelta(days=30)
        
        # Get hits by day for last 30 days
        daily_hits = db.session.query(
            db.func.date(TrafficLog.timestamp).label('date'),
            db.func.count(TrafficLog.id).label('hits')
        ).filter(
            TrafficLog.rule_matched == rule.name,
            TrafficLog.timestamp >= thirty_days_ago
        ).group_by(db.func.date(TrafficLog.timestamp)).all()
        
        # Get action breakdown
        action_stats = db.session.query(
            TrafficLog.action_taken,
            db.func.count(TrafficLog.id).label('count')
        ).filter(
            TrafficLog.rule_matched == rule.name,
            TrafficLog.timestamp >= thirty_days_ago
        ).group_by(TrafficLog.action_taken).all()
        
        return jsonify({
            'rule': {
                'id': rule.uuid,
                'name': rule.name,
                'description': rule.description,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority,
                'is_active': rule.is_active,
                'domain': {
                    'id': rule.domain.uuid,
                    'name': rule.domain.domain_name
                },
                'created_at': rule.created_at.isoformat(),
                'updated_at': rule.updated_at.isoformat()
            },
            'stats': {
                'total_hits_30_days': sum(hit.hits for hit in daily_hits),
                'daily_hits': [{'date': hit.date.isoformat(), 'hits': hit.hits} for hit in daily_hits],
                'action_breakdown': {action: count for action, count in action_stats}
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get rule: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/rules/<rule_id>', methods=['PUT'])
@jwt_required()
def update_rule(rule_id):
    """Update a rule"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get rule and verify it belongs to user's tenant
        rule = db.session.query(InterceptorRule).join(Domain).filter(
            InterceptorRule.uuid == rule_id,
            Domain.tenant_id == current_user.tenant_id
        ).first()
        
        if not rule:
            return jsonify({'message': 'Rule not found'}), 404
        
        data = request.get_json()
        
        # Validate conditions and actions if provided
        if 'conditions' in data:
            if not validate_rule_conditions(data['conditions']):
                return jsonify({'message': 'Invalid rule conditions'}), 400
        
        if 'actions' in data:
            if not validate_rule_actions(data['actions']):
                return jsonify({'message': 'Invalid rule actions'}), 400
        
        # Update rule fields
        if 'name' in data:
            # Check for duplicate name
            existing_rule = InterceptorRule.query.filter_by(
                name=data['name'],
                domain_id=rule.domain_id
            ).filter(InterceptorRule.id != rule.id).first()
            
            if existing_rule:
                return jsonify({'message': 'Rule name already exists for this domain'}), 400
            
            rule.name = data['name']
        
        if 'description' in data:
            rule.description = data['description']
        
        if 'rule_type' in data:
            valid_rule_types = ['bot_detection', 'rate_limit', 'content_protection', 'geo_blocking', 'custom']
            if data['rule_type'] not in valid_rule_types:
                return jsonify({'message': 'Invalid rule type'}), 400
            rule.rule_type = data['rule_type']
        
        if 'conditions' in data:
            rule.conditions = data['conditions']
        
        if 'actions' in data:
            rule.actions = data['actions']
        
        if 'priority' in data:
            rule.priority = data['priority']
        
        if 'is_active' in data:
            rule.is_active = data['is_active']
        
        rule.updated_at = datetime.now()
        
        db.session.commit()
        
        return jsonify({
            'rule': {
                'id': rule.uuid,
                'name': rule.name,
                'description': rule.description,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority,
                'is_active': rule.is_active,
                'domain': {
                    'id': rule.domain.uuid,
                    'name': rule.domain.domain_name
                },
                'created_at': rule.created_at.isoformat(),
                'updated_at': rule.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to update rule: {e}")
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/rules/<rule_id>', methods=['DELETE'])
@jwt_required()
def delete_rule(rule_id):
    """Delete a rule"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get rule and verify it belongs to user's tenant
        rule = db.session.query(InterceptorRule).join(Domain).filter(
            InterceptorRule.uuid == rule_id,
            Domain.tenant_id == current_user.tenant_id
        ).first()
        
        if not rule:
            return jsonify({'message': 'Rule not found'}), 404
        
        db.session.delete(rule)
        db.session.commit()
        
        return jsonify({'message': 'Rule deleted successfully'}), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to delete rule: {e}")
        db.session.rollback()
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/rules/<rule_id>/test', methods=['POST'])
@jwt_required()
def test_rule(rule_id):
    """Test a rule against sample data"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get rule and verify it belongs to user's tenant
        rule = db.session.query(InterceptorRule).join(Domain).filter(
            InterceptorRule.uuid == rule_id,
            Domain.tenant_id == current_user.tenant_id
        ).first()
        
        if not rule:
            return jsonify({'message': 'Rule not found'}), 404
        
        data = request.get_json()
        
        # Create a test request object
        from app.interceptor.traffic_processor import TrafficRequest
        test_request = TrafficRequest(
            ip_address=data.get('ip_address', '192.168.1.1'),
            user_agent=data.get('user_agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
            method=data.get('method', 'GET'),
            path=data.get('path', '/'),
            headers=data.get('headers', {}),
            domain=rule.domain.domain_name,
            timestamp=datetime.now()
        )
        
        # Test the rule
        from app.interceptor.traffic_processor import traffic_processor
        
        # Simple rule evaluation for testing
        rule_data = {
            'id': rule.uuid,
            'name': rule.name,
            'rule_type': rule.rule_type,
            'conditions': rule.conditions,
            'actions': rule.actions,
            'priority': rule.priority
        }
        
        # Simulate bot detection (simplified)
        is_bot = 'bot' in test_request.user_agent.lower()
        bot_type = 'test_bot' if is_bot else None
        
        # Evaluate rule
        matches = traffic_processor._evaluate_rule(rule_data, test_request, is_bot, bot_type)
        
        if matches:
            action_taken, response_status = traffic_processor._execute_actions(rule.actions)
        else:
            action_taken = 'no_match'
            response_status = 200
        
        return jsonify({
            'rule_matches': matches,
            'action_taken': action_taken,
            'response_status': response_status,
            'test_request': {
                'ip_address': test_request.ip_address,
                'user_agent': test_request.user_agent,
                'method': test_request.method,
                'path': test_request.path,
                'domain': test_request.domain
            },
            'detected_bot': is_bot,
            'bot_type': bot_type
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to test rule: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/rules/templates', methods=['GET'])
@jwt_required()
def get_rule_templates():
    """Get rule templates"""
    templates = [
        {
            'id': 'block_ai_bots',
            'name': 'Block AI Training Bots',
            'description': 'Block common AI training bots like GPTBot, ClaudeBot, etc.',
            'rule_type': 'bot_detection',
            'conditions': [
                {
                    'field': 'user_agent',
                    'operator': 'contains',
                    'value': 'GPTBot',
                    'connector': 'OR'
                },
                {
                    'field': 'user_agent',
                    'operator': 'contains',
                    'value': 'ClaudeBot',
                    'connector': 'OR'
                },
                {
                    'field': 'user_agent',
                    'operator': 'contains',
                    'value': 'ChatGPT',
                    'connector': None
                }
            ],
            'actions': [
                {
                    'type': 'block_request',
                    'value': True
                }
            ]
        },
        {
            'id': 'rate_limit_generic',
            'name': 'Rate Limit (10 requests/minute)',
            'description': 'Limit requests to 10 per minute per IP',
            'rule_type': 'rate_limit',
            'conditions': [
                {
                    'field': 'requests_per_minute',
                    'operator': 'greater_than',
                    'value': 10,
                    'connector': None
                }
            ],
            'actions': [
                {
                    'type': 'rate_limit',
                    'value': {'limit': 10, 'window': 60}
                }
            ]
        },
        {
            'id': 'block_specific_country',
            'name': 'Block Specific Country',
            'description': 'Block traffic from a specific country',
            'rule_type': 'geo_blocking',
            'conditions': [
                {
                    'field': 'country',
                    'operator': 'equals',
                    'value': 'XX',
                    'connector': None
                }
            ],
            'actions': [
                {
                    'type': 'block_request',
                    'value': True
                }
            ]
        }
    ]
    
    return jsonify({'templates': templates}), 200
