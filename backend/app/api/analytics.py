# Real-time Analytics API
from flask import request, jsonify, current_app
from app.api import api
from app.models import TrafficLog, Domain, Analytics, Tenant
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import json
import redis
from sqlalchemy import func, and_

# Redis client for real-time data
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_current_user():
    """Helper function to get current user from JWT token"""
    try:
        from app.models import User
        user_id = get_jwt_identity()
        return User.query.filter_by(uuid=user_id).first()
    except:
        return None

@api.route('/analytics/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_analytics():
    """Get dashboard analytics data"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get date range from query params
        days = request.args.get('days', 7, type=int)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Get tenant domains
        domains = Domain.query.filter_by(tenant_id=current_user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        if not domain_ids:
            return jsonify({
                'total_requests': 0,
                'blocked_requests': 0,
                'bot_requests': 0,
                'allowed_requests': 0,
                'top_domains': [],
                'traffic_trends': [],
                'bot_types': {},
                'countries': {},
                'real_time_metrics': {
                    'active_requests': 0,
                    'requests_per_second': 0,
                    'active_bots': 0,
                    'blocked_per_minute': 0
                }
            })
        
        # Get traffic statistics
        traffic_stats = db.session.query(
            func.count(TrafficLog.id).label('total_requests'),
            func.sum(func.case([(TrafficLog.action_taken == 'block', 1)], else_=0)).label('blocked_requests'),
            func.sum(func.case([(TrafficLog.is_bot == True, 1)], else_=0)).label('bot_requests')
        ).filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date
        ).first()
        
        total_requests = traffic_stats.total_requests or 0
        blocked_requests = traffic_stats.blocked_requests or 0
        bot_requests = traffic_stats.bot_requests or 0
        allowed_requests = total_requests - blocked_requests
        
        # Get traffic trends by day
        traffic_trends = []
        for i in range(days):
            day_start = start_date + timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            day_stats = db.session.query(
                func.count(TrafficLog.id).label('total'),
                func.sum(func.case([(TrafficLog.action_taken == 'block', 1)], else_=0)).label('blocked'),
                func.sum(func.case([(TrafficLog.is_bot == True, 1)], else_=0)).label('bots')
            ).filter(
                TrafficLog.domain_id.in_(domain_ids),
                TrafficLog.timestamp >= day_start,
                TrafficLog.timestamp < day_end
            ).first()
            
            traffic_trends.append({
                'date': day_start.strftime('%Y-%m-%d'),
                'total_requests': day_stats.total or 0,
                'blocked_requests': day_stats.blocked or 0,
                'bot_requests': day_stats.bots or 0,
                'allowed_requests': (day_stats.total or 0) - (day_stats.blocked or 0)
            })
        
        # Get top domains by traffic
        top_domains = db.session.query(
            Domain.domain_name,
            func.count(TrafficLog.id).label('request_count')
        ).join(
            TrafficLog, Domain.id == TrafficLog.domain_id
        ).filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date
        ).group_by(Domain.domain_name).order_by(
            func.count(TrafficLog.id).desc()
        ).limit(10).all()
        
        # Get bot types distribution
        bot_types = db.session.query(
            TrafficLog.bot_type,
            func.count(TrafficLog.id).label('count')
        ).filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date,
            TrafficLog.is_bot == True,
            TrafficLog.bot_type.isnot(None)
        ).group_by(TrafficLog.bot_type).all()
        
        # Get countries distribution
        countries = db.session.query(
            TrafficLog.country_code,
            func.count(TrafficLog.id).label('count')
        ).filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date,
            TrafficLog.country_code.isnot(None)
        ).group_by(TrafficLog.country_code).limit(10).all()
        
        # Get real-time metrics from Redis
        real_time_metrics = get_real_time_metrics(domains)
        
        return jsonify({
            'total_requests': total_requests,
            'blocked_requests': blocked_requests,
            'bot_requests': bot_requests,
            'allowed_requests': allowed_requests,
            'top_domains': [{'domain': domain, 'requests': count} for domain, count in top_domains],
            'traffic_trends': traffic_trends,
            'bot_types': {bot_type: count for bot_type, count in bot_types},
            'countries': {country: count for country, count in countries},
            'real_time_metrics': real_time_metrics
        })
        
    except Exception as e:
        current_app.logger.error(f"Dashboard analytics error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/analytics/traffic-logs', methods=['GET'])
@jwt_required()
def get_traffic_logs():
    """Get paginated traffic logs"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Get filter parameters
        domain_name = request.args.get('domain')
        action_taken = request.args.get('action')
        is_bot = request.args.get('is_bot')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = TrafficLog.query.join(Domain).filter(
            Domain.tenant_id == current_user.tenant_id
        )
        
        # Apply filters
        if domain_name:
            query = query.filter(Domain.domain_name == domain_name)
        
        if action_taken:
            query = query.filter(TrafficLog.action_taken == action_taken)
        
        if is_bot is not None:
            query = query.filter(TrafficLog.is_bot == (is_bot.lower() == 'true'))
        
        if start_date:
            start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            query = query.filter(TrafficLog.timestamp >= start_dt)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
            query = query.filter(TrafficLog.timestamp <= end_dt)
        
        # Order by timestamp descending
        query = query.order_by(TrafficLog.timestamp.desc())
        
        # Paginate
        logs = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'logs': [{
                'id': log.uuid,
                'domain': log.domain.domain_name,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'method': log.request_method,
                'path': log.request_path,
                'status': log.response_status,
                'is_bot': log.is_bot,
                'bot_type': log.bot_type,
                'country': log.country_code,
                'city': log.city,
                'action_taken': log.action_taken,
                'rule_matched': log.rule_matched,
                'timestamp': log.timestamp.isoformat(),
                'processing_time': log.processing_time
            } for log in logs.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': logs.total,
                'pages': logs.pages,
                'has_next': logs.has_next,
                'has_prev': logs.has_prev
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Traffic logs error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

@api.route('/analytics/hourly-stats', methods=['GET'])
@jwt_required()
def get_hourly_stats():
    """Get hourly traffic statistics"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        # Get date range (last 24 hours by default)
        hours = request.args.get('hours', 24, type=int)
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        # Get tenant domains
        domains = Domain.query.filter_by(tenant_id=current_user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        if not domain_ids:
            return jsonify({'hourly_stats': []})
        
        # Get hourly statistics
        hourly_stats = []
        for i in range(hours):
            hour_start = start_time + timedelta(hours=i)
            hour_end = hour_start + timedelta(hours=1)
            
            stats = db.session.query(
                func.count(TrafficLog.id).label('total'),
                func.sum(func.case([(TrafficLog.action_taken == 'block', 1)], else_=0)).label('blocked'),
                func.sum(func.case([(TrafficLog.is_bot == True, 1)], else_=0)).label('bots')
            ).filter(
                TrafficLog.domain_id.in_(domain_ids),
                TrafficLog.timestamp >= hour_start,
                TrafficLog.timestamp < hour_end
            ).first()
            
            hourly_stats.append({
                'hour': hour_start.strftime('%Y-%m-%d %H:00'),
                'total_requests': stats.total or 0,
                'blocked_requests': stats.blocked or 0,
                'bot_requests': stats.bots or 0,
                'allowed_requests': (stats.total or 0) - (stats.blocked or 0)
            })
        
        return jsonify({'hourly_stats': hourly_stats})
        
    except Exception as e:
        current_app.logger.error(f"Hourly stats error: {e}")
        return jsonify({'message': 'Internal server error'}), 500

def get_real_time_metrics(domains):
    """Get real-time metrics from Redis"""
    try:
        current_time = datetime.now()
        current_minute = current_time.strftime('%Y-%m-%d:%H:%M')
        
        active_requests = 0
        requests_per_second = 0
        active_bots = 0
        blocked_per_minute = 0
        
        for domain in domains:
            # Get metrics for the last minute
            minute_key = f"analytics:{domain.domain_name}:{current_minute}"
            
            minute_data = redis_client.hgetall(minute_key)
            if minute_data:
                active_requests += int(minute_data.get(b'total_requests', 0))
                blocked_per_minute += int(minute_data.get(b'blocked_requests', 0))
                active_bots += int(minute_data.get(b'bot_requests', 0))
        
        # Calculate requests per second (approximate)
        requests_per_second = active_requests // 60 if active_requests > 0 else 0
        
        return {
            'active_requests': active_requests,
            'requests_per_second': requests_per_second,
            'active_bots': active_bots,
            'blocked_per_minute': blocked_per_minute
        }
        
    except Exception as e:
        current_app.logger.error(f"Real-time metrics error: {e}")
        return {
            'active_requests': 0,
            'requests_per_second': 0,
            'active_bots': 0,
            'blocked_per_minute': 0
        }

@api.route('/analytics/export', methods=['POST'])
@jwt_required()
def export_analytics():
    """Export analytics data"""
    current_user = get_current_user()
    if not current_user:
        return jsonify({'message': 'User not found'}), 404
    
    try:
        data = request.get_json()
        export_type = data.get('type', 'csv')  # csv, json, pdf
        date_range = data.get('date_range', 7)
        
        # This would implement the actual export logic
        # For now, return a placeholder response
        
        return jsonify({
            'message': 'Export started',
            'export_id': 'exp_' + str(int(datetime.now().timestamp())),
            'status': 'processing',
            'estimated_completion': (datetime.now() + timedelta(minutes=5)).isoformat()
        })
        
    except Exception as e:
        current_app.logger.error(f"Export error: {e}")
        return jsonify({'message': 'Internal server error'}), 500
