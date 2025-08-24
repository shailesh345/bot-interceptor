"""
ML Bot Detection Model
Advanced machine learning model for bot detection with training and prediction capabilities
"""

import os
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import json
import re
import hashlib
from ..models import TrafficLog, BotProfile, Domain
from .. import db

class BotDetectionModel:
    def __init__(self, model_path: str = 'models/bot_detection_model.pkl'):
        self.model_path = model_path
        self.model = None
        self.vectorizer = None
        self.scaler = None
        self.label_encoder = None
        self.feature_names = []
        self.model_metadata = {}
        self.is_trained = False
        
        # Ensure model directory exists
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Load existing model if available
        self.load_model()
    
    def extract_features(self, request_data: Dict) -> Dict[str, Any]:
        """
        Extract features from request data for bot detection
        
        Args:
            request_data: Dictionary containing request information
            
        Returns:
            Dictionary of extracted features
        """
        features = {}
        
        # User Agent features
        user_agent = request_data.get('user_agent', '').lower()
        features['user_agent_length'] = len(user_agent)
        features['user_agent_entropy'] = self._calculate_entropy(user_agent)
        features['has_bot_keywords'] = self._check_bot_keywords(user_agent)
        features['has_browser_keywords'] = self._check_browser_keywords(user_agent)
        features['has_mobile_keywords'] = self._check_mobile_keywords(user_agent)
        
        # Request pattern features
        request_method = request_data.get('request_method', 'GET')
        features['request_method'] = self._encode_request_method(request_method)
        features['request_path_length'] = len(request_data.get('request_path', ''))
        features['query_params_count'] = len(request_data.get('query_params', {}))
        features['headers_count'] = len(request_data.get('headers', {}))
        
        # Timing features
        features['request_time'] = request_data.get('timestamp', datetime.utcnow()).hour
        features['request_day'] = request_data.get('timestamp', datetime.utcnow()).weekday()
        
        # IP-based features
        ip_address = request_data.get('client_ip', '')
        features['ip_entropy'] = self._calculate_entropy(ip_address)
        features['is_private_ip'] = self._is_private_ip(ip_address)
        
        # Behavioral features
        features['requests_per_minute'] = request_data.get('requests_per_minute', 0)
        features['unique_paths_visited'] = request_data.get('unique_paths_visited', 0)
        features['session_duration'] = request_data.get('session_duration', 0)
        
        # Content-based features
        features['content_length'] = len(request_data.get('content', ''))
        features['content_entropy'] = self._calculate_entropy(request_data.get('content', ''))
        
        # Geographic features
        geo_country = request_data.get('geo_country', '')
        geo_city = request_data.get('geo_city', '')
        features['country_code'] = self._encode_country(geo_country)
        features['city'] = self._encode_city(geo_city)
        
        return features
    
    def _calculate_entropy(self, text: str) -> float:
        """Calculate Shannon entropy of a string"""
        if not text:
            return 0.0
        
        char_counts = {}
        for char in text:
            char_counts[char] = char_counts.get(char, 0) + 1
        
        entropy = 0.0
        length = len(text)
        
        for count in char_counts.values():
            probability = count / length
            entropy -= probability * np.log2(probability)
        
        return entropy
    
    def _check_bot_keywords(self, user_agent: str) -> int:
        """Check if user agent contains bot-related keywords"""
        bot_keywords = [
            'bot', 'crawler', 'spider', 'scraper', 'robot', 'automation',
            'headless', 'phantom', 'selenium', 'puppet', 'scrapy',
            'curl', 'wget', 'python', 'java', 'perl', 'ruby'
        ]
        
        return int(any(keyword in user_agent for keyword in bot_keywords))
    
    def _check_browser_keywords(self, user_agent: str) -> int:
        """Check if user agent contains browser-related keywords"""
        browser_keywords = [
            'chrome', 'firefox', 'safari', 'edge', 'opera', 'ie',
            'webkit', 'gecko', 'trident', 'blink'
        ]
        
        return int(any(keyword in user_agent for keyword in browser_keywords))
    
    def _check_mobile_keywords(self, user_agent: str) -> int:
        """Check if user agent contains mobile-related keywords"""
        mobile_keywords = [
            'mobile', 'android', 'iphone', 'ipad', 'blackberry',
            'windows phone', 'opera mini', 'ucbrowser'
        ]
        
        return int(any(keyword in user_agent for keyword in mobile_keywords))
    
    def _is_private_ip(self, ip_address: str) -> int:
        """Check if IP address is private"""
        private_ranges = [
            ('10.0.0.0', '10.255.255.255'),
            ('172.16.0.0', '172.31.255.255'),
            ('192.168.0.0', '192.168.255.255'),
            ('127.0.0.0', '127.255.255.255')
        ]
        
        try:
            ip_parts = [int(part) for part in ip_address.split('.')]
            ip_num = ip_parts[0] * 256**3 + ip_parts[1] * 256**2 + ip_parts[2] * 256 + ip_parts[3]
            
            for start_range, end_range in private_ranges:
                start_parts = [int(part) for part in start_range.split('.')]
                end_parts = [int(part) for part in end_range.split('.')]
                start_num = start_parts[0] * 256**3 + start_parts[1] * 256**2 + start_parts[2] * 256 + start_parts[3]
                end_num = end_parts[0] * 256**3 + end_parts[1] * 256**2 + end_parts[2] * 256 + end_parts[3]
                
                if start_num <= ip_num <= end_num:
                    return 1
            
            return 0
        except:
            return 0
    
    def prepare_training_data(self, days: int = 30) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare training data from database
        
        Args:
            days: Number of days of data to use for training
            
        Returns:
            Tuple of (features, labels)
        """
        # Get traffic logs from the last N days
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        traffic_logs = TrafficLog.query.filter(
            TrafficLog.timestamp >= start_date
        ).all()
        
        features_list = []
        labels = []
        
        for log in traffic_logs:
            # Extract features
            request_data = {
                'user_agent': log.user_agent,
                'request_method': log.request_method,
                'request_path': log.request_path,
                'client_ip': log.client_ip,
                'timestamp': log.timestamp,
                'geo_country': log.geo_country,
                'geo_city': log.geo_city,
                'content': '',  # Placeholder
                'headers': {},  # Placeholder
                'query_params': {},  # Placeholder
                'requests_per_minute': 0,  # Placeholder
                'unique_paths_visited': 0,  # Placeholder
                'session_duration': 0  # Placeholder
            }
            
            features = self.extract_features(request_data)
            features_list.append(features)
            labels.append(1 if log.is_bot else 0)
        
        # Convert to DataFrame
        df = pd.DataFrame(features_list)
        
        # Categorical variables are already encoded by extract_features, no need to encode again
        # Just ensure they are numeric
        if 'request_method' in df.columns:
            df['request_method'] = pd.to_numeric(df['request_method'], errors='coerce').fillna(0)
        if 'country_code' in df.columns:
            df['country_code'] = pd.to_numeric(df['country_code'], errors='coerce').fillna(0)
        if 'city' in df.columns:
            df['city'] = pd.to_numeric(df['city'], errors='coerce').fillna(0)
        
        # Fill missing values
        df = df.fillna(0)
        
        # Convert to numpy arrays
        X = df.values
        y = np.array(labels)
        
        return X, y
    
    def train_model(self, days: int = 30, test_size: float = 0.2) -> Dict[str, Any]:
        """
        Train the bot detection model
        
        Args:
            days: Number of days of data to use for training
            test_size: Proportion of data to use for testing
            
        Returns:
            Dictionary containing training results
        """
        print(f"Preparing training data from last {days} days...")
        X, y = self.prepare_training_data(days)
        
        if len(X) == 0:
            raise ValueError("No training data available")
        
        print(f"Training data shape: {X.shape}")
        print(f"Bot samples: {np.sum(y == 1)}")
        print(f"Human samples: {np.sum(y == 0)}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        print("Training Random Forest model...")
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate model
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X_train_scaled, y_train, cv=5)
        
        # Feature importance
        feature_importance = dict(zip(
            [f"feature_{i}" for i in range(X.shape[1])],
            self.model.feature_importances_
        ))
        
        # Save model metadata
        self.model_metadata = {
            'training_date': datetime.utcnow().isoformat(),
            'training_samples': len(X),
            'test_accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'feature_importance': feature_importance,
            'model_type': 'RandomForestClassifier',
            'parameters': {
                'n_estimators': 100,
                'max_depth': 10,
                'random_state': 42
            }
        }
        
        # Save model
        self.save_model()
        
        self.is_trained = True
        
        results = {
            'accuracy': accuracy,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'training_samples': len(X),
            'test_samples': len(X_test),
            'feature_importance': feature_importance
        }
        
        print(f"Model training completed!")
        print(f"Test Accuracy: {accuracy:.4f}")
        print(f"CV Mean: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        return results
    
    def predict(self, request_data: Dict) -> Dict[str, Any]:
        """
        Predict if a request is from a bot
        
        Args:
            request_data: Dictionary containing request information
            
        Returns:
            Dictionary containing prediction results
        """
        if not self.is_trained:
            raise ValueError("Model is not trained. Please train the model first.")
        
        # Extract features
        features = self.extract_features(request_data)
        
        # Convert to array
        feature_array = np.array(list(features.values())).reshape(1, -1)
        
        # Scale features
        feature_array_scaled = self.scaler.transform(feature_array)
        
        # Make prediction
        prediction = self.model.predict(feature_array_scaled)[0]
        probability = self.model.predict_proba(feature_array_scaled)[0]
        
        return {
            'is_bot': bool(prediction),
            'bot_probability': float(probability[1]),
            'human_probability': float(probability[0]),
            'confidence': float(max(probability)),
            'features': features
        }
    
    def save_model(self):
        """Save the trained model and metadata"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'metadata': self.model_metadata,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, self.model_path)
        print(f"Model saved to {self.model_path}")
    
    def load_model(self):
        """Load the trained model and metadata"""
        try:
            if os.path.exists(self.model_path):
                model_data = joblib.load(self.model_path)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.model_metadata = model_data.get('metadata', {})
                self.is_trained = model_data.get('is_trained', False)
                print(f"Model loaded from {self.model_path}")
            else:
                print("No existing model found. Model will need to be trained.")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.is_trained = False
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model"""
        return {
            'is_trained': self.is_trained,
            'model_path': self.model_path,
            'metadata': self.model_metadata,
            'model_type': 'RandomForestClassifier' if self.model else None
        }
    
    def retrain_model(self, days: int = 30) -> Dict[str, Any]:
        """Retrain the model with new data"""
        print("Retraining model...")
        return self.train_model(days)
    
    def evaluate_model(self, days: int = 7) -> Dict[str, Any]:
        """
        Evaluate the model on recent data
        
        Args:
            days: Number of days of data to use for evaluation
            
        Returns:
            Dictionary containing evaluation results
        """
        if not self.is_trained:
            raise ValueError("Model is not trained")
        
        # Get recent data for evaluation
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        traffic_logs = TrafficLog.query.filter(
            TrafficLog.timestamp >= start_date
        ).all()
        
        predictions = []
        actual_labels = []
        
        for log in traffic_logs:
            request_data = {
                'user_agent': log.user_agent,
                'request_method': log.request_method,
                'request_path': log.request_path,
                'client_ip': log.client_ip,
                'timestamp': log.timestamp,
                'geo_country': log.geo_country,
                'geo_city': log.geo_city,
                'content': '',
                'headers': {},
                'query_params': {},
                'requests_per_minute': 0,
                'unique_paths_visited': 0,
                'session_duration': 0
            }
            
            try:
                prediction = self.predict(request_data)
                predictions.append(prediction['is_bot'])
                actual_labels.append(log.is_bot)
            except Exception as e:
                print(f"Error predicting for log {log.id}: {e}")
                continue
        
        if len(predictions) == 0:
            return {'error': 'No predictions made'}
        
        # Calculate metrics
        accuracy = accuracy_score(actual_labels, predictions)
        
        return {
            'accuracy': accuracy,
            'total_samples': len(predictions),
            'bot_predictions': sum(predictions),
            'actual_bots': sum(actual_labels),
            'evaluation_date': datetime.utcnow().isoformat()
        }
    
    def _encode_request_method(self, method: str) -> int:
        """Encode HTTP request method to numerical value"""
        method_encoding = {
            'GET': 0, 'POST': 1, 'PUT': 2, 'DELETE': 3, 'HEAD': 4, 
            'OPTIONS': 5, 'PATCH': 6, 'TRACE': 7, 'CONNECT': 8
        }
        return method_encoding.get(method.upper(), 0)
    
    def _encode_country(self, country: str) -> int:
        """Encode country code to numerical value"""
        if not country:
            return 0
        # Simple hash-based encoding for countries
        return hash(country) % 1000
    
    def _encode_city(self, city: str) -> int:
        """Encode city name to numerical value"""
        if not city:
            return 0
        # Simple hash-based encoding for cities
        return hash(city) % 1000

# Global model instance
bot_detection_model = BotDetectionModel()
