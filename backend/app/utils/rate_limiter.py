#!/usr/bin/env python3
"""
Rate Limiting Utility
Handles rate limiting for content protection
"""

import time
from collections import defaultdict
from typing import Dict, Tuple, Optional

class RateLimiter:
    """Simple in-memory rate limiter for content protection"""
    
    def __init__(self):
        self.requests = defaultdict(list)
        self.limits = {
            'default': {'requests': 100, 'window': 60},  # 100 requests per minute
            'strict': {'requests': 10, 'window': 60},    # 10 requests per minute
            'aggressive': {'requests': 5, 'window': 60}, # 5 requests per minute
        }
    
    def is_allowed(self, key: str, limit_type: str = 'default') -> Tuple[bool, Dict]:
        """
        Check if request is allowed based on rate limit
        
        Args:
            key: Unique identifier (usually IP address)
            limit_type: Type of limit to apply
            
        Returns:
            Tuple of (is_allowed, rate_limit_info)
        """
        now = time.time()
        limit_config = self.limits.get(limit_type, self.limits['default'])
        
        # Clean old requests outside the window
        window_start = now - limit_config['window']
        self.requests[key] = [req_time for req_time in self.requests[key] if req_time > window_start]
        
        # Check if limit exceeded
        current_requests = len(self.requests[key])
        is_allowed = current_requests < limit_config['requests']
        
        if is_allowed:
            self.requests[key].append(now)
        
        rate_limit_info = {
            'limit_type': limit_type,
            'current_requests': current_requests,
            'max_requests': limit_config['requests'],
            'window_seconds': limit_config['window'],
            'reset_time': now + limit_config['window'],
            'remaining_requests': max(0, limit_config['requests'] - current_requests)
        }
        
        return is_allowed, rate_limit_info
    
    def get_rate_limit_info(self, key: str, limit_type: str = 'default') -> Dict:
        """Get current rate limit information for a key"""
        now = time.time()
        limit_config = self.limits.get(limit_type, self.limits['default'])
        
        # Clean old requests
        window_start = now - limit_config['window']
        self.requests[key] = [req_time for req_time in self.requests[key] if req_time > window_start]
        
        current_requests = len(self.requests[key])
        
        return {
            'limit_type': limit_type,
            'current_requests': current_requests,
            'max_requests': limit_config['requests'],
            'window_seconds': limit_config['window'],
            'reset_time': now + limit_config['window'],
            'remaining_requests': max(0, limit_config['requests'] - current_requests),
            'is_exceeded': current_requests >= limit_config['requests']
        }
    
    def reset_rate_limit(self, key: str):
        """Reset rate limit for a specific key"""
        if key in self.requests:
            del self.requests[key]
    
    def set_custom_limit(self, limit_type: str, requests: int, window: int):
        """Set a custom rate limit configuration"""
        self.limits[limit_type] = {
            'requests': requests,
            'window': window
        }
