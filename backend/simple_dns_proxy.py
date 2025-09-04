#!/usr/bin/env python3
"""
Simple DNS Traffic Interceptor for Boot Interceptor
Captures ALL traffic (HTML, CSS, JS, images, API calls) via proxy
"""

import asyncio
import aiohttp
import logging
from aiohttp import web
import json
import time
from datetime import datetime
from urllib.parse import urlparse, urljoin
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleDNSProxy:
    def __init__(self):
        self.app = web.Application()
        self.setup_routes()
        self.traffic_count = 0
        
        # Domain mapping for forwarding
        self.domain_mapping = {
            'shaileshdwivedi.in': 'https://shaileshdwivedi.in',  # Forward to original
            'localhost': 'http://localhost:9889',  # For local testing
            'test-shaileshdwivedi.in': 'https://shaileshdwivedi.in'  # Test domain
        }
        
        logger.info("🌐 DNS Proxy Interceptor initialized")
        logger.info(f"📋 Domain mappings: {self.domain_mapping}")
    
    def setup_routes(self):
        """Setup proxy routes"""
        # Catch all routes
        self.app.router.add_route('*', '/{path:.*}', self.handle_request)
        
        # Health check
        self.app.router.add_get('/health', self.health_check)
    
    async def health_check(self, request):
        """Health check endpoint"""
        return web.json_response({
            'status': 'healthy',
            'service': 'DNS Proxy Interceptor',
            'traffic_count': self.traffic_count,
            'timestamp': datetime.utcnow().isoformat()
        })
    
    async def handle_request(self, request):
        """Main request handler - intercepts and forwards traffic"""
        self.traffic_count += 1
        start_time = time.time()
        
        # Extract request info
        host = request.headers.get('Host', 'localhost')
        method = request.method
        path = request.path_qs
        user_agent = request.headers.get('User-Agent', '')
        client_ip = request.remote
        
        # Get target URL
        target_url = self.get_target_url(host, path)
        
        logger.info(f"🌐 [{self.traffic_count}] {method} {host}{path} → {target_url}")
        
        # Log traffic data (simulate sending to Boot Interceptor)
        traffic_data = {
            'id': str(uuid.uuid4()),
            'timestamp': datetime.utcnow().isoformat(),
            'method': method,
            'host': host,
            'path': path,
            'url': f"http://{host}{path}",
            'target_url': target_url,
            'client_ip': client_ip,
            'user_agent': user_agent,
            'headers': dict(request.headers),
        }
        
        # Send to Boot Interceptor API (in background)
        asyncio.create_task(self.send_to_boot_interceptor(traffic_data))
        
        # Forward request to target
        try:
            response = await self.forward_request(request, target_url)
            
            # Calculate response time
            response_time = (time.time() - start_time) * 1000
            
            # Log response info
            traffic_data.update({
                'response_status': response.status,
                'response_time': response_time,
                'response_size': len(await response.read()) if hasattr(response, 'read') else 0
            })
            
            logger.info(f"✅ [{self.traffic_count}] {response.status} {response_time:.1f}ms")
            
            return response
            
        except Exception as e:
            logger.error(f"❌ [{self.traffic_count}] Error forwarding request: {e}")
            return web.Response(
                text=f"Proxy Error: {str(e)}",
                status=502,
                headers={'Content-Type': 'text/plain'}
            )
    
    def get_target_url(self, host, path):
        """Get target URL for forwarding"""
        # Remove port from host for matching
        host_without_port = host.split(':')[0] if ':' in host else host
        
        # Check if we have a mapping for this host
        if host_without_port in self.domain_mapping:
            base_url = self.domain_mapping[host_without_port]
        elif host in self.domain_mapping:
            base_url = self.domain_mapping[host]
        else:
            # Default fallback - but avoid forwarding to ourselves
            if host_without_port == 'localhost':
                base_url = 'http://localhost:9889'  # Default to frontend
            else:
                base_url = f"https://{host_without_port}"
        
        return f"{base_url}{path}"
    
    async def forward_request(self, request, target_url):
        """Forward request to target server"""
        # Prepare headers (remove problematic ones)
        headers = dict(request.headers)
        headers.pop('Host', None)  # Let aiohttp set this
        
        # Read request body if present
        body = None
        if request.method in ['POST', 'PUT', 'PATCH']:
            body = await request.read()
        
        # Make request to target
        timeout = aiohttp.ClientTimeout(total=30)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.request(
                method=request.method,
                url=target_url,
                headers=headers,
                data=body,
                allow_redirects=False
            ) as resp:
                # Read response
                response_body = await resp.read()
                response_headers = dict(resp.headers)
                
                # Remove problematic headers
                response_headers.pop('Content-Encoding', None)
                response_headers.pop('Content-Length', None)
                response_headers.pop('Transfer-Encoding', None)
                
                # Create response
                return web.Response(
                    body=response_body,
                    status=resp.status,
                    headers=response_headers
                )
    
    async def send_to_boot_interceptor(self, traffic_data):
        """Send traffic data to Boot Interceptor API"""
        try:
            # Prepare data for Boot Interceptor format
            boot_data = {
                'url': traffic_data['url'],
                'method': traffic_data['method'],
                'user_agent': traffic_data['user_agent'],
                'page_title': f"DNS Proxy: {traffic_data['path']}",
                'event_type': 'dns_proxy',
                'client_ip': traffic_data['client_ip'],
                'timestamp': traffic_data['timestamp'],
                'dns_proxy_data': {
                    'host': traffic_data['host'],
                    'target_url': traffic_data['target_url'],
                    'traffic_id': traffic_data['id']
                }
            }
            
            # Send to Boot Interceptor
            timeout = aiohttp.ClientTimeout(total=5)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(
                    'http://localhost:8960/api/traffic/intercept',
                    json=boot_data,
                    headers={'Content-Type': 'application/json'}
                ) as resp:
                    if resp.status == 200:
                        logger.info(f"📊 Traffic data sent to Boot Interceptor: {traffic_data['id']}")
                    else:
                        logger.warning(f"⚠️  Boot Interceptor API error: {resp.status}")
                        
        except Exception as e:
            logger.error(f"❌ Failed to send to Boot Interceptor: {e}")
    
    async def start_server(self, host='0.0.0.0', port=8080):
        """Start the proxy server"""
        runner = web.AppRunner(self.app)
        await runner.setup()
        site = web.TCPSite(runner, host, port)
        await site.start()
        
        logger.info(f"🚀 DNS Proxy Interceptor started on http://{host}:{port}")
        logger.info(f"🎯 Ready to intercept traffic for: {list(self.domain_mapping.keys())}")
        
        return runner

async def main():
    """Main function"""
    proxy = SimpleDNSProxy()
    runner = await proxy.start_server()
    
    try:
        # Keep server running
        await asyncio.Future()  # Run forever
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down DNS Proxy Interceptor...")
        await runner.cleanup()

if __name__ == '__main__':
    asyncio.run(main())
