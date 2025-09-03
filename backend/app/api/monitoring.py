"""
Monitoring API Endpoints
Provides system and application monitoring data for the dashboard
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import psutil
import json
from sqlalchemy import func, desc
from ..models import User, Domain, TrafficLog, InterceptorRule
from .. import db

monitoring = Blueprint('monitoring', __name__)

@monitoring.route('/system', methods=['GET'])
@jwt_required()
def get_system_monitoring():
    """Get system monitoring metrics"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # System metrics
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Application metrics
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(hours=1)
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        if domain_ids:
            # Traffic in last hour
            recent_traffic = TrafficLog.query.filter(
                TrafficLog.domain_id.in_(domain_ids),
                TrafficLog.timestamp >= start_date
            ).count()
            
            # Active rules
            active_rules = InterceptorRule.query.filter(
                InterceptorRule.domain_id.in_(domain_ids),
                InterceptorRule.is_active == True
            ).count()
        else:
            recent_traffic = 0
            active_rules = 0
        
        return jsonify({
            'system_health': {
                'cpu_usage': round(cpu_usage, 2),
                'memory_usage': round(memory.percent, 2),
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'disk_usage': round(disk.percent, 2),
                'disk_free_gb': round(disk.free / (1024**3), 2),
                'status': 'healthy' if cpu_usage < 80 and memory.percent < 80 else 'warning'
            },
            'application_metrics': {
                'recent_traffic': recent_traffic,
                'active_rules': active_rules,
                'total_domains': len(domain_ids),
                'uptime': '99.9%',  # This would be calculated from actual uptime
                'last_updated': datetime.utcnow().isoformat()
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"System monitoring error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@monitoring.route('/traffic', methods=['GET'])
@jwt_required()
def get_traffic_monitoring():
    """Get real-time traffic monitoring"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get time range
        minutes = request.args.get('minutes', 5, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(minutes=minutes)
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        if not domain_ids:
            return jsonify({
                'live_traffic': {
                    'total_requests': 0,
                    'bot_requests': 0,
                    'blocked_requests': 0,
                    'response_times': [],
                    'top_countries': [],
                    'recent_activity': []
                }
            }), 200
        
        # Get recent traffic
        traffic_logs = TrafficLog.query.filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date
        ).order_by(TrafficLog.timestamp.desc()).all()
        
        # Calculate metrics
        total_requests = len(traffic_logs)
        bot_requests = len([log for log in traffic_logs if log.is_bot])
        blocked_requests = len([log for log in traffic_logs if log.action_taken == 'block'])
        
        # Response times
        response_times = [log.response_time for log in traffic_logs if log.response_time]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Top countries
        countries = {}
        for log in traffic_logs:
            if log.geo_country:
                countries[log.geo_country] = countries.get(log.geo_country, 0) + 1
        
        top_countries = sorted(countries.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Recent activity
        recent_activity = []
        for log in traffic_logs[:20]:  # Last 20 requests
            recent_activity.append({
                'id': log.uuid,
                'timestamp': log.timestamp.isoformat() if log.timestamp else None,
                'ip': log.client_ip,
                'method': log.request_method,
                'path': log.request_path,
                'status': log.response_status,
                'is_bot': log.is_bot,
                'action': log.action_taken
            })
        
        return jsonify({
            'live_traffic': {
                'total_requests': total_requests,
                'bot_requests': bot_requests,
                'blocked_requests': blocked_requests,
                'human_requests': total_requests - bot_requests,
                'avg_response_time': round(avg_response_time, 3),
                'response_times': response_times[-50:],  # Last 50 response times
                'top_countries': [{'country': country, 'count': count} for country, count in top_countries],
                'recent_activity': recent_activity,
                'time_range': f"Last {minutes} minutes",
                'last_updated': datetime.utcnow().isoformat()
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Traffic monitoring error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@monitoring.route('/alerts', methods=['GET'])
@jwt_required()
def get_monitoring_alerts():
    """Get monitoring alerts and notifications"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # For now, return mock alerts - in production, this would come from an alerting system
        alerts = [
            {
                'id': '1',
                'type': 'warning',
                'title': 'High Traffic Volume',
                'message': 'Traffic increased by 150% in the last hour',
                'timestamp': (datetime.utcnow() - timedelta(minutes=30)).isoformat(),
                'severity': 'medium',
                'status': 'active'
            },
            {
                'id': '2',
                'type': 'info',
                'title': 'New Bot Pattern Detected',
                'message': 'Unusual bot behavior detected from 192.168.1.x',
                'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
                'severity': 'low',
                'status': 'acknowledged'
            }
        ]
        
        return jsonify({
            'alerts': alerts,
            'total_active': len([alert for alert in alerts if alert['status'] == 'active']),
            'total_acknowledged': len([alert for alert in alerts if alert['status'] == 'acknowledged'])
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Monitoring alerts error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@monitoring.route('/performance', methods=['GET'])
@jwt_required()
def get_performance_monitoring():
    """Get performance monitoring metrics"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get time range
        hours = request.args.get('hours', 24, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(hours=hours)
        
        # Get user's domains
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        domain_ids = [domain.id for domain in domains]
        
        if not domain_ids:
            return jsonify({
                'performance_metrics': {
                    'avg_response_time': 0,
                    'min_response_time': 0,
                    'max_response_time': 0,
                    'total_requests': 0,
                    'error_rate': 0,
                    'throughput': 0,
                    'hourly_stats': []
                }
            }), 200
        
        # Get performance data
        performance_logs = TrafficLog.query.filter(
            TrafficLog.domain_id.in_(domain_ids),
            TrafficLog.timestamp >= start_date,
            TrafficLog.response_time.isnot(None)
        ).all()
        
        if not performance_logs:
            return jsonify({
                'performance_metrics': {
                    'avg_response_time': 0,
                    'min_response_time': 0,
                    'max_response_time': 0,
                    'total_requests': 0,
                    'error_rate': 0,
                    'throughput': 0,
                    'hourly_stats': []
                }
            }), 200
        
        # Calculate metrics
        response_times = [log.response_time for log in performance_logs if log.response_time]
        total_requests = len(performance_logs)
        error_requests = len([log for log in performance_logs if log.response_status >= 400])
        
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        min_response_time = min(response_times) if response_times else 0
        max_response_time = max(response_times) if response_times else 0
        error_rate = (error_requests / total_requests) * 100 if total_requests > 0 else 0
        throughput = total_requests / hours  # requests per hour
        
        # Hourly stats
        hourly_stats = []
        for i in range(hours):
            hour_start = start_date + timedelta(hours=i)
            hour_end = hour_start + timedelta(hours=1)
            
            hour_logs = [log for log in performance_logs 
                        if hour_start <= log.timestamp < hour_end]
            
            if hour_logs:
                hour_response_times = [log.response_time for log in hour_logs if log.response_time]
                hourly_stats.append({
                    'hour': hour_start.isoformat(),
                    'requests': len(hour_logs),
                    'avg_response_time': sum(hour_response_times) / len(hour_response_times) if hour_response_times else 0,
                    'errors': len([log for log in hour_logs if log.response_status >= 400])
                })
            else:
                hourly_stats.append({
                    'hour': hour_start.isoformat(),
                    'requests': 0,
                    'avg_response_time': 0,
                    'errors': 0
                })
        
        return jsonify({
            'performance_metrics': {
                'avg_response_time': round(avg_response_time, 3),
                'min_response_time': round(min_response_time, 3),
                'max_response_time': round(max_response_time, 3),
                'total_requests': total_requests,
                'error_rate': round(error_rate, 2),
                'throughput': round(throughput, 2),
                'hourly_stats': hourly_stats,
                'time_range': f"Last {hours} hours",
                'last_updated': datetime.utcnow().isoformat()
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Performance monitoring error: {str(e)}")
        return jsonify({'error': str(e)}), 500

