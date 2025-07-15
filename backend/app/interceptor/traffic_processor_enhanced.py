"""
Enhanced Traffic Processing Engine for Phase 2
Handles traffic rules evaluation and bot detection
"""

import re
import json
import time
import hashlib
import ipaddress
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from urllib.parse import urlparse, parse_qs
from collections import defaultdict
import user_agents

class TrafficProcessor:
    """Core traffic processing engine with rules evaluation"""
    
    def __init__(self):
        self.rate_limits = defaultdict(list)  # IP-based rate limiting
        self.bot_signatures = self._load_bot_signatures()
        self.known_bots = self._load_known_bots()
        
    def _load_bot_signatures(self) -> Dict[str, List[str]]:
        """Load bot detection signatures"""
        return {
            'user_agents': [
                r'.*bot.*', r'.*crawler.*', r'.*spider.*', r'.*scraper.*',
                r'.*slurp.*', r'.*curl.*', r'.*wget.*', r'.*python.*',
                r'.*java.*', r'.*php.*', r'.*perl.*', r'.*ruby.*',
                r'googlebot', r'bingbot', r'slackbot', r'facebookbot',
                r'twitterbot', r'linkedinbot', r'whatsapp', r'telegram'
            ],
            'suspicious_patterns': [
                r'.*headless.*', r'.*phantom.*', r'.*selenium.*',
                r'.*automation.*', r'.*test.*', r'.*monitor.*'
            ],
            'legitimate_bots': [
                r'googlebot', r'bingbot', r'slackbot', r'facebookbot',
                r'twitterbot', r'linkedinbot', r'applebot', r'baiduspider'
            ]
        }
    
    def _load_known_bots(self) -> Dict[str, Dict]:
        """Load known bot information"""
        return {
            'googlebot': {
                'name': 'Google Bot',
                'type': 'search_engine',
                'legitimate': True,
                'ip_ranges': ['66.249.64.0/19', '64.233.160.0/19']
            },
            'bingbot': {
                'name': 'Bing Bot',
                'type': 'search_engine',
                'legitimate': True,
                'ip_ranges': ['40.77.167.0/24', '207.46.13.0/24']
            },
            'facebookbot': {
                'name': 'Facebook Bot',
                'type': 'social_media',
                'legitimate': True,
                'ip_ranges': ['31.13.24.0/21', '31.13.64.0/18']
            }
        }
    
    def process_request(self, request_data: Dict, rules: List[Dict]) -> Dict:
        """Process incoming request against rules"""
        try:
            # Extract request information
            request_info = self._extract_request_info(request_data)
            
            # Apply rules in priority order
            rules_results = []
            final_action = {'type': 'allow', 'reason': 'no_rules_matched'}
            
            # Sort rules by priority (higher priority first)
            sorted_rules = sorted(rules, key=lambda x: x.get('priority', 0), reverse=True)
            
            for rule in sorted_rules:
                if rule.get('status') != 'active':
                    continue
                    
                rule_result = self._evaluate_rule(request_info, rule)
                rules_results.append(rule_result)
                
                # If rule matches, apply action
                if rule_result['matched']:
                    final_action = self._apply_rule_action(rule, request_info)
                    if final_action.get('type') in ['block', 'challenge']:
                        break  # Stop processing on block/challenge
            
            # Bot detection
            bot_detection = self._detect_bot(request_info)
            
            # Rate limiting check
            rate_limit_result = self._check_rate_limit(request_info)
            
            # Generate response
            response = {
                'timestamp': datetime.utcnow().isoformat(),
                'request_id': self._generate_request_id(request_info),
                'request_info': request_info,
                'rules_applied': len(rules_results),
                'rules_results': rules_results,
                'bot_detection': bot_detection,
                'rate_limit': rate_limit_result,
                'final_action': final_action,
                'processing_time_ms': 0  # Will be calculated
            }
            
            return response
            
        except Exception as e:
            return {
                'error': str(e),
                'timestamp': datetime.utcnow().isoformat(),
                'request_info': request_data
            }
    
    def _extract_request_info(self, request_data: Dict) -> Dict:
        """Extract and normalize request information"""
        return {
            'ip': request_data.get('ip', '127.0.0.1'),
            'user_agent': request_data.get('user_agent', ''),
            'method': request_data.get('method', 'GET'),
            'path': request_data.get('path', '/'),
            'query_params': request_data.get('query_params', {}),
            'headers': request_data.get('headers', {}),
            'domain': request_data.get('domain', ''),
            'protocol': request_data.get('protocol', 'https'),
            'timestamp': request_data.get('timestamp', datetime.utcnow().isoformat()),
            'country': request_data.get('country', 'Unknown'),
            'city': request_data.get('city', 'Unknown'),
            'referrer': request_data.get('referrer', ''),
            'content_type': request_data.get('content_type', ''),
            'content_length': request_data.get('content_length', 0)
        }
    
    def _evaluate_rule(self, request_info: Dict, rule: Dict) -> Dict:
        """Evaluate a single rule against request"""
        try:
            conditions = rule.get('conditions', [])
            if not conditions:
                return {'matched': False, 'reason': 'no_conditions'}
            
            # Evaluate all conditions
            condition_results = []
            for condition in conditions:
                result = self._evaluate_condition(request_info, condition)
                condition_results.append(result)
            
            # Apply condition logic (AND/OR)
            matched = self._apply_condition_logic(condition_results, conditions)
            
            return {
                'rule_id': rule.get('id', 'unknown'),
                'rule_name': rule.get('name', 'Unnamed Rule'),
                'matched': matched,
                'conditions_evaluated': len(condition_results),
                'condition_results': condition_results,
                'rule_type': rule.get('type', 'unknown')
            }
            
        except Exception as e:
            return {
                'matched': False,
                'error': str(e),
                'rule_id': rule.get('id', 'unknown')
            }
    
    def _evaluate_condition(self, request_info: Dict, condition: Dict) -> Dict:
        """Evaluate a single condition"""
        try:
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            # Get field value from request
            field_value = self._get_field_value(request_info, field)
            
            # Apply operator
            matched = self._apply_operator(field_value, operator, value)
            
            return {
                'field': field,
                'operator': operator,
                'expected_value': value,
                'actual_value': field_value,
                'matched': matched
            }
            
        except Exception as e:
            return {
                'matched': False,
                'error': str(e),
                'field': condition.get('field', 'unknown')
            }
    
    def _get_field_value(self, request_info: Dict, field: str) -> Any:
        """Extract field value from request info"""
        field_mapping = {
            'ip': lambda r: r.get('ip'),
            'user_agent': lambda r: r.get('user_agent', ''),
            'method': lambda r: r.get('method'),
            'path': lambda r: r.get('path'),
            'domain': lambda r: r.get('domain'),
            'protocol': lambda r: r.get('protocol'),
            'country': lambda r: r.get('country'),
            'referrer': lambda r: r.get('referrer'),
            'content_type': lambda r: r.get('content_type'),
            'content_length': lambda r: r.get('content_length', 0),
            'requests_per_minute': lambda r: self._get_request_rate(r.get('ip'))
        }
        
        return field_mapping.get(field, lambda r: None)(request_info)
    
    def _apply_operator(self, field_value: Any, operator: str, expected_value: Any) -> bool:
        """Apply comparison operator"""
        if field_value is None:
            return False
        
        try:
            if operator == 'equals':
                return str(field_value) == str(expected_value)
            elif operator == 'contains':
                return str(expected_value).lower() in str(field_value).lower()
            elif operator == 'starts_with':
                return str(field_value).lower().startswith(str(expected_value).lower())
            elif operator == 'ends_with':
                return str(field_value).lower().endswith(str(expected_value).lower())
            elif operator == 'regex':
                return bool(re.search(str(expected_value), str(field_value), re.IGNORECASE))
            elif operator == 'greater_than':
                return float(field_value) > float(expected_value)
            elif operator == 'less_than':
                return float(field_value) < float(expected_value)
            elif operator == 'in_range':
                values = str(expected_value).split(',')
                return float(values[0]) <= float(field_value) <= float(values[1])
            elif operator == 'ip_in_range':
                return ipaddress.ip_address(field_value) in ipaddress.ip_network(expected_value)
            else:
                return False
                
        except (ValueError, TypeError, ipaddress.AddressValueError):
            return False
    
    def _apply_condition_logic(self, condition_results: List[Dict], conditions: List[Dict]) -> bool:
        """Apply AND/OR logic to condition results"""
        if not condition_results:
            return False
        
        # For now, use simple AND logic
        # In a more advanced version, we'd parse connector logic
        return all(result.get('matched', False) for result in condition_results)
    
    def _apply_rule_action(self, rule: Dict, request_info: Dict) -> Dict:
        """Apply rule action"""
        actions = rule.get('actions', [])
        if not actions:
            return {'type': 'allow', 'reason': 'no_actions'}
        
        # For now, take the first action
        action = actions[0]
        action_type = action.get('type', 'allow')
        
        response = {
            'type': action_type,
            'rule_id': rule.get('id'),
            'rule_name': rule.get('name'),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if action_type == 'block_request':
            response.update({
                'status_code': 403,
                'message': 'Request blocked by traffic rule',
                'reason': rule.get('name', 'Traffic Rule')
            })
        elif action_type == 'challenge':
            response.update({
                'status_code': 429,
                'message': 'Please complete challenge',
                'challenge_type': action.get('challenge_type', 'captcha')
            })
        elif action_type == 'rate_limit':
            response.update({
                'status_code': 429,
                'message': 'Rate limit exceeded',
                'retry_after': action.get('retry_after', 60)
            })
        
        return response
    
    def _detect_bot(self, request_info: Dict) -> Dict:
        """Detect if request is from a bot"""
        user_agent = request_info.get('user_agent', '').lower()
        ip = request_info.get('ip', '')
        
        # Check user agent patterns
        bot_score = 0
        matched_patterns = []
        
        for pattern in self.bot_signatures['user_agents']:
            if re.search(pattern, user_agent, re.IGNORECASE):
                bot_score += 1
                matched_patterns.append(pattern)
        
        # Check for suspicious patterns
        for pattern in self.bot_signatures['suspicious_patterns']:
            if re.search(pattern, user_agent, re.IGNORECASE):
                bot_score += 2
                matched_patterns.append(f"suspicious:{pattern}")
        
        # Check for legitimate bots
        is_legitimate = any(
            re.search(pattern, user_agent, re.IGNORECASE) 
            for pattern in self.bot_signatures['legitimate_bots']
        )
        
        # Parse user agent
        try:
            parsed_ua = user_agents.parse(user_agent)
            is_bot_ua = parsed_ua.is_bot
        except:
            is_bot_ua = False
        
        return {
            'is_bot': bot_score > 0 or is_bot_ua,
            'is_legitimate': is_legitimate,
            'bot_score': bot_score,
            'matched_patterns': matched_patterns,
            'user_agent_parsed': is_bot_ua,
            'confidence': min(bot_score * 0.3, 1.0)
        }
    
    def _check_rate_limit(self, request_info: Dict) -> Dict:
        """Check rate limiting for IP"""
        ip = request_info.get('ip', '')
        current_time = time.time()
        
        # Clean old entries (older than 1 minute)
        cutoff_time = current_time - 60
        self.rate_limits[ip] = [
            timestamp for timestamp in self.rate_limits[ip] 
            if timestamp > cutoff_time
        ]
        
        # Add current request
        self.rate_limits[ip].append(current_time)
        
        # Check limits
        requests_per_minute = len(self.rate_limits[ip])
        limit_exceeded = requests_per_minute > 100  # Default limit
        
        return {
            'requests_per_minute': requests_per_minute,
            'limit_exceeded': limit_exceeded,
            'limit': 100,
            'reset_time': current_time + 60
        }
    
    def _get_request_rate(self, ip: str) -> int:
        """Get current request rate for IP"""
        current_time = time.time()
        cutoff_time = current_time - 60
        
        return len([
            timestamp for timestamp in self.rate_limits.get(ip, [])
            if timestamp > cutoff_time
        ])
    
    def _generate_request_id(self, request_info: Dict) -> str:
        """Generate unique request ID"""
        content = f"{request_info.get('ip')}-{request_info.get('timestamp')}-{time.time()}"
        return hashlib.md5(content.encode()).hexdigest()[:16]
    
    def test_rule(self, rule: Dict, sample_requests: List[Dict]) -> Dict:
        """Test a rule against sample requests"""
        results = []
        
        for request in sample_requests:
            request_info = self._extract_request_info(request)
            rule_result = self._evaluate_rule(request_info, rule)
            
            results.append({
                'request': request_info,
                'result': rule_result,
                'would_match': rule_result['matched']
            })
        
        matched_count = sum(1 for r in results if r['would_match'])
        
        return {
            'rule': rule,
            'total_requests': len(sample_requests),
            'matched_requests': matched_count,
            'match_rate': matched_count / len(sample_requests) if sample_requests else 0,
            'results': results
        }
    
    def get_traffic_stats(self) -> Dict:
        """Get current traffic statistics"""
        current_time = time.time()
        cutoff_time = current_time - 60
        
        active_ips = 0
        total_requests = 0
        
        for ip, timestamps in self.rate_limits.items():
            recent_requests = [t for t in timestamps if t > cutoff_time]
            if recent_requests:
                active_ips += 1
                total_requests += len(recent_requests)
        
        return {
            'active_ips': active_ips,
            'requests_per_minute': total_requests,
            'average_requests_per_ip': total_requests / active_ips if active_ips > 0 else 0,
            'timestamp': datetime.utcnow().isoformat()
        }

# Create singleton instance
traffic_processor = TrafficProcessor()
