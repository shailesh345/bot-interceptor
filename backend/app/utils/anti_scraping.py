#!/usr/bin/env python3
"""
Anti-Scraping Engine
Handles detection and prevention of content scraping
"""

import re
import time
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
from collections import defaultdict

class AntiScrapingEngine:
    """Anti-scraping detection and prevention engine"""
    
    def __init__(self):
        self.scraping_patterns = {
            'user_agents': [
                r'python-requests',
                r'scrapy',
                r'beautifulsoup',
                r'selenium',
                r'phantomjs',
                r'headless',
                r'curl',
                r'wget',
                r'http\.client',
                r'urllib',
                r'mechanize',
                r'grab',
                r'requests-html'
            ],
            'behavioral': [
                'rapid_requests',      # Too many requests in short time
                'pattern_access',      # Accessing pages in predictable pattern
                'no_javascript',       # No JavaScript execution
                'no_cookies',          # No cookie handling
                'no_referrer',         # No referrer header
                'direct_access',       # Direct access to deep pages
                'bulk_download'        # Downloading multiple resources
            ],
            'technical': [
                'no_accept_language',  # Missing Accept-Language header
                'no_accept_encoding',  # Missing Accept-Encoding header
                'no_connection_keep_alive',  # No keep-alive
                'no_upgrade_insecure_requests'  # No upgrade header
            ]
        }
        
        self.suspicious_ips = defaultdict(list)
        self.scraping_attempts = defaultdict(int)
        self.blocked_ips = set()
        
    def analyze_request(self, request_data: Dict) -> Dict:
        """
        Analyze a request for scraping indicators
        
        Args:
            request_data: Request data including headers, IP, etc.
            
        Returns:
            Analysis results with scraping score and indicators
        """
        score = 0
        indicators = []
        
        # Check user agent
        user_agent = request_data.get('user_agent', '').lower()
        if user_agent:
            for pattern in self.scraping_patterns['user_agents']:
                if re.search(pattern, user_agent, re.IGNORECASE):
                    score += 30
                    indicators.append(f'suspicious_user_agent: {pattern}')
                    break
        
        # Check headers
        headers = request_data.get('headers', {})
        score += self._check_headers(headers, indicators)
        
        # Check behavioral patterns
        client_ip = request_data.get('client_ip', '')
        if client_ip:
            score += self._check_behavioral_patterns(client_ip, request_data, indicators)
        
        # Check request patterns
        score += self._check_request_patterns(request_data, indicators)
        
        # Determine risk level
        risk_level = self._get_risk_level(score)
        
        return {
            'scraping_score': score,
            'risk_level': risk_level,
            'indicators': indicators,
            'is_suspicious': score >= 50,
            'is_likely_scraper': score >= 80,
            'recommended_action': self._get_recommended_action(score)
        }
    
    def _check_headers(self, headers: Dict, indicators: List) -> int:
        """Check headers for scraping indicators"""
        score = 0
        
        # Check for missing common headers
        if 'accept-language' not in headers:
            score += 10
            indicators.append('missing_accept_language')
        
        if 'accept-encoding' not in headers:
            score += 10
            indicators.append('missing_accept_encoding')
        
        if 'connection' not in headers or 'keep-alive' not in headers.get('connection', '').lower():
            score += 5
            indicators.append('no_keep_alive')
        
        if 'upgrade-insecure-requests' not in headers:
            score += 5
            indicators.append('no_upgrade_insecure_requests')
        
        # Check for suspicious header values
        if 'accept' in headers and headers['accept'] == '*/*':
            score += 15
            indicators.append('accept_all_content_types')
        
        return score
    
    def _check_behavioral_patterns(self, client_ip: str, request_data: Dict, indicators: List) -> int:
        """Check for behavioral patterns that indicate scraping"""
        score = 0
        current_time = time.time()
        
        # Track request timing
        self.suspicious_ips[client_ip].append(current_time)
        
        # Keep only recent requests (last 5 minutes)
        cutoff_time = current_time - 300
        self.suspicious_ips[client_ip] = [
            req_time for req_time in self.suspicious_ips[client_ip] 
            if req_time > cutoff_time
        ]
        
        # Check request frequency
        recent_requests = len(self.suspicious_ips[client_ip])
        if recent_requests > 100:  # More than 100 requests in 5 minutes
            score += 25
            indicators.append('excessive_request_frequency')
        elif recent_requests > 50:
            score += 15
            indicators.append('high_request_frequency')
        
        # Check for pattern access (e.g., sequential page numbers)
        path = request_data.get('request_path', '')
        if self._is_pattern_access(path, client_ip):
            score += 20
            indicators.append('pattern_access_detected')
        
        return score
    
    def _check_request_patterns(self, request_data: Dict, indicators: List) -> int:
        """Check request patterns for scraping indicators"""
        score = 0
        
        # Check for direct access to deep pages
        path = request_data.get('request_path', '')
        if path.count('/') > 3:  # Deep page access
            referrer = request_data.get('headers', {}).get('referer', '')
            if not referrer or referrer == request_data.get('domain', ''):
                score += 15
                indicators.append('direct_deep_page_access')
        
        # Check for bulk resource access
        if 'bulk_download' in request_data.get('behavior', []):
            score += 20
            indicators.append('bulk_download_detected')
        
        return score
    
    def _is_pattern_access(self, path: str, client_ip: str) -> bool:
        """Check if access follows a predictable pattern"""
        # Simple pattern detection - could be enhanced with ML
        if re.search(r'/page/\d+', path) or re.search(r'/article/\d+', path):
            # Check if this IP has accessed similar patterns recently
            recent_paths = [
                req_data.get('request_path', '') 
                for req_data in self.suspicious_ips.get(client_ip, [])
            ]
            
            # Count sequential access
            sequential_count = 0
            for i in range(len(recent_paths) - 1):
                if self._is_sequential_path(recent_paths[i], recent_paths[i + 1]):
                    sequential_count += 1
            
            return sequential_count >= 3
        
        return False
    
    def _is_sequential_path(self, path1: str, path2: str) -> bool:
        """Check if two paths are sequential (e.g., page 1, page 2)"""
        # Extract numbers from paths
        numbers1 = re.findall(r'\d+', path1)
        numbers2 = re.findall(r'\d+', path2)
        
        if numbers1 and numbers2:
            try:
                num1 = int(numbers1[-1])
                num2 = int(numbers2[-1])
                return abs(num2 - num1) == 1
            except ValueError:
                pass
        
        return False
    
    def _get_risk_level(self, score: int) -> str:
        """Get risk level based on scraping score"""
        if score >= 80:
            return 'critical'
        elif score >= 60:
            return 'high'
        elif score >= 40:
            return 'medium'
        elif score >= 20:
            return 'low'
        else:
            return 'minimal'
    
    def _get_recommended_action(self, score: int) -> str:
        """Get recommended action based on scraping score"""
        if score >= 80:
            return 'block'
        elif score >= 60:
            return 'challenge'
        elif score >= 40:
            return 'monitor'
        elif score >= 20:
            return 'log'
        else:
            return 'allow'
    
    def block_ip(self, client_ip: str, reason: str = 'scraping_detected') -> None:
        """Block an IP address"""
        self.blocked_ips.add(client_ip)
        
        # Log the block
        print(f"IP {client_ip} blocked for {reason}")
    
    def unblock_ip(self, client_ip: str) -> None:
        """Unblock an IP address"""
        if client_ip in self.blocked_ips:
            self.blocked_ips.remove(client_ip)
            print(f"IP {client_ip} unblocked")
    
    def is_ip_blocked(self, client_ip: str) -> bool:
        """Check if an IP is blocked"""
        return client_ip in self.blocked_ips
    
    def get_scraping_stats(self) -> Dict:
        """Get scraping detection statistics"""
        total_suspicious = sum(len(ips) for ips in self.suspicious_ips.values())
        total_blocked = len(self.blocked_ips)
        
        return {
            'total_suspicious_ips': total_suspicious,
            'total_blocked_ips': total_blocked,
            'suspicious_ips': list(self.suspicious_ips.keys()),
            'blocked_ips': list(self.blocked_ips)
        }
    
    def cleanup_old_data(self, max_age_minutes: int = 30) -> int:
        """Clean up old suspicious IP data"""
        cutoff_time = time.time() - (max_age_minutes * 60)
        cleaned_count = 0
        
        for ip in list(self.suspicious_ips.keys()):
            # Remove old timestamps
            old_count = len(self.suspicious_ips[ip])
            self.suspicious_ips[ip] = [
                req_time for req_time in self.suspicious_ips[ip] 
                if req_time > cutoff_time
            ]
            new_count = len(self.suspicious_ips[ip])
            
            if new_count == 0:
                del self.suspicious_ips[ip]
            
            cleaned_count += (old_count - new_count)
        
        return cleaned_count
