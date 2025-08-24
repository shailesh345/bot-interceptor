"""
Traffic Interception API Endpoints
Provides REST API for traffic interception, bot detection, and content protection
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json
import time
from app.interceptor.traffic_interceptor import get_traffic_interceptor
from app.interceptor.ml_bot_classifier import get_ml_bot_classifier
from app.interceptor.content_protection import get_content_protection
from app.interceptor.realtime_processor import get_realtime_processor
from app.models import User, Domain, TrafficLog
from app import db

# Create blueprint
traffic_interception_bp = Blueprint('traffic_interception', __name__, url_prefix='/api/traffic')

@traffic_interception_bp.route('/intercept', methods=['POST'])
@jwt_required()
def intercept_traffic():
    """Intercept and process incoming traffic"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract required fields
        required_fields = ['method', 'url', 'headers', 'client_ip', 'user_agent']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Parse URL to get domain and path
        from urllib.parse import urlparse, parse_qsl
        parsed_url = urlparse(data['url'])
        domain = parsed_url.netloc
        path = parsed_url.path
        query_params = dict(parse_qsl(parsed_url.query))
        
        # Create intercepted request object
        from app.interceptor.traffic_interceptor import InterceptedRequest
        intercepted_request = InterceptedRequest(
            method=data['method'],
            url=data['url'],
            headers=data['headers'],
            body=data.get('body'),
            client_ip=data['client_ip'],
            user_agent=data['user_agent'],
            timestamp=datetime.now(),
            domain=domain,
            path=path,
            query_params=query_params
        )
        
        # Process through traffic interceptor
        interceptor = get_traffic_interceptor()
        interception_result = interceptor.intercept_request(intercepted_request)
        
        # Add to real-time processor
        processor = get_realtime_processor()
        processor.add_traffic_data({
            'domain': domain,
            'timestamp': intercepted_request.timestamp,
            'is_bot': interception_result.bot_detected,
            'response_status': interception_result.response_status,
            'processing_time': interception_result.processing_time,
            'action_taken': interception_result.action_taken,
            'client_ip': data['client_ip'],
            'user_agent': data['user_agent'],
            'path': path,
            'method': data['method']
        })
        
        # Return result
        return jsonify({
            'success': True,
            'interception_result': {
                'should_proxy': interception_result.should_proxy,
                'response_status': interception_result.response_status,
                'action_taken': interception_result.action_taken,
                'bot_detected': interception_result.bot_detected,
                'bot_type': interception_result.bot_type,
                'rule_matched': interception_result.rule_matched,
                'processing_time': interception_result.processing_time,
                'geo_location': interception_result.geo_location
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Traffic interception failed: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@traffic_interception_bp.route('/classify', methods=['POST'])
@jwt_required()
def classify_bot():
    """Classify if a request is from a bot using ML"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract required fields
        required_fields = ['client_ip', 'user_agent', 'headers', 'path', 'method']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Add timestamp
        data['timestamp'] = datetime.now()
        
        # Classify using ML
        classifier = get_ml_bot_classifier()
        is_bot, confidence, bot_type = classifier.classify_bot(data)
        
        return jsonify({
            'success': True,
            'classification': {
                'is_bot': is_bot,
                'confidence': confidence,
                'bot_type': bot_type,
                'timestamp': data['timestamp'].isoformat()
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Bot classification failed: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@traffic_interception_bp.route('/protect', methods=['POST'])
@jwt_required()
def protect_content():
    """Apply content protection measures"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Extract required fields
        required_fields = ['method', 'path', 'headers', 'client_ip', 'user_agent']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get domain from user's tenant
        domain = None
        if user.tenant_id:
            tenant_domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
            if tenant_domains:
                domain = tenant_domains[0].domain_name
        
        if not domain:
            domain = 'default'
        
        # Apply content protection
        protector = get_content_protection()
        protection_result = protector.protect_content(data, domain)
        
        return jsonify({
            'success': True,
            'protection_result': {
                'is_allowed': protection_result.is_allowed,
                'protection_level': protection_result.protection_level,
                'action_taken': protection_result.action_taken,
                'response_status': protection_result.response_status,
                'challenge_required': protection_result.challenge_required,
                'challenge_type': protection_result.challenge_type,
                'processing_time': protection_result.processing_time
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Content protection failed: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@traffic_interception_bp.route('/metrics/realtime', methods=['GET'])
@jwt_required()
def get_real_time_metrics():
    """Get real-time traffic metrics"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get domain parameter
        domain = request.args.get('domain')
        
        # Get real-time metrics
        processor = get_realtime_processor()
        metrics = processor.get_real_time_metrics(domain)
        
        return jsonify({
            'success': True,
            'metrics': {
                'total_requests': metrics.total_requests,
                'bot_requests': metrics.bot_requests,
                'human_requests': metrics.human_requests,
                'blocked_requests': metrics.blocked_requests,
                'avg_response_time': metrics.avg_response_time,
                'requests_per_second': metrics.requests_per_second,
                'top_user_agents': metrics.top_user_agents,
                'top_ips': metrics.top_ips,
                'top_paths': metrics.top_paths,
                'error_rate': metrics.error_rate,
                'timestamp': metrics.timestamp.isoformat()
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get real-time metrics: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@traffic_interception_bp.route('/metrics/domain/<domain_name>', methods=['GET'])
@jwt_required()
def get_domain_metrics(domain_name):
    """Get metrics for a specific domain"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if user has access to this domain
        if user.tenant_id:
            domain = Domain.query.filter_by(
                domain_name=domain_name,
                tenant_id=user.tenant_id
            ).first()
            if not domain:
                return jsonify({'error': 'Domain not found or access denied'}), 404
        
        # Get time range parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date:
            start_date = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        # Get domain metrics from Redis
        redis_client = current_app.redis_client
        domain_key = f"domain_metrics:{domain_name}"
        metrics = redis_client.hgetall(domain_key)
        
        # Get time series data
        daily_metrics = {}
        hourly_metrics = {}
        
        current_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date_obj = datetime.strptime(end_date, '%Y-%m-%d')
        
        while current_date <= end_date_obj:
            date_str = current_date.strftime('%Y-%m-%d')
            
            # Daily metrics
            daily_key = f"daily_metrics:{domain_name}:{date_str}"
            daily_data = redis_client.hgetall(daily_key)
            if daily_data:
                daily_metrics[date_str] = {
                    'total_requests': int(daily_data.get(b'total_requests', 0)),
                    'bot_requests': int(daily_data.get(b'bot_requests', 0)),
                    'blocked_requests': int(daily_data.get(b'blocked_requests', 0))
                }
            
            # Hourly metrics for the last 24 hours
            if current_date.date() == datetime.now().date():
                for hour in range(24):
                    hour_str = f"{date_str}:{hour:02d}"
                    hourly_key = f"hourly_metrics:{domain_name}:{hour_str}"
                    hourly_data = redis_client.hgetall(hourly_key)
                    if hourly_data:
                        hourly_metrics[hour_str] = {
                            'total_requests': int(hourly_data.get(b'total_requests', 0)),
                            'bot_requests': int(hourly_data.get(b'bot_requests', 0)),
                            'blocked_requests': int(hourly_data.get(b'blocked_requests', 0))
                        }
            
            current_date += timedelta(days=1)
        
        # Get top statistics
        processor = get_realtime_processor()
        top_user_agents = processor._get_top_items(f"user_agent_stats:{domain_name}", 10)
        top_ips = processor._get_top_items(f"ip_stats:{domain_name}", 10)
        top_paths = processor._get_top_items(f"path_stats:{domain_name}", 10)
        
        return jsonify({
            'success': True,
            'domain': domain_name,
            'metrics': {
                'current': {
                    'total_requests': int(metrics.get(b'total_requests', 0)),
                    'bot_requests': int(metrics.get(b'bot_requests', 0)),
                    'blocked_requests': int(metrics.get(b'blocked_requests', 0)),
                    'avg_response_time': float(metrics.get(b'avg_response_time', 0.0)),
                    'bot_rate': float(metrics.get(b'bot_rate', 0.0)),
                    'blocked_rate': float(metrics.get(b'blocked_rate', 0.0))
                },
                'daily': daily_metrics,
                'hourly': hourly_metrics,
                'top_user_agents': top_user_agents,
                'top_ips': top_ips,
                'top_paths': top_paths
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get domain metrics: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@traffic_interception_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    """Get current alerts"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get domain parameter
        domain = request.args.get('domain')
        
        # Get alerts from Redis
        redis_client = current_app.redis_client
        alert_queue_key = "alert_queue"
        
        alerts = []
        alert_count = redis_client.llen(alert_queue_key)
        
        if alert_count > 0:
            # Get last 50 alerts
            alert_data = redis_client.lrange(alert_queue_key, 0, 49)
            for alert in alert_data:
                try:
                    alert_obj = json.loads(alert.decode())
                    if not domain or alert_obj.get('domain') == domain:
                        alerts.append(alert_obj)
                except:
                    continue
        
        return jsonify({
            'success': True,
            'alerts': alerts,
            'total_alerts': len(alerts)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get alerts: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@traffic_interception_bp.route('/rules', methods=['GET'])
@jwt_required()
def get_protection_rules():
    """Get content protection rules"""
    try:
        # Get current user
        current_user_id = get_jwt_identity()
        user = User.query.filter_by(uuid=current_user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get domain parameter
        domain = request.args.get('domain')
        if not domain:
            return jsonify({'error': 'Domain parameter required'}), 400
        
        # Get rules from content protection system
        protector = get_content_protection()
        rules = protector.protection_rules
        
        # Filter by domain if specified
        if domain and domain != 'all':
            domain_rules = {}
            for rule_id, rule in rules.items():
                # Check if rule applies to the domain
                # This is a simplified check - in production, you'd have domain-specific rules
                domain_rules[rule_id] = rule
            rules = domain_rules
        
        return jsonify({
            'success': True,
            'rules': rules,
            'total_rules': len(rules)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Failed to get protection rules: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@traffic_interception_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for traffic interception system"""
    try:
        # Check Redis connection
        redis_healthy = False
        try:
            redis_client = current_app.redis_client
            redis_client.ping()
            redis_healthy = True
        except:
            pass
        
        # Check ML models
        classifier = get_ml_bot_classifier()
        ml_healthy = len(classifier.models) > 0
        
        # Check real-time processor
        processor = get_realtime_processor()
        rt_healthy = processor.is_running
        
        # Overall health
        overall_healthy = redis_healthy and ml_healthy and rt_healthy
        
        return jsonify({
            'success': True,
            'healthy': overall_healthy,
            'components': {
                'redis': redis_healthy,
                'ml_models': ml_healthy,
                'real_time_processor': rt_healthy
            },
            'timestamp': datetime.now().isoformat()
        }), 200 if overall_healthy else 503
        
    except Exception as e:
        current_app.logger.error(f"Health check failed: {e}")
        return jsonify({
            'success': False,
            'healthy': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 503

# Import parse_qsl for URL parsing
from urllib.parse import parse_qsl
