#!/usr/bin/env python3
"""
Content Protection API
Handles content protection, rate limiting, and anti-scraping measures
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Domain, ContentProtectionRule, ProtectionLog
# from app.utils.auth import admin_required  # Not implemented yet
from app.utils.rate_limiter import RateLimiter
from app.utils.content_fingerprint import ContentFingerprinter
from app.utils.anti_scraping import AntiScrapingEngine
from datetime import datetime, timedelta
import json
import hashlib

content_protection = Blueprint('content_protection', __name__)

# Initialize protection engines
rate_limiter = RateLimiter()
content_fingerprinter = ContentFingerprinter()
anti_scraping = AntiScrapingEngine()

@content_protection.route('/rules', methods=['GET'])
@jwt_required()
def get_protection_rules():
    """Get content protection rules for the user's domains"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's domains
    domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
    domain_ids = [d.id for d in domains]
    
    # Get protection rules for these domains
    rules = ContentProtectionRule.query.filter(
        ContentProtectionRule.domain_id.in_(domain_ids)
    ).all()
    
    return jsonify({
        'rules': [rule.to_dict() for rule in rules],
        'total': len(rules)
    }), 200

@content_protection.route('/rules', methods=['POST'])
@jwt_required()
def create_protection_rule():
    """Create a new content protection rule"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['domain_id', 'rule_type', 'conditions', 'actions']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Verify domain belongs to user's tenant
    domain = Domain.query.filter_by(
        id=data['domain_id'], 
        tenant_id=user.tenant_id
    ).first()
    
    if not domain:
        return jsonify({'error': 'Domain not found or access denied'}), 404
    
    # Create protection rule
    rule = ContentProtectionRule(
        domain_id=data['domain_id'],
        rule_type=data['rule_type'],
        conditions=data['conditions'],
        actions=data['actions'],
        priority=data.get('priority', 'medium'),
        is_active=data.get('is_active', True),
        user_id=current_user_id
    )
    
    db.session.add(rule)
    db.session.commit()
    
    return jsonify({
        'message': 'Protection rule created successfully',
        'rule': rule.to_dict()
    }), 201

@content_protection.route('/rules/<int:rule_id>', methods=['PUT'])
@jwt_required()
def update_protection_rule(rule_id):
    """Update an existing content protection rule"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Get rule and verify ownership
    rule = ContentProtectionRule.query.get(rule_id)
    if not rule:
        return jsonify({'error': 'Rule not found'}), 404
    
    # Verify user has access to this rule
    domain = Domain.query.filter_by(
        id=rule.domain_id, 
        tenant_id=user.tenant_id
    ).first()
    
    if not domain:
        return jsonify({'error': 'Access denied'}), 403
    
    data = request.get_json()
    
    # Update fields
    if 'rule_type' in data:
        rule.rule_type = data['rule_type']
    if 'conditions' in data:
        rule.conditions = data['conditions']
    if 'actions' in data:
        rule.actions = data['actions']
    if 'priority' in data:
        rule.priority = data['priority']
    if 'is_active' in data:
        rule.is_active = data['is_active']
    
    rule.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Protection rule updated successfully',
        'rule': rule.to_dict()
    }), 200

