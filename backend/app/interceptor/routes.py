# Interceptor Routes
from flask import request, jsonify, redirect
from app.interceptor import interceptor
from app.models import Domain, TrafficLog, InterceptorRule
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from .llm_bot_detector import llm_bot_detector
from ..models_enhanced import LLMBotDetection, Organization, CreditBalance

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


@interceptor.route('/intercept', methods=['POST'])
def intercept_request():
    """Main interception endpoint for all incoming traffic with LLM bot detection"""
    try:
        # Get request data
        request_data = {
            'client_ip': request.headers.get('X-Forwarded-For', request.remote_addr),
            'user_agent': request.headers.get('User-Agent', ''),
            'request_path': request.args.get('path', '/'),
            'request_method': request.method,
            'headers': dict(request.headers),
            'timestamp': datetime.utcnow()
        }
        
        # Get domain being accessed
        domain_name = request.args.get('domain')
        if not domain_name:
            return jsonify({'error': 'Domain parameter required'}), 400
        
        domain = Domain.query.filter_by(domain_name=domain_name).first()
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        # Perform LLM bot detection
        detection_result = llm_bot_detector.detect_llm_bot(request_data)
        
        # Log traffic
        traffic_log = TrafficLog(
            domain_id=domain.id,
            client_ip=request_data['client_ip'],
            user_agent=request_data['user_agent'],
            request_method=request_data['request_method'],
            request_path=request_data['request_path'],
            is_bot=detection_result['is_llm_bot'],
            bot_type=detection_result.get('bot_company'),
            timestamp=request_data['timestamp']
        )
        db.session.add(traffic_log)
        
        # Handle LLM bot detection
        if detection_result['is_llm_bot']:
            # Log LLM bot detection
            llm_detection = LLMBotDetection(
                domain_id=domain.id,
                timestamp=datetime.utcnow(),
                ip_address=request_data['client_ip'],
                user_agent=request_data['user_agent'],
                request_path=request_data['request_path'],
                request_method=request_data['request_method'],
                is_llm_bot=True,
                confidence=detection_result['confidence'],
                bot_company=detection_result.get('bot_company'),
                bot_type=detection_result.get('bot_type'),
                detection_methods=detection_result.get('detection_methods', []),
                evidence=detection_result.get('evidence', {}),
                action_taken='checking_credits'
            )
            db.session.add(llm_detection)
            db.session.flush()
            
            # Check if bot company has credits
            bot_company = detection_result.get('bot_company')
            if bot_company:
                org = Organization.query.filter_by(name=bot_company).first()
                
                if org:
                    # Check credit balance
                    balance = CreditBalance.query.filter_by(organization_id=org.id).first()
                    
                    if balance and balance.remaining_credits > 0:
                        # Deduct credit and allow access
                        balance.used_credits += 1
                        balance.remaining_credits -= 1
                        balance.last_used_at = datetime.utcnow()
                        
                        llm_detection.action_taken = 'allowed_with_credit'
                        llm_detection.credits_charged = 1
                        llm_detection.organization_id = org.id
                        
                        traffic_log.action_taken = 'allowed'
                        traffic_log.response_status = 200
                        
                        db.session.commit()
                        
                        return jsonify({
                            'allowed': True,
                            'message': 'Access granted. Credit deducted.',
                            'remaining_credits': balance.remaining_credits,
                            'bot_company': bot_company
                        }), 200
                
                # No credits or no organization - redirect to purchase
                llm_detection.action_taken = 'redirected_to_purchase'
                traffic_log.action_taken = 'blocked'
                traffic_log.response_status = 403
                
                db.session.commit()
                
                # Send automated outreach email (async)
                if bot_company and bot_company != 'Unknown AI Company':
                    # This would be done asynchronously in production
                    from app.api.credit_purchase import automated_company_outreach
                    outreach_data = {
                        'company_name': bot_company,
                        'detection_evidence': detection_result.get('evidence', {}),
                        'bot_type': detection_result.get('bot_type'),
                        'detection_count': 1
                    }
                    # In production, use Celery or similar for async
                    # automated_company_outreach(outreach_data)
                
                # Return redirect URL for credit purchase
                purchase_url = f"/purchase-credits?company={bot_company}&bot_redirect=true"
                
                return jsonify({
                    'allowed': False,
                    'is_llm_bot': True,
                    'bot_company': bot_company,
                    'redirect_url': purchase_url,
                    'message': 'LLM bot detected. Please purchase credits to continue.',
                    'detection_confidence': detection_result['confidence'],
                    'recommendations': detection_result.get('recommendations', [])
                }), 403
        
        # Not an LLM bot - allow normal traffic
        traffic_log.action_taken = 'allowed'
        traffic_log.response_status = 200
        db.session.commit()
        
        return jsonify({
            'allowed': True,
            'is_llm_bot': False,
            'message': 'Access granted'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@interceptor.route('/llm-detections', methods=['GET'])
@jwt_required()
def get_llm_detections():
    """Get LLM bot detection history"""
    try:
        from app.models import User
        current_user = User.query.filter_by(uuid=get_jwt_identity()).first()
        if not current_user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Get filters
        domain_id = request.args.get('domain_id', type=int)
        bot_company = request.args.get('bot_company')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = LLMBotDetection.query.join(Domain).filter(
            Domain.tenant_id == current_user.tenant_id
        )
        
        if domain_id:
            query = query.filter(LLMBotDetection.domain_id == domain_id)
        if bot_company:
            query = query.filter(LLMBotDetection.bot_company == bot_company)
        if start_date:
            query = query.filter(LLMBotDetection.timestamp >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(LLMBotDetection.timestamp <= datetime.fromisoformat(end_date))
        
        # Get detections with pagination
        detections = query.order_by(LLMBotDetection.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Get summary statistics
        total_detections = query.count()
        unique_companies = db.session.query(LLMBotDetection.bot_company).filter(
            LLMBotDetection.bot_company.isnot(None)
        ).distinct().count()
        
        return jsonify({
            'detections': [detection.to_dict() for detection in detections.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': detections.total,
                'pages': detections.pages
            },
            'summary': {
                'total_detections': total_detections,
                'unique_companies': unique_companies,
                'top_companies': _get_top_bot_companies(current_user.tenant_id)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Error fetching LLM detections', 'error': str(e)}), 500


def _get_top_bot_companies(tenant_id):
    """Get top detected bot companies"""
    from sqlalchemy import func
    
    results = db.session.query(
        LLMBotDetection.bot_company,
        func.count(LLMBotDetection.id).label('count')
    ).join(Domain).filter(
        Domain.tenant_id == tenant_id,
        LLMBotDetection.bot_company.isnot(None)
    ).group_by(LLMBotDetection.bot_company).order_by(
        func.count(LLMBotDetection.id).desc()
    ).limit(5).all()
    
    return [{
        'company': company,
        'count': count
    } for company, count in results]
