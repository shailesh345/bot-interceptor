#!/usr/bin/env python3
"""
Enhanced DNS Traffic Interceptor for Boot Interceptor
Production-ready DNS proxy with advanced features
"""

import asyncio
import aiohttp
import logging
import json
import time
from datetime import datetime, timezone
from urllib.parse import urlparse, urljoin
import uuid
from aiohttp import web
from collections import defaultdict
import gzip
from typing import Dict, Optional, Any
import signal
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EnhancedDNSProxy:
    def __init__(self):
        self.app = web.Application(middlewares=[self.logging_middleware])
        self.setup_routes()
        
        # Statistics and monitoring
        self.stats = {
            'total_requests': 0,
            'successful_forwards': 0,
            'failed_forwards': 0,
            'boot_interceptor_success': 0,
            'boot_interceptor_errors': 0,
            'start_time': datetime.now(timezone.utc),
            'domains_served': defaultdict(int),
            'response_times': [],
            'error_rates': defaultdict(int)
        }
        
        # Configuration
        self.config = {
            'boot_interceptor_endpoint': 'http://localhost:8960/api/traffic/intercept',
            'max_retries': 3,
            'retry_delay': 0.5,
            'timeout': 30,
            'max_response_time_history': 1000,
            'batch_analytics': True,
            'compress_responses': True,
            'rate_limit_per_second': 50  # Reduced to prevent overwhelming API
        }
        
        # Domain mapping for forwarding
        self.domain_mapping = {
            'shaileshdwivedi.in': 'https://shaileshdwivedi.in',
            'localhost': 'http://localhost:9889',
            'test-shaileshdwivedi.in': 'https://shaileshdwivedi.in',
            '127.0.0.1': 'http://localhost:9889'
        }
        
        # Rate limiting
        self.request_timestamps = []
        
        # Setup graceful shutdown
        self.setup_signal_handlers()
        
        logger.info("🚀 Enhanced DNS Proxy Interceptor initialized")
        logger.info(f"📋 Domain mappings: {self.domain_mapping}")
        logger.info(f"⚙️ Configuration: {self.config}")
    
    def setup_signal_handlers(self):
        """Setup graceful shutdown"""
        def signal_handler(sig, frame):
            logger.info("🛑 Graceful shutdown initiated...")
            self.print_stats()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def logging_middleware(self, request, handler):
        """Enhanced logging middleware"""
        start_time = time.time()
        
        try:
            response = await handler(request)
            process_time = (time.time() - start_time) * 1000
            
            # Store response time for analytics
            if len(self.stats['response_times']) >= self.config['max_response_time_history']:
                self.stats['response_times'].pop(0)
            self.stats['response_times'].append(process_time)
            
            logger.debug(f"📊 {request.method} {request.path} - {response.status} - {process_time:.1f}ms")
            
            return response
        except Exception as e:
            process_time = (time.time() - start_time) * 1000
            logger.error(f"❌ Middleware error: {e} - {process_time:.1f}ms")
            return web.json_response({'error': 'Internal proxy error'}, status=500)
    
    def setup_routes(self):
        """Setup enhanced routes"""
        # Health and monitoring endpoints
        self.app.router.add_get('/health', self.health_check)
        self.app.router.add_get('/stats', self.get_stats)
        self.app.router.add_get('/metrics', self.get_metrics)
        self.app.router.add_post('/admin/reset-stats', self.reset_stats)
        
        # Main proxy route (catch all)
        self.app.router.add_route('*', '/{path:.*}', self.handle_request)
    
    async def health_check(self, request):
        """Enhanced health check"""
        uptime = datetime.now(timezone.utc) - self.stats['start_time']
        
        health_data = {
            'status': 'healthy',
            'service': 'Enhanced DNS Proxy Interceptor',
            'version': '2.0.0',
            'uptime_seconds': int(uptime.total_seconds()),
            'total_requests': self.stats['total_requests'],
            'success_rate': self._calculate_success_rate(),
            'avg_response_time': self._calculate_avg_response_time(),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'domains_configured': list(self.domain_mapping.keys()),
            'boot_interceptor_healthy': await self._check_boot_interceptor_health()
        }
        
        return web.json_response(health_data)
    
    async def get_stats(self, request):
        """Detailed statistics endpoint"""
        uptime = datetime.now(timezone.utc) - self.stats['start_time']
        
        detailed_stats = {
            'uptime': {
                'seconds': int(uptime.total_seconds()),
                'formatted': str(uptime).split('.')[0]
            },
            'requests': {
                'total': self.stats['total_requests'],
                'successful_forwards': self.stats['successful_forwards'],
                'failed_forwards': self.stats['failed_forwards'],
                'success_rate': self._calculate_success_rate()
            },
            'boot_interceptor': {
                'successful_sends': self.stats['boot_interceptor_success'],
                'errors': self.stats['boot_interceptor_errors'],
                'success_rate': self._calculate_boot_interceptor_success_rate()
            },
            'performance': {
                'avg_response_time_ms': self._calculate_avg_response_time(),
                'min_response_time_ms': min(self.stats['response_times']) if self.stats['response_times'] else 0,
                'max_response_time_ms': max(self.stats['response_times']) if self.stats['response_times'] else 0
            },
            'domains_served': dict(self.stats['domains_served']),
            'error_breakdown': dict(self.stats['error_rates']),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        return web.json_response(detailed_stats)
    
    async def get_metrics(self, request):
        """Prometheus-compatible metrics"""
        metrics = [
            f"# HELP dns_proxy_requests_total Total number of requests processed",
            f"# TYPE dns_proxy_requests_total counter",
            f"dns_proxy_requests_total {self.stats['total_requests']}",
            "",
            f"# HELP dns_proxy_successful_forwards_total Successful forward requests",
            f"# TYPE dns_proxy_successful_forwards_total counter", 
            f"dns_proxy_successful_forwards_total {self.stats['successful_forwards']}",
            "",
            f"# HELP dns_proxy_response_time_avg Average response time in milliseconds",
            f"# TYPE dns_proxy_response_time_avg gauge",
            f"dns_proxy_response_time_avg {self._calculate_avg_response_time():.2f}",
        ]
        
        return web.Response(text="\n".join(metrics), content_type="text/plain")
    
    async def reset_stats(self, request):
        """Reset statistics (admin endpoint)"""
        self.stats = {
            'total_requests': 0,
            'successful_forwards': 0,
            'failed_forwards': 0,
            'boot_interceptor_success': 0,
            'boot_interceptor_errors': 0,
            'start_time': datetime.now(timezone.utc),
            'domains_served': defaultdict(int),
            'response_times': [],
            'error_rates': defaultdict(int)
        }
        
        logger.info("📊 Statistics reset by admin request")
        return web.json_response({'status': 'Statistics reset successfully'})
    
    def _rate_limit_check(self) -> bool:
        """Check if request should be rate limited"""
        now = time.time()
        # Remove timestamps older than 1 second
        self.request_timestamps = [ts for ts in self.request_timestamps if now - ts < 1.0]
        
        if len(self.request_timestamps) >= self.config['rate_limit_per_second']:
            return True  # Rate limited
        
        self.request_timestamps.append(now)
        return False  # Not rate limited
    
    async def handle_request(self, request):
        """Enhanced main request handler"""
        self.stats['total_requests'] += 1
        start_time = time.time()
        
        # Rate limiting
        if self._rate_limit_check():
            logger.warning(f"⚠️ Rate limit exceeded for {request.remote}")
            return web.json_response({
                'error': 'Rate limit exceeded',
                'retry_after': 1
            }, status=429)
        
        # Extract request info
        host = request.headers.get('Host', 'localhost')
        method = request.method
        path = request.path_qs
        user_agent = request.headers.get('User-Agent', '')
        client_ip = request.remote
        
        # Update domain statistics
        domain_key = host.split(':')[0]
        self.stats['domains_served'][domain_key] += 1
        
        # Get target URL
        target_url = self.get_target_url(host, path)
        
        # Enhanced logging
        request_id = str(uuid.uuid4())[:8]
        logger.info(f"🌐 [{self.stats['total_requests']}:{request_id}] {method} {host}{path} → {target_url}")
        
        # Prepare traffic data for Boot Interceptor
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
            'proxy_version': '2.0.0'
        }
        
        # Send to Boot Interceptor (async, non-blocking)
        asyncio.create_task(self.send_to_boot_interceptor_enhanced(traffic_data))
        
        # Forward request to target
        try:
            response = await self.forward_request_enhanced(request, target_url)
            
            # Calculate response time and update stats
            response_time = (time.time() - start_time) * 1000
            self.stats['successful_forwards'] += 1
            
            # Enhanced response logging
            logger.info(f"✅ [{self.stats['total_requests']}:{request_id}] {response.status} {response_time:.1f}ms")
            
            return response
            
        except Exception as e:
            self.stats['failed_forwards'] += 1
            self.stats['error_rates'][str(type(e).__name__)] += 1
            
            response_time = (time.time() - start_time) * 1000
            logger.error(f"❌ [{self.stats['total_requests']}:{request_id}] Error: {e} ({response_time:.1f}ms)")
            
            return web.json_response({
                'error': 'Proxy forwarding failed',
                'message': str(e),
                'request_id': request_id,
                'target_url': target_url
            }, status=502)
    
    def get_target_url(self, host, path):
        """Enhanced target URL resolution"""
        # Remove port from host for matching
        host_without_port = host.split(':')[0] if ':' in host else host
        
        # Check explicit mappings first
        if host_without_port in self.domain_mapping:
            base_url = self.domain_mapping[host_without_port]
        elif host in self.domain_mapping:
            base_url = self.domain_mapping[host]
        else:
            # Smart defaults
            if host_without_port in ['localhost', '127.0.0.1']:
                base_url = 'http://localhost:9889'
            elif 'test-' in host_without_port:
                # Test domains forward to production
                original_domain = host_without_port.replace('test-', '')
                base_url = f"https://{original_domain}"
            else:
                base_url = f"https://{host_without_port}"
        
        return f"{base_url}{path}"
    
    async def forward_request_enhanced(self, request, target_url):
        """Enhanced request forwarding with retry logic"""
        # Prepare headers
        headers = dict(request.headers)
        
        # Remove problematic headers
        for header in ['Host', 'Content-Length', 'Transfer-Encoding']:
            headers.pop(header, None)
        
        # Add proxy headers
        headers['X-Forwarded-For'] = request.remote
        headers['X-Forwarded-Proto'] = 'http'
        headers['X-Forwarded-Host'] = request.headers.get('Host', '')
        
        # Read request body
        body = None
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.read()
        
        # Retry logic
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
                        ssl=False  # Allow self-signed certificates
                    ) as resp:
                        # Read response
                        response_body = await resp.read()
                        response_headers = dict(resp.headers)
                        
                        # Clean response headers
                        for header in ['Content-Encoding', 'Content-Length', 'Transfer-Encoding']:
                            response_headers.pop(header, None)
                        
                        # Add proxy headers
                        response_headers['X-Proxy-By'] = 'Enhanced-DNS-Proxy'
                        response_headers['X-Proxy-Version'] = '2.0.0'
                        
                        # Compress if requested and beneficial
                        if (self.config['compress_responses'] and 
                            'gzip' in request.headers.get('Accept-Encoding', '') and
                            len(response_body) > 1000):
                            response_body = gzip.compress(response_body)
                            response_headers['Content-Encoding'] = 'gzip'
                        
                        return web.Response(
                            body=response_body,
                            status=resp.status,
                            headers=response_headers
                        )
                        
            except Exception as e:
                if attempt < self.config['max_retries'] - 1:
                    logger.warning(f"🔄 Retry {attempt + 1} for {target_url}: {e}")
                    await asyncio.sleep(self.config['retry_delay'] * (attempt + 1))
                else:
                    raise e
    
    async def send_to_boot_interceptor_enhanced(self, traffic_data):
        """Enhanced Boot Interceptor integration with retry logic"""
        try:
            # Prepare data for Boot Interceptor format
            boot_data = {
                'url': traffic_data['url'],
                'method': traffic_data['method'],
                'user_agent': traffic_data['user_agent'],
                'page_title': f"DNS-Proxy: {traffic_data['path']}",
                'event_type': 'dns_proxy_enhanced',
                'client_ip': traffic_data['client_ip'],
                'timestamp': traffic_data['timestamp'],
                'dns_proxy_data': {
                    'host': traffic_data['host'],
                    'target_url': traffic_data['target_url'],
                    'request_id': traffic_data['request_id'],
                    'proxy_version': '2.0.0'
                }
            }
            
            # Retry logic for Boot Interceptor
            for attempt in range(self.config['max_retries']):
                try:
                    timeout = aiohttp.ClientTimeout(total=5)
                    async with aiohttp.ClientSession(timeout=timeout) as session:
                        async with session.post(
                            self.config['boot_interceptor_endpoint'],
                            json=boot_data,
                            headers={'Content-Type': 'application/json'}
                        ) as resp:
                            if resp.status == 200:
                                self.stats['boot_interceptor_success'] += 1
                                logger.debug(f"📊 Boot Interceptor success: {traffic_data['request_id']}")
                                return
                            elif resp.status == 429:
                                # Rate limited - reduce frequency
                                logger.warning(f"⚠️ Boot Interceptor rate limited: {traffic_data['request_id']}")
                                await asyncio.sleep(1)
                                continue
                            else:
                                logger.warning(f"⚠️ Boot Interceptor error {resp.status}: {traffic_data['request_id']}")
                                
                except Exception as e:
                    if attempt < self.config['max_retries'] - 1:
                        await asyncio.sleep(0.5 * (attempt + 1))
                        continue
                    else:
                        raise e
            
            self.stats['boot_interceptor_errors'] += 1
            
        except Exception as e:
            self.stats['boot_interceptor_errors'] += 1
            logger.error(f"❌ Boot Interceptor integration error: {e}")
    
    async def _check_boot_interceptor_health(self) -> bool:
        """Check if Boot Interceptor API is healthy"""
        try:
            timeout = aiohttp.ClientTimeout(total=2)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                # Try to ping the API base
                async with session.get('http://localhost:8960/') as resp:
                    return resp.status in [200, 404]  # 404 is fine, means server is up
        except:
            return False
    
    def _calculate_success_rate(self) -> float:
        """Calculate forwarding success rate"""
        total = self.stats['successful_forwards'] + self.stats['failed_forwards']
        if total == 0:
            return 100.0
        return (self.stats['successful_forwards'] / total) * 100
    
    def _calculate_boot_interceptor_success_rate(self) -> float:
        """Calculate Boot Interceptor success rate"""
        total = self.stats['boot_interceptor_success'] + self.stats['boot_interceptor_errors']
        if total == 0:
            return 100.0
        return (self.stats['boot_interceptor_success'] / total) * 100
    
    def _calculate_avg_response_time(self) -> float:
        """Calculate average response time"""
        if not self.stats['response_times']:
            return 0.0
        return sum(self.stats['response_times']) / len(self.stats['response_times'])
    
    def print_stats(self):
        """Print comprehensive statistics"""
        uptime = datetime.now(timezone.utc) - self.stats['start_time']
        
        print("\n" + "="*80)
        print("🚀 ENHANCED DNS PROXY INTERCEPTOR - FINAL STATISTICS")
        print("="*80)
        print(f"⏱️  Uptime: {str(uptime).split('.')[0]}")
        print(f"📊 Total Requests: {self.stats['total_requests']}")
        print(f"✅ Successful Forwards: {self.stats['successful_forwards']}")
        print(f"❌ Failed Forwards: {self.stats['failed_forwards']}")
        print(f"📈 Success Rate: {self._calculate_success_rate():.1f}%")
        print(f"🔗 Boot Interceptor Success: {self.stats['boot_interceptor_success']}")
        print(f"🔗 Boot Interceptor Errors: {self.stats['boot_interceptor_errors']}")
        print(f"📡 Boot Interceptor Success Rate: {self._calculate_boot_interceptor_success_rate():.1f}%")
        print(f"⚡ Avg Response Time: {self._calculate_avg_response_time():.1f}ms")
        print(f"🌐 Domains Served: {dict(self.stats['domains_served'])}")
        print("="*80)
    
    async def start_server(self, host='0.0.0.0', port=8080):
        """Start the enhanced proxy server"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()
        
        logger.info(f"🚀 Enhanced DNS Proxy Interceptor v2.0 started on http://{host}:{port}")
        logger.info(f"🎯 Ready to intercept traffic for: {list(self.domain_mapping.keys())}")
        logger.info(f"📊 Monitoring endpoints:")
        logger.info(f"   • Health: http://{host}:{port}/health")
        logger.info(f"   • Stats: http://{host}:{port}/stats") 
        logger.info(f"   • Metrics: http://{host}:{port}/metrics")
        
        return runner

async def main():
    """Main function with enhanced error handling"""
    try:
        proxy = EnhancedDNSProxy()
        runner = await proxy.start_server()
        
        # Keep server running with periodic stats
        while True:
            await asyncio.sleep(300)  # Print stats every 5 minutes
            proxy.print_stats()
            
    except KeyboardInterrupt:
        logger.info("🛑 Shutdown requested by user")
    except Exception as e:
        logger.error(f"💥 Fatal error: {e}")
    finally:
        if 'runner' in locals():
            await runner.cleanup()
        logger.info("👋 Enhanced DNS Proxy Interceptor stopped")

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
