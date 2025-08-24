#!/usr/bin/env python3
"""
API Management API
Handles API monitoring, rate limiting, and gateway statistics
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .security import admin_required
from app.utils.api_gateway import api_gateway
from app.utils.cache_manager import cache_manager
from datetime import datetime, timedelta
import time

api_management = Blueprint('api_management', __name__)

@api_management.route('/stats', methods=['GET'])
@jwt_required()
@admin_required
def get_api_stats():
    """Get API usage statistics"""
    try:
        stats = api_gateway.get_api_stats()
        
        # Add timestamp
        stats['timestamp'] = datetime.utcnow().isoformat()
        
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_management.route('/rate-limits', methods=['GET'])
@jwt_required()
@admin_required
def get_rate_limits():
    """Get current rate limit configurations"""
    try:
        return jsonify({
            'rate_limits': api_gateway.rate_limits,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_management.route('/rate-limits', methods=['PUT'])
@jwt_required()
@admin_required
def update_rate_limits():
    """Update rate limit configurations"""
    try:
        data = request.get_json()
        
        # Validate input
        if not isinstance(data, dict):
            return jsonify({'error': 'Invalid data format'}), 400
        
        # Update rate limits
        for limit_type, config in data.items():
            if limit_type in api_gateway.rate_limits:
                if 'requests' in config and isinstance(config['requests'], int):
                    api_gateway.rate_limits[limit_type]['requests'] = config['requests']
                if 'window' in config and isinstance(config['window'], int):
                    api_gateway.rate_limits[limit_type]['window'] = config['window']
        
        return jsonify({
            'message': 'Rate limits updated successfully',
            'rate_limits': api_gateway.rate_limits,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_management.route('/logs', methods=['GET'])
@jwt_required()
@admin_required
def get_api_logs():
    """Get API request and response logs"""
    try:
        # Get time range from query params
        minutes = request.args.get('minutes', 60, type=int)
        current_minute = int(time.time() / 60)
        
        logs = {
            'requests': [],
            'responses': []
        }
        
        # Collect logs from multiple minutes
        for i in range(minutes):
            minute_key = current_minute - i
            request_logs = cache_manager.get(f"api_logs:{minute_key}") or []
            response_logs = cache_manager.get(f"api_response_logs:{minute_key}") or []
            
            logs['requests'].extend(request_logs)
            logs['responses'].extend(response_logs)
        
        # Sort by timestamp
        logs['requests'].sort(key=lambda x: x['timestamp'], reverse=True)
        logs['responses'].sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'logs': logs,
            'total_requests': len(logs['requests']),
            'total_responses': len(logs['responses']),
            'time_range_minutes': minutes,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_management.route('/logs/clear', methods=['POST'])
@jwt_required()
@admin_required
def clear_api_logs():
    """Clear API logs"""
    try:
        if not cache_manager.is_connected():
            return jsonify({'error': 'Cache not available'}), 500
        
        # Clear all log keys
        cleared_count = 0
        for pattern in ['api_logs:*', 'api_response_logs:*']:
            cleared_count += cache_manager.clear_pattern(pattern)
        
        return jsonify({
            'message': 'API logs cleared successfully',
            'cleared_keys': cleared_count,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_management.route('/health', methods=['GET'])
@jwt_required()
def get_api_health():
    """Get API gateway health status"""
    try:
        # Check cache connection
        cache_healthy = cache_manager.is_connected()
        
        # Get basic stats
        stats = api_gateway.get_api_stats()
        
        health_status = 'healthy' if cache_healthy else 'degraded'
        
        return jsonify({
            'status': health_status,
            'cache_connected': cache_healthy,
            'rate_limits_active': len(api_gateway.rate_limits),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

@api_management.route('/endpoints', methods=['GET'])
@jwt_required()
@admin_required
def get_endpoint_stats():
    """Get endpoint usage statistics"""
    try:
        # Get response logs from last hour
        current_minute = int(time.time() / 60)
        endpoint_stats = {}
        
        for i in range(60):  # Last 60 minutes
            minute_key = current_minute - i
            response_logs = cache_manager.get(f"api_response_logs:{minute_key}") or []
            
            for log in response_logs:
                endpoint = log['endpoint']
                if endpoint not in endpoint_stats:
                    endpoint_stats[endpoint] = {
                        'total_requests': 0,
                        'successful_requests': 0,
                        'failed_requests': 0,
                        'total_execution_time': 0,
                        'min_execution_time': float('inf'),
                        'max_execution_time': 0
                    }
                
                stats = endpoint_stats[endpoint]
                stats['total_requests'] += 1
                stats['total_execution_time'] += log['execution_time']
                
                if log['status'] == 'success':
                    stats['successful_requests'] += 1
                else:
                    stats['failed_requests'] += 1
                
                stats['min_execution_time'] = min(stats['min_execution_time'], log['execution_time'])
                stats['max_execution_time'] = max(stats['max_execution_time'], log['execution_time'])
        
        # Calculate averages and success rates
        for endpoint, stats in endpoint_stats.items():
            if stats['total_requests'] > 0:
                stats['avg_execution_time'] = round(
                    (stats['total_execution_time'] / stats['total_requests']) * 1000, 2
                )
                stats['success_rate'] = round(
                    (stats['successful_requests'] / stats['total_requests']) * 100, 2
                )
            else:
                stats['avg_execution_time'] = 0
                stats['success_rate'] = 0
            
            # Convert execution times to milliseconds
            stats['min_execution_time'] = round(stats['min_execution_time'] * 1000, 2)
            stats['max_execution_time'] = round(stats['max_execution_time'] * 1000, 2)
            stats['total_execution_time'] = round(stats['total_execution_time'] * 1000, 2)
        
        return jsonify({
            'endpoint_stats': endpoint_stats,
            'total_endpoints': len(endpoint_stats),
            'time_range_minutes': 60,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_management.route('/throttling', methods=['POST'])
@jwt_required()
@admin_required
def throttle_endpoint():
    """Temporarily throttle an endpoint"""
    try:
        data = request.get_json()
        endpoint = data.get('endpoint')
        duration = data.get('duration', 300)  # Default 5 minutes
        reason = data.get('reason', 'Administrative action')
        
        if not endpoint:
            return jsonify({'error': 'Endpoint is required'}), 400
        
        # Create throttling rule in cache
        throttle_key = f"throttled_endpoint:{endpoint}"
        cache_manager.set(throttle_key, {
            'endpoint': endpoint,
            'throttled_at': time.time(),
            'duration': duration,
            'reason': reason
        }, duration)
        
        return jsonify({
            'message': f'Endpoint {endpoint} throttled successfully',
            'duration_seconds': duration,
            'expires_at': datetime.utcnow() + timedelta(seconds=duration),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_management.route('/throttling/<endpoint>', methods=['DELETE'])
@jwt_required()
@admin_required
def remove_throttling(endpoint):
    """Remove throttling from an endpoint"""
    try:
        throttle_key = f"throttled_endpoint:{endpoint}"
        
        if cache_manager.exists(throttle_key):
            cache_manager.delete(throttle_key)
            message = f'Throttling removed from endpoint {endpoint}'
        else:
            message = f'Endpoint {endpoint} is not currently throttled'
        
        return jsonify({
            'message': message,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api_management.route('/throttling', methods=['GET'])
@jwt_required()
@admin_required
def get_throttled_endpoints():
    """Get list of currently throttled endpoints"""
    try:
        if not cache_manager.is_connected():
            return jsonify({'throttled_endpoints': []}), 200
        
        # Get all throttled endpoint keys
        throttled_keys = cache_manager.redis_client.keys('throttled_endpoint:*')
        throttled_endpoints = []
        
        for key in throttled_keys:
            endpoint_data = cache_manager.get(key)
            if endpoint_data:
                endpoint_data['key'] = key.decode() if isinstance(key, bytes) else key
                throttled_endpoints.append(endpoint_data)
        
        return jsonify({
            'throttled_endpoints': throttled_endpoints,
            'total_throttled': len(throttled_endpoints),
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
