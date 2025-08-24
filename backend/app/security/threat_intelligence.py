#!/usr/bin/env python3
"""
Advanced Threat Intelligence Engine
Behavioral analysis, anomaly detection, and threat scoring
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Any, Optional, Tuple
import hashlib
import ipaddress
import re
from collections import defaultdict, Counter

logger = logging.getLogger(__name__)

class ThreatIntelligenceEngine:
    """Advanced threat intelligence and behavioral analysis engine"""
    
    def __init__(self):
        self.threat_indicators = {}
        self.behavioral_patterns = {}
        self.anomaly_detectors = {}
        self.threat_scores = {}
        self.ip_reputation = {}
        self.user_behavior_baselines = {}
        
        # Initialize threat detection models
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize threat detection models"""
        # Anomaly detection models
        self.anomaly_detectors['isolation_forest'] = IsolationForest(
            contamination=0.1,
            random_state=42,
            n_estimators=100
        )
        
        self.anomaly_detectors['dbscan'] = DBSCAN(
            eps=0.5,
            min_samples=5
        )
        
        # Feature scaler
        self.scaler = StandardScaler()
        
        # Initialize threat indicators
        self._load_threat_indicators()
    
    def _load_threat_indicators(self):
        """Load known threat indicators"""
        self.threat_indicators = {
            'suspicious_user_agents': [
                'bot', 'crawler', 'spider', 'scraper', 'curl', 'wget',
                'python-requests', 'java', 'go-http-client'
            ],
            'malicious_patterns': [
                'sql injection', 'xss', 'csrf', 'lfi', 'rfi',
                'command injection', 'path traversal'
            ],
            'suspicious_ips': [
                '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'
            ],
            'high_risk_countries': [
                'XX', 'YY', 'ZZ'  # Placeholder for actual high-risk countries
            ]
        }
    
    def analyze_traffic_patterns(self, traffic_data: List[Dict]) -> Dict[str, Any]:
        """Analyze traffic patterns for threat detection"""
        try:
            df = pd.DataFrame(traffic_data)
            
            # Extract features for analysis
            features = self._extract_threat_features(df)
            
            # Detect anomalies
            anomalies = self._detect_anomalies(features)
            
            # Calculate threat scores
            threat_scores = self._calculate_threat_scores(df, features, anomalies)
            
            # Identify behavioral patterns
            behavioral_analysis = self._analyze_behavioral_patterns(df)
            
            # Generate threat intelligence report
            threat_report = self._generate_threat_report(
                df, features, anomalies, threat_scores, behavioral_analysis
            )
            
            return threat_report
            
        except Exception as e:
            logger.error(f"Error analyzing traffic patterns: {str(e)}")
            raise
    
    def _extract_threat_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract features for threat detection"""
        features = df.copy()
        
        # IP-based features
        features['ip_numeric'] = features['client_ip'].apply(self._ip_to_numeric)
        features['ip_class'] = features['client_ip'].apply(self._get_ip_class)
        
        # Request-based features
        features['request_length'] = features['request_headers'].str.len()
        features['url_depth'] = features['request_url'].str.count('/')
        features['query_params_count'] = features['request_url'].str.count('&')
        
        # User agent analysis
        features['ua_suspicious'] = features['user_agent'].apply(
            lambda x: self._is_suspicious_user_agent(x)
        )
        features['ua_length'] = features['user_agent'].str.len()
        
        # Geographic features
        features['country_risk'] = features['geo_country'].apply(
            lambda x: self._get_country_risk(x)
        )
        
        # Temporal features
        if 'timestamp' in features.columns:
            features['hour'] = pd.to_datetime(features['timestamp']).dt.hour
            features['day_of_week'] = pd.to_datetime(features['timestamp']).dt.dayofweek
            features['is_weekend'] = features['day_of_week'].isin([5, 6]).astype(int)
        
        # Behavioral features
        features['requests_per_ip'] = features.groupby('client_ip')['client_ip'].transform('count')
        features['unique_user_agents_per_ip'] = features.groupby('client_ip')['user_agent'].transform('nunique')
        
        # Content analysis
        features['content_suspicious'] = features['request_headers'].apply(
            lambda x: self._analyze_content_suspicion(x)
        )
        
        return features
    
    def _ip_to_numeric(self, ip_str: str) -> int:
        """Convert IP address to numeric for analysis"""
        try:
            return int(ipaddress.IPv4Address(ip_str))
        except:
            return 0
    
    def _get_ip_class(self, ip_str: str) -> str:
        """Get IP address class"""
        try:
            ip = ipaddress.IPv4Address(ip_str)
            if ip.is_private:
                return 'private'
            elif ip.is_loopback:
                return 'loopback'
            elif ip.is_multicast:
                return 'multicast'
            else:
                return 'public'
        except:
            return 'unknown'
    
    def _is_suspicious_user_agent(self, user_agent: str) -> int:
        """Check if user agent is suspicious"""
        if pd.isna(user_agent):
            return 0
        
        user_agent_lower = user_agent.lower()
        for pattern in self.threat_indicators['suspicious_user_agents']:
            if pattern in user_agent_lower:
                return 1
        return 0
    
    def _get_country_risk(self, country_code: str) -> int:
        """Get country risk score"""
        if pd.isna(country_code):
            return 0
        
        if country_code in self.threat_indicators['high_risk_countries']:
            return 2
        return 0
    
    def _analyze_content_suspicion(self, content: str) -> int:
        """Analyze content for suspicious patterns"""
        if pd.isna(content):
            return 0
        
        content_lower = content.lower()
        suspicion_score = 0
        
        for pattern in self.threat_indicators['malicious_patterns']:
            if pattern in content_lower:
                suspicion_score += 1
        
        return min(suspicion_score, 3)  # Cap at 3
    
    def _detect_anomalies(self, features: pd.DataFrame) -> Dict[str, Any]:
        """Detect anomalies using multiple algorithms"""
        anomalies = {}
        
        # Prepare features for anomaly detection
        numeric_features = features.select_dtypes(include=[np.number])
        numeric_features = numeric_features.fillna(0)
        
        if len(numeric_features) > 0:
            # Scale features
            scaled_features = self.scaler.fit_transform(numeric_features)
            
            # Isolation Forest
            try:
                iso_forest_predictions = self.anomaly_detectors['isolation_forest'].fit_predict(scaled_features)
                anomalies['isolation_forest'] = {
                    'predictions': iso_forest_predictions.tolist(),
                    'anomaly_indices': np.where(iso_forest_predictions == -1)[0].tolist()
                }
            except Exception as e:
                logger.warning(f"Isolation Forest failed: {e}")
                anomalies['isolation_forest'] = {'predictions': [], 'anomaly_indices': []}
            
            # DBSCAN clustering
            try:
                dbscan_predictions = self.anomaly_detectors['dbscan'].fit_predict(scaled_features)
                anomalies['dbscan'] = {
                    'predictions': dbscan_predictions.tolist(),
                    'cluster_count': len(set(dbscan_predictions)) - (1 if -1 in dbscan_predictions else 0)
                }
            except Exception as e:
                logger.warning(f"DBSCAN failed: {e}")
                anomalies['dbscan'] = {'predictions': [], 'cluster_count': 0}
        
        return anomalies
    
    def _calculate_threat_scores(self, df: pd.DataFrame, features: pd.DataFrame, anomalies: Dict) -> Dict[str, float]:
        """Calculate threat scores for each request"""
        threat_scores = {}
        
        for idx, row in features.iterrows():
            score = 0.0
            
            # Base threat indicators
            if row['ua_suspicious']:
                score += 2.0
            
            if row['country_risk'] > 0:
                score += row['country_risk']
            
            if row['content_suspicious'] > 0:
                score += row['content_suspicious'] * 0.5
            
            # IP-based scoring
            if row['ip_class'] == 'private':
                score += 1.0
            
            # Request pattern scoring
            if row['url_depth'] > 5:
                score += 0.5
            
            if row['query_params_count'] > 10:
                score += 0.5
            
            # Behavioral scoring
            if row['requests_per_ip'] > 100:
                score += 1.0
            
            if row['unique_user_agents_per_ip'] > 5:
                score += 1.0
            
            # Anomaly scoring
            if 'isolation_forest' in anomalies and idx in anomalies['isolation_forest']['anomaly_indices']:
                score += 3.0
            
            # Normalize score to 0-10 scale
            threat_scores[idx] = min(score, 10.0)
        
        return threat_scores
    
    def _analyze_behavioral_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze behavioral patterns for threat detection"""
        behavioral_analysis = {}
        
        # IP behavior analysis
        ip_behavior = df.groupby('client_ip').agg({
            'id': 'count',
            'user_agent': 'nunique',
            'geo_country': 'nunique',
            'request_method': 'nunique'
        }).rename(columns={
            'id': 'request_count',
            'user_agent': 'unique_user_agents',
            'geo_country': 'unique_countries',
            'request_method': 'unique_methods'
        })
        
        # Identify suspicious IPs
        suspicious_ips = ip_behavior[
            (ip_behavior['request_count'] > 100) |
            (ip_behavior['unique_user_agents'] > 3) |
            (ip_behavior['unique_countries'] > 2)
        ]
        
        behavioral_analysis['suspicious_ips'] = suspicious_ips.to_dict('index')
        
        # Request pattern analysis
        request_patterns = df.groupby('request_method').agg({
            'id': 'count',
            'client_ip': 'nunique'
        }).rename(columns={
            'id': 'total_requests',
            'client_ip': 'unique_ips'
        })
        
        behavioral_analysis['request_patterns'] = request_patterns.to_dict('index')
        
        # Temporal pattern analysis
        if 'timestamp' in df.columns:
            df['hour'] = pd.to_datetime(df['timestamp']).dt.hour
            hourly_patterns = df.groupby('hour')['id'].count()
            behavioral_analysis['hourly_patterns'] = hourly_patterns.to_dict()
        
        return behavioral_analysis
    
    def _generate_threat_report(self, df: pd.DataFrame, features: pd.DataFrame, 
                               anomalies: Dict, threat_scores: Dict, 
                               behavioral_analysis: Dict) -> Dict[str, Any]:
        """Generate comprehensive threat intelligence report"""
        
        # Calculate overall statistics
        total_requests = len(df)
        high_threat_requests = sum(1 for score in threat_scores.values() if score >= 7.0)
        medium_threat_requests = sum(1 for score in threat_scores.values() if 4.0 <= score < 7.0)
        
        # Top threat sources
        threat_by_ip = defaultdict(float)
        for idx, score in threat_scores.items():
            ip = df.iloc[idx]['client_ip']
            threat_by_ip[ip] += score
        
        top_threat_ips = sorted(threat_by_ip.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Threat distribution
        threat_distribution = {
            'low': sum(1 for score in threat_scores.values() if score < 4.0),
            'medium': medium_threat_requests,
            'high': high_threat_requests,
            'critical': sum(1 for score in threat_scores.values() if score >= 9.0)
        }
        
        # Generate report
        report = {
            'summary': {
                'total_requests': total_requests,
                'threat_level': self._calculate_overall_threat_level(threat_scores),
                'anomaly_count': len(anomalies.get('isolation_forest', {}).get('anomaly_indices', [])),
                'suspicious_ip_count': len(behavioral_analysis.get('suspicious_ips', {}))
            },
            'threat_distribution': threat_distribution,
            'top_threat_sources': [
                {'ip': ip, 'total_threat_score': score} 
                for ip, score in top_threat_ips
            ],
            'anomalies': anomalies,
            'behavioral_analysis': behavioral_analysis,
            'recommendations': self._generate_security_recommendations(
                threat_distribution, behavioral_analysis
            ),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        return report
    
    def _calculate_overall_threat_level(self, threat_scores: Dict) -> str:
        """Calculate overall threat level"""
        if not threat_scores:
            return 'low'
        
        avg_score = np.mean(list(threat_scores.values()))
        
        if avg_score >= 7.0:
            return 'critical'
        elif avg_score >= 5.0:
            return 'high'
        elif avg_score >= 3.0:
            return 'medium'
        else:
            return 'low'
    
    def _generate_security_recommendations(self, threat_distribution: Dict, 
                                         behavioral_analysis: Dict) -> List[str]:
        """Generate security recommendations based on analysis"""
        recommendations = []
        
        if threat_distribution['high'] > 0:
            recommendations.append("Implement additional rate limiting for high-threat IPs")
        
        if threat_distribution['critical'] > 0:
            recommendations.append("Immediate IP blocking recommended for critical threats")
        
        suspicious_ips = behavioral_analysis.get('suspicious_ips', {})
        if len(suspicious_ips) > 5:
            recommendations.append("Consider implementing IP reputation scoring system")
        
        if threat_distribution['medium'] > threat_distribution['low']:
            recommendations.append("Review and strengthen security policies")
        
        recommendations.append("Enable real-time threat monitoring and alerting")
        recommendations.append("Implement behavioral analysis for user sessions")
        
        return recommendations
    
    def update_ip_reputation(self, ip: str, threat_score: float, 
                           additional_data: Dict = None):
        """Update IP reputation database"""
        if ip not in self.ip_reputation:
            self.ip_reputation[ip] = {
                'threat_score': 0.0,
                'request_count': 0,
                'first_seen': datetime.utcnow().isoformat(),
                'last_seen': datetime.utcnow().isoformat(),
                'threat_history': []
            }
        
        # Update reputation
        self.ip_reputation[ip]['threat_score'] = (
            self.ip_reputation[ip]['threat_score'] * 0.7 + threat_score * 0.3
        )
        self.ip_reputation[ip]['request_count'] += 1
        self.ip_reputation[ip]['last_seen'] = datetime.utcnow().isoformat()
        
        # Add to threat history
        threat_record = {
            'timestamp': datetime.utcnow().isoformat(),
            'threat_score': threat_score,
            'additional_data': additional_data or {}
        }
        self.ip_reputation[ip]['threat_history'].append(threat_record)
        
        # Keep only last 100 records
        if len(self.ip_reputation[ip]['threat_history']) > 100:
            self.ip_reputation[ip]['threat_history'] = \
                self.ip_reputation[ip]['threat_history'][-100:]
    
    def get_ip_reputation(self, ip: str) -> Dict[str, Any]:
        """Get IP reputation information"""
        return self.ip_reputation.get(ip, {
            'threat_score': 0.0,
            'request_count': 0,
            'first_seen': None,
            'last_seen': None,
            'threat_history': []
        })
    
    def get_global_threat_summary(self) -> Dict[str, Any]:
        """Get global threat intelligence summary"""
        if not self.ip_reputation:
            return {'status': 'No data available'}
        
        total_ips = len(self.ip_reputation)
        high_threat_ips = sum(1 for data in self.ip_reputation.values() 
                            if data['threat_score'] >= 7.0)
        
        avg_threat_score = np.mean([data['threat_score'] 
                                  for data in self.ip_reputation.values()])
        
        return {
            'total_monitored_ips': total_ips,
            'high_threat_ips': high_threat_ips,
            'average_threat_score': round(avg_threat_score, 2),
            'threat_level': self._calculate_overall_threat_level(
                {ip: data['threat_score'] for ip, data in self.ip_reputation.items()}
            ),
            'last_updated': datetime.utcnow().isoformat()
        }

# Global instance
threat_intelligence_engine = ThreatIntelligenceEngine()
