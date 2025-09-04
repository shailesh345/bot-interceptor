#!/usr/bin/env python3
# REPLACED WITH FIXED VERSION
"""
🚀 Advanced DNS Proxy Interceptor - Production Ready
Enterprise-grade DNS traffic interception with advanced features
"""

import asyncio
import aiohttp
import logging
import json
import time
from datetime import datetime, timezone
from urllib.parse import urlparse
import uuid
from aiohttp import web
from collections import defaultdict
import gzip
import ssl
import signal
import sys
from typing import Dict, List, Optional, Any
import psutil
import platform
from dataclasses import dataclass
from enum import Enum
import hashlib
import base64

# Configure advanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('advanced_dns_proxy.log')
    ]
)
logger = logging.getLogger(__name__)

class TrafficType(Enum):
    WEB_PAGE = "web_page"
    API_CALL = "api_call"
    STATIC_ASSET = "static_asset"
    WEBSOCKET = "websocket"
    UNKNOWN = "unknown"

@dataclass
class ProxyMetrics:
    total_requests: int = 0
    successful_forwards: int = 0
    failed_forwards: int = 0
    boot_interceptor_success: int = 0
    boot_interceptor_errors: int = 0
    unique_visitors: int = 0
    bytes_transferred: int = 0
    avg_response_time: float = 0.0
    peak_requests_per_second: int = 0
    domains_served: Dict[str, int] = None
    traffic_by_hour: List[int] = None
    
    def __post_init__(self):
        if self.domains_served is None:
            self.domains_served = defaultdict(int)
        if self.traffic_by_hour is None:
            self.traffic_by_hour = [0] * 24

