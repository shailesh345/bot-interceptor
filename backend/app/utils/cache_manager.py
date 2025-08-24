#!/usr/bin/env python3
"""
Cache Manager for Performance Optimization
Handles Redis caching, database query optimization, and performance monitoring
"""

import redis
import json
import pickle
import hashlib
import time
from functools import wraps
from typing import Any, Optional, Union, Callable
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    """Redis-based cache manager for performance optimization"""
    
    def __init__(self, redis_url: str = "redis://localhost:6379", default_ttl: int = 3600):
        """
        Initialize cache manager
        
        Args:
            redis_url: Redis connection URL
            default_ttl: Default time-to-live in seconds
        """
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=False)
            self.default_ttl = default_ttl
            self.connected = True
            logger.info("Cache manager initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize cache manager: {e}")
            self.redis_client = None
            self.connected = False
    
    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if not self.redis_client:
            return False
        
        try:
            self.redis_client.ping()
            return True
        except:
            return False
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key from prefix and arguments"""
        key_parts = [prefix]
        
        # Add positional arguments
        for arg in args:
            if isinstance(arg, (str, int, float, bool)):
                key_parts.append(str(arg))
            else:
                key_parts.append(hashlib.md5(str(arg).encode()).hexdigest()[:8])
        
        # Add keyword arguments
        for key, value in sorted(kwargs.items()):
            if isinstance(value, (str, int, float, bool)):
                key_parts.append(f"{key}:{value}")
            else:
                key_parts.append(f"{key}:{hashlib.md5(str(value).encode()).hexdigest()[:8]}")
        
        return ":".join(key_parts)
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.is_connected():
            return None
        
        try:
            value = self.redis_client.get(key)
            if value:
                return pickle.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting cache key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache with optional TTL"""
        if not self.is_connected():
            return False
        
        try:
            ttl = ttl or self.default_ttl
            serialized_value = pickle.dumps(value)
            return self.redis_client.setex(key, ttl, serialized_value)
        except Exception as e:
            logger.error(f"Error setting cache key {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.is_connected():
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Error deleting cache key {key}: {e}")
            return False
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.is_connected():
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Error checking cache key {key}: {e}")
            return False
    
    def expire(self, key: str, ttl: int) -> bool:
        """Set expiration time for key"""
        if not self.is_connected():
            return False
        
        try:
            return bool(self.redis_client.expire(key, ttl))
        except Exception as e:
            logger.error(f"Error setting expiration for key {key}: {e}")
            return False
    
    def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        if not self.is_connected():
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Error clearing pattern {pattern}: {e}")
            return 0
    
    def get_or_set(self, key: str, callback: Callable, ttl: Optional[int] = None) -> Any:
        """Get from cache or set using callback function"""
        value = self.get(key)
        if value is not None:
            return value
        
        # Call callback to get value
        value = callback()
        if value is not None:
            self.set(key, value, ttl)
        
        return value
    
    def invalidate_user_cache(self, user_id: int):
        """Invalidate all cache entries for a specific user"""
        pattern = f"user:{user_id}:*"
        return self.clear_pattern(pattern)
    
    def invalidate_tenant_cache(self, tenant_id: int):
        """Invalidate all cache entries for a specific tenant"""
        pattern = f"tenant:{tenant_id}:*"
        return self.clear_pattern(pattern)
    
    def invalidate_domain_cache(self, domain_id: int):
        """Invalidate all cache entries for a specific domain"""
        pattern = f"domain:{domain_id}:*"
        return self.clear_pattern(pattern)
    
    def get_stats(self) -> dict:
        """Get cache statistics"""
        if not self.is_connected():
            return {"connected": False}
        
        try:
            info = self.redis_client.info()
            return {
                "connected": True,
                "total_keys": info.get('db0', {}).get('keys', 0),
                "memory_usage": info.get('used_memory_human', 'N/A'),
                "hit_rate": info.get('keyspace_hits', 0) / max(info.get('keyspace_misses', 1), 1)
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"connected": False, "error": str(e)}

# Global cache manager instance
cache_manager = CacheManager()

def cached(prefix: str, ttl: Optional[int] = None, key_func: Optional[Callable] = None):
    """
    Decorator for caching function results
    
    Args:
        prefix: Cache key prefix
        ttl: Time-to-live in seconds
        key_func: Custom key generation function
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not cache_manager.is_connected():
                return func(*args, **kwargs)
            
            # Generate cache key
            if key_func:
                cache_key = key_func(prefix, *args, **kwargs)
            else:
                cache_key = cache_manager._generate_key(prefix, *args, **kwargs)
            
            # Try to get from cache
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            if result is not None:
                cache_manager.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

def cache_invalidate(pattern: str):
    """Decorator for invalidating cache after function execution"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = func(*args, **kwargs)
            
            if cache_manager.is_connected():
                cache_manager.clear_pattern(pattern)
            
            return result
        return wrapper
    return decorator

# Performance monitoring decorators
def performance_monitor(func: Callable) -> Callable:
    """Decorator for monitoring function performance"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            # Log performance metrics
            logger.info(f"Function {func.__name__} executed in {execution_time:.4f}s")
            
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Function {func.__name__} failed after {execution_time:.4f}s: {e}")
            raise
    
    return wrapper

def query_optimizer(func: Callable) -> Callable:
    """Decorator for database query optimization"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Add query optimization logic here
        # This could include query plan analysis, index suggestions, etc.
        return func(*args, **kwargs)
    
    return wrapper

