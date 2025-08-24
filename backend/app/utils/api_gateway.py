#!/usr/bin/env python3
"""
API Gateway Utility
Handles rate limiting, request validation, and API management
"""

import time
import hashlib
import json
from typing import Dict, Any, Optional, Callable
from functools import wraps
from flask import request, jsonify, current_app
from app.utils.cache_manager import cache_manager

class APIGateway:
    """API Gateway for request management and rate limiting"""
    
    def __init__(self):
        self.rate_limits = {
            'default': {'requests': 100, 'window': 3600},  # 100 requests per hour
            'auth': {'requests': 10, 'window': 300},       # 10 requests per 5 minutes
            'analytics': {'requests': 50, 'window': 3600}, # 50 requests per hour
            'admin': {'requests': 200, 'window': 3600},    # 200 requests per hour
        }
    
    def rate_limit(self, limit_type: str = 'default'):
        """Decorator for rate limiting endpoints"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Get client identifier
                client_id = self._get_client_id()
                
                # Check rate limit
                if not self._check_rate_limit(client_id, limit_type):
                    return jsonify({
                        'error': 'Rate limit exceeded',
                        'limit_type': limit_type,
                        'retry_after': self._get_retry_after(client_id, limit_type)
                    }), 429
                
                return func(*args, **kwargs)
            return wrapper
        return decorator
    
    def _get_client_id(self) -> str:
        """Get unique client identifier"""
        # Try to get user ID from JWT token first
        try:
            from flask_jwt_extended import get_jwt_identity
            user_id = get_jwt_identity()
            if user_id:
                return f"user_{user_id}"
        except:
            pass
        
        # Fall back to IP address
        return f"ip_{request.remote_addr}"
    
    def _check_rate_limit(self, client_id: str, limit_type: str) -> bool:
        """Check if client has exceeded rate limit"""
        if not cache_manager.is_connected():
            return True  # Allow if cache is not available
        
        limit_config = self.rate_limits.get(limit_type, self.rate_limits['default'])
        key = f"rate_limit:{limit_type}:{client_id}"
        
        # Get current count
        current_count = cache_manager.get(key) or 0
        
        if current_count >= limit_config['requests']:
            return False
        
        # Increment count
        cache_manager.set(key, current_count + 1, limit_config['window'])
        return True
    
    def _get_retry_after(self, client_id: str, limit_type: str) -> int:
        """Get retry after time in seconds"""
        if not cache_manager.is_connected():
            return 60
        
        limit_config = self.rate_limits.get(limit_type, self.rate_limits['default'])
        key = f"rate_limit:{limit_type}:{client_id}"
        
        # Get TTL for the key
        ttl = cache_manager.redis_client.ttl(key) if cache_manager.is_connected() else 0
        return max(ttl, 60)
    
    def validate_request(self, required_fields: list = None, optional_fields: list = None):
        """Decorator for request validation"""
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                if request.method in ['POST', 'PUT', 'PATCH']:
                    data = request.get_json() or {}
                    
                    # Check required fields
                    if required_fields:
                        missing_fields = [field for field in required_fields if field not in data]
                        if missing_fields:
                            return jsonify({
                                'error': 'Missing required fields',
                                'missing_fields': missing_fields
                            }), 400
                    
                    # Validate field types (basic validation)
                    validation_errors = self._validate_field_types(data, required_fields or [], optional_fields or [])
                    if validation_errors:
                        return jsonify({
                            'error': 'Field validation failed',
                            'validation_errors': validation_errors
                        }), 400
                
                return func(*args, **kwargs)
            return wrapper
        return decorator
    
    def _validate_field_types(self, data: Dict[str, Any], required_fields: list, optional_fields: list) -> list:
        """Validate field types"""
        errors = []
        all_fields = required_fields + optional_fields
        
        for field in all_fields:
            if field in data:
                value = data[field]
                
                # Basic type validation
                if field.endswith('_id') and not isinstance(value, (int, str)):
                    errors.append(f"{field} must be an integer or string")
                elif field.endswith('_email') and not isinstance(value, str):
                    errors.append(f"{field} must be a string")
                elif field.endswith('_count') and not isinstance(value, int):
                    errors.append(f"{field} must be an integer")
                elif field.endswith('_enabled') and not isinstance(value, bool):
                    errors.append(f"{field} must be a boolean")
        
        return errors
    
    def api_key_required(self, func: Callable) -> Callable:
        """Decorator for API key authentication"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            api_key = request.headers.get('X-API-Key')
            if not api_key:
                return jsonify({'error': 'API key required'}), 401
            
            # Validate API key (in production, check against database)
            if not self._validate_api_key(api_key):
                return jsonify({'error': 'Invalid API key'}), 401
            
            return func(*args, **kwargs)
        return wrapper
    
    def _validate_api_key(self, api_key: str) -> bool:
        """Validate API key"""
        # In production, this would check against database
        # For now, accept any non-empty key
        return bool(api_key and len(api_key) >= 10)
    
    def request_logging(self, func: Callable) -> Callable:
        """Decorator for request logging"""
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            
            # Log request
            self._log_request(func.__name__, request.method, request.path)
            
            try:
                result = func(*args, **kwargs)
                execution_time = time.time() - start_time
                
                # Log successful response
                self._log_response(func.__name__, 'success', execution_time)
                
                return result
            except Exception as e:
                execution_time = time.time() - start_time
                
                # Log error
                self._log_response(func.__name__, 'error', execution_time, str(e))
                
                raise
        
        return wrapper
    
    def _log_request(self, endpoint: str, method: str, path: str):
        """Log incoming request"""
        log_data = {
            'timestamp': time.time(),
            'endpoint': endpoint,
            'method': method,
            'path': path,
            'ip': request.remote_addr,
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        }
        
        # Store in cache for monitoring
        if cache_manager.is_connected():
            key = f"api_logs:{int(time.time() / 60)}"  # Group by minute
            logs = cache_manager.get(key) or []
            logs.append(log_data)
            cache_manager.set(key, logs, 300)  # Keep for 5 minutes
    
    def _log_response(self, endpoint: str, status: str, execution_time: float, error: str = None):
        """Log response details"""
        log_data = {
            'timestamp': time.time(),
            'endpoint': endpoint,
            'status': status,
            'execution_time': execution_time,
            'error': error
        }
        
        # Store in cache for monitoring
        if cache_manager.is_connected():
            key = f"api_response_logs:{int(time.time() / 60)}"  # Group by minute
            logs = cache_manager.get(key) or []
            logs.append(log_data)
            cache_manager.set(key, logs, 300)  # Keep for 5 minutes
    
    def get_api_stats(self) -> Dict[str, Any]:
        """Get API usage statistics"""
        if not cache_manager.is_connected():
            return {'error': 'Cache not available'}
        
        stats = {}
        
        # Get rate limit stats
        for limit_type in self.rate_limits.keys():
            pattern = f"rate_limit:{limit_type}:*"
            keys = cache_manager.redis_client.keys(pattern)
            stats[f'{limit_type}_active_limits'] = len(keys)
        
        # Get request logs
        current_minute = int(time.time() / 60)
        request_logs = cache_manager.get(f"api_logs:{current_minute}") or []
        response_logs = cache_manager.get(f"api_response_logs:{current_minute}") or []
        
        stats['requests_this_minute'] = len(request_logs)
        stats['responses_this_minute'] = len(response_logs)
        
        # Calculate success rate
        if response_logs:
            success_count = len([log for log in response_logs if log['status'] == 'success'])
            stats['success_rate'] = (success_count / len(response_logs)) * 100
        else:
            stats['success_rate'] = 0
        
        # Calculate average response time
        if response_logs:
            avg_time = sum(log['execution_time'] for log in response_logs) / len(response_logs)
            stats['avg_response_time'] = round(avg_time * 1000, 2)  # in milliseconds
        else:
            stats['avg_response_time'] = 0
        
        return stats

# Global API gateway instance
api_gateway = APIGateway()

# Convenience decorators
def rate_limit(limit_type: str = 'default'):
    """Rate limiting decorator"""
    return api_gateway.rate_limit(limit_type)

def validate_request(required_fields: list = None, optional_fields: list = None):
    """Request validation decorator"""
    return api_gateway.validate_request(required_fields, optional_fields)

def api_key_required(func: Callable) -> Callable:
    """API key authentication decorator"""
    return api_gateway.api_key_required(func)

def request_logging(func: Callable) -> Callable:
    """Request logging decorator"""
    return api_gateway.request_logging(func)
