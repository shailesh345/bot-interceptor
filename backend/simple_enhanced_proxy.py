#!/usr/bin/env python3
"""
Simple Enhanced DNS Proxy - Fixed Version
Lightweight but robust DNS proxy with proper error handling
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

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SimpleEnhancedProxy:
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()
        
        # Simple statistics
        self.stats = {
            'total_requests': 0,
            'successful_forwards': 0,
            'failed_forwards': 0,
            'boot_interceptor_success': 0,
            'boot_interceptor_errors': 0,
            'start_time': datetime.now(timezone.utc)
        }
        
        # Configuration
        self.config = {
            'boot_interceptor_endpoint': 'http://localhost:8960/api/traffic/intercept',  # Back to original endpoint
            'timeout': 10,
            'rate_limit_per_second': 100  # Higher limit for DNS traffic
        }
        
        # Domain mapping - simplified
        self.domain_mapping = {
            'shaileshdwivedi.in': 'https://shaileshdwivedi.in',
            'localhost': 'http://localhost:9889',
            'test-shaileshdwivedi.in': 'https://shaileshdwivedi.in',
            '127.0.0.1': 'http://localhost:9889'
        }
        
        # Rate limiting
        self.request_timestamps = []
        
        logger.info("🚀 Simple Enhanced DNS Proxy initialized")
        logger.info(f"📋 Domain mappings: {list(self.domain_mapping.keys())}")
    
    def setup_routes(self):
        """Setup routes"""
        # Health and monitoring
        self.app.router.add_get('/health', self.health_check)
        self.app.router.add_get('/stats', self.get_stats)
        
        # Main proxy route
        self.app.router.add_route('*', '/{path:.*}', self.handle_request)
    
    async def health_check(self, request):
        """Health check endpoint"""
        uptime = datetime.now(timezone.utc) - self.stats['start_time']
        
        return web.json_response({
            'status': 'healthy',
            'service': 'Simple Enhanced DNS Proxy',
            'version': '1.0.0',
            'uptime_seconds': int(uptime.total_seconds()),
            'total_requests': self.stats['total_requests'],
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
    
    async def get_stats(self, request):
        """Statistics endpoint"""
        uptime = datetime.now(timezone.utc) - self.stats['start_time']
        
        return web.json_response({
            'uptime_seconds': int(uptime.total_seconds()),
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
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
    
    def _rate_limit_check(self) -> bool:
        """Simple rate limiting"""
        now = time.time()
        # Keep only requests from last second
        self.request_timestamps = [ts for ts in self.request_timestamps if now - ts < 1.0]
        
        if len(self.request_timestamps) >= self.config['rate_limit_per_second']:
            return True
        
        self.request_timestamps.append(now)
        return False
    
    async def handle_request(self, request):
        """Main request handler"""
        self.stats['total_requests'] += 1
        
        # Rate limiting
        if self._rate_limit_check():
            return web.json_response({
                'error': 'Rate limit exceeded',
                'retry_after': 1
            }, status=429)
        
        # Extract request info
        host = request.headers.get('Host', 'localhost')
        method = request.method
        path = request.path_qs
        
        # Get target URL
        target_url = self.get_target_url(host, path)
        
        # Log request
        logger.info(f"🌐 [{self.stats['total_requests']}] {method} {host}{path} → {target_url}")
        
        # Send to Boot Interceptor (async, non-blocking)
        asyncio.create_task(self.send_to_boot_interceptor({
            'url': f"http://{host}{path}",
            'method': method,
            'user_agent': request.headers.get('User-Agent', ''),
            'client_ip': request.remote,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }))
        
        # Forward request
        try:
            response = await self.forward_request(request, target_url)
            self.stats['successful_forwards'] += 1
            logger.info(f"✅ [{self.stats['total_requests']}] {response.status}")
            return response
            
        except Exception as e:
            self.stats['failed_forwards'] += 1
            logger.error(f"❌ [{self.stats['total_requests']}] Error: {e}")
            
            return web.json_response({
                'error': 'Proxy forwarding failed',
                'message': str(e)
            }, status=502)
    
    def get_target_url(self, host, path):
        """Get target URL for forwarding"""
        host_without_port = host.split(':')[0] if ':' in host else host
        
        if host_without_port in self.domain_mapping:
            base_url = self.domain_mapping[host_without_port]
        else:
            # Default behavior for unknown domains
            if host_without_port in ['localhost', '127.0.0.1']:
                base_url = 'http://localhost:9889'
            else:
                base_url = f"https://{host_without_port}"
        
        return f"{base_url}{path}"
    
    async def forward_request(self, request, target_url):
        """Forward request to target"""
        # Prepare headers
        headers = dict(request.headers)
        
        # Remove problematic headers
        for header in ['Host', 'Content-Length']:
            headers.pop(header, None)
        
        # Read body if needed
        body = None
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.read()
        
        # Make request
        timeout = aiohttp.ClientTimeout(total=self.config['timeout'])
        
        try:
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.request(
                    method=request.method,
                    url=target_url,
                    headers=headers,
                    data=body,
                    ssl=False  # Allow self-signed certificates
                ) as resp:
                    # Read response
                    response_body = await resp.read()
                    response_headers = dict(resp.headers)
                    
                    # Clean response headers
                    response_headers.pop('Content-Length', None)
                    response_headers.pop('Transfer-Encoding', None)
                    
                    return web.Response(
                        body=response_body,
                        status=resp.status,
                        headers=response_headers
                    )
        
        except Exception as e:
            raise e
    
    async def send_to_boot_interceptor(self, traffic_data):
        """Send traffic data to Boot Interceptor"""
        try:
            # Prepare data for Boot Interceptor
            boot_data = {
                'url': traffic_data['url'],
                'method': traffic_data['method'],
                'user_agent': traffic_data['user_agent'],
                'page_title': 'DNS Proxy Traffic',
                'event_type': 'dns_proxy_simple',
                'client_ip': traffic_data['client_ip'],
                'timestamp': traffic_data['timestamp']
            }
            
            # Send to Boot Interceptor (with timeout)
            timeout = aiohttp.ClientTimeout(total=2)  # Short timeout for non-blocking
            
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(
                    self.config['boot_interceptor_endpoint'],
                    json=boot_data,
                    headers={'Content-Type': 'application/json'}
                ) as resp:
                    if resp.status == 200:
                        self.stats['boot_interceptor_success'] += 1
                        logger.debug("📊 Boot Interceptor: Success")
                    elif resp.status == 429:
                        logger.debug("⚠️ Boot Interceptor: Rate limited (expected)")
                        # Don't count 429 as error since it's expected
                    else:
                        self.stats['boot_interceptor_errors'] += 1
                        logger.debug(f"⚠️ Boot Interceptor: Error {resp.status}")
                        
        except asyncio.TimeoutError:
            logger.debug("⚠️ Boot Interceptor: Timeout (expected)")
            # Don't count timeouts as errors for non-critical integration
        except Exception as e:
            self.stats['boot_interceptor_errors'] += 1
            logger.debug(f"⚠️ Boot Interceptor: {e}")
    
    def _calculate_success_rate(self) -> float:
        """Calculate success rate"""
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
    
    def print_stats(self):
        """Print statistics"""
        uptime = datetime.now(timezone.utc) - self.stats['start_time']
        
        print("\n" + "="*60)
        print("🚀 SIMPLE ENHANCED DNS PROXY - STATISTICS")
        print("="*60)
        print(f"⏱️  Uptime: {str(uptime).split('.')[0]}")
        print(f"📊 Total Requests: {self.stats['total_requests']}")
        print(f"✅ Successful: {self.stats['successful_forwards']}")
        print(f"❌ Failed: {self.stats['failed_forwards']}")
        print(f"📈 Success Rate: {self._calculate_success_rate():.1f}%")
        print(f"🔗 Boot Interceptor Success: {self.stats['boot_interceptor_success']}")
        print("="*60)
    
    async def start_server(self, host='0.0.0.0', port=8080):
        """Start the proxy server"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()
        
        logger.info(f"🚀 Simple Enhanced DNS Proxy v1.0 started on http://{host}:{port}")
        logger.info(f"🎯 Ready to intercept traffic for: {list(self.domain_mapping.keys())}")
        logger.info(f"📊 Health: http://{host}:{port}/health")
        logger.info(f"📊 Stats: http://{host}:{port}/stats")
        
        return runner

async def main():
    """Main function"""
    try:
        proxy = SimpleEnhancedProxy()
        runner = await proxy.start_server()
        
        # Keep running with periodic stats
        while True:
            await asyncio.sleep(60)  # Print stats every minute
            proxy.print_stats()
            
    except KeyboardInterrupt:
        logger.info("🛑 Shutdown requested")
        proxy.print_stats()
    except Exception as e:
        logger.error(f"💥 Error: {e}")
    finally:
        if 'runner' in locals():
            await runner.cleanup()
        logger.info("👋 Simple Enhanced DNS Proxy stopped")

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
