#!/usr/bin/env python3
"""
System Health Monitoring API
Provides comprehensive system health checks, performance monitoring, and diagnostic endpoints
"""

import psutil
import time
import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import text
from ..models import db, User, TrafficLog, Domain, Tenant
from ..utils.cache_manager import cache_manager
from ..utils.database_optimizer import db_optimizer
import os
import redis

system_health = Blueprint('system_health', __name__)

def admin_required(f):
    """Decorator to require admin role"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user or user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@system_health.route('/status', methods=['GET'])
def get_system_status():
    """Get basic system status (public endpoint)"""
    try:
        status = {
            'status': 'healthy',
            'timestamp': datetime.utcnow().isoformat(),
            'service': 'traffic-interceptor-api',
            'version': '2.0.0'
        }
        
        # Check database connectivity
        try:
            db.session.execute(text('SELECT 1'))
            status['database'] = 'connected'
        except Exception as e:
            status['database'] = 'error'
            status['status'] = 'degraded'
        
        # Check Redis connectivity
        try:
            if cache_manager.is_connected():
                status['cache'] = 'connected'
            else:
                status['cache'] = 'disconnected'
                status['status'] = 'degraded'
        except Exception as e:
            status['cache'] = 'error'
            status['status'] = 'degraded'
        
        return jsonify(status), 200
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@system_health.route('/health/detailed', methods=['GET'])
@jwt_required()
@admin_required
def get_detailed_health():
    """Get detailed system health information (admin only)"""
    try:
        health_data = {}
        
        # System metrics
        health_data['system'] = {
            'cpu_percent': psutil.cpu_percent(interval=1),
            'memory_percent': psutil.virtual_memory().percent,
            'disk_percent': psutil.disk_usage('/').percent,
            'load_average': os.getloadavg() if hasattr(os, 'getloadavg') else None,
            'uptime_seconds': time.time() - psutil.boot_time(),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Database health
        health_data['database'] = get_database_health()
        
        # Cache health
        health_data['cache'] = get_cache_health()
        
        # Application metrics
        health_data['application'] = get_application_metrics()
        
        # Service dependencies
        health_data['dependencies'] = check_service_dependencies()
        
        # Determine overall health
        overall_status = determine_overall_health(health_data)
        health_data['overall_status'] = overall_status
        
        return jsonify({
            'success': True,
            'health': health_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Detailed health check error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@system_health.route('/metrics', methods=['GET'])
@jwt_required()
@admin_required
def get_system_metrics():
    """Get comprehensive system metrics"""
    try:
        metrics = {}
        
        # Performance metrics
        metrics['performance'] = {
            'cpu_cores': psutil.cpu_count(),
            'cpu_frequency': psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None,
            'memory_total_gb': round(psutil.virtual_memory().total / (1024**3), 2),
            'memory_available_gb': round(psutil.virtual_memory().available / (1024**3), 2),
            'disk_total_gb': round(psutil.disk_usage('/').total / (1024**3), 2),
            'disk_free_gb': round(psutil.disk_usage('/').free / (1024**3), 2),
            'network_io': psutil.net_io_counters()._asdict() if psutil.net_io_counters() else None
        }
        
        # Database metrics
        metrics['database'] = db_optimizer.get_performance_metrics()
        
        # Traffic metrics (last 24 hours)
        yesterday = datetime.utcnow() - timedelta(days=1)
        traffic_stats = db.session.query(
            db.func.count(TrafficLog.id).label('total_requests'),
            db.func.sum(db.case([(TrafficLog.is_bot == True, 1)], else_=0)).label('bot_requests'),
            db.func.avg(TrafficLog.response_time).label('avg_response_time')
        ).filter(TrafficLog.timestamp >= yesterday).first()
        
        metrics['traffic'] = {
            'total_requests_24h': traffic_stats.total_requests or 0,
            'bot_requests_24h': traffic_stats.bot_requests or 0,
            'avg_response_time_ms': round(traffic_stats.avg_response_time or 0, 2),
            'human_requests_24h': (traffic_stats.total_requests or 0) - (traffic_stats.bot_requests or 0)
        }
        
        # Tenant metrics
        tenant_stats = db.session.query(
            db.func.count(Tenant.id).label('total_tenants'),
            db.func.sum(db.case([(Tenant.status == 'active', 1)], else_=0)).label('active_tenants')
        ).first()
        
        metrics['tenants'] = {
            'total_tenants': tenant_stats.total_tenants or 0,
            'active_tenants': tenant_stats.active_tenants or 0
        }
        
        # Domain metrics
        domain_stats = db.session.query(
            db.func.count(Domain.id).label('total_domains'),
            db.func.sum(db.case([(Domain.is_verified == True, 1)], else_=0)).label('verified_domains')
        ).first()
        
        metrics['domains'] = {
            'total_domains': domain_stats.total_domains or 0,
            'verified_domains': domain_stats.verified_domains or 0
        }
        
        return jsonify({
            'success': True,
            'metrics': metrics,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"System metrics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@system_health.route('/diagnostics', methods=['GET'])
@jwt_required()
@admin_required
def run_diagnostics():
    """Run comprehensive system diagnostics"""
    try:
        diagnostics = {}
        
        # Database diagnostics
        diagnostics['database'] = run_database_diagnostics()
        
        # Cache diagnostics
        diagnostics['cache'] = run_cache_diagnostics()
        
        # Performance diagnostics
        diagnostics['performance'] = run_performance_diagnostics()
        
        # Configuration diagnostics
        diagnostics['configuration'] = run_configuration_diagnostics()
        
        # Security diagnostics
        diagnostics['security'] = run_security_diagnostics()
        
        return jsonify({
            'success': True,
            'diagnostics': diagnostics,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Diagnostics error: {str(e)}")
        return jsonify({'error': str(e)}), 500

def get_database_health():
    """Get database health information"""
    try:
        health = {}
        
        # Connection test
        start_time = time.time()
        db.session.execute(text('SELECT 1'))
        connection_time = time.time() - start_time
        
        health['connection'] = {
            'status': 'connected',
            'response_time_ms': round(connection_time * 1000, 2)
        }
        
        # Get table statistics
        health['statistics'] = db_optimizer.get_table_statistics()
        
        # Check for recent activity
        recent_logs = db.session.query(db.func.count(TrafficLog.id)).filter(
            TrafficLog.timestamp >= datetime.utcnow() - timedelta(minutes=5)
        ).scalar()
        
        health['activity'] = {
            'recent_requests_5min': recent_logs or 0
        }
        
        return health
        
    except Exception as e:
        return {
            'connection': {'status': 'error', 'error': str(e)},
            'statistics': {'status': 'error', 'error': str(e)},
            'activity': {'status': 'error', 'error': str(e)}
        }

def get_cache_health():
    """Get cache (Redis) health information"""
    try:
        if not cache_manager.is_connected():
            return {'status': 'disconnected'}
        
        stats = cache_manager.get_stats()
        
        # Test cache operations
        test_key = 'health_check_test'
        test_value = {'timestamp': datetime.utcnow().isoformat()}
        
        # Test write
        write_start = time.time()
        cache_manager.set(test_key, test_value, ttl=60)
        write_time = time.time() - write_start
        
        # Test read
        read_start = time.time()
        cached_value = cache_manager.get(test_key)
        read_time = time.time() - read_start
        
        # Clean up
        cache_manager.delete(test_key)
        
        return {
            'status': 'connected',
            'stats': stats,
            'performance': {
                'write_time_ms': round(write_time * 1000, 2),
                'read_time_ms': round(read_time * 1000, 2),
                'test_success': cached_value is not None
            }
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def get_application_metrics():
    """Get application-specific metrics"""
    try:
        # Count active sessions (simplified)
        active_users = db.session.query(db.func.count(User.id)).filter(
            User.last_login >= datetime.utcnow() - timedelta(hours=24)
        ).scalar()
        
        # Get error rates (simplified)
        total_requests = db.session.query(db.func.count(TrafficLog.id)).filter(
            TrafficLog.timestamp >= datetime.utcnow() - timedelta(hours=1)
        ).scalar()
        
        error_requests = db.session.query(db.func.count(TrafficLog.id)).filter(
            TrafficLog.timestamp >= datetime.utcnow() - timedelta(hours=1),
            TrafficLog.response_status >= 500
        ).scalar()
        
        error_rate = (error_requests / max(total_requests, 1)) * 100
        
        return {
            'active_users_24h': active_users or 0,
            'requests_last_hour': total_requests or 0,
            'error_rate_percent': round(error_rate, 2),
            'app_start_time': datetime.utcnow().isoformat()  # Simplified
        }
        
    except Exception as e:
        return {
            'error': str(e)
        }

def check_service_dependencies():
    """Check external service dependencies"""
    dependencies = {}
    
    # Check Redis
    try:
        if cache_manager.is_connected():
            dependencies['redis'] = {'status': 'available'}
        else:
            dependencies['redis'] = {'status': 'unavailable'}
    except Exception as e:
        dependencies['redis'] = {'status': 'error', 'error': str(e)}
    
    # Check external services (simplified)
    dependencies['stripe'] = {'status': 'not_tested'}  # Would implement actual check
    dependencies['email_service'] = {'status': 'not_tested'}  # Would implement actual check
    
    return dependencies

def determine_overall_health(health_data):
    """Determine overall system health status"""
    issues = []
    warnings = []
    
    # Check system resources
    system = health_data.get('system', {})
    if system.get('cpu_percent', 0) > 80:
        issues.append('High CPU usage')
    elif system.get('cpu_percent', 0) > 60:
        warnings.append('Elevated CPU usage')
    
    if system.get('memory_percent', 0) > 85:
        issues.append('High memory usage')
    elif system.get('memory_percent', 0) > 70:
        warnings.append('Elevated memory usage')
    
    if system.get('disk_percent', 0) > 90:
        issues.append('High disk usage')
    elif system.get('disk_percent', 0) > 80:
        warnings.append('Elevated disk usage')
    
    # Check database
    database = health_data.get('database', {})
    if database.get('connection', {}).get('status') != 'connected':
        issues.append('Database connection issues')
    
    # Check cache
    cache = health_data.get('cache', {})
    if cache.get('status') != 'connected':
        warnings.append('Cache unavailable')
    
    # Determine status
    if issues:
        return {
            'status': 'critical',
            'issues': issues,
            'warnings': warnings
        }
    elif warnings:
        return {
            'status': 'warning',
            'issues': [],
            'warnings': warnings
        }
    else:
        return {
            'status': 'healthy',
            'issues': [],
            'warnings': []
        }

def run_database_diagnostics():
    """Run database-specific diagnostics"""
    try:
        diagnostics = {}
        
        # Test query performance
        diagnostics['query_performance'] = db_optimizer.get_performance_metrics()
        
        # Check for missing indexes
        diagnostics['index_recommendations'] = db_optimizer.create_recommended_indexes()
        
        # Check table sizes
        diagnostics['table_statistics'] = db_optimizer.get_table_statistics()
        
        return {
            'status': 'completed',
            'results': diagnostics
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def run_cache_diagnostics():
    """Run cache-specific diagnostics"""
    try:
        if not cache_manager.is_connected():
            return {'status': 'cache_unavailable'}
        
        # Test cache performance
        test_sizes = [1, 10, 100, 1000]  # KB
        performance_results = {}
        
        for size_kb in test_sizes:
            test_data = 'x' * (size_kb * 1024)
            
            # Test write
            start_time = time.time()
            cache_manager.set(f'perf_test_{size_kb}kb', test_data, ttl=60)
            write_time = time.time() - start_time
            
            # Test read
            start_time = time.time()
            cached_data = cache_manager.get(f'perf_test_{size_kb}kb')
            read_time = time.time() - start_time
            
            # Cleanup
            cache_manager.delete(f'perf_test_{size_kb}kb')
            
            performance_results[f'{size_kb}kb'] = {
                'write_time_ms': round(write_time * 1000, 2),
                'read_time_ms': round(read_time * 1000, 2),
                'success': cached_data is not None
            }
        
        return {
            'status': 'completed',
            'performance_tests': performance_results,
            'cache_stats': cache_manager.get_stats()
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def run_performance_diagnostics():
    """Run performance diagnostics"""
    try:
        # CPU stress test (brief)
        cpu_start = time.time()
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_time = time.time() - cpu_start
        
        # Memory usage
        memory = psutil.virtual_memory()
        
        # Disk I/O
        disk_io = psutil.disk_io_counters()
        
        return {
            'status': 'completed',
            'cpu_test': {
                'usage_percent': cpu_percent,
                'test_duration_ms': round(cpu_time * 1000, 2)
            },
            'memory_usage': {
                'total_gb': round(memory.total / (1024**3), 2),
                'available_gb': round(memory.available / (1024**3), 2),
                'percent_used': memory.percent
            },
            'disk_io': {
                'read_bytes': disk_io.read_bytes if disk_io else 0,
                'write_bytes': disk_io.write_bytes if disk_io else 0
            }
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def run_configuration_diagnostics():
    """Run configuration diagnostics"""
    try:
        config_checks = {}
        
        # Check environment variables
        required_env_vars = [
            'SECRET_KEY', 'JWT_SECRET_KEY', 'DATABASE_URL', 'REDIS_URL'
        ]
        
        for var in required_env_vars:
            config_checks[var] = {
                'present': os.environ.get(var) is not None,
                'length': len(os.environ.get(var, ''))
            }
        
        # Check Flask configuration
        config_checks['flask_config'] = {
            'debug_mode': current_app.debug,
            'testing_mode': current_app.testing,
            'environment': os.environ.get('FLASK_ENV', 'unknown')
        }
        
        return {
            'status': 'completed',
            'configuration_checks': config_checks
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def run_security_diagnostics():
    """Run security diagnostics"""
    try:
        security_checks = {}
        
        # Check for recent security events
        recent_security_events = db.session.execute(text("""
            SELECT COUNT(*) FROM security_logs 
            WHERE timestamp >= datetime('now', '-24 hours')
            AND severity IN ('warning', 'error', 'critical')
        """)).scalar()
        
        security_checks['recent_security_events'] = recent_security_events or 0
        
        # Check for failed login attempts
        failed_logins = db.session.execute(text("""
            SELECT COUNT(*) FROM security_logs 
            WHERE timestamp >= datetime('now', '-1 hour')
            AND event_type LIKE '%failed%'
        """)).scalar()
        
        security_checks['failed_logins_1h'] = failed_logins or 0
        
        # Check configuration security
        security_checks['configuration'] = {
            'debug_mode_enabled': current_app.debug,
            'secret_key_length': len(current_app.secret_key) if current_app.secret_key else 0
        }
        
        return {
            'status': 'completed',
            'security_checks': security_checks
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }
