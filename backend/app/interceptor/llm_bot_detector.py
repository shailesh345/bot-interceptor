"""
Enhanced LLM Bot Detection System
Specifically designed to detect and intercept AI company crawlers including:
- ChatGPT/OpenAI bots
- Google AI/Bard bots
- Perplexity AI crawlers
- Claude/Anthropic bots
- Other AI training data collectors
"""

import re
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Set
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
import joblib
import os
import requests
from collections import defaultdict
import threading
import time

from ..models import BotProfile, TrafficLog
from ..models_enhanced import LLMBotDetection, CreditPurchase
from .. import db

class LLMBotDetector:
    """Advanced detector specifically for AI/LLM company bots"""
    
    def __init__(self):
        self.ml_model = None
        self.vectorizer = None
        self.scaler = StandardScaler()
        self.feature_names = []
        
        # LLM-specific detection patterns
        self.llm_bot_signatures = self._load_llm_bot_signatures()
        self.llm_user_agents = self._load_llm_user_agents()
        self.llm_ip_ranges = self._load_llm_ip_ranges()
        self.behavioral_patterns = self._load_behavioral_patterns()
        
        # Caches for performance
        self.detection_cache = {}
        self.ip_reputation_cache = {}
        self.rate_limit_cache = defaultdict(list)
        
        # Super intelligence components
        self.ensemble_models = []
        self.threat_intelligence_feeds = []
        
        # Load or create models
        self.load_models()
        
    def _load_llm_bot_signatures(self) -> Dict[str, Dict]:
        """Load specific signatures for LLM company bots"""
        return {
            'openai': {
                'name': 'OpenAI/ChatGPT',
                'user_agents': [
                    'GPTBot',
                    'ChatGPT-User',
                    'OpenAI',
                    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.0)',
                    'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)'
                ],
                'ip_ranges': [
                    '20.14.0.0/16',
                    '52.230.152.0/24',
                    '20.42.0.0/16'
                ],
                'behavioral_patterns': {
                    'crawl_delay': 1.0,
                    'concurrent_requests': 5,
                    'respects_robots': True,
                    'javascript_execution': False
                },
                'detection_weight': 0.95
            },
            'google_ai': {
                'name': 'Google AI/Bard',
                'user_agents': [
                    'Google-Extended',
                    'Googlebot',
                    'AdsBot-Google',
                    'Googlebot-Image',
                    'Mediapartners-Google',
                    'Google-InspectionTool'
                ],
                'ip_ranges': [
                    '66.249.64.0/19',
                    '66.102.0.0/20',
                    '64.233.160.0/19',
                    '72.14.192.0/18'
                ],
                'behavioral_patterns': {
                    'crawl_delay': 0.5,
                    'concurrent_requests': 10,
                    'respects_robots': True,
                    'javascript_execution': True
                },
                'detection_weight': 0.90
            },
            'perplexity': {
                'name': 'Perplexity AI',
                'user_agents': [
                    'PerplexityBot',
                    'Perplexity-Bot',
                    'Mozilla/5.0 (compatible; PerplexityBot/1.0)',
                    'PerplexityAI'
                ],
                'ip_ranges': [
                    '34.0.0.0/8',  # Common cloud ranges used
                    '35.0.0.0/8'
                ],
                'behavioral_patterns': {
                    'crawl_delay': 2.0,
                    'concurrent_requests': 3,
                    'respects_robots': True,
                    'javascript_execution': False
                },
                'detection_weight': 0.85
            },
            'anthropic': {
                'name': 'Claude/Anthropic',
                'user_agents': [
                    'Claude-Web',
                    'AnthropicBot',
                    'Claude',
                    'Mozilla/5.0 (compatible; Claude/1.0)'
                ],
                'ip_ranges': [
                    '54.0.0.0/8',  # AWS ranges commonly used
                    '52.0.0.0/8'
                ],
                'behavioral_patterns': {
                    'crawl_delay': 1.5,
                    'concurrent_requests': 4,
                    'respects_robots': True,
                    'javascript_execution': False
                },
                'detection_weight': 0.85
            },
            'other_ai': {
                'name': 'Other AI Bots',
                'user_agents': [
                    'AI-Bot',
                    'ML-Bot',
                    'DataBot',
                    'TrainingBot',
                    'AIDataCollector',
                    'LLMCrawler'
                ],
                'ip_ranges': [],
                'behavioral_patterns': {
                    'crawl_delay': 1.0,
                    'concurrent_requests': 5,
                    'respects_robots': False,
                    'javascript_execution': False
                },
                'detection_weight': 0.75
            }
        }
    
    def _load_llm_user_agents(self) -> Set[str]:
        """Load comprehensive list of LLM bot user agents"""
        agents = set()
        for bot_type, signature in self.llm_bot_signatures.items():
            agents.update(signature['user_agents'])
        return agents
    
    def _load_llm_ip_ranges(self) -> Dict[str, List[str]]:
        """Load IP ranges used by LLM companies"""
        ip_ranges = {}
        for bot_type, signature in self.llm_bot_signatures.items():
            ip_ranges[bot_type] = signature['ip_ranges']
        return ip_ranges
    
    def _load_behavioral_patterns(self) -> Dict:
        """Load behavioral patterns specific to LLM bots"""
        return {
            'content_preferences': {
                'targets_text_content': True,
                'ignores_media': True,
                'follows_internal_links': True,
                'respects_nofollow': False,
                'extracts_structured_data': True
            },
            'crawl_patterns': {
                'systematic_crawling': True,
                'depth_first': False,
                'breadth_first': True,
                'random_delay': False,
                'consistent_timing': True
            },
            'technical_indicators': {
                'accepts_all_content_types': False,
                'sends_custom_headers': True,
                'maintains_session': False,
                'executes_javascript': False,
                'renders_page': False
            }
        }
    
    def detect_llm_bot(self, request_data: Dict) -> Dict:
        """
        Enhanced detection specifically for LLM/AI company bots
        
        Args:
            request_data: Dictionary containing request information
            
        Returns:
            Dictionary with detailed detection results
        """
        # Initialize detection result
        detection_result = {
            'is_llm_bot': False,
            'confidence': 0.0,
            'bot_company': None,
            'bot_type': None,
            'detection_methods': [],
            'risk_score': 0.0,
            'credit_required': False,
            'redirect_url': None,
            'company_contact': None,
            'evidence': {},
            'recommendations': []
        }
        
        # Check cache first
        cache_key = self._generate_cache_key(request_data)
        if cache_key in self.detection_cache:
            cached_result = self.detection_cache[cache_key]
            if (datetime.utcnow() - cached_result['timestamp']).seconds < 300:  # 5 min cache
                return cached_result['result']
        
        # Method 1: Direct User Agent Matching
        ua_result = self._detect_by_user_agent(request_data.get('user_agent', ''))
        if ua_result['detected']:
            detection_result['detection_methods'].append('user_agent_match')
            detection_result['confidence'] += ua_result['confidence'] * 0.3
            detection_result['bot_company'] = ua_result['company']
            detection_result['evidence']['user_agent'] = ua_result
        
        # Method 2: IP Range Analysis
        ip_result = self._detect_by_ip_range(request_data.get('client_ip', ''))
        if ip_result['detected']:
            detection_result['detection_methods'].append('ip_range_match')
            detection_result['confidence'] += ip_result['confidence'] * 0.25
            if not detection_result['bot_company']:
                detection_result['bot_company'] = ip_result['company']
            detection_result['evidence']['ip_analysis'] = ip_result
        
        # Method 3: Behavioral Pattern Analysis
        behavior_result = self._analyze_llm_behavior(request_data)
        if behavior_result['detected']:
            detection_result['detection_methods'].append('behavioral_analysis')
            detection_result['confidence'] += behavior_result['confidence'] * 0.2
            detection_result['evidence']['behavior'] = behavior_result
        
        # Method 4: Advanced ML Classification
        ml_result = self._ml_llm_classification(request_data)
        if ml_result['detected']:
            detection_result['detection_methods'].append('ml_classification')
            detection_result['confidence'] += ml_result['confidence'] * 0.15
            detection_result['evidence']['ml_analysis'] = ml_result
        
        # Method 5: Super Intelligence Detection
        si_result = self._super_intelligence_detection(request_data)
        if si_result['detected']:
            detection_result['detection_methods'].append('super_intelligence')
            detection_result['confidence'] += si_result['confidence'] * 0.1
            detection_result['evidence']['super_intelligence'] = si_result
        
        # Normalize confidence score
        detection_result['confidence'] = min(detection_result['confidence'], 1.0)
        
        # Determine if it's an LLM bot
        detection_result['is_llm_bot'] = detection_result['confidence'] > 0.6
        
        # Calculate risk score and determine actions
        if detection_result['is_llm_bot']:
            detection_result['risk_score'] = self._calculate_llm_risk_score(detection_result)
            detection_result['credit_required'] = True
            detection_result['redirect_url'] = '/purchase-credits'
            detection_result['company_contact'] = self._get_company_contact(
                detection_result['bot_company']
            )
            detection_result['recommendations'] = self._generate_llm_recommendations(
                detection_result
            )
        
        # Cache the result
        self.detection_cache[cache_key] = {
            'result': detection_result,
            'timestamp': datetime.utcnow()
        }
        
        # Log detection for training data
        self._log_detection(request_data, detection_result)
        
        return detection_result
    
    def _detect_by_user_agent(self, user_agent: str) -> Dict:
        """Detect LLM bots by user agent string"""
        result = {
            'detected': False,
            'confidence': 0.0,
            'company': None,
            'matches': []
        }
        
        if not user_agent:
            return result
        
        ua_lower = user_agent.lower()
        
        # Check each LLM bot signature
        for bot_type, signature in self.llm_bot_signatures.items():
            for pattern in signature['user_agents']:
                if pattern.lower() in ua_lower or re.search(pattern, user_agent, re.IGNORECASE):
                    result['detected'] = True
                    result['confidence'] = max(result['confidence'], signature['detection_weight'])
                    result['company'] = signature['name']
                    result['matches'].append({
                        'pattern': pattern,
                        'bot_type': bot_type,
                        'weight': signature['detection_weight']
                    })
        
        # Additional patterns for AI/ML bots
        ai_patterns = [
            r'(?i)(ai|ml|machine.?learning|neural|gpt|llm|language.?model)',
            r'(?i)(training|dataset|corpus|scraper.*ai|crawler.*ai)',
            r'(?i)(openai|anthropic|google.*ai|perplexity|chatgpt|claude|bard)'
        ]
        
        for pattern in ai_patterns:
            if re.search(pattern, user_agent):
                result['detected'] = True
                result['confidence'] = max(result['confidence'], 0.7)
                if not result['company']:
                    result['company'] = 'Unknown AI Company'
                result['matches'].append({
                    'pattern': pattern,
                    'bot_type': 'generic_ai',
                    'weight': 0.7
                })
        
        return result
    
    def _detect_by_ip_range(self, ip_address: str) -> Dict:
        """Detect LLM bots by IP range"""
        result = {
            'detected': False,
            'confidence': 0.0,
            'company': None,
            'ip_info': {}
        }
        
        if not ip_address:
            return result
        
        # Check against known LLM company IP ranges
        for bot_type, signature in self.llm_bot_signatures.items():
            for ip_range in signature['ip_ranges']:
                if self._ip_in_range(ip_address, ip_range):
                    result['detected'] = True
                    result['confidence'] = signature['detection_weight'] * 0.8
                    result['company'] = signature['name']
                    result['ip_info'] = {
                        'range': ip_range,
                        'bot_type': bot_type,
                        'verified': True
                    }
                    break
        
        # Check IP reputation if not found in known ranges
        if not result['detected']:
            reputation = self._check_ip_reputation(ip_address)
            if reputation.get('is_datacenter') or reputation.get('is_vpn'):
                result['detected'] = True
                result['confidence'] = 0.5
                result['ip_info'] = reputation
        
        return result
    
    def _analyze_llm_behavior(self, request_data: Dict) -> Dict:
        """Analyze request behavior specific to LLM bots"""
        result = {
            'detected': False,
            'confidence': 0.0,
            'patterns': []
        }
        
        score = 0.0
        
        # Check crawl patterns
        client_ip = request_data.get('client_ip', '')
        path = request_data.get('request_path', '')
        headers = request_data.get('headers', {})
        
        # Pattern 1: Systematic crawling behavior
        if client_ip in self.rate_limit_cache:
            recent_requests = self.rate_limit_cache[client_ip]
            current_time = datetime.utcnow()
            
            # Clean old requests
            recent_requests = [r for r in recent_requests 
                             if (current_time - r['time']).seconds < 300]
            
            if len(recent_requests) >= 10:
                # Check for systematic timing
                time_diffs = []
                for i in range(1, len(recent_requests)):
                    diff = (recent_requests[i]['time'] - recent_requests[i-1]['time']).seconds
                    time_diffs.append(diff)
                
                if time_diffs:
                    avg_diff = np.mean(time_diffs)
                    std_diff = np.std(time_diffs)
                    
                    # Consistent timing indicates bot
                    if std_diff < 2.0 and 0.5 <= avg_diff <= 5.0:
                        score += 0.3
                        result['patterns'].append('consistent_timing')
        
        # Pattern 2: Content targeting behavior
        if any(ext in path for ext in ['.html', '.htm', '.txt', '.json', '/']):
            if not any(ext in path for ext in ['.jpg', '.png', '.css', '.js', '.gif']):
                score += 0.2
                result['patterns'].append('text_content_focus')
        
        # Pattern 3: Header analysis
        accept_header = headers.get('accept', '').lower()
        if 'text/html' in accept_header and 'image' not in accept_header:
            score += 0.1
            result['patterns'].append('text_only_accept')
        
        # Pattern 4: No referrer for deep pages
        if path.count('/') > 2 and not headers.get('referer'):
            score += 0.2
            result['patterns'].append('deep_crawl_no_referrer')
        
        # Pattern 5: Ignores cookies
        if not headers.get('cookie') and request_data.get('request_method') == 'GET':
            score += 0.1
            result['patterns'].append('no_cookies')
        
        result['confidence'] = min(score, 1.0)
        result['detected'] = result['confidence'] > 0.5
        
        # Update rate limit cache
        self.rate_limit_cache[client_ip].append({
            'time': datetime.utcnow(),
            'path': path,
            'method': request_data.get('request_method')
        })
        
        return result
    
    def _ml_llm_classification(self, request_data: Dict) -> Dict:
        """Use ML model specifically trained on LLM bot patterns"""
        result = {
            'detected': False,
            'confidence': 0.0,
            'model_scores': {}
        }
        
        if not self.ml_model:
            return result
        
        try:
            # Extract features
            features = self._extract_llm_features(request_data)
            
            # Make prediction
            if isinstance(features, np.ndarray):
                prediction_proba = self.ml_model.predict_proba(features.reshape(1, -1))[0]
                bot_probability = prediction_proba[1] if len(prediction_proba) > 1 else 0.0
                
                result['detected'] = bot_probability > 0.6
                result['confidence'] = bot_probability
                result['model_scores']['primary_model'] = bot_probability
            
            # Use ensemble if available
            if self.ensemble_models:
                ensemble_scores = []
                for i, model in enumerate(self.ensemble_models):
                    score = model.predict_proba(features.reshape(1, -1))[0][1]
                    ensemble_scores.append(score)
                    result['model_scores'][f'ensemble_{i}'] = score
                
                result['confidence'] = np.mean(ensemble_scores)
                result['detected'] = result['confidence'] > 0.6
        
        except Exception as e:
            print(f"ML classification error: {e}")
        
        return result
    
    def _super_intelligence_detection(self, request_data: Dict) -> Dict:
        """Advanced detection using multiple intelligence sources"""
        result = {
            'detected': False,
            'confidence': 0.0,
            'intelligence_sources': []
        }
        
        scores = []
        
        # 1. Threat Intelligence Feeds
        threat_score = self._check_threat_intelligence(request_data)
        if threat_score > 0:
            scores.append(threat_score)
            result['intelligence_sources'].append('threat_feeds')
        
        # 2. Behavioral Anomaly Detection
        anomaly_score = self._detect_behavioral_anomalies(request_data)
        if anomaly_score > 0:
            scores.append(anomaly_score)
            result['intelligence_sources'].append('anomaly_detection')
        
        # 3. Pattern Correlation Analysis
        correlation_score = self._analyze_pattern_correlations(request_data)
        if correlation_score > 0:
            scores.append(correlation_score)
            result['intelligence_sources'].append('pattern_correlation')
        
        # 4. Real-time Learning
        learning_score = self._real_time_learning_detection(request_data)
        if learning_score > 0:
            scores.append(learning_score)
            result['intelligence_sources'].append('real_time_learning')
        
        if scores:
            result['confidence'] = np.mean(scores)
            result['detected'] = result['confidence'] > 0.5
        
        return result
    
    def _extract_llm_features(self, request_data: Dict) -> np.ndarray:
        """Extract features specific to LLM bot detection"""
        features = []
        
        # User agent features
        ua = request_data.get('user_agent', '')
        features.extend([
            len(ua),
            ua.lower().count('bot'),
            ua.lower().count('ai'),
            ua.lower().count('gpt'),
            ua.lower().count('crawl'),
            int(any(company in ua.lower() for company in ['openai', 'google', 'anthropic', 'perplexity']))
        ])
        
        # Request features
        path = request_data.get('request_path', '')
        features.extend([
            len(path),
            path.count('/'),
            int('.html' in path or '.htm' in path),
            int('.json' in path or '.xml' in path),
            int(any(media in path for media in ['.jpg', '.png', '.gif', '.mp4'])),
            int('/api/' in path),
            int('/search' in path or '/query' in path)
        ])
        
        # Header features
        headers = request_data.get('headers', {})
        features.extend([
            len(headers),
            int('referer' in headers),
            int('cookie' in headers),
            int('authorization' in headers),
            int('accept-language' in headers),
            int('x-' in str(headers).lower())  # Custom headers
        ])
        
        # Timing features
        hour = datetime.utcnow().hour
        features.extend([
            hour,
            int(0 <= hour <= 6),  # Night crawling
            int(request_data.get('request_method', '') == 'GET'),
            int(request_data.get('request_method', '') == 'POST')
        ])
        
        return np.array(features, dtype=np.float32)
    
    def _ip_in_range(self, ip: str, ip_range: str) -> bool:
        """Check if IP is in given CIDR range"""
        try:
            import ipaddress
            return ipaddress.ip_address(ip) in ipaddress.ip_network(ip_range)
        except:
            return False
    
    def _check_ip_reputation(self, ip: str) -> Dict:
        """Check IP reputation from cache or external service"""
        if ip in self.ip_reputation_cache:
            return self.ip_reputation_cache[ip]
        
        reputation = {
            'is_datacenter': False,
            'is_vpn': False,
            'is_proxy': False,
            'country': 'unknown',
            'asn': None
        }
        
        # Simplified check - in production, use actual IP reputation services
        # Check for common datacenter patterns
        datacenter_patterns = [
            r'^54\.',     # AWS
            r'^52\.',     # AWS
            r'^35\.',     # GCP
            r'^34\.',     # GCP
            r'^104\.',    # Cloudflare
            r'^172\.217\.' # Google
        ]
        
        for pattern in datacenter_patterns:
            if re.match(pattern, ip):
                reputation['is_datacenter'] = True
                break
        
        self.ip_reputation_cache[ip] = reputation
        return reputation
    
    def _check_threat_intelligence(self, request_data: Dict) -> float:
        """Check against threat intelligence feeds"""
        # Simplified - in production, integrate with actual threat feeds
        score = 0.0
        
        ip = request_data.get('client_ip', '')
        ua = request_data.get('user_agent', '')
        
        # Check known bad patterns
        if any(pattern in ua.lower() for pattern in ['scanner', 'exploit', 'vulnerability']):
            score += 0.3
        
        # Check suspicious IPs
        if ip.startswith(('10.', '172.16.', '192.168.')):
            score += 0.2
        
        return min(score, 1.0)
    
    def _detect_behavioral_anomalies(self, request_data: Dict) -> float:
        """Detect anomalous behavior patterns"""
        score = 0.0
        
        # Check for unusual request patterns
        path = request_data.get('request_path', '')
        if path.count('../') > 0 or path.count('..\\') > 0:
            score += 0.5
        
        # Check for missing standard headers
        headers = request_data.get('headers', {})
        standard_headers = ['user-agent', 'accept', 'host']
        missing = sum(1 for h in standard_headers if h not in headers)
        score += missing * 0.1
        
        return min(score, 1.0)
    
    def _analyze_pattern_correlations(self, request_data: Dict) -> float:
        """Analyze correlations between different pattern types"""
        correlations = 0
        
        # Correlation 1: Datacenter IP + Bot UA
        ip_result = self._check_ip_reputation(request_data.get('client_ip', ''))
        ua_result = self._detect_by_user_agent(request_data.get('user_agent', ''))
        
        if ip_result.get('is_datacenter') and ua_result['detected']:
            correlations += 0.4
        
        # Correlation 2: No referrer + Deep path
        path = request_data.get('request_path', '')
        headers = request_data.get('headers', {})
        
        if path.count('/') > 3 and not headers.get('referer'):
            correlations += 0.3
        
        # Correlation 3: Fast requests + Text content only
        # (Would need request history for proper implementation)
        
        return min(correlations, 1.0)
    
    def _real_time_learning_detection(self, request_data: Dict) -> float:
        """Use real-time learning from recent detections"""
        # Simplified - in production, implement proper online learning
        
        # Check similarity to recent confirmed bots
        # This would compare current request to recently detected LLM bots
        # and learn from patterns
        
        return 0.0  # Placeholder
    
    def _calculate_llm_risk_score(self, detection_result: Dict) -> float:
        """Calculate risk score specific to LLM bots"""
        base_score = detection_result['confidence'] * 50
        
        # Adjust based on bot company
        company_multipliers = {
            'OpenAI/ChatGPT': 1.5,      # High value
            'Google AI/Bard': 1.4,       # High value
            'Perplexity AI': 1.3,        # Medium-high value
            'Claude/Anthropic': 1.3,     # Medium-high value
            'Unknown AI Company': 1.0    # Standard value
        }
        
        company = detection_result.get('bot_company', 'Unknown')
        multiplier = company_multipliers.get(company, 1.0)
        
        # Additional factors
        if len(detection_result['detection_methods']) > 3:
            multiplier *= 1.2
        
        if 'super_intelligence' in detection_result['detection_methods']:
            multiplier *= 1.1
        
        return min(base_score * multiplier, 100.0)
    
    def _get_company_contact(self, company_name: str) -> Dict:
        """Get contact information for AI companies"""
        contacts = {
            'OpenAI/ChatGPT': {
                'email': 'partnerships@openai.com',
                'website': 'https://openai.com/policies/data-usage',
                'contact_form': 'https://openai.com/contact'
            },
            'Google AI/Bard': {
                'email': 'googlebot@google.com',
                'website': 'https://developers.google.com/search',
                'contact_form': 'https://support.google.com/webmasters/contact'
            },
            'Perplexity AI': {
                'email': 'hello@perplexity.ai',
                'website': 'https://perplexity.ai',
                'contact_form': 'https://perplexity.ai/contact'
            },
            'Claude/Anthropic': {
                'email': 'support@anthropic.com',
                'website': 'https://anthropic.com',
                'contact_form': 'https://anthropic.com/contact'
            }
        }
        
        return contacts.get(company_name, {
            'email': 'info@unknown-ai.com',
            'website': 'https://example.com',
            'contact_form': None
        })
    
    def _generate_llm_recommendations(self, detection_result: Dict) -> List[str]:
        """Generate recommendations for handling LLM bots"""
        recommendations = []
        
        company = detection_result.get('bot_company', 'Unknown')
        
        # Company-specific recommendations
        if 'OpenAI' in company:
            recommendations.append("High-value bot detected - OpenAI/ChatGPT crawler. Immediate credit purchase required.")
            recommendations.append("Consider premium pricing tier for OpenAI access.")
        elif 'Google' in company:
            recommendations.append("Google AI bot detected - High traffic expected. Set appropriate rate limits.")
            recommendations.append("Enable advanced monitoring for Google bot activity.")
        elif 'Perplexity' in company:
            recommendations.append("Perplexity AI crawler detected - Growing AI platform. Standard credit package recommended.")
        elif 'Anthropic' in company:
            recommendations.append("Claude/Anthropic bot detected - Emerging AI company. Monitor usage patterns.")
        
        # General recommendations
        if detection_result['confidence'] > 0.9:
            recommendations.append("Very high confidence detection - Automatic redirect to credit purchase recommended.")
        
        if len(detection_result['detection_methods']) > 3:
            recommendations.append("Multiple detection methods triggered - Strong evidence of AI bot activity.")
        
        recommendations.append(f"Send automated outreach email to {company} for partnership opportunities.")
        
        return recommendations
    
    def _generate_cache_key(self, request_data: Dict) -> str:
        """Generate cache key for request"""
        key_parts = [
            request_data.get('client_ip', ''),
            request_data.get('user_agent', ''),
            request_data.get('request_path', ''),
            request_data.get('request_method', '')
        ]
        return hashlib.md5('|'.join(key_parts).encode()).hexdigest()
    
    def _log_detection(self, request_data: Dict, detection_result: Dict):
        """Log detection for training data and analytics"""
        try:
            detection = LLMBotDetection(
                timestamp=datetime.utcnow(),
                ip_address=request_data.get('client_ip'),
                user_agent=request_data.get('user_agent'),
                request_path=request_data.get('request_path'),
                is_llm_bot=detection_result['is_llm_bot'],
                confidence=detection_result['confidence'],
                bot_company=detection_result.get('bot_company'),
                detection_methods=json.dumps(detection_result['detection_methods']),
                evidence=json.dumps(detection_result.get('evidence', {}))
            )
            db.session.add(detection)
            db.session.commit()
        except Exception as e:
            print(f"Error logging detection: {e}")
    
    def train_on_feedback(self, request_data: Dict, is_llm_bot: bool, bot_company: str = None):
        """Train model based on user feedback"""
        # Store feedback for model retraining
        # In production, implement proper feedback loop
        pass
    
    def load_models(self):
        """Load ML models for LLM bot detection"""
        try:
            model_path = 'models/llm_bot_detector.pkl'
            if os.path.exists(model_path):
                self.ml_model = joblib.load(model_path)
            else:
                # Create default model
                self.ml_model = GradientBoostingClassifier(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=5,
                    random_state=42
                )
        except Exception as e:
            print(f"Error loading LLM bot detection model: {e}")
    
    def save_models(self):
        """Save trained models"""
        try:
            os.makedirs('models', exist_ok=True)
            if self.ml_model:
                joblib.dump(self.ml_model, 'models/llm_bot_detector.pkl')
        except Exception as e:
            print(f"Error saving models: {e}")

# Global instance
llm_bot_detector = LLMBotDetector()
