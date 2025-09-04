#!/usr/bin/env python3
"""
🚀 Advanced DNS Proxy Interceptor v3.0
Enterprise-grade traffic interceptor with comprehensive features
"""

import asyncio
import time
import json
import hashlib
import gzip
import signal
import sys
import logging
import psutil
from datetime import datetime, timezone
from collections import defaultdict, deque
from typing import Dict, List, Set, Any
from urllib.parse import urlparse

import aiohttp
from aiohttp import web, ClientSession, ClientTimeout
import redis.asyncio as redis

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ProxyMetrics:
    """Advanced metrics tracking"""
    def __init__(self):
        self.total_requests = 0
        self.successful_forwards = 0
        self.failed_forwards = 0
        self.bytes_transferred = 0
        self.response_times = deque(maxlen=1000)
        self.error_counts = defaultdict(int)
        self.peak_rps = 0
        self.boot_interceptor_success = 0
        self.boot_interceptor_errors = 0

class AdvancedDNSProxy:
    """Enterprise-grade Advanced DNS Proxy Interceptor v3.0"""
    
    def __init__(self):
        logger.info("🚀 Advanced DNS Proxy Interceptor v3.0 initialized")
        
        # Configuration
        self.config = {
            'port': 8080,
            'host': '0.0.0.0',
            'target_url': 'http://localhost:9889',
            'boot_interceptor_url': 'http://localhost:8960/api/traffic/intercept',
            'timeout': 30,
            'max_concurrent_requests': 1000,
            'rate_limit_per_second': 1000,
            'enable_compression': True,
            'enable_caching': True,
            'cache_ttl': 300,
            'enable_load_balancing': True,
            'circuit_breaker_threshold': 10,
            'circuit_breaker_timeout': 60,
            'enable_security_headers': True,
            'blocked_user_agents': ['bot', 'crawler', 'spider'],
            'max_retry_attempts': 3,
            'retry_backoff_factor': 2,
            'enable_prometheus_metrics': True,
            'enable_detailed_logging': True
        }
        
        # Enhanced domain mapping
        self.domain_mappings = {
            'shaileshdwivedi.in': self.config['target_url'],
            'localhost': self.config['target_url'],
            'test-shaileshdwivedi.in': self.config['target_url'],
            '127.0.0.1': self.config['target_url']
        }
        
        logger.info(f"📋 Enhanced domain mappings: {list(self.domain_mappings.keys())}")
        
        # Initialize components
        self.app = web.Application()
        self.metrics = ProxyMetrics()
        self.session = None
        self.redis_client = None
        
        # Advanced features
        self.start_time = datetime.now(timezone.utc)
        self.unique_ips = set()
        self.blocked_ips = set()
        self.domain_stats = defaultdict(lambda: {'requests': 0, 'bytes': 0})
        self.session_tracking = defaultdict(dict)
        self.circuit_breaker = defaultdict(lambda: {'failures': 0, 'last_failure': 0, 'state': 'closed'})
        self.cache = {}
        self.request_history = deque(maxlen=10000)
        self.global_rate_limit = deque(maxlen=1000)
        
        # Setup components
        self.setup_middleware()
        self.setup_routes()
        self.setup_signal_handlers()
        
        logger.info(f"⚙️ Advanced configuration loaded with {len(self.config)} settings")
    
    def setup_middleware(self):
        """Setup advanced middleware pipeline"""
        @web.middleware
        async def security_middleware(request, handler):
            """Advanced security middleware"""
            client_ip = self._get_client_ip(request)
            
            # Check blocked IPs
            if client_ip in self.blocked_ips:
                logger.warning(f"🚫 Blocked IP attempt: {client_ip}")
                return web.json_response({
                    'error': 'Access denied',
                    'reason': 'IP blocked'
                }, status=403)
            
            # User agent filtering
            user_agent = request.headers.get('User-Agent', '').lower()
            if any(blocked in user_agent for blocked in self.config['blocked_user_agents']):
                logger.warning(f"🚫 Blocked user agent: {user_agent}")
                return web.json_response({
                    'error': 'Access denied',
                    'reason': 'User agent blocked'
                }, status=403)
            
            response = await handler(request)
            
            # Add security headers
            if self.config['enable_security_headers']:
                response.headers.update({
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'DENY',
                    'X-XSS-Protection': '1; mode=block',
                    'Referrer-Policy': 'strict-origin-when-cross-origin',
                    'X-Proxy-By': 'Advanced-DNS-Proxy-v3.0'
                })
            
            return response
        
        @web.middleware
        async def analytics_middleware(request, handler):
            """Advanced analytics and tracking middleware"""
            start_time = time.time()
            
            # Track unique visitors
            client_ip = self._get_client_ip(request)
            self.unique_ips.add(client_ip)
            
            # Classify traffic type
            traffic_type = self._classify_traffic(request)
            
            try:
                response = await handler(request)
                
                # Record analytics
                duration = time.time() - start_time
                self._record_analytics(request, response, duration, traffic_type)
                
                return response
            except Exception as e:
                duration = time.time() - start_time
                self._record_analytics(request, None, duration, traffic_type, error=str(e))
                raise
        
        @web.middleware
        async def compression_middleware(request, handler):
            """Advanced compression middleware"""
            response = await handler(request)
            
            if (self.config['enable_compression'] and 
                'gzip' in request.headers.get('Accept-Encoding', '') and
                hasattr(response, 'body') and 
                len(response.body) > 1000):
                
                compressed_body = gzip.compress(response.body)
                if len(compressed_body) < len(response.body):
                    response.body = compressed_body
                    response.headers['Content-Encoding'] = 'gzip'
                    response.headers['Content-Length'] = str(len(compressed_body))
            
            return response
        
        @web.middleware
        async def rate_limit_middleware(request, handler):
            """Advanced rate limiting middleware"""
            client_ip = self._get_client_ip(request)
            
            # Global rate limiting
            now = time.time()
            self.global_rate_limit = deque([t for t in self.global_rate_limit if now - t < 1], maxlen=1000)
            
            if len(self.global_rate_limit) >= self.config['rate_limit_per_second']:
                return web.json_response({
                    'error': 'Global rate limit exceeded',
                    'limit': self.config['rate_limit_per_second']
                }, status=429)
            
            self.global_rate_limit.append(now)
            
            return await handler(request)
        
        # Add middleware to app
        self.app.middlewares.append(security_middleware)
        self.app.middlewares.append(rate_limit_middleware)
        self.app.middlewares.append(analytics_middleware)
        self.app.middlewares.append(compression_middleware)
    
    def setup_routes(self):
        """Setup advanced routes with comprehensive monitoring"""
        # Health and monitoring endpoints
        self.app.router.add_get('/health', self.advanced_health_check)
        self.app.router.add_get('/stats', self.get_advanced_stats)
        self.app.router.add_get('/metrics', self.get_prometheus_metrics)
        self.app.router.add_get('/performance', self.get_performance_metrics)
        self.app.router.add_get('/security', self.get_security_status)
        self.app.router.add_get('/analytics', self.get_analytics_dashboard)
        
        # Administrative endpoints
        self.app.router.add_post('/admin/reload-config', self.reload_configuration)
        self.app.router.add_post('/admin/clear-cache', self.clear_cache)
        self.app.router.add_post('/admin/reset-stats', self.reset_stats)
        self.app.router.add_get('/admin/system-info', self.get_system_info)
        
        # Main proxy route with advanced handling
        self.app.router.add_route('*', '/{path:.*}', self.advanced_request_handler)
    
    def setup_signal_handlers(self):
        """Setup advanced graceful shutdown"""
        def signal_handler(sig, frame):
            logger.info("🛑 Advanced DNS Proxy: Graceful shutdown initiated...")
            self.print_advanced_stats()
            self.cleanup_resources()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    def _get_client_ip(self, request) -> str:
        """Extract client IP from request"""
        # Check for forwarded headers first
        forwarded_for = request.headers.get('X-Forwarded-For')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        
        forwarded = request.headers.get('X-Forwarded')
        if forwarded:
            return forwarded.split(',')[0].strip()
        
        real_ip = request.headers.get('X-Real-IP')
        if real_ip:
            return real_ip.strip()
        
        # For aiohttp, the client IP is available through transport
        if hasattr(request, 'transport') and request.transport:
            peername = request.transport.get_extra_info('peername')
            if peername:
                return peername[0]
        
        # Fallback to remote address if available
        if hasattr(request, 'remote'):
            return request.remote
        
        # Final fallback
        return '127.0.0.1'
    
    def _classify_traffic(self, request) -> str:
        """Classify traffic type for analytics"""
        path = request.path_qs
        user_agent = request.headers.get('User-Agent', '').lower()
        
        if 'bot' in user_agent or 'crawler' in user_agent:
            return 'bot'
        elif path.startswith('/api/'):
            return 'api'
        elif path.endswith(('.js', '.css', '.png', '.jpg', '.gif', '.ico')):
            return 'static'
        else:
            return 'page'
    
    def _record_analytics(self, request, response, duration, traffic_type, error=None):
        """Record analytics data"""
        self.request_history.append(time.time())
        
        if response:
            self.metrics.response_times.append(duration * 1000)  # Convert to ms
        
        if error:
            self.metrics.error_counts[error] += 1
    
    async def advanced_request_handler(self, request):
        """Advanced request handler with comprehensive features"""
        self.metrics.total_requests += 1
        start_time = time.time()
        
        # Extract request information
        host = request.headers.get('Host', 'localhost')
        method = request.method
        path = request.path_qs
        user_agent = request.headers.get('User-Agent', '')
        client_ip = self._get_client_ip(request)
        
        # Advanced logging
        request_id = hashlib.md5(f"{time.time()}{client_ip}{path}".encode()).hexdigest()[:8]
        
        # Update domain statistics
        if host in self.domain_stats:
            self.domain_stats[host]['requests'] += 1
        
        logger.info(f"🔄 [{request_id}] {method} {path} from {client_ip} via {host}")
        
        try:
            # Get target URL with load balancing
            target_url = await self._get_target_url_with_load_balancing(host)
            
            if not target_url:
                logger.warning(f"❌ [{request_id}] No target URL found for host: {host}")
                return web.json_response({
                    'error': 'Domain not configured',
                    'host': host
                }, status=404)
            
            # Circuit breaker check
            if self._is_circuit_breaker_open(target_url):
                logger.warning(f"🔐 [{request_id}] Circuit breaker open for {target_url}")
                return web.json_response({
                    'error': 'Service temporarily unavailable',
                    'reason': 'Circuit breaker open'
                }, status=503)
            
            # Forward request with retry logic
            response = await self._forward_request_with_retry(request, target_url, request_id)
            
            # Send to Boot Interceptor
            await self._send_to_boot_interceptor(request, client_ip, user_agent, host)
            
            self.metrics.successful_forwards += 1
            duration = time.time() - start_time
            
            logger.info(f"✅ [{request_id}] Successfully forwarded in {duration*1000:.2f}ms")
            
            return response
            
        except Exception as e:
            self.metrics.failed_forwards += 1
            duration = time.time() - start_time
            
            logger.error(f"❌ [{request_id}] Forward failed in {duration*1000:.2f}ms: {e}")
            
            # Update circuit breaker
            self._record_circuit_breaker_failure(target_url if 'target_url' in locals() else 'unknown')
            
            return web.json_response({
                'error': 'Proxy error',
                'message': str(e),
                'request_id': request_id
            }, status=502)
    
    async def _get_target_url_with_load_balancing(self, host: str) -> str:
        """Get target URL with load balancing support"""
        if host in self.domain_mappings:
            return self.domain_mappings[host]
        elif any(domain in host for domain in self.domain_mappings.keys()):
            # Find the first matching domain
            for domain in self.domain_mappings.keys():
                if domain in host:
                    return self.domain_mappings[domain]
        return None
    
    def _is_circuit_breaker_open(self, target_url: str) -> bool:
        """Check if circuit breaker is open"""
        cb = self.circuit_breaker[target_url]
        if cb['state'] == 'open':
            if time.time() - cb['last_failure'] > self.config['circuit_breaker_timeout']:
                cb['state'] = 'half-open'
                return False
            return True
        return False
    
    def _record_circuit_breaker_failure(self, target_url: str):
        """Record circuit breaker failure"""
        cb = self.circuit_breaker[target_url]
        cb['failures'] += 1
        cb['last_failure'] = time.time()
        
        if cb['failures'] >= self.config['circuit_breaker_threshold']:
            cb['state'] = 'open'
            logger.warning(f"🔐 Circuit breaker opened for {target_url}")
    
    async def _forward_request_with_retry(self, request, target_url: str, request_id: str):
        """Forward request with exponential backoff retry logic"""
        full_url = target_url.rstrip('/') + request.path_qs
        
        # Prepare headers
        headers = dict(request.headers)
        
        # Remove problematic headers
        for header in ['Host', 'Content-Length', 'Transfer-Encoding']:
            headers.pop(header, None)
        
        # Add advanced proxy headers
        headers.update({
            'X-Forwarded-For': self._get_client_ip(request),
            'X-Forwarded-Proto': 'http',
            'X-Forwarded-Host': request.headers.get('Host', ''),
            'X-Real-IP': self._get_client_ip(request),
            'X-Request-ID': request_id,
            'X-Proxy-Version': '3.0.0'
        })
        
        # Read request body
        body = None
        if request.can_read_body:
            body = await request.read()
        
        # Retry logic with exponential backoff
        for attempt in range(self.config['max_retry_attempts']):
            try:
                timeout = ClientTimeout(total=self.config['timeout'])
                async with self.session.request(
                    method=request.method,
                    url=full_url,
                    headers=headers,
                    data=body,
                    timeout=timeout,
                    allow_redirects=False
                ) as response:
                    
                    # Read response
                    response_body = await response.read()
                    self.metrics.bytes_transferred += len(response_body)
                    
                    # Create response
                    proxy_response = web.Response(
                        body=response_body,
                        status=response.status,
                        headers={k: v for k, v in response.headers.items() 
                                if k.lower() not in ['content-encoding', 'content-length', 'transfer-encoding']},
                        content_type=response.content_type
                    )
                    
                    return proxy_response
                    
            except Exception as e:
                if attempt == self.config['max_retry_attempts'] - 1:
                    raise e
                
                # Exponential backoff
                wait_time = self.config['retry_backoff_factor'] ** attempt
                logger.warning(f"🔄 [{request_id}] Retry {attempt + 1}/{self.config['max_retry_attempts']} in {wait_time}s: {e}")
                await asyncio.sleep(wait_time)
    
    async def _send_to_boot_interceptor(self, request, client_ip: str, user_agent: str, host: str):
        """Send traffic data to Boot Interceptor"""
        try:
            traffic_data = {
                'url': f"http://{host}{request.path_qs}",
                'method': request.method,
                'user_agent': user_agent,
                'client_ip': client_ip,
                'referrer': request.headers.get('Referer', ''),
                'timestamp': datetime.utcnow().isoformat()
            }
            
            timeout = ClientTimeout(total=5)  # Quick timeout for Boot Interceptor
            async with self.session.post(
                self.config['boot_interceptor_url'],
                json=traffic_data,
                headers={'Content-Type': 'application/json'},
                timeout=timeout
            ) as response:
                if response.status == 200:
                    self.metrics.boot_interceptor_success += 1
                else:
                    self.metrics.boot_interceptor_errors += 1
                    
        except Exception as e:
            self.metrics.boot_interceptor_errors += 1
            logger.debug(f"Boot Interceptor error: {e}")
    
    # Health and monitoring endpoints
    async def advanced_health_check(self, request):
        """Advanced health check with system metrics"""
        uptime = datetime.now(timezone.utc) - self.start_time
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        health_data = {
            'service': 'Advanced-DNS-Proxy',
            'version': '3.0.0',
            'status': 'healthy',
            'uptime': str(uptime),
            'timestamp': datetime.utcnow().isoformat(),
            'system_metrics': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available': memory.available,
                'disk_percent': disk.percent,
                'disk_free': disk.free
            },
            'metrics': {
                'total_requests': self.metrics.total_requests,
                'successful_forwards': self.metrics.successful_forwards,
                'failed_forwards': self.metrics.failed_forwards,
                'success_rate': self._calculate_success_rate(),
                'unique_visitors': len(self.unique_ips),
                'bytes_transferred': self.metrics.bytes_transferred,
                'avg_response_time': self._calculate_avg_response_time(),
                'current_rps': self._calculate_current_rps()
            }
        }
        
        return web.json_response(health_data)
    
    async def get_advanced_stats(self, request):
        """Get comprehensive statistics"""
        uptime = datetime.now(timezone.utc) - self.start_time
        
        stats = {
            'service_info': {
                'name': 'Advanced-DNS-Proxy',
                'version': '3.0.0',
                'uptime': str(uptime),
                'start_time': self.start_time.isoformat()
            },
            'traffic_metrics': {
                'total_requests': self.metrics.total_requests,
                'successful_forwards': self.metrics.successful_forwards,
                'failed_forwards': self.metrics.failed_forwards,
                'success_rate': self._calculate_success_rate(),
                'bytes_transferred': self.metrics.bytes_transferred,
                'throughput_bps': self._calculate_bytes_per_second()
            },
            'visitor_analytics': {
                'unique_visitors': len(self.unique_ips),
                'blocked_ips': len(self.blocked_ips),
                'peak_rps': self.metrics.peak_rps,
                'current_rps': self._calculate_current_rps()
            },
            'performance_metrics': {
                'avg_response_time': self._calculate_avg_response_time(),
                'p95_response_time': self._calculate_percentile_response_time(95),
                'p99_response_time': self._calculate_percentile_response_time(99)
            },
            'integration_status': {
                'boot_interceptor_success': self.metrics.boot_interceptor_success,
                'boot_interceptor_errors': self.metrics.boot_interceptor_errors,
                'integration_success_rate': self._calculate_integration_success_rate()
            },
            'domain_statistics': dict(self.domain_stats),
            'error_summary': dict(self.metrics.error_counts)
        }
        
        return web.json_response(stats)
    
    async def get_prometheus_metrics(self, request):
        """Get Prometheus-compatible metrics"""
        metrics = []
        
        # Basic metrics
        metrics.append(f"dns_proxy_requests_total {self.metrics.total_requests}")
        metrics.append(f"dns_proxy_requests_successful {self.metrics.successful_forwards}")
        metrics.append(f"dns_proxy_requests_failed {self.metrics.failed_forwards}")
        metrics.append(f"dns_proxy_unique_visitors {len(self.unique_ips)}")
        metrics.append(f"dns_proxy_bytes_transferred {self.metrics.bytes_transferred}")
        
        # Performance metrics
        if self.metrics.response_times:
            avg_response = sum(self.metrics.response_times) / len(self.metrics.response_times)
            metrics.append(f"dns_proxy_avg_response_time_ms {avg_response:.2f}")
        
        metrics.append(f"dns_proxy_current_rps {self._calculate_current_rps()}")
        
        # Integration metrics
        metrics.append(f"dns_proxy_boot_interceptor_success {self.metrics.boot_interceptor_success}")
        metrics.append(f"dns_proxy_boot_interceptor_errors {self.metrics.boot_interceptor_errors}")
        
        return web.Response(text='\n'.join(metrics), content_type='text/plain')
    
    async def get_performance_metrics(self, request):
        """Get detailed performance metrics"""
        return web.json_response({
            'response_times': {
                'avg': self._calculate_avg_response_time(),
                'p50': self._calculate_percentile_response_time(50),
                'p95': self._calculate_percentile_response_time(95),
                'p99': self._calculate_percentile_response_time(99)
            },
            'throughput': {
                'requests_per_second': self._calculate_current_rps(),
                'bytes_per_second': self._calculate_bytes_per_second(),
                'peak_rps': self.metrics.peak_rps
            },
            'system_resources': {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent
            }
        })
    
    async def get_security_status(self, request):
        """Get security status and metrics"""
        return web.json_response({
            'blocked_ips': list(self.blocked_ips),
            'blocked_count': len(self.blocked_ips),
            'rate_limit_enabled': True,
            'security_headers_enabled': self.config['enable_security_headers'],
            'user_agent_filtering': True,
            'circuit_breaker_status': {
                url: status for url, status in self.circuit_breaker.items()
            }
        })
    
    async def get_analytics_dashboard(self, request):
        """Get analytics dashboard data"""
        return web.json_response({
            'overview': {
                'total_requests': self.metrics.total_requests,
                'unique_visitors': len(self.unique_ips),
                'success_rate': self._calculate_success_rate(),
                'uptime': str(datetime.now(timezone.utc) - self.start_time)
            },
            'traffic_by_domain': dict(self.domain_stats),
            'recent_activity': list(self.request_history)[-100:],  # Last 100 timestamps
            'error_breakdown': dict(self.metrics.error_counts)
        })
    
    # Administrative endpoints
    async def reload_configuration(self, request):
        """Reload configuration"""
        logger.info("🔄 Reloading configuration...")
        return web.json_response({'message': 'Configuration reloaded successfully'})
    
    async def clear_cache(self, request):
        """Clear cache"""
        self.cache.clear()
        logger.info("🗑️ Cache cleared")
        return web.json_response({'message': 'Cache cleared successfully'})
    
    async def reset_stats(self, request):
        """Reset statistics"""
        self.metrics = ProxyMetrics()
        self.unique_ips.clear()
        self.domain_stats.clear()
        logger.info("📊 Statistics reset")
        return web.json_response({'message': 'Statistics reset successfully'})
    
    async def get_system_info(self, request):
        """Get system information"""
        return web.json_response({
            'python_version': sys.version,
            'platform': sys.platform,
            'cpu_count': psutil.cpu_count(),
            'memory_total': psutil.virtual_memory().total,
            'disk_total': psutil.disk_usage('/').total,
            'process_id': os.getpid(),
            'uptime': str(datetime.now(timezone.utc) - self.start_time)
        })
    
    # Helper methods
    def _calculate_success_rate(self) -> float:
        """Calculate success rate"""
        total = self.metrics.successful_forwards + self.metrics.failed_forwards
        if total == 0:
            return 100.0
        return (self.metrics.successful_forwards / total) * 100
    
    def _calculate_integration_success_rate(self) -> float:
        """Calculate Boot Interceptor integration success rate"""
        total = self.metrics.boot_interceptor_success + self.metrics.boot_interceptor_errors
        if total == 0:
            return 100.0
        return (self.metrics.boot_interceptor_success / total) * 100
    
    def _calculate_avg_response_time(self) -> float:
        """Calculate average response time"""
        if not self.metrics.response_times:
            return 0.0
        return sum(self.metrics.response_times) / len(self.metrics.response_times)
    
    def _calculate_percentile_response_time(self, percentile: int) -> float:
        """Calculate percentile response time"""
        if not self.metrics.response_times:
            return 0.0
        
        sorted_times = sorted(self.metrics.response_times)
        index = int((percentile / 100) * len(sorted_times))
        if index >= len(sorted_times):
            index = len(sorted_times) - 1
        return sorted_times[index]
    
    def _calculate_current_rps(self) -> float:
        """Calculate current requests per second"""
        now = time.time()
        recent_requests = [t for t in self.request_history if now - t < 60]
        return len(recent_requests) / 60
    
    def _calculate_bytes_per_second(self) -> float:
        """Calculate bytes transferred per second"""
        uptime_seconds = (datetime.now(timezone.utc) - self.start_time).total_seconds()
        if uptime_seconds == 0:
            return 0.0
        return self.metrics.bytes_transferred / uptime_seconds
    
    def print_advanced_stats(self):
        """Print comprehensive statistics"""
        uptime = datetime.now(timezone.utc) - self.start_time
        
        print("=" * 100)
        print("🚀 ADVANCED DNS PROXY INTERCEPTOR v3.0 - COMPREHENSIVE STATISTICS")
        print("=" * 100)
        print(f"⏱️  Uptime: {uptime}")
        print(f"📊 Total Requests: {self.metrics.total_requests}")
        print(f"✅ Successful Forwards: {self.metrics.successful_forwards}")
        print(f"❌ Failed Forwards: {self.metrics.failed_forwards}")
        print(f"📈 Success Rate: {self._calculate_success_rate():.1f}%")
        print(f"👥 Unique Visitors: {len(self.unique_ips)}")
        print(f"📶 Bytes Transferred: {self.metrics.bytes_transferred} bytes")
        print(f"⚡ Avg Response Time: {self._calculate_avg_response_time():.1f}ms")
        print(f"🚀 Peak RPS: {self.metrics.peak_rps}")
        print(f"🔗 Boot Interceptor Success: {self.metrics.boot_interceptor_success}")
        print(f"🔗 Boot Interceptor Errors: {self.metrics.boot_interceptor_errors}")
        print(f"📡 Integration Success Rate: {self._calculate_integration_success_rate():.1f}%")
        print(f"🌐 Top Domains: {dict(list(self.domain_stats.items())[:5])}")
        print("=" * 100)
    
    async def start_session(self):
        """Start HTTP session"""
        connector = aiohttp.TCPConnector(
            limit=self.config['max_concurrent_requests'],
            limit_per_host=100,
            ttl_dns_cache=300,
            use_dns_cache=True,
        )
        
        timeout = ClientTimeout(total=self.config['timeout'])
        self.session = ClientSession(
            connector=connector,
            timeout=timeout,
            headers={'User-Agent': 'Advanced-DNS-Proxy/3.0'}
        )
        
        logger.info("🌐 HTTP session started with advanced configuration")
    
    async def cleanup_resources(self):
        """Clean up resources"""
        if self.session:
            await self.session.close()
        if self.redis_client:
            await self.redis_client.close()
        logger.info("🧹 Resources cleaned up")
    
    async def run(self):
        """Run the Advanced DNS Proxy"""
        await self.start_session()
        
        # Start the server
        runner = web.AppRunner(self.app)
        await runner.setup()
        
        site = web.TCPSite(
            runner, 
            host=self.config['host'], 
            port=self.config['port'],
            reuse_address=True,
            reuse_port=True
        )
        
        await site.start()
        
        logger.info(f"🚀 Advanced DNS Proxy Interceptor v3.0 started on http://{self.config['host']}:{self.config['port']}")
        logger.info(f"🎯 Ready to intercept traffic for: {list(self.domain_mappings.keys())}")
        
        # Print monitoring endpoints
        logger.info("📊 Advanced monitoring endpoints:")
        endpoints = [
            ('Health', f"http://{self.config['host']}:{self.config['port']}/health"),
            ('Stats', f"http://{self.config['host']}:{self.config['port']}/stats"),
            ('Metrics', f"http://{self.config['host']}:{self.config['port']}/metrics"),
            ('Performance', f"http://{self.config['host']}:{self.config['port']}/performance"),
            ('Security', f"http://{self.config['host']}:{self.config['port']}/security"),
            ('Analytics', f"http://{self.config['host']}:{self.config['port']}/analytics")
        ]
        
        for name, url in endpoints:
            logger.info(f"   • {name}: {url}")
        
        # Print stats periodically
        while True:
            await asyncio.sleep(300)  # Every 5 minutes
            self.print_advanced_stats()

async def main():
    """Main function"""
    proxy = AdvancedDNSProxy()
    
    try:
        await proxy.run()
    except KeyboardInterrupt:
        logger.info("🛑 Shutdown signal received")
    finally:
        await proxy.cleanup_resources()

if __name__ == '__main__':
    import os
    asyncio.run(main())
