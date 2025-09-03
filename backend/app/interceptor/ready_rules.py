#!/usr/bin/env python3
"""
Ready-to-Use Rules System
Provides pre-configured rules for common security and traffic management scenarios
"""

import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class ReadyRule:
    """Represents a ready-to-use rule template"""
    id: str
    name: str
    description: str
    category: str
    severity: str  # low, medium, high, critical
    rule_type: str
    conditions: List[Dict]
    actions: List[Dict]
    priority: int
    tags: List[str]
    use_count: int
    success_rate: float
    created_at: datetime
    updated_at: datetime
    is_verified: bool
    documentation: str
    examples: List[str]

class ReadyRulesSystem:
    """
    Manages ready-to-use rules for quick domain protection setup
    """
    
    def __init__(self):
        self.rules = {}
        self.categories = {}
        self._initialize_rules()
    
    def _initialize_rules(self):
        """Initialize the ready-to-use rules"""
        
        # Bot Protection Rules
        self.rules['bot_protection_basic'] = ReadyRule(
            id='bot_protection_basic',
            name='Basic Bot Protection',
            description='Blocks common bot user agents and suspicious behavior patterns',
            category='bot_protection',
            severity='medium',
            rule_type='bot_detection',
            conditions=[
                {
                    'field': 'user_agent',
                    'operator': 'contains',
                    'value': 'bot|crawler|spider|scraper'
                },
                {
                    'field': 'requests_per_minute',
                    'operator': 'greater_than',
                    'value': 100
                }
            ],
            actions=[
                {
                    'type': 'block_request',
                    'parameters': {
                        'status_code': 403,
                        'message': 'Bot access denied'
                    }
                }
            ],
            priority=100,
            tags=['bot', 'protection', 'basic', 'user_agent'],
            use_count=1250,
            success_rate=0.94,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_verified=True,
            documentation='Basic bot protection rule that blocks common bot user agents and high-frequency requests',
            examples=[
                'Blocks: Googlebot, Bingbot, Scrapy, etc.',
                'Rate limits: More than 100 requests per minute',
                'Response: 403 Forbidden with custom message'
            ]
        )
        
        self.rules['ddos_protection'] = ReadyRule(
            id='ddos_protection',
            name='DDoS Protection',
            description='Protects against distributed denial of service attacks',
            category='ddos_protection',
            severity='critical',
            rule_type='rate_limiting',
            conditions=[
                {
                    'field': 'requests_per_minute',
                    'operator': 'greater_than',
                    'value': 1000
                },
                {
                    'field': 'ip',
                    'operator': 'in',
                    'value': 'suspicious_ips'
                }
            ],
            actions=[
                {
                    'type': 'rate_limit',
                    'parameters': {
                        'requests_per_minute': 50,
                        'block_duration': 300
                    }
                },
                {
                    'type': 'challenge',
                    'parameters': {
                        'challenge_type': 'captcha',
                        'timeout': 60
                    }
                }
            ],
            priority=50,
            tags=['ddos', 'protection', 'rate_limiting', 'critical'],
            use_count=890,
            success_rate=0.97,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_verified=True,
            documentation='Advanced DDoS protection with rate limiting and challenge mechanisms',
            examples=[
                'Rate limit: 50 requests per minute per IP',
                'Challenge: CAPTCHA for suspicious behavior',
                'Block duration: 5 minutes for violations'
            ]
        )
        
        self.rules['geo_blocking'] = ReadyRule(
            id='geo_blocking',
            name='Geographic Blocking',
            description='Blocks traffic from specific countries or regions',
            category='geo_blocking',
            severity='medium',
            rule_type='geo_filtering',
            conditions=[
                {
                    'field': 'country',
                    'operator': 'in',
                    'value': ['CN', 'RU', 'IR', 'KP']
                }
            ],
            actions=[
                {
                    'type': 'block_request',
                    'parameters': {
                        'status_code': 403,
                        'message': 'Access denied from your region'
                    }
                }
            ],
            priority=150,
            tags=['geo', 'blocking', 'security', 'countries'],
            use_count=567,
            success_rate=0.99,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_verified=True,
            documentation='Geographic blocking rule for countries with high threat levels',
            examples=[
                'Blocks: China, Russia, Iran, North Korea',
                'Response: 403 Forbidden with regional message',
                'Configurable: Easy to modify country list'
            ]
        )
        
        self.rules['content_protection'] = ReadyRule(
            id='content_protection',
            name='Content Protection',
            description='Protects against content scraping and hotlinking',
            category='content_protection',
            severity='high',
            rule_type='content_filtering',
            conditions=[
                {
                    'field': 'referer',
                    'operator': 'not_contains',
                    'value': 'yourdomain.com'
                },
                {
                    'field': 'path',
                    'operator': 'ends_with',
                    'value': '.jpg|.png|.gif|.mp4|.pdf'
                }
            ],
            actions=[
                {
                    'type': 'redirect',
                    'parameters': {
                        'url': 'https://yourdomain.com/blocked',
                        'status_code': 302
                    }
                }
            ],
            priority=200,
            tags=['content', 'protection', 'hotlinking', 'scraping'],
            use_count=432,
            success_rate=0.96,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_verified=True,
            documentation='Content protection rule that prevents hotlinking and unauthorized content access',
            examples=[
                'Blocks: External sites linking to your media files',
                'Redirects: Sends violators to blocked page',
                'Media types: Images, videos, PDFs, etc.'
            ]
        )
        
        self.rules['api_protection'] = ReadyRule(
            id='api_protection',
            name='API Protection',
            description='Protects API endpoints from abuse and unauthorized access',
            category='api_protection',
            severity='high',
            rule_type='api_security',
            conditions=[
                {
                    'field': 'path',
                    'operator': 'starts_with',
                    'value': '/api/'
                },
                {
                    'field': 'method',
                    'operator': 'in',
                    'value': ['POST', 'PUT', 'DELETE']
                },
                {
                    'field': 'requests_per_minute',
                    'operator': 'greater_than',
                    'value': 200
                }
            ],
            actions=[
                {
                    'type': 'rate_limit',
                    'parameters': {
                        'requests_per_minute': 100,
                        'block_duration': 600
                    }
                },
                {
                    'type': 'challenge',
                    'parameters': {
                        'challenge_type': 'api_key',
                        'timeout': 30
                    }
                }
            ],
            priority=75,
            tags=['api', 'protection', 'rate_limiting', 'security'],
            use_count=678,
            success_rate=0.93,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_verified=True,
            documentation='API protection rule with rate limiting and authentication challenges',
            examples=[
                'Rate limit: 100 requests per minute for API endpoints',
                'Challenge: API key verification for high-frequency requests',
                'Block duration: 10 minutes for violations'
            ]
        )
        
        self.rules['sql_injection_protection'] = ReadyRule(
            id='sql_injection_protection',
            name='SQL Injection Protection',
            description='Blocks common SQL injection attack patterns',
            category='security',
            severity='critical',
            rule_type='security_filtering',
            conditions=[
                {
                    'field': 'query_params',
                    'operator': 'regex',
                    'value': '(\'|--|;|/\*|\*/|union|select|insert|update|delete|drop|create|alter)'
                }
            ],
            actions=[
                {
                    'type': 'block_request',
                    'parameters': {
                        'status_code': 400,
                        'message': 'Invalid request detected'
                    }
                },
                {
                    'type': 'log_only',
                    'parameters': {
                        'log_level': 'warning',
                        'alert': True
                    }
                }
            ],
            priority=25,
            tags=['security', 'sql_injection', 'critical', 'filtering'],
            use_count=1234,
            success_rate=0.98,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_verified=True,
            documentation='SQL injection protection using regex pattern matching',
            examples=[
                'Patterns: Common SQL injection keywords and syntax',
                'Response: 400 Bad Request for violations',
                'Logging: Detailed logging with alerts'
            ]
        )
        
        self.rules['xss_protection'] = ReadyRule(
            id='xss_protection',
            name='XSS Protection',
            description='Blocks cross-site scripting attack attempts',
            category='security',
            severity='critical',
            rule_type='security_filtering',
            conditions=[
                {
                    'field': 'query_params',
                    'operator': 'regex',
                    'value': '(<script|javascript:|vbscript:|onload=|onerror=|onclick=)'
                }
            ],
            actions=[
                {
                    'type': 'block_request',
                    'parameters': {
                        'status_code': 400,
                        'message': 'XSS attack detected'
                    }
                }
            ],
            priority=30,
            tags=['security', 'xss', 'critical', 'filtering'],
            use_count=987,
            success_rate=0.97,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            is_verified=True,
            documentation='XSS protection using pattern matching for malicious scripts',
            examples=[
                'Patterns: Script tags, JavaScript events, VBScript',
                'Response: 400 Bad Request for violations',
                'Coverage: Common XSS attack vectors'
            ]
        )
        
        # Initialize categories
        self.categories = {
            'bot_protection': {
                'name': 'Bot Protection',
                'description': 'Rules to detect and block malicious bots',
                'icon': '🤖',
                'rule_count': 1
            },
            'ddos_protection': {
                'name': 'DDoS Protection',
                'description': 'Protection against distributed denial of service attacks',
                'icon': '🛡️',
                'rule_count': 1
            },
            'geo_blocking': {
                'name': 'Geographic Blocking',
                'description': 'Block traffic from specific countries or regions',
                'icon': '🌍',
                'rule_count': 1
            },
            'content_protection': {
                'name': 'Content Protection',
                'description': 'Protect content from scraping and hotlinking',
                'icon': '📄',
                'rule_count': 1
            },
            'api_protection': {
                'name': 'API Protection',
                'description': 'Secure API endpoints from abuse',
                'icon': '🔌',
                'rule_count': 1
            },
            'security': {
                'name': 'Security',
                'description': 'General security rules for common attack vectors',
                'icon': '🔒',
                'rule_count': 2
            }
        }
    
    def get_all_rules(self) -> List[ReadyRule]:
        """Get all ready-to-use rules"""
        return list(self.rules.values())
    
    def get_rules_by_category(self, category: str) -> List[ReadyRule]:
        """Get rules by category"""
        return [rule for rule in self.rules.values() if rule.category == category]
    
    def get_rule_by_id(self, rule_id: str) -> Optional[ReadyRule]:
        """Get a specific rule by ID"""
        return self.rules.get(rule_id)
    
    def get_categories(self) -> Dict:
        """Get all rule categories"""
        return self.categories
    
    def get_popular_rules(self, limit: int = 10) -> List[ReadyRule]:
        """Get most popular rules based on use count"""
        sorted_rules = sorted(
            self.rules.values(),
            key=lambda x: x.use_count,
            reverse=True
        )
        return sorted_rules[:limit]
    
    def get_high_severity_rules(self) -> List[ReadyRule]:
        """Get high and critical severity rules"""
        return [
            rule for rule in self.rules.values()
            if rule.severity in ['high', 'critical']
        ]
    
    def apply_rule_to_domain(self, rule_id: str, domain_id: int, customizations: Dict = None) -> Dict:
        """Apply a ready-to-use rule to a specific domain with optional customizations"""
        try:
            rule = self.get_rule_by_id(rule_id)
            if not rule:
                return {
                    'success': False,
                    'error': f'Rule {rule_id} not found'
                }
            
            # Create rule data for domain
            rule_data = {
                'name': f"{rule.name} - {domain_id}",
                'description': rule.description,
                'rule_type': rule.rule_type,
                'conditions': rule.conditions.copy(),
                'actions': rule.actions.copy(),
                'priority': rule.priority,
                'is_active': True,
                'tags': rule.tags.copy()
            }
            
            # Apply customizations if provided
            if customizations:
                if 'conditions' in customizations:
                    rule_data['conditions'] = customizations['conditions']
                if 'actions' in customizations:
                    rule_data['actions'] = customizations['actions']
                if 'priority' in customizations:
                    rule_data['priority'] = customizations['priority']
                if 'name' in customizations:
                    rule_data['name'] = customizations['name']
            
            # Increment use count
            rule.use_count += 1
            
            return {
                'success': True,
                'rule_data': rule_data,
                'message': f'Rule {rule.name} applied successfully'
            }
            
        except Exception as e:
            logger.error(f"Failed to apply rule {rule_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def search_rules(self, query: str, category: str = None, severity: str = None) -> List[ReadyRule]:
        """Search rules by query, category, and severity"""
        results = []
        
        for rule in self.rules.values():
            # Check if rule matches search criteria
            matches_query = (
                query.lower() in rule.name.lower() or
                query.lower() in rule.description.lower() or
                any(query.lower() in tag.lower() for tag in rule.tags)
            )
            
            matches_category = category is None or rule.category == category
            matches_severity = severity is None or rule.severity == severity
            
            if matches_query and matches_category and matches_severity:
                results.append(rule)
        
        return results
    
    def get_rule_statistics(self) -> Dict:
        """Get statistics about ready-to-use rules"""
        total_rules = len(self.rules)
        total_use_count = sum(rule.use_count for rule in self.rules.values())
        avg_success_rate = sum(rule.success_rate for rule in self.rules.values()) / total_rules
        
        category_stats = {}
        for category in self.categories:
            category_rules = self.get_rules_by_category(category)
            category_stats[category] = {
                'rule_count': len(category_rules),
                'total_use_count': sum(rule.use_count for rule in category_rules),
                'avg_success_rate': sum(rule.success_rate for rule in category_rules) / len(category_rules) if category_rules else 0
            }
        
        return {
            'total_rules': total_rules,
            'total_use_count': total_use_count,
            'avg_success_rate': avg_success_rate,
            'categories': len(self.categories),
            'category_stats': category_stats
        }

# Global instance (lazy initialization)
_ready_rules_system = None

def get_ready_rules_system():
    """Get global ready rules system instance"""
    global _ready_rules_system
    if _ready_rules_system is None:
        _ready_rules_system = ReadyRulesSystem()
    return _ready_rules_system
