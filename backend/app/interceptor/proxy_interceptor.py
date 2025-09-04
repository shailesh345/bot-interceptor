"""
Proxy-Based Traffic Interception
Routes traffic through the interceptor for real-time monitoring and protection
"""

import asyncio
import aiohttp
import ssl
from aiohttp import web, ClientSession, TCPConnector
from aiohttp.web import Request, Response
from typing import Dict, List, Optional, Tuple
import json
import time
import hashlib
from datetime import datetime, timezone
import logging
from urllib.parse import urlparse, urljoin
import redis
from ..models import Domain, InterceptorRule, TrafficLog
from .. import db
from .traffic_processor_enhanced import traffic_processor
# from app.websocket.traffic_stream import get_traffic_stream_manager  # Disabled for now

logger = logging.getLogger(__name__)

class ProxyInterceptor:
    def __init__(self, redis_client: redis.Redis):
        self.redis_client = redis_client
        self.domain_configs: Dict[str, Dict] = {}  # domain -> config
        self.ssl_contexts: Dict[str, ssl.SSLContext] = {}
        self.session: Optional[ClientSession] = None
        self.load_balancer = LoadBalancer()
        
    async def start(self, host: str = '0.0.0.0', port: int = 8080):
        """Start the proxy interceptor"""
        try:
            # Create aiohttp session
            connector = TCPConnector(limit=1000, limit_per_host=100)
            self.session = ClientSession(connector=connector)
            
            # Load domain configurations
            await self._load_domain_configs()
            
            # Create application
            app = web.Application()
            app.router.add_route('*', '/{path:.*}', self._handle_request)
            
            # Start server
            runner = web.AppRunner(app)
            await runner.setup()
            
            site = web.TCPSite(runner, host, port)
            await site.start()
            
            logger.info(f"Proxy interceptor started on {host}:{port}")
            
            # Start background tasks
            asyncio.create_task(self._background_domain_reload())
            asyncio.create_task(self._health_check())
            
        except Exception as e:
            logger.error(f"Failed to start proxy interceptor: {e}")
            raise
    
    async def _load_domain_configs(self):
        """Load domain configurations from database"""
        try:
            # Get all active domains
            domains = Domain.query.filter_by(status='verified').all()
            
            for domain in domains:
                # Determine target URL for forwarding
                target_url = self._get_target_url(domain)
                
                config = {
                    'id': domain.id,
                    'domain_name': domain.domain_name,
                    'target_url': target_url,
                    'ssl_enabled': domain.ssl_enabled,
                    'cdn_enabled': domain.cdn_enabled,
                    'traffic_enabled': domain.traffic_enabled,
                    'rules': self._get_domain_rules(domain.id),
                    'rate_limits': self._get_rate_limits(domain.id)
                }
                
                self.domain_configs[domain.domain_name] = config
                
                # Create SSL context if needed
                if domain.ssl_enabled:
                    self.ssl_contexts[domain.domain_name] = self._create_ssl_context(domain.domain_name)
            
            logger.info(f"Loaded {len(self.domain_configs)} domain configurations")
            
        except Exception as e:
            logger.error(f"Error loading domain configs: {e}")
    
    def _get_target_url(self, domain) -> str:
        """Get target URL for domain forwarding"""
        try:
            # Check if domain has a custom target URL configured
            if hasattr(domain, 'original_url') and domain.original_url:
                return domain.original_url
            
            # Check if there's an origin subdomain setup
            # This would be configured during domain setup
            origin_url = f"http://origin.{domain.domain_name}"
            
            # For development/testing, fallback to localhost
            if domain.domain_name in ['localhost', '127.0.0.1', 'test.local']:
                return "http://localhost:9889"
            
            # Default: assume original server is at origin.domain
            protocol = "https" if domain.ssl_enabled else "http"
            return f"{protocol}://origin.{domain.domain_name}"
            
        except Exception as e:
            logger.error(f"Error determining target URL for {domain.domain_name}: {e}")
            return f"http://origin.{domain.domain_name}"
    
    def _get_domain_rules(self, domain_id: int) -> List[Dict]:
        """Get rules for a domain"""
        try:
            rules = InterceptorRule.query.filter_by(
                domain_id=domain_id,
                is_active=True
            ).order_by(InterceptorRule.priority.desc()).all()
            
            return [rule.to_dict() for rule in rules]
        except Exception as e:
            logger.error(f"Error getting rules for domain {domain_id}: {e}")
            return []
    
    def _get_rate_limits(self, domain_id: int) -> Dict:
        """Get rate limits for a domain"""
        try:
            # Get rate limiting rules
            rate_limit_rules = InterceptorRule.query.filter_by(
                domain_id=domain_id,
                rule_type='rate_limiting',
                is_active=True
            ).all()
            
            limits = {}
            for rule in rate_limit_rules:
                for action in rule.actions:
                    if action.get('type') == 'rate_limit':
                        limits[rule.id] = {
                            'requests_per_minute': int(action.get('value', 60)),
                            'burst_size': int(action.get('burst', 10))
                        }
            
            return limits
        except Exception as e:
            logger.error(f"Error getting rate limits for domain {domain_id}: {e}")
            return {}
    
    def _create_ssl_context(self, domain_name: str) -> ssl.SSLContext:
        """Create SSL context for domain"""
        try:
            context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            return context
        except Exception as e:
            logger.error(f"Error creating SSL context for {domain_name}: {e}")
            return None
    
    async def _handle_request(self, request: Request) -> Response:
        """Handle incoming request through proxy"""
        start_time = time.time()
        
        try:
            # Extract domain from request
            domain = self._extract_domain(request)
            if not domain:
                return web.Response(text="Invalid domain", status=400)
            
            # Check if domain is configured
            if domain not in self.domain_configs:
                return web.Response(text="Domain not found", status=404)
            
            config = self.domain_configs[domain]
            
            # Check if traffic monitoring is enabled
            if not config.get('traffic_enabled', False):
                # Forward request without processing
                return await self._forward_request(request, config)
            
            # Process request through interceptor
            intercepted_response = await self._process_request(request, config)
            if intercepted_response:
                return intercepted_response
            
            # Forward request to target
            response = await self._forward_request(request, config)
            
            # Log traffic
            await self._log_traffic(request, response, config, start_time)
            
            return response
            
        except Exception as e:
            logger.error(f"Error handling request: {e}")
            return web.Response(text="Internal Server Error", status=500)
    
    def _extract_domain(self, request: Request) -> Optional[str]:
        """Extract domain from request"""
        try:
            # Try to get domain from Host header
            host = request.headers.get('Host', '')
            if host:
                # Remove port if present
                domain = host.split(':')[0]
                return domain
            
            # Try to get from URL
            url = str(request.url)
            parsed = urlparse(url)
            if parsed.netloc:
                return parsed.netloc.split(':')[0]
            
            return None
        except Exception as e:
            logger.error(f"Error extracting domain: {e}")
            return None
    
    async def _process_request(self, request: Request, config: Dict) -> Optional[Response]:
        """Process request through interceptor rules"""
        try:
            # Prepare request data for rule processing
            request_data = {
                'method': request.method,
                'path': str(request.path),
                'headers': dict(request.headers),
                'query': dict(request.query),
                'ip': request.remote,
                'user_agent': request.headers.get('User-Agent', ''),
                'domain': config['domain_name']
            }
            
            # Process through rules engine
            result = traffic_processor.process_request(request_data, config['rules'])
            
            # Check if request should be blocked
            if result['final_action']['type'] == 'block':
                return web.Response(
                    text="Access denied",
                    status=403,
                    headers={'Content-Type': 'text/plain'}
                )
            
            # Check rate limiting
            rate_limit_result = await self._check_rate_limit(request_data, config)
            if rate_limit_result:
                return rate_limit_result
            
            # Add challenge if needed
            if result['final_action']['type'] == 'challenge':
                return await self._handle_challenge(request, result)
            
            return None
            
        except Exception as e:
            logger.error(f"Error processing request: {e}")
            return None
    
    async def _check_rate_limit(self, request_data: Dict, config: Dict) -> Optional[Response]:
        """Check rate limiting for request"""
        try:
            ip = request_data['ip']
            domain = config['domain_name']
            
            for rule_id, limits in config['rate_limits'].items():
                key = f"rate_limit:{domain}:{rule_id}:{ip}"
                current_time = int(time.time())
                
                # Get current request count
                pipe = self.redis_client.pipeline()
                pipe.zremrangebyscore(key, 0, current_time - 60)  # Remove old entries
                pipe.zcard(key)  # Count current entries
                pipe.zadd(key, {str(current_time): current_time})  # Add current request
                pipe.expire(key, 120)  # Set expiration
                results = pipe.execute()
                
                current_count = results[1]
                
                if current_count > limits['requests_per_minute']:
                    return web.Response(
                        text="Rate limit exceeded",
                        status=429,
                        headers={'Retry-After': '60'}
                    )
            
            return None
            
        except Exception as e:
            logger.error(f"Error checking rate limit: {e}")
            return None
    
    async def _handle_challenge(self, request: Request, result: Dict) -> Response:
        """Handle challenge (e.g., CAPTCHA) for suspicious requests"""
        try:
            challenge_type = result['final_action'].get('challenge_type', 'captcha')
            
            if challenge_type == 'captcha':
                return web.Response(
                    text="Please complete the challenge to continue",
                    status=200,
                    headers={'Content-Type': 'text/html'}
                )
            else:
                return web.Response(
                    text="Challenge required",
                    status=200,
                    headers={'Content-Type': 'text/plain'}
                )
                
        except Exception as e:
            logger.error(f"Error handling challenge: {e}")
            return web.Response(text="Challenge error", status=500)
    
    async def _forward_request(self, request: Request, config: Dict) -> Response:
        """Forward request to target server"""
        try:
            # Prepare target URL
            target_url = urljoin(config['target_url'], str(request.path))
            if request.query_string:
                target_url += f"?{request.query_string}"
            
            # Prepare headers
            headers = dict(request.headers)
            headers.pop('Host', None)  # Remove Host header
            
            # Prepare request data
            data = None
            if request.body_exists:
                data = await request.read()
            
            # Make request to target
            async with self.session.request(
                method=request.method,
                url=target_url,
                headers=headers,
                data=data,
                ssl=self.ssl_contexts.get(config['domain_name'])
            ) as response:
                
                # Read response body
                body = await response.read()
                
                # Create response
                return web.Response(
                    body=body,
                    status=response.status,
                    headers=dict(response.headers)
                )
                
        except Exception as e:
            logger.error(f"Error forwarding request: {e}")
            return web.Response(text="Upstream error", status=502)
    
    async def _log_traffic(self, request: Request, response: Response, config: Dict, start_time: float):
        """Log traffic for analytics"""
        try:
            processing_time = (time.time() - start_time) * 1000  # Convert to ms
            
            # Create traffic log entry
            traffic_data = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'domain': config['domain_name'],
                'method': request.method,
                'path': str(request.path),
                'ip': request.remote,
                'user_agent': request.headers.get('User-Agent', ''),
                'status_code': response.status,
                'processing_time_ms': processing_time,
                'request_size': len(await request.read()) if request.body_exists else 0,
                'response_size': len(response.body) if response.body else 0
            }
            
            # Add to traffic stream
            stream_manager = get_traffic_stream_manager()
            if stream_manager:
                stream_manager.add_traffic_data(config['domain_name'], traffic_data)
            
            # Store in Redis for analytics
            current_time = datetime.now(timezone.utc)
            hour_key = f"analytics:{config['domain_name']}:{current_time.strftime('%Y-%m-%d:%H')}"
            day_key = f"analytics:{config['domain_name']}:{current_time.strftime('%Y-%m-%d')}"
            
            pipe = self.redis_client.pipeline()
            pipe.hincrby(hour_key, 'total_requests', 1)
            pipe.hincrby(day_key, 'total_requests', 1)
            
            if response.status >= 400:
                pipe.hincrby(hour_key, 'error_requests', 1)
                pipe.hincrby(day_key, 'error_requests', 1)
            
            pipe.execute()
            
        except Exception as e:
            logger.error(f"Error logging traffic: {e}")
    
    async def _background_domain_reload(self):
        """Background task to reload domain configurations"""
        while True:
            try:
                await asyncio.sleep(300)  # Reload every 5 minutes
                await self._load_domain_configs()
            except Exception as e:
                logger.error(f"Error reloading domain configs: {e}")
    
    async def _health_check(self):
        """Background health check task"""
        while True:
            try:
                await asyncio.sleep(60)  # Check every minute
                
                # Check Redis connection
                try:
                    self.redis_client.ping()
                except Exception as e:
                    logger.error(f"Redis health check failed: {e}")
                
                # Check domain configurations
                logger.info(f"Health check: {len(self.domain_configs)} domains configured")
                
            except Exception as e:
                logger.error(f"Health check error: {e}")
    
    async def stop(self):
        """Stop the proxy interceptor"""
        try:
            if self.session:
                await self.session.close()
            logger.info("Proxy interceptor stopped")
        except Exception as e:
            logger.error(f"Error stopping proxy interceptor: {e}")

class LoadBalancer:
    """Simple load balancer for multiple target servers"""
    
    def __init__(self):
        self.targets: List[str] = []
        self.current_index = 0
    
    def add_target(self, target: str):
        """Add target server"""
        if target not in self.targets:
            self.targets.append(target)
    
    def remove_target(self, target: str):
        """Remove target server"""
        if target in self.targets:
            self.targets.remove(target)
    
    def get_next_target(self) -> Optional[str]:
        """Get next target using round-robin"""
        if not self.targets:
            return None
        
        target = self.targets[self.current_index]
        self.current_index = (self.current_index + 1) % len(self.targets)
        return target
    
    def get_targets(self) -> List[str]:
        """Get all targets"""
        return self.targets.copy()
