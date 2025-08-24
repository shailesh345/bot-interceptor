"""
Enhanced Bot Detection System
Combines multiple detection methods for comprehensive bot identification
"""

import re
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
import os
from ..models import BotProfile, TrafficLog
from .. import db

class EnhancedBotDetector:
    def __init__(self):
        self.ml_model = None
        self.vectorizer = None
        self.feature_names = []
        self.detection_rules = self._load_detection_rules()
        self.bot_profiles = self._load_bot_profiles()
        self.suspicious_patterns = self._load_suspicious_patterns()
        self.rate_limit_cache = {}
        
    def _load_detection_rules(self) -> Dict:
        """Load bot detection rules from configuration"""
        return {
            'user_agent_patterns': [
                r'bot|crawler|spider|scraper|scout|monitor|checker|validator',
                r'python|curl|wget|http|java|perl|ruby|php',
                r'headless|phantom|selenium|puppet|playwright',
                r'googlebot|bingbot|yandex|baiduspider|facebookexternalhit'
            ],
            'behavior_patterns': [
                'rapid_requests',
                'no_javascript',
                'no_cookies',
                'no_images',
                'no_css',
                'direct_access',
                'missing_referrer'
            ],
            'ip_patterns': [
                'data_center_ip',
                'vpn_ip',
                'proxy_ip',
                'tor_exit_node'
            ]
        }
    
    def _load_bot_profiles(self) -> List[BotProfile]:
        """Load known bot profiles from database"""
        try:
            return BotProfile.query.filter_by(is_verified=True).all()
        except:
            return []
    
    def _load_suspicious_patterns(self) -> Dict:
        """Load suspicious behavior patterns"""
        return {
            'request_frequency': {
                'threshold': 100,  # requests per minute
                'window': 60  # seconds
            },
            'pattern_anomalies': {
                'missing_headers': ['user-agent', 'accept', 'accept-language'],
                'suspicious_paths': ['/admin', '/wp-admin', '/phpmyadmin', '/config'],
                'automated_patterns': ['/api/', '/xmlrpc.php', '/feed/']
            }
        }
    
    def detect_bot(self, request_data: Dict) -> Dict:
        """
        Comprehensive bot detection using multiple methods
        
        Args:
            request_data: Dictionary containing request information
            
        Returns:
            Dictionary with detection results and confidence scores
        """
        detection_results = {
            'is_bot': False,
            'confidence': 0.0,
            'bot_type': None,
            'detection_methods': [],
            'risk_score': 0.0,
            'recommendations': []
        }
        
        # Method 1: User Agent Analysis
        ua_score, ua_type = self._analyze_user_agent(request_data.get('user_agent', ''))
        if ua_score > 0.7:
            detection_results['detection_methods'].append('user_agent')
            detection_results['confidence'] += ua_score * 0.4
        
        # Method 2: Behavioral Analysis
        behavior_score, behavior_type = self._analyze_behavior(request_data)
        if behavior_score > 0.6:
            detection_results['detection_methods'].append('behavior')
            detection_results['confidence'] += behavior_score * 0.3
        
        # Method 3: IP Analysis
        ip_score, ip_type = self._analyze_ip_address(request_data.get('client_ip', ''))
        if ip_score > 0.5:
            detection_results['detection_methods'].append('ip_analysis')
            detection_results['confidence'] += ip_score * 0.2
        
        # Method 4: Pattern Analysis
        pattern_score, pattern_type = self._analyze_patterns(request_data)
        if pattern_score > 0.6:
            detection_results['detection_methods'].append('pattern_analysis')
            detection_results['confidence'] += pattern_score * 0.1
        
        # Method 5: ML-based Classification (if available)
        if self.ml_model:
            ml_score, ml_type = self._ml_classification(request_data)
            if ml_score > 0.5:
                detection_results['detection_methods'].append('ml_classification')
                detection_results['confidence'] += ml_score * 0.2
        
        # Determine final bot classification
        detection_results['confidence'] = min(detection_results['confidence'], 1.0)
        detection_results['is_bot'] = detection_results['confidence'] > 0.6
        
        # Determine bot type
        detection_results['bot_type'] = self._determine_bot_type(
            ua_type, behavior_type, ip_type, pattern_type
        )
        
        # Calculate risk score
        detection_results['risk_score'] = self._calculate_risk_score(
            detection_results['confidence'],
            detection_results['bot_type'],
            request_data
        )
        
        # Generate recommendations
        detection_results['recommendations'] = self._generate_recommendations(
            detection_results
        )
        
        return detection_results
    
    def _analyze_user_agent(self, user_agent: str) -> Tuple[float, str]:
        """Analyze user agent string for bot indicators"""
        if not user_agent:
            return 0.9, 'missing_ua'
        
        user_agent_lower = user_agent.lower()
        score = 0.0
        bot_type = 'unknown'
        
        # Check against known bot patterns
        for pattern in self.detection_rules['user_agent_patterns']:
            if re.search(pattern, user_agent_lower):
                score += 0.3
                if 'bot' in pattern or 'crawler' in pattern:
                    bot_type = 'web_crawler'
                elif 'python' in pattern or 'curl' in pattern:
                    bot_type = 'script_bot'
                elif 'selenium' in pattern or 'phantom' in pattern:
                    bot_type = 'automation_bot'
        
        # Check against known bot profiles
        for profile in self.bot_profiles:
            if profile.user_agent_patterns:
                for pattern in profile.user_agent_patterns:
                    if re.search(pattern, user_agent_lower):
                        score += 0.4
                        bot_type = profile.bot_type or 'known_bot'
                        break
        
        # Additional checks
        if len(user_agent) < 20:
            score += 0.2
        if user_agent.count('/') > 3:
            score += 0.1
        
        return min(score, 1.0), bot_type
    
    def _analyze_behavior(self, request_data: Dict) -> Tuple[float, str]:
        """Analyze request behavior for bot indicators"""
        score = 0.0
        behavior_type = 'normal'
        
        # Check request frequency
        client_ip = request_data.get('client_ip', '')
        if client_ip in self.rate_limit_cache:
            recent_requests = self.rate_limit_cache[client_ip]
            current_time = datetime.utcnow()
            # Remove old requests
            recent_requests = [req for req in recent_requests 
                             if current_time - req < timedelta(minutes=1)]
            
            if len(recent_requests) > self.suspicious_patterns['request_frequency']['threshold']:
                score += 0.6
                behavior_type = 'rapid_requests'
            
            # Update cache
            recent_requests.append(current_time)
            self.rate_limit_cache[client_ip] = recent_requests
        else:
            self.rate_limit_cache[client_ip] = [datetime.utcnow()]
        
        # Check for missing headers
        headers = request_data.get('headers', {})
        missing_headers = []
        for header in self.suspicious_patterns['pattern_anomalies']['missing_headers']:
            if header.lower() not in [h.lower() for h in headers.keys()]:
                missing_headers.append(header)
        
        if len(missing_headers) > 2:
            score += 0.3
            behavior_type = 'missing_headers'
        
        # Check request path
        path = request_data.get('request_path', '')
        for suspicious_path in self.suspicious_patterns['pattern_anomalies']['suspicious_paths']:
            if suspicious_path in path:
                score += 0.4
                behavior_type = 'suspicious_path'
                break
        
        # Check referrer
        referrer = headers.get('referer', '')
        if not referrer and request_data.get('request_method') == 'GET':
            score += 0.2
            if behavior_type == 'normal':
                behavior_type = 'no_referrer'
        
        return min(score, 1.0), behavior_type
    
    def _analyze_ip_address(self, ip_address: str) -> Tuple[float, str]:
        """Analyze IP address for suspicious characteristics"""
        score = 0.0
        ip_type = 'normal'
        
        # Basic IP validation
        if not ip_address or not re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', ip_address):
            return 0.0, 'invalid_ip'
        
        # Check for private/local IPs
        if ip_address.startswith(('10.', '172.16.', '192.168.', '127.')):
            score += 0.3
            ip_type = 'private_ip'
        
        # Check for known data center ranges (simplified)
        data_center_ranges = [
            ('8.8.8.0', '8.8.8.255'),  # Google
            ('1.1.1.0', '1.1.1.255'),  # Cloudflare
            ('208.67.222.0', '208.67.222.255')  # OpenDNS
        ]
        
        ip_parts = [int(x) for x in ip_address.split('.')]
        for start_range, end_range in data_center_ranges:
            start_parts = [int(x) for x in start_range.split('.')]
            end_parts = [int(x) for x in end_range.split('.')]
            
            if (start_parts <= ip_parts <= end_parts):
                score += 0.4
                ip_type = 'data_center_ip'
                break
        
        # Check for suspicious patterns
        if ip_address.endswith('.0') or ip_address.endswith('.255'):
            score += 0.2
            if ip_type == 'normal':
                ip_type = 'network_edge'
        
        return min(score, 1.0), ip_type
    
    def _analyze_patterns(self, request_data: Dict) -> Tuple[float, str]:
        """Analyze request patterns for automation indicators"""
        score = 0.0
        pattern_type = 'normal'
        
        # Check request timing patterns
        timestamp = request_data.get('timestamp')
        if timestamp:
            # This would require historical data for proper analysis
            # For now, we'll use basic heuristics
            pass
        
        # Check for automated request patterns
        path = request_data.get('request_path', '')
        for pattern in self.suspicious_patterns['pattern_anomalies']['automated_patterns']:
            if pattern in path:
                score += 0.5
                pattern_type = 'automated_pattern'
                break
        
        # Check for sequential requests
        if 'id=' in path or 'page=' in path:
            score += 0.2
            if pattern_type == 'normal':
                pattern_type = 'sequential_request'
        
        # Check for API abuse patterns
        if '/api/' in path and request_data.get('request_method') == 'GET':
            score += 0.3
            if pattern_type == 'normal':
                pattern_type = 'api_abuse'
        
        return min(score, 1.0), pattern_type
    
    def _ml_classification(self, request_data: Dict) -> Tuple[float, str]:
        """Use ML model for bot classification"""
        if not self.ml_model or not self.vectorizer:
            return 0.0, 'ml_unavailable'
        
        try:
            # Extract features
            features = self._extract_ml_features(request_data)
            
            # Vectorize features
            feature_vector = self.vectorizer.transform([features])
            
            # Make prediction
            prediction = self.ml_model.predict_proba(feature_vector)[0]
            bot_probability = prediction[1] if len(prediction) > 1 else prediction[0]
            
            bot_type = 'ml_classified'
            if bot_probability > 0.8:
                bot_type = 'high_confidence_bot'
            elif bot_probability > 0.6:
                bot_type = 'medium_confidence_bot'
            
            return bot_probability, bot_type
            
        except Exception as e:
            print(f"ML classification error: {e}")
            return 0.0, 'ml_error'
    
    def _extract_ml_features(self, request_data: Dict) -> str:
        """Extract features for ML classification"""
        features = []
        
        # User agent features
        ua = request_data.get('user_agent', '')
        features.append(f"ua_length:{len(ua)}")
        features.append(f"ua_has_bot:{1 if 'bot' in ua.lower() else 0}")
        features.append(f"ua_has_script:{1 if any(x in ua.lower() for x in ['python', 'curl', 'wget']) else 0}")
        
        # Request features
        method = request_data.get('request_method', '')
        features.append(f"method:{method}")
        
        path = request_data.get('request_path', '')
        features.append(f"path_length:{len(path)}")
        features.append(f"path_has_api:{1 if '/api/' in path else 0}")
        
        # Header features
        headers = request_data.get('headers', {})
        features.append(f"header_count:{len(headers)}")
        features.append(f"has_referer:{1 if 'referer' in headers else 0}")
        features.append(f"has_accept:{1 if 'accept' in headers else 0}")
        
        return ' '.join(features)
    
    def _determine_bot_type(self, ua_type: str, behavior_type: str, 
                           ip_type: str, pattern_type: str) -> str:
        """Determine the most likely bot type based on all detection methods"""
        type_priority = {
            'web_crawler': 1,
            'automation_bot': 2,
            'script_bot': 3,
            'rapid_requests': 4,
            'suspicious_path': 5,
            'data_center_ip': 6,
            'automated_pattern': 7,
            'api_abuse': 8,
            'unknown': 9
        }
        
        types = [ua_type, behavior_type, ip_type, pattern_type]
        valid_types = [t for t in types if t in type_priority]
        
        # Return the type with highest priority (lowest number)
        return min(valid_types, key=lambda x: type_priority.get(x, 999))
    
    def _calculate_risk_score(self, confidence: float, bot_type: str, 
                             request_data: Dict) -> float:
        """Calculate risk score based on detection results"""
        base_score = confidence * 100
        
        # Adjust based on bot type
        type_multipliers = {
            'web_crawler': 0.5,      # Generally safe
            'automation_bot': 0.8,    # Moderate risk
            'script_bot': 0.9,        # High risk
            'rapid_requests': 1.2,    # Very high risk
            'suspicious_path': 1.5,   # Critical risk
            'api_abuse': 1.3,         # High risk
            'unknown': 1.0            # Default
        }
        
        multiplier = type_multipliers.get(bot_type, 1.0)
        adjusted_score = base_score * multiplier
        
        # Additional risk factors
        if request_data.get('request_method') == 'POST':
            adjusted_score *= 1.2
        
        if '/admin' in request_data.get('request_path', ''):
            adjusted_score *= 1.5
        
        return min(adjusted_score, 100.0)
    
    def _generate_recommendations(self, detection_results: Dict) -> List[str]:
        """Generate recommendations based on detection results"""
        recommendations = []
        
        if detection_results['confidence'] > 0.8:
            recommendations.append("High confidence bot detected - consider immediate blocking")
        
        if detection_results['risk_score'] > 80:
            recommendations.append("Critical risk level - implement strict rate limiting")
        
        if 'rapid_requests' in detection_results['detection_methods']:
            recommendations.append("Implement rate limiting for this IP address")
        
        if 'suspicious_path' in detection_results['detection_methods']:
            recommendations.append("Monitor access to sensitive endpoints")
        
        if 'api_abuse' in detection_results['detection_methods']:
            recommendations.append("Implement API rate limiting and authentication")
        
        if not recommendations:
            recommendations.append("Continue monitoring for additional indicators")
        
        return recommendations
    
    def train_model(self, training_data: List[Dict]):
        """Train the ML model with new data"""
        try:
            # Extract features and labels
            features = []
            labels = []
            
            for data_point in training_data:
                features.append(self._extract_ml_features(data_point))
                labels.append(1 if data_point.get('is_bot') else 0)
            
            # Vectorize features
            self.vectorizer = TfidfVectorizer(max_features=1000)
            X = self.vectorizer.fit_transform(features)
            
            # Train model
            self.ml_model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.ml_model.fit(X, labels)
            
            # Save model
            self._save_model()
            
            return True
            
        except Exception as e:
            print(f"Model training error: {e}")
            return False
    
    def _save_model(self):
        """Save the trained model to disk"""
        try:
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.ml_model, 'models/bot_detector_model.pkl')
            joblib.dump(self.vectorizer, 'models/bot_detector_vectorizer.pkl')
        except Exception as e:
            print(f"Model save error: {e}")
    
    def load_model(self):
        """Load the trained model from disk"""
        try:
            model_path = 'models/bot_detector_model.pkl'
            vectorizer_path = 'models/bot_detector_vectorizer.pkl'
            
            if os.path.exists(model_path) and os.path.exists(vectorizer_path):
                # Suppress scikit-learn version warnings during loading
                import warnings
                with warnings.catch_warnings():
                    warnings.filterwarnings("ignore", category=UserWarning)
                    warnings.filterwarnings("ignore", category=FutureWarning)
                    
                    try:
                        self.ml_model = joblib.load(model_path)
                        self.vectorizer = joblib.load(vectorizer_path)
                        print("ML model and vectorizer loaded successfully")
                        return True
                    except Exception as e:
                        print(f"Error loading saved model (version conflict): {e}")
                        print("Will create new model instance...")
                        self._create_new_model()
                        return False
            else:
                print("No existing model found. Will create new model instance...")
                self._create_new_model()
                return False
        except Exception as e:
            print(f"Model load error: {e}")
            self._create_new_model()
            return False
    
    def _create_new_model(self):
        """Create a new model instance when loading fails"""
        try:
            from sklearn.ensemble import RandomForestClassifier
            from sklearn.feature_extraction.text import TfidfVectorizer
            
            self.ml_model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.vectorizer = TfidfVectorizer(max_features=1000)
            print("New ML model and vectorizer created successfully")
        except Exception as e:
            print(f"Error creating new model: {e}")
            self.ml_model = None
            self.vectorizer = None

# Global instance
bot_detector = EnhancedBotDetector()
