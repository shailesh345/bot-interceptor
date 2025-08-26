# Interceptor Routes
from flask import request, jsonify
from app.interceptor import interceptor
from app.models import Domain, TrafficLog, InterceptorRule
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

@interceptor.route('/traffic', methods=['GET'])
@jwt_required()
def get_traffic_data():
    """Get traffic data for user's domains"""
    try:
        from app.models import User
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
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
        
        return jsonify([{
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
        } for log in logs.items]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching traffic data', 'error': str(e)}), 500

@interceptor.route('/rules', methods=['GET'])
@jwt_required()
def get_interceptor_rules():
    """Get interceptor rules for user's domains"""
    try:
        from app.models import User
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        rules = InterceptorRule.query.join(Domain).filter(Domain.tenant_id == current_user.tenant_id).all()
        
        return jsonify([{
            'id': rule.uuid,
            'name': rule.name,
            'description': rule.description,
            'rule_type': rule.rule_type,
            'conditions': rule.conditions,
            'actions': rule.actions,
            'is_active': rule.is_active,
            'priority': rule.priority,
            'domain_id': rule.domain_id,
            'created_at': rule.created_at.isoformat() if rule.created_at else None
        } for rule in rules]), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching interceptor rules', 'error': str(e)}), 500

@interceptor.route('/rules', methods=['POST'])
@jwt_required()
def create_interceptor_rule():
    """Create a new interceptor rule"""
    try:
        from app.models import User
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        data = request.get_json()
        if not data or not data.get('name') or not data.get('rule_type'):
            return jsonify({'message': 'Name and rule_type are required'}), 400
        
        # Verify domain belongs to user
        domain = Domain.query.filter_by(
            id=data.get('domain_id'),
            tenant_id=current_user.tenant_id
        ).first()
        
        if not domain:
            return jsonify({'message': 'Domain not found or access denied'}), 404
        
        rule = InterceptorRule(
            name=data['name'],
            description=data.get('description'),
            rule_type=data['rule_type'],
            conditions=data.get('conditions', {}),
            actions=data.get('actions', {}),
            is_active=data.get('is_active', True),
            priority=data.get('priority', 1),
            domain_id=domain.id
        )
        
        db.session.add(rule)
        db.session.commit()
        
        return jsonify({
            'message': 'Interceptor rule created successfully',
            'rule_id': rule.uuid
        }), 201
    except Exception as e:
        return jsonify({'message': 'Error creating interceptor rule', 'error': str(e)}), 500

@interceptor.route('/stats', methods=['GET'])
@jwt_required()
def get_interceptor_stats():
    """Get interceptor statistics"""
    try:
        from app.models import User
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get time range
        days = request.args.get('days', 7, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=current_user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        if not domain_ids:
            return jsonify({
                'total_requests': 0,
                'bot_requests': 0,
                'blocked_requests': 0,
                'avg_response_time': 0
            }), 200
        
        # Get traffic data
        traffic_logs = TrafficLog.query.filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date,
            TrafficLog.timestamp <= end_date
        ).all()
        
        total_requests = len(traffic_logs)
        bot_requests = len([log for log in traffic_logs if log.bot_detected])
        blocked_requests = len([log for log in traffic_logs if log.response_status == 403])
        avg_response_time = sum(log.response_time for log in traffic_logs) / total_requests if total_requests > 0 else 0
        
        return jsonify({
            'total_requests': total_requests,
            'bot_requests': bot_requests,
            'blocked_requests': blocked_requests,
            'avg_response_time': round(avg_response_time, 3)
        }), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching interceptor stats', 'error': str(e)}), 500
