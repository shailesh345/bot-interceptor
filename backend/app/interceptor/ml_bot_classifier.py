"""
ML-Based Bot Classification System
Advanced bot detection using machine learning models
"""

import json
import numpy as np
import pickle
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from collections import defaultdict
import redis
import hashlib
import re
from dataclasses import dataclass
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import StandardScaler
import joblib
import os
import time
import ipaddress

@dataclass
class BotFeatures:
    """Features extracted from a request for bot classification"""
    user_agent_length: int
    user_agent_entropy: float
    request_frequency: float
    request_pattern: float
    header_count: int
    suspicious_headers: int
    path_depth: int
    query_param_count: int
    referrer_present: bool
    cookie_present: bool
    javascript_enabled: bool
    time_pattern: float
    ip_reputation: float
    geographic_anomaly: float

class MLBotClassifier:
    """
    Machine Learning-based bot classification system
    Uses multiple ML models for accurate bot detection
    """
    
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=0)
        self.models = {}
        self.scalers = {}
        self.vectorizers = {}
        self.feature_cache = {}
        self._load_models()
        self._initialize_features()
    
    def _load_models(self):
        """Load pre-trained ML models"""
        try:
            model_dir = os.path.join(os.path.dirname(__file__), 'models')
            
            # Load Random Forest classifier
            rf_model_path = os.path.join(model_dir, 'bot_classifier_rf.pkl')
            if os.path.exists(rf_model_path):
                self.models['random_forest'] = joblib.load(rf_model_path)
            
            # Load feature scaler
            scaler_path = os.path.join(model_dir, 'feature_scaler.pkl')
            if os.path.exists(scaler_path):
                self.scalers['standard'] = joblib.load(scaler_path)
            
            # Load TF-IDF vectorizer for user agent analysis
            vectorizer_path = os.path.join(model_dir, 'user_agent_vectorizer.pkl')
            if os.path.exists(vectorizer_path):
                self.vectorizers['tfidf'] = joblib.load(vectorizer_path)
                
        except Exception as e:
            print(f"Failed to load ML models: {e}")
            self._train_default_models()
    
    def _train_default_models(self):
        """Train default models if pre-trained ones don't exist"""
        try:
            # Create default training data
            training_data = self._create_default_training_data()
            
            # Train Random Forest classifier
            X_train = training_data['features']
            y_train = training_data['labels']
            
            self.models['random_forest'] = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.models['random_forest'].fit(X_train, y_train)
            
            # Train feature scaler
            self.scalers['standard'] = StandardScaler()
            self.scalers['standard'].fit(X_train)
            
            # Save models
            self._save_models()
            
        except Exception as e:
            print(f"Failed to train default models: {e}")
    
    def _create_default_training_data(self) -> Dict:
        """Create default training data for bot classification"""
        # This is simplified training data - in production, use real labeled data
        
        # Bot-like features
        bot_features = [
            [50, 0.8, 0.9, 0.8, 5, 2, 3, 2, False, False, False, 0.9, 0.8, 0.7],  # Bot
            [45, 0.7, 0.8, 0.7, 4, 1, 2, 1, False, False, False, 0.8, 0.7, 0.6],  # Bot
            [60, 0.6, 0.6, 0.5, 8, 0, 1, 0, True, True, True, 0.3, 0.2, 0.1],    # Human
            [55, 0.5, 0.4, 0.3, 7, 0, 1, 0, True, True, True, 0.2, 0.1, 0.1],    # Human
        ]
        
        # Labels: 1 for bot, 0 for human
        labels = [1, 1, 0, 0]
        
        return {
            'features': np.array(bot_features),
            'labels': np.array(labels)
        }
    
    def _save_models(self):
        """Save trained models to disk"""
        try:
            model_dir = os.path.join(os.path.dirname(__file__), 'models')
            os.makedirs(model_dir, exist_ok=True)
            
            # Save Random Forest classifier
            rf_model_path = os.path.join(model_dir, 'bot_classifier_rf.pkl')
            joblib.dump(self.models['random_forest'], rf_model_path)
            
            # Save feature scaler
            scaler_path = os.path.join(model_dir, 'feature_scaler.pkl')
            joblib.dump(self.scalers['standard'], scaler_path)
            
        except Exception as e:
            print(f"Failed to save models: {e}")
    
    def _initialize_features(self):
        """Initialize feature extraction methods"""
        self.feature_cache = {}
    
    def extract_features(self, request_data: Dict) -> BotFeatures:
        """Extract features from request data for ML classification"""
        try:
            user_agent = request_data.get('user_agent', '')
            client_ip = request_data.get('client_ip', '')
            headers = request_data.get('headers', {})
            path = request_data.get('path', '')
            query_params = request_data.get('query_params', {})
            timestamp = request_data.get('timestamp', datetime.now())
            
            # Feature 1: User agent length
            user_agent_length = len(user_agent)
            
            # Feature 2: User agent entropy (measure of randomness)
            user_agent_entropy = self._calculate_entropy(user_agent)
            
            # Feature 3: Request frequency
            request_frequency = self._calculate_request_frequency(client_ip)
            
            # Feature 4: Request pattern (time between requests)
            request_pattern = self._calculate_request_pattern(client_ip, timestamp)
            
            # Feature 5: Header count
            header_count = len(headers)
            
            # Feature 6: Suspicious headers
            suspicious_headers = self._count_suspicious_headers(headers)
            
            # Feature 7: Path depth
            path_depth = len([p for p in path.split('/') if p])
            
            # Feature 8: Query parameter count
            query_param_count = len(query_params)
            
            # Feature 9: Referrer present
            referrer_present = 'referer' in headers or 'referrer' in headers
            
            # Feature 10: Cookie present
            cookie_present = 'cookie' in headers
            
            # Feature 11: JavaScript enabled (simplified detection)
            javascript_enabled = self._detect_javascript_support(headers)
            
            # Feature 12: Time pattern (requests per hour)
            time_pattern = self._calculate_time_pattern(client_ip, timestamp)
            
            # Feature 13: IP reputation
            ip_reputation = self._calculate_ip_reputation(client_ip)
            
            # Feature 14: Geographic anomaly
            geographic_anomaly = self._calculate_geographic_anomaly(client_ip)
            
            return BotFeatures(
                user_agent_length=user_agent_length,
                user_agent_entropy=user_agent_entropy,
                request_frequency=request_frequency,
                request_pattern=request_pattern,
                header_count=header_count,
                suspicious_headers=suspicious_headers,
                path_depth=path_depth,
                query_param_count=query_param_count,
                referrer_present=referrer_present,
                cookie_present=cookie_present,
                javascript_enabled=javascript_enabled,
                time_pattern=time_pattern,
                ip_reputation=ip_reputation,
                geographic_anomaly=geographic_anomaly
            )
            
        except Exception as e:
            print(f"Feature extraction failed: {e}")
            # Return default features
            return BotFeatures(
                user_agent_length=0,
                user_agent_entropy=0.0,
                request_frequency=0.0,
                request_pattern=0.0,
                header_count=0,
                suspicious_headers=0,
                path_depth=0,
                query_param_count=0,
                referrer_present=False,
                cookie_present=False,
                javascript_enabled=False,
                time_pattern=0.0,
                ip_reputation=0.0,
                geographic_anomaly=0.0
            )
    
    def _calculate_entropy(self, text: str) -> float:
        """Calculate Shannon entropy of text"""
        if not text:
            return 0.0
        
        # Count character frequencies
        char_counts = defaultdict(int)
        for char in text:
            char_counts[char] += 1
        
        # Calculate entropy
        length = len(text)
        entropy = 0.0
        for count in char_counts.values():
            probability = count / length
            if probability > 0:
                entropy -= probability * np.log2(probability)
        
        return entropy
    
    def _calculate_request_frequency(self, client_ip: str) -> float:
        """Calculate request frequency for an IP address"""
        try:
            cache_key = f"request_frequency:{client_ip}"
            current_time = time.time()
            
            # Get recent requests from Redis
            recent_requests = self.redis_client.lrange(cache_key, 0, 99)
            recent_requests = [float(r) for r in recent_requests if r]
            
            # Remove old requests (older than 1 hour)
            recent_requests = [r for r in recent_requests if current_time - r < 3600]
            
            # Calculate frequency (requests per minute)
            frequency = len(recent_requests) / 60.0 if recent_requests else 0.0
            
            # Add current request
            self.redis_client.rpush(cache_key, current_time)
            self.redis_client.expire(cache_key, 3600)
            
            return min(frequency, 10.0)  # Cap at 10 requests per minute
            
        except Exception as e:
            print(f"Request frequency calculation failed: {e}")
            return 0.0
    
    def _calculate_request_pattern(self, client_ip: str, timestamp: datetime) -> float:
        """Calculate request pattern (time between requests)"""
        try:
            cache_key = f"request_pattern:{client_ip}"
            current_time = timestamp.timestamp()
            
            # Get recent request timestamps
            recent_timestamps = self.redis_client.lrange(cache_key, 0, 9)
            recent_timestamps = [float(t) for t in recent_timestamps if t]
            
            if len(recent_timestamps) < 2:
                pattern_score = 0.5  # Neutral score for insufficient data
            else:
                # Calculate time differences between consecutive requests
                time_diffs = []
                for i in range(1, len(recent_timestamps)):
                    diff = recent_timestamps[i] - recent_timestamps[i-1]
                    time_diffs.append(diff)
                
                # Calculate pattern score based on regularity
                if time_diffs:
                    mean_diff = np.mean(time_diffs)
                    std_diff = np.std(time_diffs)
                    
                    if std_diff == 0:
                        pattern_score = 0.9  # Very regular pattern (likely bot)
                    else:
                        cv = std_diff / mean_diff  # Coefficient of variation
                        pattern_score = 1.0 - min(cv, 1.0)  # Lower CV = higher score
                else:
                    pattern_score = 0.5
            
            # Add current timestamp
            self.redis_client.rpush(cache_key, current_time)
            self.redis_client.expire(cache_key, 3600)
            
            return pattern_score
            
        except Exception as e:
            print(f"Request pattern calculation failed: {e}")
            return 0.5
    
    def _count_suspicious_headers(self, headers: Dict) -> int:
        """Count suspicious headers that might indicate automation"""
        suspicious_patterns = [
            'x-forwarded-for', 'x-real-ip', 'x-client-ip',
            'x-cluster-client-ip', 'x-forwarded', 'x-forwarded-proto',
            'x-requested-with', 'x-http-method-override'
        ]
        
        count = 0
        for header_name in headers.keys():
            if header_name.lower() in suspicious_patterns:
                count += 1
        
        return count
    
    def _detect_javascript_support(self, headers: Dict) -> bool:
        """Detect if JavaScript is likely enabled"""
        # Check for JavaScript-related headers
        js_headers = ['accept', 'accept-encoding', 'accept-language']
        js_values = ['text/javascript', 'application/javascript', 'js']
        
        for header_name, header_value in headers.items():
            if header_name.lower() in js_headers:
                for js_value in js_values:
                    if js_value in header_value.lower():
                        return True
        
        return False
    
    def _calculate_time_pattern(self, client_ip: str, timestamp: datetime) -> float:
        """Calculate time-based pattern score"""
        try:
            cache_key = f"time_pattern:{client_ip}"
            hour = timestamp.hour
            
            # Get hourly request counts
            hourly_counts = self.redis_client.hgetall(cache_key)
            hourly_counts = {int(k): int(v) for k, v in hourly_counts.items()}
            
            # Calculate time pattern score
            total_requests = sum(hourly_counts.values())
            if total_requests == 0:
                return 0.5
            
            # Check if requests are distributed evenly across hours
            expected_per_hour = total_requests / 24
            variance = sum((count - expected_per_hour) ** 2 for count in hourly_counts.values())
            std_dev = np.sqrt(variance / len(hourly_counts)) if hourly_counts else 0
            
            # Lower std dev = more even distribution = higher score (likely human)
            if std_dev == 0:
                pattern_score = 0.1  # Very even distribution
            else:
                pattern_score = max(0.1, 1.0 - (std_dev / expected_per_hour))
            
            # Update hourly count
            self.redis_client.hincrby(cache_key, hour, 1)
            self.redis_client.expire(cache_key, 86400)  # 24 hours
            
            return pattern_score
            
        except Exception as e:
            print(f"Time pattern calculation failed: {e}")
            return 0.5
    
    def _calculate_ip_reputation(self, client_ip: str) -> float:
        """Calculate IP reputation score"""
        try:
            # Check if IP is in known bot IP ranges
            bot_ip_ranges = [
                '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'  # Private IPs
            ]
            
            ip_obj = ipaddress.ip_address(client_ip)
            for ip_range in bot_ip_ranges:
                if ip_obj in ipaddress.ip_network(ip_range):
                    return 0.8  # Higher score for private IPs
            
            # Check Redis for IP reputation
            reputation_key = f"ip_reputation:{client_ip}"
            cached_reputation = self.redis_client.get(reputation_key)
            
            if cached_reputation:
                return float(cached_reputation)
            
            # Default reputation score
            default_score = 0.3
            self.redis_client.setex(reputation_key, 3600, str(default_score))
            
            return default_score
            
        except Exception as e:
            print(f"IP reputation calculation failed: {e}")
            return 0.5
    
    def _calculate_geographic_anomaly(self, client_ip: str) -> float:
        """Calculate geographic anomaly score"""
        try:
            # Simplified geographic anomaly detection
            # In production, use GeoIP database and check for unusual locations
            
            # For now, return a neutral score
            return 0.5
            
        except Exception as e:
            print(f"Geographic anomaly calculation failed: {e}")
            return 0.5
    
    def classify_bot(self, request_data: Dict) -> Tuple[bool, float, str]:
        """Classify if a request is from a bot using ML models"""
        try:
            # Extract features
            features = self.extract_features(request_data)
            
            # Convert features to numpy array
            feature_vector = np.array([
                features.user_agent_length,
                features.user_agent_entropy,
                features.request_frequency,
                features.request_pattern,
                features.header_count,
                features.suspicious_headers,
                features.path_depth,
                features.query_param_count,
                int(features.referrer_present),
                int(features.cookie_present),
                int(features.javascript_enabled),
                features.time_pattern,
                features.ip_reputation,
                features.geographic_anomaly
            ]).reshape(1, -1)
            
            # Scale features
            if 'standard' in self.scalers:
                feature_vector = self.scalers['standard'].transform(feature_vector)
            
            # Make prediction
            if 'random_forest' in self.models:
                prediction = self.models['random_forest'].predict(feature_vector)[0]
                probability = self.models['random_forest'].predict_proba(feature_vector)[0]
                
                is_bot = bool(prediction)
                confidence = max(probability)
                
                # Determine bot type based on features
                bot_type = self._determine_bot_type(features, confidence)
                
                return is_bot, confidence, bot_type
            
            else:
                # Fallback to rule-based classification
                return self._fallback_classification(features)
                
        except Exception as e:
            print(f"ML classification failed: {e}")
            return False, 0.5, 'unknown'
    
    def _determine_bot_type(self, features: BotFeatures, confidence: float) -> str:
        """Determine the type of bot based on features"""
        if features.user_agent_entropy > 0.8:
            return 'randomized_bot'
        elif features.request_frequency > 5.0:
            return 'high_frequency_bot'
        elif features.request_pattern > 0.8:
            return 'patterned_bot'
        elif features.suspicious_headers > 3:
            return 'proxy_bot'
        elif features.path_depth > 5:
            return 'deep_crawler'
        elif features.query_param_count > 10:
            return 'parameter_bot'
        else:
            return 'generic_bot'
    
    def _fallback_classification(self, features: BotFeatures) -> Tuple[bool, float, str]:
        """Fallback classification when ML models are not available"""
        # Simple rule-based classification
        bot_score = 0.0
        
        # User agent analysis
        if features.user_agent_length < 20:
            bot_score += 0.3
        if features.user_agent_entropy > 0.8:
            bot_score += 0.2
        
        # Request behavior
        if features.request_frequency > 3.0:
            bot_score += 0.3
        if features.request_pattern > 0.7:
            bot_score += 0.2
        
        # Header analysis
        if features.suspicious_headers > 2:
            bot_score += 0.2
        if not features.javascript_enabled:
            bot_score += 0.1
        
        # Determine if it's a bot
        is_bot = bot_score > 0.5
        confidence = min(bot_score, 1.0)
        bot_type = self._determine_bot_type(features, confidence)
        
        return is_bot, confidence, bot_type
    
    def update_model(self, training_data: List[Dict]):
        """Update the ML model with new training data"""
        try:
            # Extract features and labels from training data
            features_list = []
            labels = []
            
            for data_point in training_data:
                features = self.extract_features(data_point['request'])
                feature_vector = [
                    features.user_agent_length,
                    features.user_agent_entropy,
                    features.request_frequency,
                    features.request_pattern,
                    features.header_count,
                    features.suspicious_headers,
                    features.path_depth,
                    features.query_param_count,
                    int(features.referrer_present),
                    int(features.cookie_present),
                    int(features.javascript_enabled),
                    features.time_pattern,
                    features.ip_reputation,
                    features.geographic_anomaly
                ]
                
                features_list.append(feature_vector)
                labels.append(1 if data_point['is_bot'] else 0)
            
            # Convert to numpy arrays
            X = np.array(features_list)
            y = np.array(labels)
            
            # Retrain Random Forest model
            self.models['random_forest'] = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.models['random_forest'].fit(X, y)
            
            # Update scaler
            self.scalers['standard'] = StandardScaler()
            self.scalers['standard'].fit(X)
            
            # Save updated models
            self._save_models()
            
            print(f"Model updated with {len(training_data)} new samples")
            
        except Exception as e:
            print(f"Model update failed: {e}")

# Global ML classifier instance
# Initialize lazily to avoid app context issues
ml_bot_classifier = None

def get_ml_bot_classifier():
    global ml_bot_classifier
    if ml_bot_classifier is None:
        ml_bot_classifier = MLBotClassifier()
    return ml_bot_classifier