@content_protection.route('/rules/<int:rule_id>', methods=['DELETE'])
@jwt_required()
def delete_protection_rule(rule_id):
    """Delete a content protection rule"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Get rule and verify ownership
    rule = ContentProtectionRule.query.get(rule_id)
    if not rule:
        return jsonify({'error': 'Rule not found'}), 404
    
    # Verify user has access to this rule
    domain = Domain.query.filter_by(
        id=rule.domain_id, 
        tenant_id=user.tenant_id
    ).first()
    
    if not domain:
        return jsonify({'error': 'Access denied'}), 403
    
    db.session.delete(rule)
    db.session.commit()
    
    return jsonify({'message': 'Protection rule deleted successfully'}), 200

@content_protection.route('/protect', methods=['POST'])
def protect_content():
    """Content protection endpoint - called by the interceptor"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    domain_id = data.get('domain_id')
    client_ip = data.get('client_ip')
    user_agent = data.get('user_agent', '')
    request_path = data.get('request_path', '')
    request_method = data.get('request_method', 'GET')
    
    if not all([domain_id, client_ip]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Get domain and its protection rules
    domain = Domain.query.get(domain_id)
    if not domain:
        return jsonify({'error': 'Domain not found'}), 404
    
    # Get active protection rules for this domain
    rules = ContentProtectionRule.query.filter_by(
        domain_id=domain_id,
        is_active=True
    ).order_by(ContentProtectionRule.priority.desc()).all()
    
    protection_result = {
        'allowed': True,
        'actions': [],
        'reason': 'No protection rules matched',
        'rule_matched': None
    }
    
    # Check each rule
    for rule in rules:
        if _evaluate_rule(rule, data):
            protection_result['allowed'] = False
            protection_result['actions'] = rule.actions
            protection_result['reason'] = f'Rule {rule.id} matched'
            protection_result['rule_matched'] = rule.id
            break
    
    # Log protection event
    protection_log = ProtectionLog(
        domain_id=domain_id,
        client_ip=client_ip,
        user_agent=user_agent,
        request_path=request_path,
        request_method=request_method,
        rule_matched=protection_result['rule_matched'],
        action_taken=json.dumps(protection_result['actions']),
        allowed=protection_result['allowed'],
        timestamp=datetime.utcnow()
    )
    
    db.session.add(protection_log)
    db.session.commit()
    
    return jsonify(protection_result), 200

@content_protection.route('/analytics', methods=['GET'])
@jwt_required()
def get_protection_analytics():
    """Get content protection analytics for the user's domains"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get user's domains
    domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
    domain_ids = [d.id for d in domains]
    
    # Get date range from query params
    days = request.args.get('days', 7, type=int)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    # Get protection logs
    logs = ProtectionLog.query.filter(
        ProtectionLog.domain_id.in_(domain_ids),
        ProtectionLog.timestamp >= start_date
    ).all()
    
    # Calculate analytics
    total_requests = len(logs)
    blocked_requests = len([log for log in logs if not log.allowed])
    allowed_requests = total_requests - blocked_requests
    
    # Top blocked IPs
    blocked_ips = {}
    for log in logs:
        if not log.allowed:
            blocked_ips[log.client_ip] = blocked_ips.get(log.client_ip, 0) + 1
    
    top_blocked_ips = sorted(blocked_ips.items(), key=lambda x: x[1], reverse=True)[:10]
    
    # Top blocked user agents
    blocked_user_agents = {}
    for log in logs:
        if not log.allowed and log.user_agent:
            blocked_user_agents[log.user_agent] = blocked_user_agents.get(log.user_agent, 0) + 1
    
    top_blocked_user_agents = sorted(blocked_user_agents.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return jsonify({
        'period': {
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
            'days': days
        },
        'summary': {
            'total_requests': total_requests,
            'allowed_requests': allowed_requests,
            'blocked_requests': blocked_requests,
            'block_rate': (blocked_requests / total_requests * 100) if total_requests > 0 else 0
        },
        'top_blocked_ips': [{'ip': ip, 'count': count} for ip, count in top_blocked_ips],
        'top_blocked_user_agents': [{'user_agent': ua, 'count': count} for ua, count in top_blocked_user_agents]
    }), 200

def _evaluate_rule(rule, request_data):
    """Evaluate if a protection rule matches the request"""
    conditions = rule.conditions
    
    for condition in conditions:
        condition_type = condition.get('type')
        field = condition.get('field')
        operator = condition.get('operator')
        value = condition.get('value')
        
        if not all([condition_type, field, operator, value]):
            continue
        
        request_value = request_data.get(field, '')
        
        if not _evaluate_condition(request_value, operator, value):
            return False
    
    return True

def _evaluate_condition(request_value, operator, expected_value):
    """Evaluate a single condition"""
    if operator == 'equals':
        return str(request_value) == str(expected_value)
    elif operator == 'contains':
        return str(expected_value).lower() in str(request_value).lower()
    elif operator == 'starts_with':
        return str(request_value).startswith(str(expected_value))
    elif operator == 'ends_with':
        return str(request_value).endswith(str(expected_value))
    elif operator == 'regex':
        import re
        try:
            return bool(re.search(expected_value, str(request_value)))
        except:
            return False
    elif operator == 'in':
        return str(request_value) in expected_value if isinstance(expected_value, list) else False
    elif operator == 'not_in':
        return str(request_value) not in expected_value if isinstance(expected_value, list) else False
    
    return False
