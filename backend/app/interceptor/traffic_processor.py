# Traffic Processing Engine
import json
import asyncio
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from flask import current_app
from app.models import TrafficLog, Domain, InterceptorRule, BotProfile, Analytics
from app import db
import redis
import geoip2.database
import re
import hashlib
import user_agents

@dataclass
class TrafficRequest:
    ip_address: str
    user_agent: str
    method: str
    path: str
    headers: Dict[str, str]
    domain: str
    timestamp: datetime
    
@dataclass
class ProcessingResult:
    is_bot: bool
    bot_type: Optional[str]
    rule_matched: Optional[str]
    action_taken: str
    country_code: Optional[str]
    city: Optional[str]
    response_status: int
    processing_time: float

class TrafficProcessor:
    """
    Core traffic processing engine for bot detection and rule enforcement
    """
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.geoip_reader = None
        self.bot_patterns = {}
        self.rule_cache = {}
        self._load_bot_patterns()
    
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
    
    def _get_domain_rules(self, domain_name: str) -> List[InterceptorRule]:
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
    
    def _detect_bot(self, request: TrafficRequest) -> tuple[bool, Optional[str]]:
        """Detect if request is from a bot"""
        user_agent = request.user_agent.lower()
        
        # Check against known bot patterns
        for bot_name, pattern_data in self.bot_patterns.items():
            # Check user agent patterns
            for pattern in pattern_data['user_agent_patterns']:
                if re.search(pattern.lower(), user_agent):
                    return True, pattern_data['type']
            
            # Check IP ranges (simplified)
            # In production, implement proper IP range checking
            
        # Check for common bot indicators
        bot_indicators = [
            'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
            'python', 'java', 'perl', 'ruby', 'php', 'node',
            'headless', 'phantom', 'selenium', 'puppeteer'
        ]
        
        for indicator in bot_indicators:
            if indicator in user_agent:
                return True, 'generic_bot'
        
        # Parse user agent for additional detection
        parsed_ua = user_agents.parse(request.user_agent)
        if parsed_ua.is_bot:
            return True, 'user_agent_bot'
        
        return False, None
    
    def _get_geo_location(self, ip_address: str) -> tuple[Optional[str], Optional[str]]:
        """Get geographic location from IP address"""
        try:
            if not self.geoip_reader:
                # Initialize GeoIP reader (you'll need to download the database)
                # self.geoip_reader = geoip2.database.Reader('GeoLite2-City.mmdb')
                pass
            
            # For now, return placeholder data
            # In production, implement proper GeoIP lookup
            return 'US', 'San Francisco'
            
        except Exception as e:
            current_app.logger.error(f"GeoIP lookup failed: {e}")
            return None, None
    
    def _evaluate_rule(self, rule: Dict[str, Any], request: TrafficRequest, 
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
                request_value = request.ip_address
            elif field == 'path':
                request_value = request.path
            elif field == 'method':
                request_value = request.method
            elif field == 'is_bot':
                request_value = is_bot
            elif field == 'bot_type':
                request_value = bot_type
            else:
                continue
            
            # Evaluate condition based on operator
            if operator == 'equals':
                if request_value != value:
                    return False
            elif operator == 'contains':
                if value.lower() not in str(request_value).lower():
                    return False
            elif operator == 'starts_with':
                if not str(request_value).lower().startswith(value.lower()):
                    return False
            elif operator == 'ends_with':
                if not str(request_value).lower().endswith(value.lower()):
                    return False
            elif operator == 'regex':
                if not re.search(value, str(request_value), re.IGNORECASE):
                    return False
        
        return True
    
    def _execute_actions(self, actions: List[Dict[str, Any]]) -> tuple[str, int]:
        """Execute rule actions and return action taken and response status"""
        primary_action = 'allow'
        response_status = 200
        
        for action in actions:
            action_type = action.get('type')
            
            if action_type == 'block_request':
                primary_action = 'block'
                response_status = 403
            elif action_type == 'rate_limit':
                # Implement rate limiting logic
                primary_action = 'rate_limit'
                response_status = 429
            elif action_type == 'redirect':
                primary_action = 'redirect'
                response_status = 302
            elif action_type == 'challenge':
                primary_action = 'challenge'
                response_status = 401
        
        return primary_action, response_status
    
    def _log_traffic(self, request: TrafficRequest, result: ProcessingResult):
        """Log traffic to database"""
        try:
            domain = Domain.query.filter_by(domain_name=request.domain).first()
            if not domain:
                return
            
            traffic_log = TrafficLog(
                ip_address=request.ip_address,
                user_agent=request.user_agent,
                request_method=request.method,
                request_path=request.path,
                request_headers=request.headers,
                response_status=result.response_status,
                processing_time=result.processing_time,
                is_bot=result.is_bot,
                bot_type=result.bot_type,
                country_code=result.country_code,
                city=result.city,
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
    
    def _update_analytics(self, request: TrafficRequest, result: ProcessingResult):
        """Update real-time analytics"""
        try:
            domain = Domain.query.filter_by(domain_name=request.domain).first()
            if not domain:
                return
            
            # Update Redis counters for real-time metrics
            date_key = request.timestamp.strftime('%Y-%m-%d')
            hour_key = request.timestamp.strftime('%Y-%m-%d:%H')
            
            # Increment various counters
            self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}", 'total_requests', 1)
            self.redis_client.hincrby(f"analytics:{request.domain}:{hour_key}", 'total_requests', 1)
            
            if result.is_bot:
                self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}", 'bot_requests', 1)
                self.redis_client.hincrby(f"analytics:{request.domain}:{hour_key}", 'bot_requests', 1)
                
                if result.bot_type:
                    self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}:bot_types", result.bot_type, 1)
            
            if result.action_taken == 'block':
                self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}", 'blocked_requests', 1)
                self.redis_client.hincrby(f"analytics:{request.domain}:{hour_key}", 'blocked_requests', 1)
            
            # Country analytics
            if result.country_code:
                self.redis_client.hincrby(f"analytics:{request.domain}:{date_key}:countries", result.country_code, 1)
            
            # Set expiration for Redis keys (7 days)
            self.redis_client.expire(f"analytics:{request.domain}:{date_key}", 604800)
            self.redis_client.expire(f"analytics:{request.domain}:{hour_key}", 604800)
            
        except Exception as e:
            current_app.logger.error(f"Failed to update analytics: {e}")
    
    async def process_traffic(self, request: TrafficRequest) -> ProcessingResult:
        """Main traffic processing function"""
        start_time = datetime.now(timezone.utc)
        
        try:
            # Step 1: Bot detection
            is_bot, bot_type = self._detect_bot(request)
            
            # Step 2: Get geographic location
            country_code, city = self._get_geo_location(request.ip_address)
            
            # Step 3: Get and evaluate rules
            rules = self._get_domain_rules(request.domain)
            rule_matched = None
            action_taken = 'allow'
            response_status = 200
            
            for rule in rules:
                if self._evaluate_rule(rule, request, is_bot, bot_type):
                    rule_matched = rule['name']
                    action_taken, response_status = self._execute_actions(rule['actions'])
                    break
            
            # Calculate processing time
            processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            result = ProcessingResult(
                is_bot=is_bot,
                bot_type=bot_type,
                rule_matched=rule_matched,
                action_taken=action_taken,
                country_code=country_code,
                city=city,
                response_status=response_status,
                processing_time=processing_time
            )
            
            # Step 4: Log traffic and update analytics
            self._log_traffic(request, result)
            self._update_analytics(request, result)
            
            return result
            
        except Exception as e:
            current_app.logger.error(f"Traffic processing failed: {e}")
            processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
            
            return ProcessingResult(
                is_bot=False,
                bot_type=None,
                rule_matched=None,
                action_taken='error',
                country_code=None,
                city=None,
                response_status=500,
                processing_time=processing_time
            )

# Global traffic processor instance
traffic_processor = TrafficProcessor()
