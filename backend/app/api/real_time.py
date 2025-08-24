"""
Real-Time Metrics API
Provides live metrics and system status for real-time dashboard
"""

import psutil
import time
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func, desc, and_
from ..models import User, Domain, TrafficLog, BotProfile
from .. import db
from ..websocket import broadcast_system_status, broadcast_analytics_update

real_time = Blueprint('real_time', __name__)

@real_time.route('/metrics', methods=['GET'])
@jwt_required()
def get_real_time_metrics():
    """Get real-time metrics for dashboard"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get time range (default: last 5 minutes)
        minutes = request.args.get('minutes', 5, type=int)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(minutes=minutes)
        
        # Base query for user's tenant
        base_query = TrafficLog.query.join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date,
            TrafficLog.timestamp <= end_date
        )
        
        # Traffic metrics
        total_requests = base_query.count()
        bot_requests = base_query.filter(TrafficLog.is_bot == True).count()
        human_requests = total_requests - bot_requests
        blocked_requests = base_query.filter(TrafficLog.action_taken == 'block').count()
        allowed_requests = total_requests - blocked_requests
        
        # Performance metrics
        response_time_stats = db.session.query(
            func.avg(TrafficLog.response_time).label('avg_response_time'),
            func.min(TrafficLog.response_time).label('min_response_time'),
            func.max(TrafficLog.response_time).label('max_response_time')
        ).join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date,
            TrafficLog.response_time.isnot(None)
        ).first()
        
        error_count = base_query.filter(TrafficLog.response_status >= 400).count()
        error_rate = (error_count / total_requests * 100) if total_requests > 0 else 0
        
        # Calculate throughput (requests per second)
        time_diff = (end_date - start_date).total_seconds()
        throughput = total_requests / time_diff if time_diff > 0 else 0
        
        # Security metrics
        threats_blocked = blocked_requests
        suspicious_ips = db.session.query(
            func.count(func.distinct(TrafficLog.client_ip))
        ).join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date,
            TrafficLog.is_bot == True
        ).scalar() or 0
        
        # Bot detection metrics
        bot_types = db.session.query(
            TrafficLog.bot_type,
            func.count(TrafficLog.id).label('count')
        ).join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date,
            TrafficLog.is_bot == True
        ).group_by(TrafficLog.bot_type).all()
        
        # System metrics
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent
        
        # Network I/O
        network_io = psutil.net_io_counters()
        network_bytes = network_io.bytes_sent + network_io.bytes_recv
        
        # Active connections (simulated)
        active_connections = total_requests  # Simplified for demo
        
        metrics = {
            'traffic': {
                'total_requests': total_requests,
                'bot_requests': bot_requests,
                'human_requests': human_requests,
                'blocked_requests': blocked_requests,
                'allowed_requests': allowed_requests
            },
            'performance': {
                'avg_response_time': response_time_stats.avg_response_time or 0,
                'min_response_time': response_time_stats.min_response_time or 0,
                'max_response_time': response_time_stats.max_response_time or 0,
                'error_rate': round(error_rate, 2),
                'throughput': round(throughput, 2),
                'active_connections': active_connections
            },
            'security': {
                'threats_blocked': threats_blocked,
                'suspicious_ips': suspicious_ips,
                'ddos_attempts': 0,  # Placeholder
                'malware_detected': 0  # Placeholder
            },
            'system': {
                'cpu_usage': round(cpu_usage, 1),
                'memory_usage': round(memory_usage, 1),
                'disk_usage': round(disk_usage, 1),
                'network_io': network_bytes
            },
            'bot_analysis': {
                'total_bots': bot_requests,
                'bot_types': [
                    {'type': bt.bot_type or 'unknown', 'count': bt.count}
                    for bt in bot_types
                ]
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Broadcast metrics to WebSocket subscribers
        broadcast_analytics_update(metrics)
        
        return jsonify({
            'success': True,
            'metrics': metrics
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get real-time metrics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@real_time.route('/system-status', methods=['GET'])
@jwt_required()
def get_system_status():
    """Get current system status"""
    try:
        # System metrics
        cpu_usage = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        memory_usage = memory.percent
        disk = psutil.disk_usage('/')
        disk_usage = disk.percent
        
        # Network metrics
        network_io = psutil.net_io_counters()
        network_bytes = network_io.bytes_sent + network_io.bytes_recv
        
        # Process metrics
        process = psutil.Process()
        process_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # System uptime
        uptime = time.time() - psutil.boot_time()
        uptime_hours = uptime / 3600
        
        status = {
            'cpu': {
                'usage_percent': round(cpu_usage, 1),
                'count': psutil.cpu_count(),
                'frequency': psutil.cpu_freq().current if psutil.cpu_freq() else 0
            },
            'memory': {
                'usage_percent': round(memory_usage, 1),
                'total_gb': round(memory.total / 1024 / 1024 / 1024, 1),
                'available_gb': round(memory.available / 1024 / 1024 / 1024, 1),
                'used_gb': round(memory.used / 1024 / 1024 / 1024, 1)
            },
            'disk': {
                'usage_percent': round(disk_usage, 1),
                'total_gb': round(disk.total / 1024 / 1024 / 1024, 1),
                'free_gb': round(disk.free / 1024 / 1024 / 1024, 1),
                'used_gb': round(disk.used / 1024 / 1024 / 1024, 1)
            },
            'network': {
                'bytes_sent': network_io.bytes_sent,
                'bytes_recv': network_io.bytes_recv,
                'packets_sent': network_io.packets_sent,
                'packets_recv': network_io.packets_recv
            },
            'process': {
                'memory_mb': round(process_memory, 1),
                'cpu_percent': process.cpu_percent(),
                'threads': process.num_threads()
            },
            'system': {
                'uptime_hours': round(uptime_hours, 1),
                'boot_time': datetime.fromtimestamp(psutil.boot_time()).isoformat(),
                'platform': psutil.sys.platform,
                'python_version': psutil.sys.version
            },
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Broadcast system status to WebSocket subscribers
        broadcast_system_status(status)
        
        return jsonify({
            'success': True,
            'status': status
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get system status error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@real_time.route('/traffic-stream', methods=['GET'])
@jwt_required()
def get_traffic_stream():
    """Get real-time traffic stream (Server-Sent Events)"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # This endpoint could be used for Server-Sent Events
        # For now, return current traffic summary
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(minutes=5)
        
        base_query = TrafficLog.query.join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date
        )
        
        total_requests = base_query.count()
        bot_requests = base_query.filter(TrafficLog.is_bot == True).count()
        
        stream_data = {
            'total_requests': total_requests,
            'bot_requests': bot_requests,
            'human_requests': total_requests - bot_requests,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'stream_data': stream_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get traffic stream error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@real_time.route('/alerts', methods=['GET'])
@jwt_required()
def get_active_alerts():
    """Get active system alerts"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get recent security events
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(hours=1)
        
        recent_bots = TrafficLog.query.join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date,
            TrafficLog.is_bot == True
        ).order_by(TrafficLog.timestamp.desc()).limit(10).all()
        
        alerts = []
        
        # Check for high bot activity
        if len(recent_bots) > 100:
            alerts.append({
                'type': 'high_bot_activity',
                'severity': 'warning',
                'message': f'High bot activity detected: {len(recent_bots)} bot requests in the last hour',
                'timestamp': datetime.utcnow().isoformat()
            })
        
        # Check for blocked requests spike
        blocked_count = TrafficLog.query.join(Domain).filter(
            Domain.tenant_id == user.tenant_id,
            TrafficLog.timestamp >= start_date,
            TrafficLog.action_taken == 'block'
        ).count()
        
        if blocked_count > 50:
            alerts.append({
                'type': 'high_block_rate',
                'severity': 'warning',
                'message': f'High block rate detected: {blocked_count} requests blocked in the last hour',
                'timestamp': datetime.utcnow().isoformat()
            })
        
        # Check system resources
        cpu_usage = psutil.cpu_percent(interval=1)
        if cpu_usage > 80:
            alerts.append({
                'type': 'high_cpu_usage',
                'severity': 'critical',
                'message': f'High CPU usage: {cpu_usage}%',
                'timestamp': datetime.utcnow().isoformat()
            })
        
        memory_usage = psutil.virtual_memory().percent
        if memory_usage > 85:
            alerts.append({
                'type': 'high_memory_usage',
                'severity': 'critical',
                'message': f'High memory usage: {memory_usage}%',
                'timestamp': datetime.utcnow().isoformat()
            })
        
        return jsonify({
            'success': True,
            'alerts': alerts,
            'count': len(alerts)
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get active alerts error: {str(e)}")
        return jsonify({'error': str(e)}), 500
