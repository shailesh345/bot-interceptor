"""
Advanced Content Protection System
Implements multiple layers of anti-scraping and content protection measures
"""

import hashlib
import json
import time
import random
import string
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass
import redis
import re
from urllib.parse import urlparse, parse_qs
from flask import current_app, request, Response
from app.models import Domain, InterceptorRule, TrafficLog
from app import db

@dataclass
class ProtectionResult:
    """Result of content protection processing"""
    is_allowed: bool
    protection_level: str
    action_taken: str
    response_status: int
    response_headers: Dict[str, str]
    response_body: Optional[str]
    challenge_required: bool
    challenge_type: Optional[str]
    processing_time: float

class ContentProtection:
    """
    Advanced content protection system with multiple anti-scraping layers
    """
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.protection_rules = {}
        self.honeypot_urls = set()
        self.dynamic_content_cache = {}
        self._load_protection_rules()
        self._initialize_honeypots()
    
    def _load_protection_rules(self):
        """Load content protection rules from database"""
        try:
            # Load rules for content protection
            rules = InterceptorRule.query.filter_by(
                rule_type='content_protection',
                is_active=True
            ).all()
            
            for rule in rules:
                self.protection_rules[rule.uuid] = {
                    'name': rule.name,
                    'conditions': rule.conditions,
                    'actions': rule.actions,
                    'priority': rule.priority
                }
                
        except Exception as e:
            current_app.logger.error(f"Failed to load protection rules: {e}")
    
    def _initialize_honeypots(self):
        """Initialize honeypot URLs and traps"""
        # Generate random honeypot URLs that look legitimate
        honeypot_patterns = [
            '/admin', '/config', '/api/internal', '/debug', '/test',
            '/backup', '/database', '/logs', '/temp', '/cache'
        ]
        
        for pattern in honeypot_patterns:
            # Add random variations
            random_suffix = ''.join(random.choices(string.ascii_lowercase, k=3))
            honeypot_url = f"{pattern}_{random_suffix}"
            self.honeypot_urls.add(honeypot_url)
    
    def protect_content(self, request_data: Dict, domain_name: str) -> ProtectionResult:
        """Main content protection function"""
        start_time = time.time()
        
        try:
            # Step 1: Basic request validation
            if not self._validate_request(request_data):
                return self._create_blocked_response(
                    "Invalid request format",
                    400,
                    start_time
                )
            
            # Step 2: Honeypot detection
            if self._is_honeypot_request(request_data):
                return self._create_blocked_response(
                    "Access denied",
                    403,
                    start_time,
                    action="honeypot_triggered"
                )
            
            # Step 3: Rate limiting check
            rate_limit_result = self._check_rate_limiting(request_data)
            if not rate_limit_result['allowed']:
                return self._create_blocked_response(
                    "Rate limit exceeded",
                    429,
                    start_time,
                    action="rate_limited"
                )
            
            # Step 4: Bot behavior analysis
            behavior_result = self._analyze_behavior(request_data)
            if behavior_result['suspicious']:
                return self._create_challenge_response(
                    behavior_result['challenge_type'],
                    start_time,
                    action="behavior_challenge"
                )
            
            # Step 5: Content protection rules evaluation
            protection_result = self._evaluate_protection_rules(request_data, domain_name)
            if protection_result['action'] != 'allow':
                return self._create_protection_response(
                    protection_result,
                    start_time
                )
            
            # Step 6: Dynamic content modification
            modified_content = self._apply_dynamic_protection(request_data)
            
            # Step 7: Log protection event
            self._log_protection_event(request_data, "allowed", start_time)
            
            processing_time = time.time() - start_time
            
            return ProtectionResult(
                is_allowed=True,
                protection_level="standard",
                action_taken="allow",
                response_status=200,
                response_headers=modified_content.get('headers', {}),
                response_body=modified_content.get('body'),
                challenge_required=False,
                challenge_type=None,
                processing_time=processing_time
            )
            
        except Exception as e:
            current_app.logger.error(f"Content protection failed: {e}")
            processing_time = time.time() - start_time
            
            return ProtectionResult(
                is_allowed=False,
                protection_level="error",
                action_taken="error",
                response_status=500,
                response_headers={'Content-Type': 'text/plain'},
                response_body="Internal Server Error",
                challenge_required=False,
                challenge_type=None,
                processing_time=processing_time
            )
    
    def _validate_request(self, request_data: Dict) -> bool:
        """Validate basic request format"""
        required_fields = ['method', 'path', 'headers', 'client_ip']
        
        for field in required_fields:
            if field not in request_data:
                return False
        
        # Check for suspicious request patterns
        path = request_data.get('path', '')
        if len(path) > 1000:  # Extremely long paths
            return False
        
        if '..' in path:  # Path traversal attempts
            return False
        
        return True
    
    def _is_honeypot_request(self, request_data: Dict) -> bool:
        """Check if request is accessing honeypot URLs"""
        path = request_data.get('path', '').lower()
        
        # Check for honeypot URLs
        for honeypot_url in self.honeypot_urls:
            if honeypot_url in path:
                return True
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'/admin[^/]*$', r'/config[^/]*$', r'/api/internal',
            r'/debug[^/]*$', r'/backup[^/]*$', r'/database[^/]*$'
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, path, re.IGNORECASE):
                return True
        
        return False
    
    def _check_rate_limiting(self, request_data: Dict) -> Dict:
        """Check rate limiting for the client"""
        client_ip = request_data.get('client_ip', '')
        path = request_data.get('path', '')
        
        # Different rate limits for different paths
        if '/api/' in path:
            limit_key = f"rate_limit_api:{client_ip}"
            max_requests = 100  # 100 requests per minute for API
        elif '/admin/' in path:
            limit_key = f"rate_limit_admin:{client_ip}"
            max_requests = 10   # 10 requests per minute for admin
        else:
            limit_key = f"rate_limit_general:{client_ip}"
            max_requests = 200  # 200 requests per minute for general content
        
        current_time = time.time()
        
        try:
            # Get current request count
            request_count = self.redis_client.get(limit_key)
            if request_count:
                request_count = int(request_count)
            else:
                request_count = 0
            
            # Check if limit exceeded
            if request_count >= max_requests:
                return {
                    'allowed': False,
                    'remaining': 0,
                    'reset_time': current_time + 60
                }
            
            # Increment request count
            self.redis_client.incr(limit_key)
            self.redis_client.expire(limit_key, 60)  # 1 minute window
            
            return {
                'allowed': True,
                'remaining': max_requests - request_count - 1,
                'reset_time': current_time + 60
            }
            
        except Exception as e:
            current_app.logger.error(f"Rate limiting check failed: {e}")
            return {'allowed': True, 'remaining': 999, 'reset_time': current_time + 60}
    
    def _analyze_behavior(self, request_data: Dict) -> Dict:
        """Analyze request behavior for suspicious patterns"""
        client_ip = request_data.get('client_ip', '')
        path = request_data.get('path', '')
        headers = request_data.get('headers', {})
        user_agent = request_data.get('user_agent', '')
        
        suspicious_score = 0
        challenge_type = None
        
        # Check 1: Rapid navigation
        if self._is_rapid_navigation(client_ip):
            suspicious_score += 30
            challenge_type = "captcha"
        
        # Check 2: Missing or suspicious headers
        if not self._has_normal_headers(headers):
            suspicious_score += 25
            challenge_type = "javascript_challenge"
        
        # Check 3: Unusual user agent patterns
        if self._is_suspicious_user_agent(user_agent):
            suspicious_score += 20
            challenge_type = "user_agent_verification"
        
        # Check 4: Path scanning behavior
        if self._is_path_scanning(client_ip, path):
            suspicious_score += 25
            challenge_type = "rate_limiting"
        
        # Check 5: Referrer anomalies
        if self._has_referrer_anomalies(headers):
            suspicious_score += 15
            challenge_type = "referrer_verification"
        
        return {
            'suspicious': suspicious_score > 50,
            'score': suspicious_score,
            'challenge_type': challenge_type
        }
    
    def _is_rapid_navigation(self, client_ip: str) -> bool:
        """Check if client is navigating too rapidly"""
        try:
            cache_key = f"navigation_speed:{client_ip}"
            current_time = time.time()
            
            # Get recent navigation timestamps
            recent_navs = self.redis_client.lrange(cache_key, 0, 9)
            recent_navs = [float(t) for t in recent_navs if t]
            
            # Remove old timestamps (older than 10 seconds)
            recent_navs = [t for t in recent_navs if current_time - t < 10]
            
            # Check for rapid navigation
            if len(recent_navs) >= 5:  # 5+ requests in 10 seconds
                return True
            
            # Add current timestamp
            self.redis_client.rpush(cache_key, current_time)
            self.redis_client.expire(cache_key, 10)
            
            return False
            
        except Exception as e:
            current_app.logger.error(f"Navigation speed check failed: {e}")
            return False
    
    def _has_normal_headers(self, headers: Dict) -> bool:
        """Check if request has normal browser headers"""
        normal_headers = [
            'accept', 'accept-language', 'accept-encoding',
            'user-agent', 'referer', 'cache-control'
        ]
        
        present_headers = sum(1 for h in normal_headers if h in headers)
        
        # Should have at least 3 normal headers
        return present_headers >= 3
    
    def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is suspicious"""
        suspicious_patterns = [
            r'headless', r'phantom', r'selenium', r'automation',
            r'bot', r'crawler', r'spider', r'scraper',
            r'python', r'curl', r'wget', r'http'
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, user_agent, re.IGNORECASE):
                return True
        
        # Check for very short or very long user agents
        if len(user_agent) < 20 or len(user_agent) > 500:
            return True
        
        return False
    
    def _is_path_scanning(self, client_ip: str, path: str) -> bool:
        """Check if client is scanning paths"""
        try:
            cache_key = f"path_scanning:{client_ip}"
            current_time = time.time()
            
            # Get recent paths accessed
            recent_paths = self.redis_client.lrange(cache_key, 0, 19)
            recent_paths = [p.decode() for p in recent_paths if p]
            
            # Add current path
            recent_paths.append(path)
            
            # Check for path scanning patterns
            if len(recent_paths) >= 10:
                # Check if many different paths in short time
                unique_paths = set(recent_paths)
                if len(unique_paths) >= 8:  # 8+ unique paths
                    return True
            
            # Update Redis
            self.redis_client.rpush(cache_key, path)
            self.redis_client.expire(cache_key, 60)  # 1 minute window
            
            return False
            
        except Exception as e:
            current_app.logger.error(f"Path scanning check failed: {e}")
            return False
    
    def _has_referrer_anomalies(self, headers: Dict) -> bool:
        """Check for referrer anomalies"""
        referrer = headers.get('referer', '')
        
        if not referrer:
            return False  # No referrer is sometimes normal
        
        # Check for suspicious referrer patterns
        suspicious_referrers = [
            'google.com/search', 'bing.com/search', 'yahoo.com/search',
            'facebook.com', 'twitter.com', 'linkedin.com'
        ]
        
        for suspicious in suspicious_referrers:
            if suspicious in referrer:
                return True
        
        return False
    
    def _evaluate_protection_rules(self, request_data: Dict, domain_name: str) -> Dict:
        """Evaluate content protection rules"""
        path = request_data.get('path', '')
        method = request_data.get('method', '')
        client_ip = request_data.get('client_ip', '')
        
        # Default action
        result = {
            'action': 'allow',
            'protection_level': 'standard',
            'headers': {},
            'body': None
        }
        
        # Apply protection rules based on path and method
        if '/api/' in path and method == 'GET':
            # API endpoints need special protection
            result['protection_level'] = 'high'
            result['headers']['X-Content-Protection'] = 'enabled'
        
        elif '/admin/' in path:
            # Admin areas need maximum protection
            result['protection_level'] = 'maximum'
            result['headers']['X-Content-Protection'] = 'maximum'
            result['headers']['X-Frame-Options'] = 'DENY'
            result['headers']['X-Content-Type-Options'] = 'nosniff'
        
        elif method == 'POST' and '/submit' in path:
            # Form submissions need CSRF protection
            result['protection_level'] = 'high'
            result['headers']['X-CSRF-Protection'] = 'enabled'
        
        # Check for specific protection rules
        for rule_id, rule in self.protection_rules.items():
            if self._rule_matches(rule, request_data):
                rule_action = rule['actions'][0] if rule['actions'] else {}
                action_type = rule_action.get('type', 'allow')
                
                if action_type == 'block':
                    result['action'] = 'block'
                    result['protection_level'] = 'maximum'
                elif action_type == 'challenge':
                    result['action'] = 'challenge'
                    result['protection_level'] = 'high'
                elif action_type == 'modify':
                    # Apply header modifications
                    for header_name, header_value in rule_action.get('headers', {}).items():
                        result['headers'][header_name] = header_value
        
        return result
    
    def _rule_matches(self, rule: Dict, request_data: Dict) -> bool:
        """Check if a protection rule matches the request"""
        conditions = rule.get('conditions', [])
        
        for condition in conditions:
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            if field == 'path':
                request_value = request_data.get('path', '')
            elif field == 'method':
                request_value = request_data.get('method', '')
            elif field == 'ip':
                request_value = request_data.get('client_ip', '')
            elif field == 'user_agent':
                request_value = request_data.get('user_agent', '')
            else:
                continue
            
            # Evaluate condition
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
        
        return False
    
    def _apply_dynamic_protection(self, request_data: Dict) -> Dict:
        """Apply dynamic content protection measures"""
        path = request_data.get('path', '')
        method = request_data.get('method', '')
        
        protection_headers = {}
        modified_body = None
        
        # Add dynamic protection headers
        protection_headers['X-Content-Protection'] = 'enabled'
        protection_headers['X-Frame-Options'] = 'SAMEORIGIN'
        protection_headers['X-Content-Type-Options'] = 'nosniff'
        protection_headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Add CSP header for content security
        csp_policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        protection_headers['Content-Security-Policy'] = csp_policy
        
        # Add timing headers for performance monitoring
        protection_headers['Server-Timing'] = 'content-protection;dur=0'
        
        # For HTML content, add dynamic protection
        if method == 'GET' and path.endswith(('.html', '.htm')):
            modified_body = self._add_dynamic_protection_html()
        
        return {
            'headers': protection_headers,
            'body': modified_body
        }
    
    def _add_dynamic_protection_html(self) -> str:
        """Add dynamic protection to HTML content"""
        protection_script = """
        <script>
        // Dynamic content protection
        (function() {
            // Detect automation tools
            if (window.navigator.webdriver) {
                document.body.innerHTML = 'Access Denied';
                return;
            }
            
            // Add mouse movement tracking
            let mouseMovements = 0;
            document.addEventListener('mousemove', function() {
                mouseMovements++;
                if (mouseMovements > 100) {
                    // Remove protection after sufficient interaction
                    document.body.classList.remove('protected');
                }
            });
            
            // Add keyboard tracking
            let keyStrokes = 0;
            document.addEventListener('keydown', function() {
                keyStrokes++;
            });
            
            // Add scroll tracking
            let scrollEvents = 0;
            document.addEventListener('scroll', function() {
                scrollEvents++;
            });
            
            // Check for suspicious behavior
            setTimeout(function() {
                if (mouseMovements < 5 && keyStrokes < 3 && scrollEvents < 2) {
                    // Likely automated access
                    document.body.innerHTML = 'Access Denied - Automated Access Detected';
                }
            }, 5000);
        })();
        </script>
        """
        
        return protection_script
    
    def _create_blocked_response(self, message: str, status: int, start_time: float, action: str = "blocked") -> ProtectionResult:
        """Create a blocked response"""
        processing_time = time.time() - start_time
        
        return ProtectionResult(
            is_allowed=False,
            protection_level="maximum",
            action_taken=action,
            response_status=status,
            response_headers={'Content-Type': 'text/plain'},
            response_body=message,
            challenge_required=False,
            challenge_type=None,
            processing_time=processing_time
        )
    
    def _create_challenge_response(self, challenge_type: str, start_time: float, action: str = "challenge") -> ProtectionResult:
        """Create a challenge response"""
        processing_time = time.time() - start_time
        
        if challenge_type == "captcha":
            challenge_body = "Please complete the CAPTCHA to continue"
            challenge_headers = {'X-Challenge-Type': 'captcha'}
        elif challenge_type == "javascript_challenge":
            challenge_body = "Please enable JavaScript to continue"
            challenge_headers = {'X-Challenge-Type': 'javascript'}
        else:
            challenge_body = "Additional verification required"
            challenge_headers = {'X-Challenge-Type': challenge_type}
        
        return ProtectionResult(
            is_allowed=False,
            protection_level="high",
            action_taken=action,
            response_status=401,
            response_headers=challenge_headers,
            response_body=challenge_body,
            challenge_required=True,
            challenge_type=challenge_type,
            processing_time=processing_time
        )
    
    def _create_protection_response(self, protection_result: Dict, start_time: float) -> ProtectionResult:
        """Create a protection response"""
        processing_time = time.time() - start_time
        
        return ProtectionResult(
            is_allowed=False,
            protection_level=protection_result.get('protection_level', 'standard'),
            action_taken=protection_result.get('action', 'block'),
            response_status=403,
            response_headers=protection_result.get('headers', {}),
            response_body=protection_result.get('body'),
            challenge_required=False,
            challenge_type=None,
            processing_time=processing_time
        )
    
    def _log_protection_event(self, request_data: Dict, action: str, start_time: float):
        """Log content protection event"""
        try:
            processing_time = time.time() - start_time
            
            # Log to Redis for real-time monitoring
            log_data = {
                'timestamp': datetime.now().isoformat(),
                'client_ip': request_data.get('client_ip'),
                'path': request_data.get('path'),
                'method': request_data.get('method'),
                'action': action,
                'processing_time': processing_time
            }
            
            log_key = f"protection_logs:{datetime.now().strftime('%Y-%m-%d:%H')}"
            self.redis_client.lpush(log_key, json.dumps(log_data))
            self.redis_client.expire(log_key, 86400)  # 24 hours
            
        except Exception as e:
            current_app.logger.error(f"Failed to log protection event: {e}")

# Global content protection instance
# Initialize lazily to avoid app context issues
content_protection = None

def get_content_protection():
    global content_protection
    if content_protection is None:
        content_protection = ContentProtection()
    return content_protection
