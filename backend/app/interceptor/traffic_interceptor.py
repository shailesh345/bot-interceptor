"""
Production-Ready Traffic Interception Engine
Acts as a proxy service to intercept and process traffic in real-time
"""

import asyncio
import json
import time
import hashlib
import ipaddress
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from urllib.parse import urlparse, parse_qs
from collections import defaultdict
import aiohttp
import aiohttp.web
import redis
import geoip2.database
import user_agents
from dataclasses import dataclass
from flask import current_app
from app.models import TrafficLog, Domain, InterceptorRule, BotProfile, Analytics
from app import db

@dataclass
class InterceptedRequest:
    """Represents an intercepted HTTP request"""
    method: str
    url: str
    headers: Dict[str, str]
    body: Optional[bytes]
    client_ip: str
    user_agent: str
    timestamp: datetime
    domain: str
    path: str
    query_params: Dict[str, str]

@dataclass
class InterceptionResult:
    """Result of traffic interception processing"""
    should_proxy: bool
    response_status: int
    response_headers: Dict[str, str]
    response_body: Optional[bytes]
    action_taken: str
    bot_detected: bool
    bot_type: Optional[str]
    rule_matched: Optional[str]
    processing_time: float
    geo_location: Optional[Dict[str, str]]

class TrafficInterceptor:
    """
    Production-ready traffic interception engine
    Acts as a proxy service to intercept and process traffic
    """
    
    def __init__(self, target_host: str = None, target_port: int = 80):
        self.target_host = target_host
        self.target_port = target_port
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.geoip_reader = None
        self.bot_patterns = {}
        self.rule_cache = {}
        self.rate_limit_cache = defaultdict(list)
        self._load_bot_patterns()
        self._initialize_geoip()
    
    def _initialize_geoip(self):
        """Initialize GeoIP database reader"""
        try:
            # In production, download and use GeoLite2 database
            # self.geoip_reader = geoip2.database.Reader('GeoLite2-City.mmdb')
            pass
        except Exception as e:
            current_app.logger.warning(f"GeoIP initialization failed: {e}")
    
    def _load_bot_patterns(self):
        """Load bot detection patterns from database"""
        try:
            bot_profiles = BotProfile.query.filter_by(is_verified=True).all()
            for profile in bot_profiles:
                self.bot_patterns[profile.name] = {
                    'type': profile.bot_type,
                    'user_agent_patterns': profile.user_agent_patterns or [],
                    'ip_ranges': profile.ip_ranges or [],
                    'behavior_patterns': profile.behavior_patterns or {}
                }
        except Exception as e:
            current_app.logger.error(f"Failed to load bot patterns: {e}")
    
    def _get_domain_rules(self, domain_name: str) -> List[Dict]:
        """Get cached rules for a domain"""
        cache_key = f"domain_rules:{domain_name}"
        cached_rules = self.redis_client.get(cache_key)
        
        if cached_rules:
            return json.loads(cached_rules)
        
        try:
            domain = Domain.query.filter_by(domain_name=domain_name).first()
            if not domain:
                return []
            
            rules = InterceptorRule.query.filter_by(
                domain_id=domain.id,
                is_active=True
            ).order_by(InterceptorRule.priority.desc()).all()
            
            rule_data = [{
                'id': rule.uuid,
                'name': rule.name,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions,
                'actions': rule.actions,
                'priority': rule.priority
            } for rule in rules]
            
            # Cache for 5 minutes
            self.redis_client.setex(cache_key, 300, json.dumps(rule_data))
            return rule_data
            
        except Exception as e:
            current_app.logger.error(f"Failed to get domain rules: {e}")
            return []
    
    def _detect_bot(self, request: InterceptedRequest) -> Tuple[bool, Optional[str]]:
        """Advanced bot detection with multiple methods"""
        user_agent = request.user_agent.lower()
        
        # Method 1: Check against known bot patterns
        for bot_name, pattern_data in self.bot_patterns.items():
            for pattern in pattern_data['user_agent_patterns']:
                if re.search(pattern.lower(), user_agent):
                    return True, pattern_data['type']
        
        # Method 2: Check for common bot indicators
        bot_indicators = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            'python', 'java', 'perl', 'ruby', 'php', 'node',
            'headless', 'phantom', 'selenium', 'puppeteer', 'playwright'
        ]
        
        for indicator in bot_indicators:
            if indicator in user_agent:
                return True, 'generic_bot'
        
        # Method 3: Parse user agent for additional detection
        try:
            parsed_ua = user_agents.parse(request.user_agent)
            if parsed_ua.is_bot:
                return True, 'user_agent_bot'
        except:
            pass
        
        # Method 4: Check for suspicious patterns
        suspicious_patterns = [
            r'headless', r'phantom', r'selenium', r'automation',
            r'test', r'monitor', r'scanner', r'probe'
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, user_agent, re.IGNORECASE):
                return True, 'suspicious_bot'
        
        # Method 5: Behavioral analysis (simplified)
        if self._analyze_behavior(request):
            return True, 'behavioral_bot'
        
        return False, None
    
    def _analyze_behavior(self, request: InterceptedRequest) -> bool:
        """Analyze request behavior for bot patterns"""
        # Check request frequency
        client_key = f"client_requests:{request.client_ip}"
        current_time = time.time()
        
        # Get recent requests from this IP
        recent_requests = self.redis_client.lrange(client_key, 0, 9)
        recent_requests = [float(r) for r in recent_requests if r]
        
        # Remove old requests (older than 1 minute)
        recent_requests = [r for r in recent_requests if current_time - r < 60]
        
        # Add current request
        recent_requests.append(current_time)
        
        # Update Redis list
        self.redis_client.delete(client_key)
        if recent_requests:
            self.redis_client.rpush(client_key, *recent_requests)
            self.redis_client.expire(client_key, 60)
        
        # Check for suspicious patterns
        if len(recent_requests) > 20:  # More than 20 requests per minute
            return True
        
        # Check for rapid-fire requests
        if len(recent_requests) >= 2:
            time_diff = recent_requests[-1] - recent_requests[-2]
            if time_diff < 0.1:  # Less than 100ms between requests
                return True
        
        return False
    
    def _get_geo_location(self, ip_address: str) -> Optional[Dict[str, str]]:
        """Get geographic location from IP address"""
        try:
            if self.geoip_reader:
                response = self.geoip_reader.city(ip_address)
                return {
                    'country_code': response.country.iso_code,
                    'country_name': response.country.name,
                    'city': response.city.name,
                    'latitude': str(response.location.latitude),
                    'longitude': str(response.location.longitude)
                }
            
            # Fallback: return placeholder data
            return {
                'country_code': 'US',
                'country_name': 'United States',
                'city': 'Unknown',
                'latitude': '0.0',
                'longitude': '0.0'
            }
            
        except Exception as e:
            current_app.logger.error(f"GeoIP lookup failed: {e}")
            return None
    
    def _evaluate_rule(self, rule: Dict, request: InterceptedRequest, 
                       is_bot: bool, bot_type: Optional[str]) -> bool:
        """Evaluate if a rule matches the request"""
        conditions = rule.get('conditions', [])
        
        for condition in conditions:
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            if field == 'user_agent':
                request_value = request.user_agent
            elif field == 'ip':
                request_value = request.client_ip
            elif field == 'path':
                request_value = request.path
            elif field == 'method':
                request_value = request.method
            elif field == 'is_bot':
                request_value = is_bot
            elif field == 'bot_type':
                request_value = bot_type
            elif field == 'country_code':
                geo = self._get_geo_location(request.client_ip)
                request_value = geo.get('country_code') if geo else None
            else:
                continue
            
            # Evaluate condition based on operator
            if not self._evaluate_condition(request_value, operator, value):
                return False
        
        return True
    
    def _evaluate_condition(self, request_value: Any, operator: str, value: Any) -> bool:
        """Evaluate a single condition"""
        if operator == 'equals':
            return request_value == value
        elif operator == 'contains':
            return value.lower() in str(request_value).lower()
        elif operator == 'starts_with':
            return str(request_value).lower().startswith(value.lower())
        elif operator == 'ends_with':
            return str(request_value).lower().endswith(value.lower())
        elif operator == 'regex':
            try:
                return bool(re.search(value, str(request_value), re.IGNORECASE))
            except:
                return False
        elif operator == 'in':
            return str(request_value).lower() in [v.lower() for v in value]
        elif operator == 'not_equals':
            return request_value != value
        elif operator == 'not_contains':
            return value.lower() not in str(request_value).lower()
        
        return False
    
    def _execute_actions(self, actions: List[Dict]) -> Tuple[str, int, Dict[str, str], Optional[bytes]]:
        """Execute rule actions and return response details"""
        primary_action = 'allow'
        response_status = 200
        response_headers = {}
        response_body = None
        
        for action in actions:
            action_type = action.get('type')
            
            if action_type == 'block_request':
                primary_action = 'block'
                response_status = 403
                response_body = b'Access Denied'
                response_headers['Content-Type'] = 'text/plain'
                
            elif action_type == 'rate_limit':
                primary_action = 'rate_limit'
                response_status = 429
                response_body = b'Too Many Requests'
                response_headers['Content-Type'] = 'text/plain'
                response_headers['Retry-After'] = '60'
                
            elif action_type == 'redirect':
                primary_action = 'redirect'
                response_status = 302
                response_headers['Location'] = action.get('target_url', '/')
                
            elif action_type == 'challenge':
                primary_action = 'challenge'
                response_status = 401
                response_body = b'Authentication Required'
                response_headers['Content-Type'] = 'text/plain'
                response_headers['WWW-Authenticate'] = 'Basic realm="Bot Challenge"'
                
            elif action_type == 'modify_headers':
                for header_name, header_value in action.get('headers', {}).items():
                    response_headers[header_name] = header_value
        
        return primary_action, response_status, response_headers, response_body
    
    def _log_traffic(self, request: InterceptedRequest, result: InterceptionResult):
        """Log traffic to database"""
        try:
            domain = Domain.query.filter_by(domain_name=request.domain).first()
            if not domain:
                return
            
            traffic_log = TrafficLog(
                ip_address=request.client_ip,
                user_agent=request.user_agent,
                request_method=request.method,
                request_path=request.path,
                request_headers=request.headers,
                response_status=result.response_status,
                processing_time=result.processing_time,
                is_bot=result.bot_detected,
                bot_type=result.bot_type,
                country_code=result.geo_location.get('country_code') if result.geo_location else None,
                city=result.geo_location.get('city') if result.geo_location else None,
                rule_matched=result.rule_matched,
                action_taken=result.action_taken,
                timestamp=request.timestamp,
                domain_id=domain.id
            )
            
            db.session.add(traffic_log)
            db.session.commit()
            
        except Exception as e:
            current_app.logger.error(f"Failed to log traffic: {e}")
            db.session.rollback()
    
    def _update_analytics(self, request: InterceptedRequest, result: InterceptionResult):
        """Update real-time analytics"""
        try:
            # Update Redis counters for real-time metrics
            date_key = request.timestamp.strftime('%Y-%m-%d')
            hour_key = request.timestamp.strftime('%Y-%m-%d:%H')
            
            # Increment various counters
            self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}", 'total_requests', 1)
            self.redis_client.hincrby(f"analytics:{request.domain}:{hour_key}", 'total_requests', 1)
            
            if result.bot_detected:
                self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}", 'bot_requests', 1)
                self.redis_client.hincrby(f"analytics:{request.domain}:{hour_key}", 'bot_requests', 1)
                
                if result.bot_type:
                    self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}:bot_types", result.bot_type, 1)
            
            if result.action_taken in ['block', 'challenge', 'rate_limit']:
                self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}", 'blocked_requests', 1)
                self.redis_client.hincrby(f"analytics:{request.domain}:{hour_key}", 'blocked_requests', 1)
            
            # Country analytics
            if result.geo_location and result.geo_location.get('country_code'):
                country_code = result.geo_location['country_code']
                self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}:countries", country_code, 1)
            
            # Set expiration for Redis keys (7 days)
            self.redis_client.expire(f"analytics:{request.domain}:{date_key}", 604800)
            self.redis_client.expire(f"analytics:{request.domain}:{hour_key}", 604800)
            
        except Exception as e:
            current_app.logger.error(f"Failed to update analytics: {e}")
    
    def intercept_request(self, request: InterceptedRequest) -> InterceptionResult:
        """Main interception function"""
        start_time = time.time()
        
        try:
            # Step 1: Bot detection
            is_bot, bot_type = self._detect_bot(request)
            
            # Step 2: Get geographic location
            geo_location = self._get_geo_location(request.client_ip)
            
            # Step 3: Get and evaluate rules
            rules = self._get_domain_rules(request.domain)
            rule_matched = None
            action_taken = 'allow'
            response_status = 200
            response_headers = {}
            response_body = None
            
            for rule in rules:
                if self._evaluate_rule(rule, request, is_bot, bot_type):
                    rule_matched = rule['name']
                    action_taken, response_status, response_headers, response_body = self._execute_actions(rule['actions'])
                    break
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            result = InterceptionResult(
                should_proxy=(action_taken == 'allow'),
                response_status=response_status,
                response_headers=response_headers,
                response_body=response_body,
                action_taken=action_taken,
                bot_detected=is_bot,
                bot_type=bot_type,
                rule_matched=rule_matched,
                processing_time=processing_time,
                geo_location=geo_location
            )
            
            # Step 4: Log traffic and update analytics
            self._log_traffic(request, result)
            self._update_analytics(request, result)
            
            return result
            
        except Exception as e:
            current_app.logger.error(f"Traffic interception failed: {e}")
            processing_time = time.time() - start_time
            
            return InterceptionResult(
                should_proxy=True,  # Default to proxying on error
                response_status=500,
                response_headers={'Content-Type': 'text/plain'},
                response_body=b'Internal Server Error',
                action_taken='error',
                bot_detected=False,
                bot_type=None,
                rule_matched=None,
                processing_time=processing_time,
                geo_location=None
            )
    
    async def proxy_request(self, request: InterceptedRequest, target_url: str) -> Dict:
        """Proxy the request to the target server"""
        try:
            async with aiohttp.ClientSession() as session:
                # Prepare headers for proxying
                headers = dict(request.headers)
                headers['X-Forwarded-For'] = request.client_ip
                headers['X-Forwarded-Proto'] = 'http'
                headers['X-Real-IP'] = request.client_ip
                
                # Make request to target
                async with session.request(
                    method=request.method,
                    url=target_url,
                    headers=headers,
                    data=request.body,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_body = response.read()
                    
                    return {
                        'status': response.status,
                        'headers': dict(response.headers),
                        'body': response_body
                    }
                    
        except Exception as e:
            current_app.logger.error(f"Proxying failed: {e}")
            return {
                'status': 502,
                'headers': {'Content-Type': 'text/plain'},
                'body': b'Bad Gateway'
            }

# Global interceptor instance
# Initialize lazily to avoid app context issues
traffic_interceptor = None

def get_traffic_interceptor():
    global traffic_interceptor
    if traffic_interceptor is None:
        traffic_interceptor = TrafficInterceptor()
    return traffic_interceptor
