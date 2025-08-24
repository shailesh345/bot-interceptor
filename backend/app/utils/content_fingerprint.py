#!/usr/bin/env python3
"""
Content Fingerprinting Utility
Handles content fingerprinting for anti-scraping detection
"""

import hashlib
import re
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta

class ContentFingerprinter:
    """Content fingerprinting for anti-scraping detection"""
    
    def __init__(self):
        self.fingerprints = {}  # Store content fingerprints
        self.similarity_threshold = 0.8  # Similarity threshold for duplicate detection
        
    def generate_fingerprint(self, content: str, content_type: str = 'html') -> str:
        """
        Generate a fingerprint for content
        
        Args:
            content: The content to fingerprint
            content_type: Type of content (html, text, json, etc.)
            
        Returns:
            Content fingerprint hash
        """
        if not content:
            return ""
        
        # Normalize content based on type
        normalized_content = self._normalize_content(content, content_type)
        
        # Generate fingerprint using SHA-256
        fingerprint = hashlib.sha256(normalized_content.encode('utf-8')).hexdigest()
        
        return fingerprint
    
    def _normalize_content(self, content: str, content_type: str) -> str:
        """Normalize content for consistent fingerprinting"""
        if content_type == 'html':
            # Remove HTML tags, whitespace, and normalize
            content = re.sub(r'<[^>]+>', '', content)
            content = re.sub(r'\s+', ' ', content)
            content = re.sub(r'[^\w\s]', '', content)
            content = content.lower().strip()
        elif content_type == 'text':
            # Remove extra whitespace and normalize
            content = re.sub(r'\s+', ' ', content)
            content = content.lower().strip()
        elif content_type == 'json':
            # Parse and re-serialize for consistent formatting
            try:
                import json
                parsed = json.loads(content)
                content = json.dumps(parsed, sort_keys=True, separators=(',', ':'))
            except:
                pass
        
        return content
    
    def store_fingerprint(self, domain_id: int, path: str, fingerprint: str, 
                         metadata: Dict = None) -> None:
        """
        Store a content fingerprint
        
        Args:
            domain_id: Domain ID
            path: Content path/URL
            fingerprint: Content fingerprint
            metadata: Additional metadata
        """
        key = f"{domain_id}:{path}"
        self.fingerprints[key] = {
            'fingerprint': fingerprint,
            'timestamp': datetime.utcnow(),
            'metadata': metadata or {},
            'access_count': 0
        }
    
    def check_duplicate(self, domain_id: int, path: str, fingerprint: str) -> Tuple[bool, Dict]:
        """
        Check if content is a duplicate
        
        Args:
            domain_id: Domain ID
            path: Content path/URL
            fingerprint: Content fingerprint to check
            
        Returns:
            Tuple of (is_duplicate, duplicate_info)
        """
        key = f"{domain_id}:{path}"
        
        if key in self.fingerprints:
            stored_fingerprint = self.fingerprints[key]
            stored_fingerprint['access_count'] += 1
            
            # Check if fingerprints match exactly
            if fingerprint == stored_fingerprint['fingerprint']:
                return True, {
                    'is_duplicate': True,
                    'original_path': path,
                    'original_timestamp': stored_fingerprint['timestamp'],
                    'access_count': stored_fingerprint['access_count'],
                    'similarity': 1.0
                }
        
        # Check for similar fingerprints across all paths
        similarity_scores = []
        for stored_key, stored_data in self.fingerprints.items():
            if stored_key.startswith(f"{domain_id}:"):
                similarity = self._calculate_similarity(fingerprint, stored_data['fingerprint'])
                if similarity >= self.similarity_threshold:
                    similarity_scores.append({
                        'path': stored_key.split(':', 1)[1],
                        'similarity': similarity,
                        'timestamp': stored_data['timestamp']
                    })
        
        if similarity_scores:
            # Sort by similarity (highest first)
            similarity_scores.sort(key=lambda x: x['similarity'], reverse=True)
            best_match = similarity_scores[0]
            
            return True, {
                'is_duplicate': True,
                'original_path': best_match['path'],
                'original_timestamp': best_match['timestamp'],
                'similarity': best_match['similarity'],
                'all_matches': similarity_scores
            }
        
        return False, {'is_duplicate': False, 'similarity': 0.0}
    
    def _calculate_similarity(self, fingerprint1: str, fingerprint2: str) -> float:
        """
        Calculate similarity between two fingerprints
        
        Args:
            fingerprint1: First fingerprint
            fingerprint2: Second fingerprint
            
        Returns:
            Similarity score (0.0 to 1.0)
        """
        if not fingerprint1 or not fingerprint2:
            return 0.0
        
        if fingerprint1 == fingerprint2:
            return 1.0
        
        # Simple similarity based on common characters
        # This is a basic implementation - could be enhanced with more sophisticated algorithms
        common_chars = sum(1 for a, b in zip(fingerprint1, fingerprint2) if a == b)
        max_length = max(len(fingerprint1), len(fingerprint2))
        
        return common_chars / max_length if max_length > 0 else 0.0
    
    def get_fingerprint_info(self, domain_id: int, path: str) -> Optional[Dict]:
        """Get information about a stored fingerprint"""
        key = f"{domain_id}:{path}"
        return self.fingerprints.get(key)
    
    def cleanup_old_fingerprints(self, max_age_days: int = 30) -> int:
        """
        Clean up old fingerprints
        
        Args:
            max_age_days: Maximum age in days
            
        Returns:
            Number of fingerprints removed
        """
        cutoff_time = datetime.utcnow() - timedelta(days=max_age_days)
        keys_to_remove = []
        
        for key, data in self.fingerprints.items():
            if data['timestamp'] < cutoff_time:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.fingerprints[key]
        
        return len(keys_to_remove)
    
    def get_domain_fingerprints(self, domain_id: int) -> List[Dict]:
        """Get all fingerprints for a specific domain"""
        domain_fingerprints = []
        
        for key, data in self.fingerprints.items():
            if key.startswith(f"{domain_id}:"):
                path = key.split(':', 1)[1]
                domain_fingerprints.append({
                    'path': path,
                    'fingerprint': data['fingerprint'],
                    'timestamp': data['timestamp'],
                    'access_count': data['access_count'],
                    'metadata': data['metadata']
                })
        
        return domain_fingerprints
