#!/usr/bin/env python3
"""
Performance Monitoring & Optimization API
Handles system health, caching, database performance, and optimization
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from .security import admin_required
from app.models import db, User, Domain, TrafficLog
from app.utils.cache_manager import cache_manager, performance_monitor, query_optimizer
from datetime import datetime, timedelta
import psutil
import time
import sqlite3
import json
from sqlalchemy import text, func
from sqlalchemy.orm import joinedload

performance = Blueprint('performance', __name__)

@performance.route('/health', methods=['GET'])
@jwt_required()
def get_system_health():
    """Get comprehensive system health status"""
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database health
        db_health = check_database_health()
        
        # Cache health
        cache_health = cache_manager.get_stats()
        
        # Application metrics
        app_metrics = get_application_metrics()
        
        return jsonify({
            'timestamp': datetime.utcnow().isoformat(),
            'system': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_gb': round(memory.available / (1024**3), 2),
                'disk_percent': disk.percent,
                'disk_free_gb': round(disk.free / (1024**3), 2)
            },
            'database': db_health,
            'cache': cache_health,
            'application': app_metrics,
            'overall_status': 'healthy' if all([
                cpu_percent < 80,
                memory.percent < 80,
                disk.percent < 80,
                db_health['status'] == 'healthy',
                cache_health.get('connected', False)
            ]) else 'warning'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@performance.route('/cache/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_cache_stats():
    """Get detailed cache statistics"""
    try:
        stats = cache_manager.get_stats()
        
        # Get cache keys by pattern
        key_patterns = {
            'user_cache': len(cache_manager.redis_client.keys('user:*')) if cache_manager.is_connected() else 0,
            'tenant_cache': len(cache_manager.redis_client.keys('tenant:*')) if cache_manager.is_connected() else 0,
            'domain_cache': len(cache_manager.redis_client.keys('domain:*')) if cache_manager.is_connected() else 0,
            'analytics_cache': len(cache_manager.redis_client.keys('analytics:*')) if cache_manager.is_connected() else 0
        }
        
        stats.update(key_patterns)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@performance.route('/cache/clear', methods=['POST'])
@jwt_required()
@admin_required
def clear_cache():
    """Clear specific cache patterns"""
    try:
        data = request.get_json()
        pattern = data.get('pattern', '*')
        
        if pattern == '*':
            # Clear all cache
            if cache_manager.is_connected():
                cache_manager.redis_client.flushdb()
                message = "All cache cleared successfully"
            else:
                return jsonify({'error': 'Cache not connected'}), 500
        else:
            # Clear specific pattern
            cleared_count = cache_manager.clear_pattern(pattern)
            message = f"Cleared {cleared_count} cache keys matching pattern: {pattern}"
        
        return jsonify({'message': message}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@performance.route('/database/performance', methods=['GET'])
@jwt_required()
@admin_required
def get_database_performance():
    """Get database performance metrics and optimization suggestions"""
    try:
        # Query execution times
        query_times = measure_query_performance()
        
        # Table statistics
        table_stats = get_table_statistics()
        
        # Index analysis
        index_analysis = analyze_indexes()
        
        # Optimization suggestions
        suggestions = generate_optimization_suggestions(query_times, table_stats, index_analysis)
        
        return jsonify({
            'query_performance': query_times,
            'table_statistics': table_stats,
            'index_analysis': index_analysis,
            'optimization_suggestions': suggestions,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@performance.route('/database/optimize', methods=['POST'])
@jwt_required()
@admin_required
def optimize_database():
    """Run database optimization tasks"""
    try:
        data = request.get_json()
        optimization_type = data.get('type', 'all')
        
        results = {}
        
        if optimization_type in ['all', 'vacuum']:
            # SQLite VACUUM
            db.engine.execute(text('VACUUM'))
            results['vacuum'] = 'Database vacuumed successfully'
        
        if optimization_type in ['all', 'analyze']:
            # SQLite ANALYZE
            db.engine.execute(text('ANALYZE'))
            results['analyze'] = 'Database analyzed successfully'
        
        if optimization_type in ['all', 'reindex']:
            # SQLite REINDEX
            db.engine.execute(text('REINDEX'))
            results['reindex'] = 'Database reindexed successfully'
        
        return jsonify({
            'message': 'Database optimization completed',
            'results': results,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@performance.route('/queries/slow', methods=['GET'])
@jwt_required()
@admin_required
def get_slow_queries():
    """Get slow query analysis and recommendations"""
    try:
        # This would typically come from query logging
        # For now, we'll analyze common query patterns
        slow_queries = analyze_slow_queries()
        
        return jsonify({
            'slow_queries': slow_queries,
            'recommendations': generate_query_recommendations(slow_queries),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@performance.route('/metrics/real-time', methods=['GET'])
@jwt_required()
def get_real_time_metrics():
    """Get real-time performance metrics"""
    try:
        # Current system load
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        
        # Active connections (simulated)
        active_connections = get_active_connections()
        
        # Request rate (simulated)
        request_rate = get_request_rate()
        
        return jsonify({
            'timestamp': datetime.utcnow().isoformat(),
            'cpu_percent': cpu_percent,
            'memory_percent': memory.percent,
            'active_connections': active_connections,
            'request_rate_per_minute': request_rate
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper functions
def check_database_health():
    """Check database connection and performance"""
    try:
        start_time = time.time()
        
        # Test basic query
        result = db.session.execute(text('SELECT 1')).fetchone()
        
        query_time = time.time() - start_time
        
        # Check database size
        db_size = get_database_size()
        
        return {
            'status': 'healthy',
            'connection': True,
            'query_time_ms': round(query_time * 1000, 2),
            'size_mb': db_size,
            'last_check': datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'connection': False,
            'error': str(e),
            'last_check': datetime.utcnow().isoformat()
        }

def get_application_metrics():
    """Get application-specific metrics"""
    try:
        # User count
        user_count = User.query.count()
        
        # Domain count
        domain_count = Domain.query.count()
        
        # Recent traffic
        recent_traffic = TrafficLog.query.filter(
            TrafficLog.timestamp >= datetime.utcnow() - timedelta(hours=1)
        ).count()
        
        return {
            'total_users': user_count,
            'total_domains': domain_count,
            'traffic_last_hour': recent_traffic,
            'uptime': get_uptime()
        }
    except Exception as e:
        return {'error': str(e)}

@performance_monitor
def measure_query_performance():
    """Measure performance of common queries"""
    queries = {
        'user_lookup': lambda: User.query.filter_by(is_active=True).count(),
        'domain_lookup': lambda: Domain.query.filter_by(status='active').count(),
        'traffic_analysis': lambda: TrafficLog.query.filter(
            TrafficLog.timestamp >= datetime.utcnow() - timedelta(days=1)
        ).count()
    }
    
    results = {}
    for name, query_func in queries.items():
        start_time = time.time()
        try:
            result = query_func()
            execution_time = time.time() - start_time
            results[name] = {
                'execution_time_ms': round(execution_time * 1000, 2),
                'result': result,
                'status': 'success'
            }
        except Exception as e:
            results[name] = {
                'execution_time_ms': 0,
                'error': str(e),
                'status': 'error'
            }
    
    return results

def get_table_statistics():
    """Get statistics about database tables"""
    try:
        # This is SQLite-specific
        tables = ['users', 'domains', 'traffic_logs', 'analytics', 'billing_plans']
        stats = {}
        
        for table in tables:
            try:
                result = db.session.execute(text(f'SELECT COUNT(*) FROM {table}')).fetchone()
                stats[table] = {
                    'row_count': result[0] if result else 0,
                    'size_kb': get_table_size(table)
                }
            except:
                stats[table] = {'error': 'Table not accessible'}
        
        return stats
    except Exception as e:
        return {'error': str(e)}

def analyze_indexes():
    """Analyze database indexes for optimization opportunities"""
    try:
        # SQLite-specific index analysis
        indexes = db.session.execute(text("""
            SELECT name, tbl_name, sql FROM sqlite_master 
            WHERE type='index' AND tbl_name NOT LIKE 'sqlite_%'
        """)).fetchall()
        
        return [
            {
                'name': idx[0],
                'table': idx[1],
                'definition': idx[2]
            }
            for idx in indexes
        ]
    except Exception as e:
        return {'error': str(e)}

def generate_optimization_suggestions(query_times, table_stats, index_analysis):
    """Generate optimization suggestions based on analysis"""
    suggestions = []
    
    # Query performance suggestions
    for query_name, metrics in query_times.items():
        if metrics.get('status') == 'success':
            execution_time = metrics.get('execution_time_ms', 0)
            if execution_time > 100:  # More than 100ms
                suggestions.append({
                    'type': 'query_optimization',
                    'query': query_name,
                    'issue': f'Slow query execution: {execution_time}ms',
                    'recommendation': 'Consider adding database indexes or optimizing the query'
                })
    
    # Table size suggestions
    for table_name, stats in table_stats.items():
        if isinstance(stats, dict) and 'row_count' in stats:
            row_count = stats.get('row_count', 0)
            if row_count > 10000:
                suggestions.append({
                    'type': 'table_optimization',
                    'table': table_name,
                    'issue': f'Large table: {row_count:,} rows',
                    'recommendation': 'Consider partitioning or archiving old data'
                })
    
    # Index suggestions
    if isinstance(index_analysis, list) and len(index_analysis) < 5:
        suggestions.append({
            'type': 'index_optimization',
            'issue': 'Limited number of indexes',
            'recommendation': 'Consider adding indexes on frequently queried columns'
        })
    
    return suggestions

def analyze_slow_queries():
    """Analyze slow queries (placeholder for query logging)"""
    # In a production system, this would analyze query logs
    # For now, return common optimization patterns
    return [
        {
            'query_pattern': 'SELECT * FROM traffic_logs WHERE timestamp > ?',
            'frequency': 'High',
            'avg_execution_time': '150ms',
            'recommendation': 'Add index on timestamp column'
        },
        {
            'query_pattern': 'SELECT * FROM users WHERE email = ?',
            'frequency': 'High',
            'avg_execution_time': '5ms',
            'recommendation': 'Query is well-optimized'
        }
    ]

def generate_query_recommendations(slow_queries):
    """Generate recommendations for slow queries"""
    recommendations = []
    
    for query in slow_queries:
        if 'timestamp' in query['query_pattern']:
            recommendations.append({
                'type': 'index',
                'table': 'traffic_logs',
                'columns': ['timestamp'],
                'reason': 'Frequent timestamp-based queries'
            })
        
        if 'email' in query['query_pattern']:
            recommendations.append({
                'type': 'index',
                'table': 'users',
                'columns': ['email'],
                'reason': 'Email lookups should be fast'
            })
    
    return recommendations

def get_database_size():
    """Get database file size in MB"""
    try:
        import os
        db_path = current_app.config.get('SQLALCHEMY_DATABASE_URI', '').replace('sqlite:///', '')
        if db_path and os.path.exists(db_path):
            size_bytes = os.path.getsize(db_path)
            return round(size_bytes / (1024 * 1024), 2)
        return 0
    except:
        return 0

def get_table_size(table_name):
    """Get table size in KB (SQLite-specific)"""
    try:
        result = db.session.execute(text(f'PRAGMA table_info({table_name})')).fetchall()
        return len(result) * 0.1  # Rough estimate
    except:
        return 0

def get_uptime():
    """Get application uptime"""
    try:
        # This would typically come from application startup time
        # For now, return a placeholder
        return "24h 15m 30s"
    except:
        return "Unknown"

def get_active_connections():
    """Get number of active connections (simulated)"""
    try:
        # In a real system, this would count actual connections
        return 5  # Placeholder
    except:
        return 0

def get_request_rate():
    """Get current request rate (simulated)"""
    try:
        # In a real system, this would calculate from actual metrics
        return 120  # requests per minute placeholder
    except:
        return 0