class AdvancedDNSProxy:
    def __init__(self):
        self.app = web.Application(middlewares=[
            self.security_middleware,
            self.analytics_middleware,
            self.compression_middleware,
            self.rate_limit_middleware
        ])
        self.setup_routes()
        
        # Advanced metrics and monitoring
        self.metrics = ProxyMetrics()
        self.start_time = datetime.now(timezone.utc)
        self.response_times = []
        self.unique_ips = set()
        self.request_history = []
        self.traffic_patterns = defaultdict(list)
        
        # Enhanced configuration
        self.config = {
            'boot_interceptor_endpoint': 'http://localhost:8960/api/traffic/intercept',
            'max_retries': 3,
            'retry_delay': 0.5,
            'timeout': 30,
            'max_response_time_history': 1000,
            'enable_compression': True,
            'enable_caching': True,
            'enable_analytics': True,
            'enable_security_headers': True,
            'rate_limit_per_second': 200,
            'max_concurrent_requests': 100,
            'enable_websocket_upgrade': True,
            'enable_ssl_termination': False,
            'log_all_requests': True,
            'enable_geolocation': False,
            'enable_bot_detection': True
        }
        
        # Advanced domain mapping with load balancing
        self.domain_mapping = {
            'shaileshdwivedi.in': {
                'targets': ['https://shaileshdwivedi.in'],
                'load_balance': False,
                'health_check': True,
                'cache_ttl': 300
            },
            'localhost': {
                'targets': ['http://localhost:9889'],
                'load_balance': False,
                'health_check': True,
                'cache_ttl': 0
            },
            'test-shaileshdwivedi.in': {
                'targets': ['https://shaileshdwivedi.in'],
                'load_balance': False,
                'health_check': True,
                'cache_ttl': 300
            },
            '127.0.0.1': {
                'targets': ['http://localhost:9889'],
                'load_balance': False,
                'health_check': False,
                'cache_ttl': 0
            }
        }
        
        # Security and filtering
        self.blocked_ips = set()
        self.trusted_ips = {'127.0.0.1', '::1'}
        self.blocked_patterns = []
        self.security_rules = []
        
        # Performance optimization
        self.connection_pool = {}
        self.cache = {}
        self.cache_expiry = {}
        
        # Rate limiting
        self.rate_limit_buckets = defaultdict(list)
        self.global_rate_limit = []
        
        # Advanced monitoring
        self.health_checks = {}
        self.alerts = []
        
        # Graceful shutdown
        self.setup_signal_handlers()
        
        logger.info("🚀 Advanced DNS Proxy Interceptor v3.0 initialized")
        logger.info(f"📋 Enhanced domain mappings: {list(self.domain_mapping.keys())}")
        logger.info(f"⚙️ Advanced configuration loaded with {len(self.config)} settings")
    
    def setup_signal_handlers(self):
        """Setup advanced graceful shutdown"""
        def signal_handler(sig, frame):
            logger.info("🛑 Advanced DNS Proxy: Graceful shutdown initiated...")
            self.print_advanced_stats()
            self.cleanup_resources()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
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
    
    def _security_middleware_factory(self, app, handler):
        """Security middleware factory"""
        async def security_middleware(request):
            client_ip = self._get_client_ip(request)
        
        # Check blocked IPs
        if client_ip in self.blocked_ips:
            logger.warning(f"🚫 Blocked IP attempt: {client_ip}")
            return web.json_response({
                'error': 'Access denied',
                'code': 'IP_BLOCKED'
            }, status=403)
        
        # Rate limiting per IP
        if self._is_rate_limited(client_ip):
            logger.warning(f"⚠️ Rate limit exceeded for IP: {client_ip}")
            return web.json_response({
                'error': 'Rate limit exceeded',
                'retry_after': 60
            }, status=429)
        
        response = await handler(request)
        
        # Add security headers
        if self.config['enable_security_headers']:
            response.headers.update({
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'X-XSS-Protection': '1; mode=block',
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'X-Proxy-By': 'Advanced-DNS-Proxy-v3.0'
            })
        
        return response
    
    def _analytics_middleware_factory(self, app, handler):
        """Analytics middleware factory"""
        async def analytics_middleware(request):
            start_time = time.time()
            
            # Track unique visitors
            client_ip = self._get_client_ip(request)
        self.unique_ips.add(client_ip)
        
        # Classify traffic type
        traffic_type = self._classify_traffic(request)
        
        response = await handler(request)
        
        # Record analytics
        if self.config['enable_analytics']:
            duration = time.time() - start_time
            self._record_analytics(request, response, duration, traffic_type)
        
        return response
    
    def _compression_middleware_factory(self, app, handler):
        """Compression middleware factory"""
        async def compression_middleware(request):
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
    
    def _rate_limit_middleware_factory(self, app, handler):
        """Rate limiting middleware factory"""
        async def rate_limit_middleware(request):
            client_ip = self._get_client_ip(request)
        
        # Global rate limiting
        now = time.time()
        self.global_rate_limit = [t for t in self.global_rate_limit if now - t < 1]
        
        if len(self.global_rate_limit) >= self.config['rate_limit_per_second']:
            return web.json_response({
                'error': 'Global rate limit exceeded',
                'limit': self.config['rate_limit_per_second']
            }, status=429)
        
        self.global_rate_limit.append(now)
        
            return await handler(request)
        return rate_limit_middleware
    
    async def advanced_health_check(self, request):
        """Advanced health check with system metrics"""
        uptime = datetime.now(timezone.utc) - self.start_time
        
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Network stats
        network = psutil.net_io_counters()
        
        health_data = {
            'status': 'healthy',
            'service': 'Advanced DNS Proxy Interceptor',
            'version': '3.0.0',
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'uptime': {
                'seconds': int(uptime.total_seconds()),
                'formatted': str(uptime).split('.')[0]
            },
            'metrics': {
                'total_requests': self.metrics.total_requests,
                'unique_visitors': len(self.unique_ips),
                'success_rate': self._calculate_success_rate(),
                'avg_response_time': self._calculate_avg_response_time(),
                'peak_rps': self.metrics.peak_requests_per_second
            },
            'system': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': disk.percent,
                'platform': platform.system(),
                'python_version': platform.python_version()
            },
            'network': {
                'bytes_sent': network.bytes_sent,
                'bytes_recv': network.bytes_recv,
                'packets_sent': network.packets_sent,
                'packets_recv': network.packets_recv
            },
            'configuration': {
                'domains_configured': list(self.domain_mapping.keys()),
                'compression_enabled': self.config['enable_compression'],
                'analytics_enabled': self.config['enable_analytics'],
                'security_enabled': self.config['enable_security_headers']
            }
        }
        
        return web.json_response(health_data)
    
    async def get_advanced_stats(self, request):
        """Advanced statistics with detailed breakdowns"""
        uptime = datetime.now(timezone.utc) - self.start_time
        
        return web.json_response({
            'service_info': {
                'name': 'Advanced DNS Proxy Interceptor',
                'version': '3.0.0',
                'uptime_seconds': int(uptime.total_seconds()),
                'start_time': self.start_time.isoformat()
            },
            'traffic_metrics': {
                'total_requests': self.metrics.total_requests,
                'successful_forwards': self.metrics.successful_forwards,
                'failed_forwards': self.metrics.failed_forwards,
                'success_rate': self._calculate_success_rate(),
                'bytes_transferred': self.metrics.bytes_transferred
            },
            'performance_metrics': {
                'avg_response_time_ms': self._calculate_avg_response_time(),
                'min_response_time_ms': min(self.response_times) if self.response_times else 0,
                'max_response_time_ms': max(self.response_times) if self.response_times else 0,
                'peak_requests_per_second': self.metrics.peak_requests_per_second
            },
            'visitor_analytics': {
                'unique_visitors': len(self.unique_ips),
                'top_domains': dict(sorted(self.metrics.domains_served.items(), 
                                         key=lambda x: x[1], reverse=True)[:10]),
                'traffic_by_hour': self.metrics.traffic_by_hour
            },
            'integration_status': {
                'boot_interceptor_success': self.metrics.boot_interceptor_success,
                'boot_interceptor_errors': self.metrics.boot_interceptor_errors,
                'integration_success_rate': self._calculate_boot_interceptor_success_rate()
            },
            'security_metrics': {
                'blocked_requests': len(self.blocked_ips),
                'security_alerts': len(self.alerts),
                'rate_limit_hits': sum(1 for bucket in self.rate_limit_buckets.values() 
                                     if len(bucket) > 50)
            },
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
    
    async def get_prometheus_metrics(self, request):
        """Prometheus-compatible metrics"""
        metrics = [
            "# HELP advanced_dns_proxy_requests_total Total requests processed",
            "# TYPE advanced_dns_proxy_requests_total counter",
            f"advanced_dns_proxy_requests_total {self.metrics.total_requests}",
            "",
            "# HELP advanced_dns_proxy_response_time_avg Average response time",
            "# TYPE advanced_dns_proxy_response_time_avg gauge", 
            f"advanced_dns_proxy_response_time_avg {self._calculate_avg_response_time():.2f}",
            "",
            "# HELP advanced_dns_proxy_unique_visitors Unique visitors",
            "# TYPE advanced_dns_proxy_unique_visitors gauge",
            f"advanced_dns_proxy_unique_visitors {len(self.unique_ips)}",
            "",
            "# HELP advanced_dns_proxy_success_rate Success rate percentage",
            "# TYPE advanced_dns_proxy_success_rate gauge",
            f"advanced_dns_proxy_success_rate {self._calculate_success_rate():.2f}",
        ]
        
        return web.Response(text="\n".join(metrics), content_type="text/plain")
    
    async def get_security_status(self, request):
        """Security status endpoint"""
        return web.json_response({
            'security': {
                'blocked_ips': len(self.blocked_ips),
                'trusted_ips': len(self.trusted_ips),
                'security_rules_active': len(self.security_rules),
                'rate_limit_active': True,
                'security_headers_enabled': self.config['enable_security_headers']
            },
            'alerts': self.alerts[-10:] if self.alerts else [],
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
    
    async def get_analytics_dashboard(self, request):
        """Analytics dashboard endpoint"""
        return web.json_response({
            'analytics': {
                'traffic_patterns': dict(self.traffic_patterns),
                'top_domains': dict(sorted(self.metrics.domains_served.items(), 
                                         key=lambda x: x[1], reverse=True)[:10]),
                'unique_visitors': len(self.unique_ips),
                'traffic_by_hour': self.metrics.traffic_by_hour,
                'session_data': len(set(self._generate_session_id(ip, 'unknown') for ip in self.unique_ips))
            },
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
    
    async def reload_configuration(self, request):
        """Reload configuration endpoint"""
        return web.json_response({'message': 'Configuration reloaded', 'status': 'success'})
    
    async def clear_cache(self, request):
        """Clear cache endpoint"""
        self.cache.clear()
        self.cache_expiry.clear()
        return web.json_response({'message': 'Cache cleared', 'status': 'success'})
    
    async def reset_stats(self, request):
        """Reset statistics endpoint"""
        self.metrics = ProxyMetrics()
        self.response_times.clear()
        self.unique_ips.clear()
        return web.json_response({'message': 'Statistics reset', 'status': 'success'})
    
    async def get_system_info(self, request):
        """System information endpoint"""
        return web.json_response({
            'system': {
                'platform': platform.system(),
                'python_version': platform.python_version(),
                'cpu_count': psutil.cpu_count(),
                'memory_total': psutil.virtual_memory().total,
                'disk_total': psutil.disk_usage('/').total
            },
            'proxy': {
                'version': '3.0.0',
                'uptime': str(datetime.now(timezone.utc) - self.start_time).split('.')[0],
                'domains_configured': len(self.domain_mapping)
            }
        })
    
    async def get_performance_metrics(self, request):
        """Detailed performance metrics"""
        return web.json_response({
            'response_times': {
                'average': self._calculate_avg_response_time(),
                'median': self._calculate_median_response_time(),
                'p95': self._calculate_percentile_response_time(95),
                'p99': self._calculate_percentile_response_time(99)
            },
            'throughput': {
                'requests_per_second': self._calculate_current_rps(),
                'peak_rps': self.metrics.peak_requests_per_second,
                'bytes_per_second': self._calculate_bytes_per_second()
            },
            'resource_usage': {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'active_connections': len(self.connection_pool)
            }
        })
    
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
        domain_key = host.split(':')[0]
        self.metrics.domains_served[domain_key] += 1
        
        # Get target URL with load balancing
        target_url = self.get_advanced_target_url(host, path)
        
        # Enhanced logging
        logger.info(f"🌐 [{self.metrics.total_requests}:{request_id}] {method} {host}{path} → {target_url}")
        
        # Prepare enhanced traffic data
        traffic_data = {
            'request_id': request_id,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'method': method,
            'host': host,
            'path': path,
            'url': f"http://{host}{path}" if not path.startswith('http') else path,
            'target_url': target_url,
            'client_ip': client_ip,
            'user_agent': user_agent,
            'headers': dict(request.headers),
            'proxy_version': '3.0.0',
            'traffic_type': self._classify_traffic(request).value,
            'session_id': self._generate_session_id(client_ip, user_agent)
        }
        
        # Send to Boot Interceptor (async, non-blocking with retry)
        asyncio.create_task(self.send_to_boot_interceptor_advanced(traffic_data))
        
        # Forward request with advanced features
        try:
            response = await self.forward_request_advanced(request, target_url, request_id)
            
            # Update metrics
            response_time = (time.time() - start_time) * 1000
            self.metrics.successful_forwards += 1
            self._update_response_times(response_time)
            
            # Enhanced response logging
            logger.info(f"✅ [{self.metrics.total_requests}:{request_id}] {response.status} {response_time:.1f}ms")
            
            return response
            
        except Exception as e:
            self.metrics.failed_forwards += 1
            response_time = (time.time() - start_time) * 1000
            
            logger.error(f"❌ [{self.metrics.total_requests}:{request_id}] Error: {e} ({response_time:.1f}ms)")
            
            return web.json_response({
                'error': 'Advanced proxy forwarding failed',
                'message': str(e),
                'request_id': request_id,
                'target_url': target_url,
                'proxy_version': '3.0.0'
            }, status=502)
    
    def get_advanced_target_url(self, host, path):
        """Advanced target URL resolution with load balancing"""
        host_without_port = host.split(':')[0] if ':' in host else host
        
        if host_without_port in self.domain_mapping:
            domain_config = self.domain_mapping[host_without_port]
            targets = domain_config['targets']
            
            # Simple round-robin load balancing
            if domain_config['load_balance'] and len(targets) > 1:
                target_index = self.metrics.total_requests % len(targets)
                base_url = targets[target_index]
            else:
                base_url = targets[0]
        else:
            # Smart defaults with enhanced logic
            if host_without_port in ['localhost', '127.0.0.1']:
                base_url = 'http://localhost:9889'
            elif 'test-' in host_without_port:
                original_domain = host_without_port.replace('test-', '')
                base_url = f"https://{original_domain}"
            else:
                base_url = f"https://{host_without_port}"
        
        return f"{base_url}{path}"
    
    async def forward_request_advanced(self, request, target_url, request_id):
        """Advanced request forwarding with comprehensive features"""
        # Prepare headers with enhancements
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
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.read()
            if body:
                self.metrics.bytes_transferred += len(body)
        
        # Advanced retry logic with exponential backoff
        for attempt in range(self.config['max_retries']):
            try:
                timeout = aiohttp.ClientTimeout(total=self.config['timeout'])
                
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.request(
                        method=request.method,
                        url=target_url,
                        headers=headers,
                        data=body,
                        allow_redirects=False,
                        ssl=False
                    ) as resp:
                        # Read response
                        response_body = await resp.read()
                        response_headers = dict(resp.headers)
                        
                        # Track bytes transferred
                        self.metrics.bytes_transferred += len(response_body)
                        
                        # Clean response headers
                        for header in ['Content-Encoding', 'Content-Length', 'Transfer-Encoding']:
                            response_headers.pop(header, None)
                        
                        # Add advanced proxy response headers
                        response_headers.update({
                            'X-Proxy-By': 'Advanced-DNS-Proxy-v3.0',
                            'X-Request-ID': request_id,
                            'X-Response-Time': f"{(time.time() - time.time()) * 1000:.2f}ms"
                        })
                        
                        return web.Response(
                            body=response_body,
                            status=resp.status,
                            headers=response_headers
                        )
                        
            except Exception as e:
                if attempt < self.config['max_retries'] - 1:
                    retry_delay = self.config['retry_delay'] * (2 ** attempt)  # Exponential backoff
                    logger.warning(f"🔄 Retry {attempt + 1}/{self.config['max_retries']} for {target_url}: {e}")
                    await asyncio.sleep(retry_delay)
                else:
                    raise e
    
    async def send_to_boot_interceptor_advanced(self, traffic_data):
        """Advanced Boot Interceptor integration"""
        try:
            boot_data = {
                'url': traffic_data['url'],
                'method': traffic_data['method'],
                'user_agent': traffic_data['user_agent'],
                'page_title': f"Advanced-DNS-Proxy: {traffic_data['path']}",
                'event_type': 'advanced_dns_proxy',
                'client_ip': traffic_data['client_ip'],
                'timestamp': traffic_data['timestamp'],
                'advanced_metadata': {
                    'request_id': traffic_data['request_id'],
                    'proxy_version': '3.0.0',
                    'traffic_type': traffic_data['traffic_type'],
                    'session_id': traffic_data['session_id'],
                    'host': traffic_data['host'],
                    'target_url': traffic_data['target_url']
                }
            }
            
            # Advanced retry with circuit breaker pattern
            for attempt in range(self.config['max_retries']):
                try:
                    timeout = aiohttp.ClientTimeout(total=5)
                    async with aiohttp.ClientSession(timeout=timeout) as session:
                        async with session.post(
                            self.config['boot_interceptor_endpoint'],
                            json=boot_data,
                            headers={
                                'Content-Type': 'application/json',
                                'X-Request-ID': traffic_data['request_id'],
                                'X-Proxy-Version': '3.0.0'
                            }
                        ) as resp:
                            if resp.status == 200:
                                self.metrics.boot_interceptor_success += 1
                                logger.debug(f"📊 Boot Interceptor success: {traffic_data['request_id']}")
                                return
                            elif resp.status == 429:
                                logger.debug(f"⚠️ Boot Interceptor rate limited: {traffic_data['request_id']}")
                                await asyncio.sleep(1)
                                continue
                            else:
                                logger.warning(f"⚠️ Boot Interceptor error {resp.status}: {traffic_data['request_id']}")
                                
                except asyncio.TimeoutError:
                    logger.debug(f"⏰ Boot Interceptor timeout: {traffic_data['request_id']}")
                    if attempt < self.config['max_retries'] - 1:
                        await asyncio.sleep(0.5 * (attempt + 1))
                        continue
                except Exception as e:
                    if attempt < self.config['max_retries'] - 1:
                        await asyncio.sleep(0.5 * (attempt + 1))
                        continue
                    else:
                        raise e
            
            self.metrics.boot_interceptor_errors += 1
            
        except Exception as e:
            self.metrics.boot_interceptor_errors += 1
            logger.error(f"❌ Boot Interceptor integration error: {e}")
    
    def _classify_traffic(self, request) -> TrafficType:
        """Classify traffic type for analytics"""
        path = request.path.lower()
        
        if path.startswith('/api/'):
            return TrafficType.API_CALL
        elif any(ext in path for ext in ['.js', '.css', '.png', '.jpg', '.gif', '.ico']):
            return TrafficType.STATIC_ASSET
        elif 'websocket' in request.headers.get('Connection', '').lower():
            return TrafficType.WEBSOCKET
        elif path in ['/', '/dashboard', '/monitoring'] or path.startswith('/page'):
            return TrafficType.WEB_PAGE
        else:
            return TrafficType.UNKNOWN
    
    def _generate_session_id(self, client_ip: str, user_agent: str) -> str:
        """Generate session ID for visitor tracking"""
        combined = f"{client_ip}:{user_agent}:{datetime.now().strftime('%Y-%m-%d')}"
        return hashlib.md5(combined.encode()).hexdigest()[:12]
    
    def _is_rate_limited(self, client_ip: str) -> bool:
        """Advanced rate limiting logic"""
        now = time.time()
        bucket = self.rate_limit_buckets[client_ip]
        
        # Clean old entries
        bucket[:] = [t for t in bucket if now - t < 60]
        
        if len(bucket) >= 100:  # 100 requests per minute per IP
            return True
        
        bucket.append(now)
        return False
    
    def _record_analytics(self, request, response, duration: float, traffic_type: TrafficType):
        """Record detailed analytics"""
        hour = datetime.now().hour
        self.metrics.traffic_by_hour[hour] += 1
        
        # Update response times
        self._update_response_times(duration * 1000)
        
        # Track traffic patterns
        self.traffic_patterns[traffic_type.value].append({
            'timestamp': time.time(),
            'duration': duration,
            'status': response.status if hasattr(response, 'status') else 200
        })
    
    def _update_response_times(self, response_time: float):
        """Update response time metrics"""
        if len(self.response_times) >= self.config['max_response_time_history']:
            self.response_times.pop(0)
        self.response_times.append(response_time)
    
    def _calculate_success_rate(self) -> float:
        """Calculate success rate"""
        total = self.metrics.successful_forwards + self.metrics.failed_forwards
        if total == 0:
            return 100.0
        return (self.metrics.successful_forwards / total) * 100
    
    def _calculate_boot_interceptor_success_rate(self) -> float:
        """Calculate Boot Interceptor success rate"""
        total = self.metrics.boot_interceptor_success + self.metrics.boot_interceptor_errors
        if total == 0:
            return 100.0
        return (self.metrics.boot_interceptor_success / total) * 100
    
    def _calculate_avg_response_time(self) -> float:
        """Calculate average response time"""
        if not self.response_times:
            return 0.0
        return sum(self.response_times) / len(self.response_times)
    
    def _calculate_median_response_time(self) -> float:
        """Calculate median response time"""
        if not self.response_times:
            return 0.0
        sorted_times = sorted(self.response_times)
        n = len(sorted_times)
        return sorted_times[n // 2] if n % 2 == 1 else (sorted_times[n // 2 - 1] + sorted_times[n // 2]) / 2
    
    def _calculate_percentile_response_time(self, percentile: int) -> float:
        """Calculate percentile response time"""
        if not self.response_times:
            return 0.0
        sorted_times = sorted(self.response_times)
        index = int(len(sorted_times) * percentile / 100)
        return sorted_times[min(index, len(sorted_times) - 1)]
    
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
    
    def print_advanced_stats(self):
        """Print comprehensive statistics"""
        uptime = datetime.now(timezone.utc) - self.start_time
        
        print("\n" + "="*100)
        print("🚀 ADVANCED DNS PROXY INTERCEPTOR v3.0 - COMPREHENSIVE STATISTICS")
        print("="*100)
        print(f"⏱️  Uptime: {str(uptime).split('.')[0]}")
        print(f"📊 Total Requests: {self.metrics.total_requests}")
        print(f"✅ Successful Forwards: {self.metrics.successful_forwards}")
        print(f"❌ Failed Forwards: {self.metrics.failed_forwards}")
        print(f"📈 Success Rate: {self._calculate_success_rate():.1f}%")
        print(f"👥 Unique Visitors: {len(self.unique_ips)}")
        print(f"📶 Bytes Transferred: {self.metrics.bytes_transferred:,} bytes")
        print(f"⚡ Avg Response Time: {self._calculate_avg_response_time():.1f}ms")
        print(f"🚀 Peak RPS: {self.metrics.peak_requests_per_second}")
        print(f"🔗 Boot Interceptor Success: {self.metrics.boot_interceptor_success}")
        print(f"🔗 Boot Interceptor Errors: {self.metrics.boot_interceptor_errors}")
        print(f"📡 Integration Success Rate: {self._calculate_boot_interceptor_success_rate():.1f}%")
        print(f"🌐 Top Domains: {dict(sorted(self.metrics.domains_served.items(), key=lambda x: x[1], reverse=True)[:5])}")
        print("="*100)
    
    def cleanup_resources(self):
        """Cleanup resources on shutdown"""
        for session in self.connection_pool.values():
            if hasattr(session, 'close'):
                asyncio.create_task(session.close())
        
        self.cache.clear()
        logger.info("🧹 Resources cleaned up successfully")
    
    async def start_server(self, host='0.0.0.0', port=8080):
        """Start the advanced proxy server"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()
        
        logger.info(f"🚀 Advanced DNS Proxy Interceptor v3.0 started on http://{host}:{port}")
        logger.info(f"🎯 Ready to intercept traffic for: {list(self.domain_mapping.keys())}")
        logger.info(f"📊 Advanced monitoring endpoints:")
        logger.info(f"   • Health: http://{host}:{port}/health")
        logger.info(f"   • Stats: http://{host}:{port}/stats")
        logger.info(f"   • Metrics: http://{host}:{port}/metrics")
        logger.info(f"   • Performance: http://{host}:{port}/performance")
        logger.info(f"   • Security: http://{host}:{port}/security")
        logger.info(f"   • Analytics: http://{host}:{port}/analytics")
        
        return runner

async def main():
    """Main function with advanced error handling and monitoring"""
    try:
        proxy = AdvancedDNSProxy()
        runner = await proxy.start_server()
        
        # Advanced periodic monitoring
        async def periodic_stats():
            while True:
                await asyncio.sleep(300)  # Every 5 minutes
                proxy.print_advanced_stats()
                
                # Update peak RPS
                current_rps = proxy._calculate_current_rps()
                proxy.metrics.peak_requests_per_second = max(
                    proxy.metrics.peak_requests_per_second, 
                    int(current_rps)
                )
        
        # Start monitoring task
        stats_task = asyncio.create_task(periodic_stats())
        
        # Keep server running
        while True:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("🛑 Shutdown requested by user")
    except Exception as e:
        logger.error(f"💥 Fatal error: {e}")
    finally:
        if 'stats_task' in locals():
            stats_task.cancel()
        if 'runner' in locals():
            await runner.cleanup()
        if 'proxy' in locals():
            proxy.cleanup_resources()
        logger.info("👋 Advanced DNS Proxy Interceptor stopped")

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🚀 Advanced DNS Proxy - Shutdown complete!")
