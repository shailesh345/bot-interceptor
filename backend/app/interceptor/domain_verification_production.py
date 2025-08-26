"""
Production-Ready Domain Verification Service
Enhanced implementation for Traffic Interceptor Platform v2.0+

This service provides comprehensive domain ownership verification using multiple methods:
- DNS TXT Record Verification
- HTML File Upload Verification  
- HTML Meta Tag Verification
- CNAME Record Verification

Features:
- Token generation with secure randomization
- SSL certificate validation
- Domain accessibility testing
- Retry logic with exponential backoff
- Comprehensive error handling
- Detailed verification instructions
- Performance monitoring
- Security validations

Author: Traffic Interceptor Team
Version: 2.0.0
Last Updated: August 26, 2025
"""

import dns.resolver
import requests
import ssl
import socket
import time
import hashlib
import secrets
import re
import asyncio
import aiohttp
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Union
from urllib.parse import urlparse, urljoin
from dataclasses import dataclass, asdict
from flask import current_app
import logging

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class VerificationResult:
    """Result of a domain verification attempt"""
    success: bool
    method: str
    domain: str
    message: str
    token: Optional[str] = None
    details: Optional[Dict] = None
    error: Optional[str] = None
    instruction: Optional[str] = None
    timestamp: Optional[str] = None
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for API responses"""
        return asdict(self)

@dataclass
class SSLInfo:
    """SSL certificate information"""
    enabled: bool
    common_name: Optional[str] = None
    issuer: Optional[str] = None
    expires_on: Optional[str] = None
    days_until_expiry: Optional[int] = None
    is_valid: Optional[bool] = None
    error: Optional[str] = None

@dataclass
class DomainAccessInfo:
    """Domain accessibility information"""
    domain: str
    http_accessible: bool
    https_accessible: bool
    response_time: Optional[float] = None
    ssl_info: Optional[SSLInfo] = None
    redirects: Optional[List[str]] = None
    error: Optional[str] = None

class DomainVerificationService:
    """
    Production-ready domain verification service with comprehensive validation methods
    """
    
    def __init__(self):
        self.verification_timeout = 10  # seconds
        self.max_retries = 3
        self.retry_delays = [1, 2, 4]  # exponential backoff
        self.token_length = 32
        self.supported_methods = ['dns', 'html', 'meta', 'cname']
        
        # DNS configuration
        self.dns_timeout = 10
        self.dns_lifetime = 30
        
        # HTTP configuration
        self.http_timeout = 10
        self.user_agent = 'TrafficInterceptor-Verification/2.0'
        
        # Security settings
        self.max_verification_attempts = 5
        self.verification_cooldown = 3600  # 1 hour
        
        # Method mapping
        self.verification_methods = {
            'dns': self._verify_dns_record,
            'html': self._verify_html_file,
            'meta': self._verify_meta_tag,
            'cname': self._verify_cname_record
        }
    
    # ==================== TOKEN GENERATION ====================
    
    def generate_verification_token(self, domain: str, user_id: Optional[str] = None) -> str:
        """
        Generate a cryptographically secure verification token
        
        Args:
            domain: Domain name to generate token for
            user_id: Optional user ID for additional entropy
            
        Returns:
            32-character hexadecimal token
        """
        try:
            # Create entropy from multiple sources
            timestamp = str(int(time.time() * 1000))  # millisecond precision
            random_bytes = secrets.token_bytes(32)
            domain_normalized = domain.lower().strip()
            
            # Build token content
            content_parts = [
                domain_normalized,
                timestamp,
                random_bytes.hex(),
            ]
            
            if user_id:
                content_parts.append(str(user_id))
            
            # Add system entropy
            content_parts.append(secrets.token_hex(16))
            
            # Create final content string
            content = '-'.join(content_parts)
            
            # Generate token using SHA-256
            token_hash = hashlib.sha256(content.encode('utf-8')).hexdigest()
            
            # Return first 32 characters for manageable token size
            token = token_hash[:self.token_length]
            
            logger.info(f"Generated verification token for domain: {domain}")
            return token
            
        except Exception as e:
            logger.error(f"Failed to generate verification token for {domain}: {e}")
            raise Exception(f"Token generation failed: {str(e)}")
    
    # ==================== DOMAIN VALIDATION ====================
    
    def validate_domain_format(self, domain: str) -> Tuple[bool, str]:
        """
        Validate domain name format
        
        Args:
            domain: Domain name to validate
            
        Returns:
            Tuple of (is_valid, normalized_domain)
        """
        try:
            # Remove protocol if present
            if domain.startswith(('http://', 'https://')):
                domain = urlparse(domain).netloc
            
            # Normalize domain
            domain = domain.lower().strip().rstrip('/')
            
            # Remove port if present
            if ':' in domain and not domain.count(':') > 1:  # Not IPv6
                domain = domain.split(':')[0]
            
            # Basic format validation
            domain_pattern = re.compile(
                r'^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$'
            )
            
            if not domain_pattern.match(domain):
                return False, domain
            
            # Check length constraints
            if len(domain) > 253 or len(domain) < 3:
                return False, domain
            
            # Check for valid TLD
            if '.' not in domain:
                return False, domain
            
            return True, domain
            
        except Exception:
            return False, domain
    
    def check_domain_accessibility(self, domain: str) -> DomainAccessInfo:
        """
        Check if domain is accessible via HTTP/HTTPS
        
        Args:
            domain: Domain name to check
            
        Returns:
            DomainAccessInfo object with accessibility details
        """
        access_info = DomainAccessInfo(
            domain=domain,
            http_accessible=False,
            https_accessible=False
        )
        
        try:
            # Test HTTPS first (preferred)
            https_result = self._test_protocol_access(domain, 'https')
            access_info.https_accessible = https_result['accessible']
            
            if https_result['accessible']:
                access_info.response_time = https_result.get('response_time')
                access_info.redirects = https_result.get('redirects')
                
                # Get SSL info if HTTPS works
                access_info.ssl_info = self.check_domain_ssl(domain)
            
            # Test HTTP as fallback
            http_result = self._test_protocol_access(domain, 'http')
            access_info.http_accessible = http_result['accessible']
            
            if not access_info.response_time and http_result['accessible']:
                access_info.response_time = http_result.get('response_time')
                access_info.redirects = http_result.get('redirects')
            
        except Exception as e:
            access_info.error = str(e)
            logger.error(f"Domain accessibility check failed for {domain}: {e}")
        
        return access_info
    
    def _test_protocol_access(self, domain: str, protocol: str) -> Dict:
        """Test domain accessibility for specific protocol"""
        try:
            url = f'{protocol}://{domain}'
            start_time = time.time()
            
            response = requests.get(
                url,
                timeout=self.http_timeout,
                allow_redirects=True,
                verify=False,  # We'll check SSL separately
                headers={'User-Agent': self.user_agent}
            )
            
            response_time = time.time() - start_time
            
            # Track redirects
            redirects = []
            if response.history:
                redirects = [resp.url for resp in response.history]
                redirects.append(response.url)
            
            return {
                'accessible': response.status_code < 400,
                'status_code': response.status_code,
                'response_time': response_time,
                'final_url': response.url,
                'redirects': redirects if redirects else None
            }
            
        except requests.RequestException as e:
            return {
                'accessible': False,
                'error': str(e)
            }
    
    def check_domain_ssl(self, domain: str) -> SSLInfo:
        """
        Check SSL certificate information for domain
        
        Args:
            domain: Domain name to check SSL for
            
        Returns:
            SSLInfo object with certificate details
        """
        try:
            # Create SSL context
            context = ssl.create_default_context()
            
            # Connect to domain on port 443
            with socket.create_connection((domain, 443), timeout=self.verification_timeout) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Extract certificate information
                    subject = dict(x[0] for x in cert['subject'])
                    issuer = dict(x[0] for x in cert['issuer'])
                    
                    # Parse expiration date
                    not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    days_until_expiry = (not_after - datetime.utcnow()).days
                    
                    return SSLInfo(
                        enabled=True,
                        common_name=subject.get('commonName', domain),
                        issuer=issuer.get('organizationName', 'Unknown'),
                        expires_on=not_after.isoformat(),
                        days_until_expiry=days_until_expiry,
                        is_valid=days_until_expiry > 0
                    )
                    
        except Exception as e:
            return SSLInfo(
                enabled=False,
                error=str(e)
            )
    
    # ==================== VERIFICATION METHODS ====================
    
    def verify_domain_ownership(self, domain: str, method: str, token: str) -> VerificationResult:
        """
        Main verification method that orchestrates the verification process
        
        Args:
            domain: Domain name to verify
            method: Verification method to use
            token: Verification token to check for
            
        Returns:
            VerificationResult object with verification details
        """
        start_time = time.time()
        
        try:
            # Validate inputs
            is_valid, normalized_domain = self.validate_domain_format(domain)
            if not is_valid:
                return VerificationResult(
                    success=False,
                    method=method,
                    domain=domain,
                    message="Invalid domain format",
                    error="Domain format validation failed",
                    timestamp=datetime.utcnow().isoformat()
                )
            
            domain = normalized_domain
            
            # Check if method is supported
            if method not in self.supported_methods:
                return VerificationResult(
                    success=False,
                    method=method,
                    domain=domain,
                    message=f"Unsupported verification method: {method}",
                    error=f"Supported methods: {', '.join(self.supported_methods)}",
                    timestamp=datetime.utcnow().isoformat()
                )
            
            # Validate token format
            if not token or len(token) < 16:
                return VerificationResult(
                    success=False,
                    method=method,
                    domain=domain,
                    message="Invalid verification token",
                    error="Token must be at least 16 characters",
                    timestamp=datetime.utcnow().isoformat()
                )
            
            # Perform verification with retry logic
            result = self._verify_with_retries(domain, method, token)
            
            # Add performance metrics
            verification_time = time.time() - start_time
            if result.details is None:
                result.details = {}
            result.details['verification_time'] = round(verification_time, 3)
            
            # Log verification attempt
            logger.info(
                f"Domain verification completed - Domain: {domain}, "
                f"Method: {method}, Success: {result.success}, "
                f"Time: {verification_time:.3f}s"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Domain verification error for {domain}: {e}")
            return VerificationResult(
                success=False,
                method=method,
                domain=domain,
                message="Verification failed due to system error",
                error=str(e),
                timestamp=datetime.utcnow().isoformat()
            )
    
    def _verify_with_retries(self, domain: str, method: str, token: str) -> VerificationResult:
        """Perform verification with retry logic"""
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                # Perform verification
                result = self.verification_methods[method](domain, token)
                
                # If successful, return immediately
                if result.success:
                    if result.details is None:
                        result.details = {}
                    result.details['attempts'] = attempt + 1
                    return result
                
                # If this is the last attempt, return the failure
                if attempt == self.max_retries - 1:
                    if result.details is None:
                        result.details = {}
                    result.details['attempts'] = attempt + 1
                    return result
                
                # Store error for potential retry
                last_error = result.error
                
                # Wait before retry (exponential backoff)
                if attempt < len(self.retry_delays):
                    time.sleep(self.retry_delays[attempt])
                
            except Exception as e:
                last_error = str(e)
                if attempt == self.max_retries - 1:
                    # Last attempt failed
                    return VerificationResult(
                        success=False,
                        method=method,
                        domain=domain,
                        message=f"Verification failed after {self.max_retries} attempts",
                        error=last_error,
                        timestamp=datetime.utcnow().isoformat(),
                        details={'attempts': attempt + 1}
                    )
                
                # Wait before retry
                if attempt < len(self.retry_delays):
                    time.sleep(self.retry_delays[attempt])
        
        # Should not reach here, but safety fallback
        return VerificationResult(
            success=False,
            method=method,
            domain=domain,
            message="Verification failed",
            error=last_error or "Unknown error",
            timestamp=datetime.utcnow().isoformat()
        )
    
    def _verify_dns_record(self, domain: str, token: str) -> VerificationResult:
        """Verify domain ownership via DNS TXT record"""
        try:
            # Configure DNS resolver
            resolver = dns.resolver.Resolver()
            resolver.timeout = self.dns_timeout
            resolver.lifetime = self.dns_lifetime
            
            # Look for TXT record
            record_name = f'_traffic-interceptor.{domain}'
            expected_value = f'traffic-interceptor-verification={token}'
            
            try:
                txt_records = resolver.resolve(record_name, 'TXT')
                
                # Check each TXT record
                for record in txt_records:
                    record_value = record.to_text().strip('"')
                    
                    if record_value == expected_value:
                        return VerificationResult(
                            success=True,
                            method='dns',
                            domain=domain,
                            message='DNS verification successful',
                            token=token,
                            timestamp=datetime.utcnow().isoformat(),
                            details={
                                'record_name': record_name,
                                'record_value': record_value
                            }
                        )
                
                # Record found but value doesn't match
                found_records = [r.to_text().strip('"') for r in txt_records]
                return VerificationResult(
                    success=False,
                    method='dns',
                    domain=domain,
                    message='DNS TXT record found but token mismatch',
                    token=token,
                    error='Token mismatch',
                    instruction=f'Update TXT record value to: {expected_value}',
                    timestamp=datetime.utcnow().isoformat(),
                    details={
                        'record_name': record_name,
                        'expected': expected_value,
                        'found': found_records
                    }
                )
                
            except dns.resolver.NXDOMAIN:
                return VerificationResult(
                    success=False,
                    method='dns',
                    domain=domain,
                    message='DNS TXT record not found',
                    token=token,
                    error='Record not found',
                    instruction=f'Add TXT record: {record_name} = {expected_value}',
                    timestamp=datetime.utcnow().isoformat(),
                    details={
                        'record_name': record_name,
                        'expected': expected_value
                    }
                )
                
        except Exception as e:
            return VerificationResult(
                success=False,
                method='dns',
                domain=domain,
                message='DNS verification failed',
                token=token,
                error=f'DNS lookup error: {str(e)}',
                timestamp=datetime.utcnow().isoformat()
            )
    
    def _verify_html_file(self, domain: str, token: str) -> VerificationResult:
        """Verify domain ownership via HTML file upload"""
        file_path = '/traffic-interceptor-verification.html'
        
        # Try both HTTPS and HTTP
        for protocol in ['https', 'http']:
            try:
                url = f'{protocol}://{domain}{file_path}'
                
                response = requests.get(
                    url,
                    timeout=self.verification_timeout,
                    verify=False,
                    headers={'User-Agent': self.user_agent}
                )
                
                if response.status_code == 200:
                    content = response.text.strip()
                    
                    if content == token:
                        return VerificationResult(
                            success=True,
                            method='html',
                            domain=domain,
                            message='HTML file verification successful',
                            token=token,
                            timestamp=datetime.utcnow().isoformat(),
                            details={
                                'url': url,
                                'protocol': protocol,
                                'status_code': response.status_code
                            }
                        )
                    else:
                        return VerificationResult(
                            success=False,
                            method='html',
                            domain=domain,
                            message='HTML file content mismatch',
                            token=token,
                            error='Content mismatch',
                            instruction=f'Update file content to exactly: {token}',
                            timestamp=datetime.utcnow().isoformat(),
                            details={
                                'url': url,
                                'expected': token,
                                'found': content[:100] + '...' if len(content) > 100 else content
                            }
                        )
                        
            except requests.RequestException:
                continue  # Try next protocol
        
        # Neither protocol worked
        return VerificationResult(
            success=False,
            method='html',
            domain=domain,
            message='HTML verification file not accessible',
            token=token,
            error='File not accessible',
            instruction=f'Upload file with content "{token}" to {domain}{file_path}',
            timestamp=datetime.utcnow().isoformat(),
            details={
                'file_path': file_path,
                'expected_content': token
            }
        )
    
    def _verify_meta_tag(self, domain: str, token: str) -> VerificationResult:
        """Verify domain ownership via HTML meta tag"""
        expected_tag = f'<meta name="traffic-interceptor-verification" content="{token}"'
        
        # Try both HTTPS and HTTP
        for protocol in ['https', 'http']:
            try:
                url = f'{protocol}://{domain}/'
                
                response = requests.get(
                    url,
                    timeout=self.verification_timeout,
                    verify=False,
                    headers={'User-Agent': self.user_agent}
                )
                
                if response.status_code == 200:
                    content = response.text.lower()
                    
                    # Check for meta tag (case insensitive)
                    if expected_tag.lower() in content:
                        return VerificationResult(
                            success=True,
                            method='meta',
                            domain=domain,
                            message='Meta tag verification successful',
                            token=token,
                            timestamp=datetime.utcnow().isoformat(),
                            details={
                                'url': url,
                                'protocol': protocol,
                                'status_code': response.status_code
                            }
                        )
                        
            except requests.RequestException:
                continue  # Try next protocol
        
        # Neither protocol worked or tag not found
        return VerificationResult(
            success=False,
            method='meta',
            domain=domain,
            message='Meta tag not found on homepage',
            token=token,
            error='Meta tag not found',
            instruction=f'Add to <head> section: {expected_tag} />',
            timestamp=datetime.utcnow().isoformat(),
            details={
                'expected_tag': expected_tag + ' />',
                'location': '<head> section of homepage'
            }
        )
    
    def _verify_cname_record(self, domain: str, token: str) -> VerificationResult:
        """Verify domain ownership via CNAME record"""
        try:
            # Configure DNS resolver
            resolver = dns.resolver.Resolver()
            resolver.timeout = self.dns_timeout
            resolver.lifetime = self.dns_lifetime
            
            # Look for CNAME record
            record_name = f'verify.{domain}'
            expected_target = f'{token}.traffic-interceptor.com'
            
            try:
                cname_records = resolver.resolve(record_name, 'CNAME')
                
                # Check each CNAME record
                for record in cname_records:
                    target = record.target.to_text().rstrip('.')
                    
                    if target == expected_target:
                        return VerificationResult(
                            success=True,
                            method='cname',
                            domain=domain,
                            message='CNAME verification successful',
                            token=token,
                            timestamp=datetime.utcnow().isoformat(),
                            details={
                                'record_name': record_name,
                                'target': target
                            }
                        )
                
                # Record found but target doesn't match
                found_targets = [r.target.to_text().rstrip('.') for r in cname_records]
                return VerificationResult(
                    success=False,
                    method='cname',
                    domain=domain,
                    message='CNAME record found but target mismatch',
                    token=token,
                    error='Target mismatch',
                    instruction=f'Update CNAME target to: {expected_target}',
                    timestamp=datetime.utcnow().isoformat(),
                    details={
                        'record_name': record_name,
                        'expected': expected_target,
                        'found': found_targets
                    }
                )
                
            except dns.resolver.NXDOMAIN:
                return VerificationResult(
                    success=False,
                    method='cname',
                    domain=domain,
                    message='CNAME record not found',
                    token=token,
                    error='Record not found',
                    instruction=f'Add CNAME record: {record_name} -> {expected_target}',
                    timestamp=datetime.utcnow().isoformat(),
                    details={
                        'record_name': record_name,
                        'expected_target': expected_target
                    }
                )
                
        except Exception as e:
            return VerificationResult(
                success=False,
                method='cname',
                domain=domain,
                message='CNAME verification failed',
                token=token,
                error=f'DNS lookup error: {str(e)}',
                timestamp=datetime.utcnow().isoformat()
            )
    
    # ==================== VERIFICATION INSTRUCTIONS ====================
    
    def get_verification_instructions(self, domain: str, method: str, token: str) -> Dict:
        """
        Get detailed step-by-step verification instructions
        
        Args:
            domain: Domain name being verified
            method: Verification method
            token: Verification token
            
        Returns:
            Dictionary with detailed instructions
        """
        instructions = {
            'dns': {
                'title': 'DNS TXT Record Verification',
                'description': 'Add a TXT record to your DNS settings to verify domain ownership.',
                'difficulty': 'Medium',
                'time_estimate': '5-30 minutes + DNS propagation (up to 24 hours)',
                'steps': [
                    'Log in to your DNS provider (e.g., Cloudflare, Route53, GoDaddy, etc.)',
                    f'Navigate to the DNS management section for {domain}',
                    'Add a new TXT record with these details:',
                    f'  • Name/Host: _traffic-interceptor.{domain}',
                    f'  • Type: TXT',
                    f'  • Value: traffic-interceptor-verification={token}',
                    f'  • TTL: 300 (5 minutes) or default',
                    'Save the record',
                    'Wait for DNS propagation (usually 5-30 minutes, can take up to 24 hours)',
                    'Return here and click "Verify Domain" to complete verification'
                ],
                'tips': [
                    'DNS changes can take time to propagate worldwide',
                    'Some providers may require the full record name',
                    'You can test DNS propagation using online DNS checker tools',
                    'The record can be removed after successful verification'
                ],
                'troubleshooting': [
                    'If verification fails, wait longer for DNS propagation',
                    'Check that the record name and value are exactly as specified',
                    'Some DNS providers require different syntax for subdomains',
                    'Contact your DNS provider if you need help adding TXT records'
                ],
                'note': 'This is the most reliable verification method and is recommended for production use.'
            },
            'html': {
                'title': 'HTML File Verification',
                'description': 'Upload a verification file to your website root directory.',
                'difficulty': 'Easy',
                'time_estimate': '2-5 minutes',
                'steps': [
                    'Create a new file named: traffic-interceptor-verification.html',
                    f'Add this exact content to the file: {token}',
                    'Upload the file to your website root directory',
                    f'Ensure the file is accessible at: https://{domain}/traffic-interceptor-verification.html',
                    'Test the URL in your browser to confirm it shows the token',
                    'Return here and click "Verify Domain" to complete verification'
                ],
                'tips': [
                    'The file must be accessible via both HTTP and HTTPS if available',
                    'Make sure there are no extra spaces or characters in the file',
                    'The file should return the token as plain text, not HTML',
                    'Some web servers may require specific file permissions'
                ],
                'troubleshooting': [
                    'Check that the file is in the correct directory (website root)',
                    'Verify the file name is exactly: traffic-interceptor-verification.html',
                    'Ensure the file contains only the token, no extra content',
                    'Check your web server configuration allows access to .html files'
                ],
                'note': 'This method works well if you have direct access to your website files.'
            },
            'meta': {
                'title': 'HTML Meta Tag Verification',
                'description': 'Add a meta tag to your website homepage.',
                'difficulty': 'Easy',
                'time_estimate': '2-5 minutes',
                'steps': [
                    'Access your website homepage HTML code',
                    'Locate the <head> section of your HTML',
                    'Add this meta tag inside the <head> section:',
                    f'  <meta name="traffic-interceptor-verification" content="{token}" />',
                    'Save and publish your changes',
                    f'Verify the tag appears when you view source of https://{domain}/',
                    'Return here and click "Verify Domain" to complete verification'
                ],
                'tips': [
                    'The meta tag must be in the <head> section, not the <body>',
                    'The tag should be on your homepage (root URL)',
                    'Make sure the content value exactly matches the provided token',
                    'The tag can be removed after successful verification'
                ],
                'troubleshooting': [
                    'Check that the meta tag is in the <head> section',
                    'Verify the tag appears when you view page source',
                    'Ensure there are no typos in the tag name or content',
                    'Clear your browser cache and try again if needed'
                ],
                'note': 'This method is convenient if you can edit your homepage HTML.'
            },
            'cname': {
                'title': 'CNAME Record Verification',
                'description': 'Add a CNAME record to your DNS settings.',
                'difficulty': 'Medium',
                'time_estimate': '5-15 minutes + DNS propagation',
                'steps': [
                    'Log in to your DNS provider',
                    f'Navigate to the DNS management section for {domain}',
                    'Add a new CNAME record with these details:',
                    f'  • Name/Host: verify.{domain}',
                    f'  • Type: CNAME',
                    f'  • Target/Value: {token}.traffic-interceptor.com',
                    f'  • TTL: 300 (5 minutes) or default',
                    'Save the record',
                    'Wait for DNS propagation (usually 5-15 minutes)',
                    'Return here and click "Verify Domain" to complete verification'
                ],
                'tips': [
                    'CNAME records typically propagate faster than TXT records',
                    'Some providers may automatically add the domain to the name field',
                    'The target must point exactly to the provided subdomain',
                    'You can test CNAME resolution using DNS lookup tools'
                ],
                'troubleshooting': [
                    'Verify the CNAME name is exactly: verify.{domain}',
                    'Check that the target points to the correct subdomain',
                    'Wait longer for DNS propagation if verification fails',
                    'Some DNS providers have different CNAME syntax requirements'
                ],
                'note': 'CNAME records often propagate faster than TXT records.'
            }
        }
        
        default_instruction = {
            'title': 'Unknown Verification Method',
            'description': 'Please select a valid verification method.',
            'steps': ['Choose from: DNS, HTML File, Meta Tag, or CNAME'],
            'note': f'Supported methods: {", ".join(self.supported_methods)}'
        }
        
        instruction = instructions.get(method, default_instruction)
        
        # Add common information
        instruction.update({
            'domain': domain,
            'method': method,
            'token': token,
            'timestamp': datetime.utcnow().isoformat(),
            'support': {
                'documentation': '/docs/domain-verification',
                'contact': 'support@traffic-interceptor.com',
                'faq': '/faq/domain-verification'
            }
        })
        
        return instruction

# ==================== ASYNC VERIFICATION (OPTIONAL) ====================

class AsyncDomainVerificationService(DomainVerificationService):
    """
    Async version of domain verification service for high-performance scenarios
    """
    
    async def verify_domain_ownership_async(self, domain: str, method: str, token: str) -> VerificationResult:
        """Async version of domain verification"""
        # Implementation would use aiohttp and aiodns for async operations
        # This is a placeholder for future async implementation
        return await asyncio.get_event_loop().run_in_executor(
            None, self.verify_domain_ownership, domain, method, token
        )

# ==================== SERVICE INSTANCES ====================

# Create singleton instance for use throughout the application
domain_verification_service = DomainVerificationService()
async_domain_verification_service = AsyncDomainVerificationService()

# ==================== UTILITY FUNCTIONS ====================

def verify_domain(domain: str, method: str = 'dns', token: Optional[str] = None) -> VerificationResult:
    """
    Convenience function for quick domain verification
    
    Args:
        domain: Domain to verify
        method: Verification method to use
        token: Verification token (generates new one if not provided)
        
    Returns:
        VerificationResult object
    """
    if token is None:
        token = domain_verification_service.generate_verification_token(domain)
    
    return domain_verification_service.verify_domain_ownership(domain, method, token)

def get_domain_instructions(domain: str, method: str = 'dns', token: Optional[str] = None) -> Dict:
    """
    Convenience function to get verification instructions
    
    Args:
        domain: Domain to get instructions for
        method: Verification method
        token: Verification token (generates new one if not provided)
        
    Returns:
        Dictionary with instructions
    """
    if token is None:
        token = domain_verification_service.generate_verification_token(domain)
    
    return domain_verification_service.get_verification_instructions(domain, method, token)

# ==================== TESTING UTILITIES ====================

def test_verification_methods(domain: str) -> Dict[str, VerificationResult]:
    """
    Test all verification methods for a domain (for debugging)
    
    Args:
        domain: Domain to test
        
    Returns:
        Dictionary mapping method names to verification results
    """
    token = domain_verification_service.generate_verification_token(domain)
    results = {}
    
    for method in domain_verification_service.supported_methods:
        try:
            results[method] = domain_verification_service.verify_domain_ownership(domain, method, token)
        except Exception as e:
            results[method] = VerificationResult(
                success=False,
                method=method,
                domain=domain,
                message='Test failed',
                error=str(e),
                timestamp=datetime.utcnow().isoformat()
            )
    
    return results

if __name__ == '__main__':
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python domain_verification_production.py <domain> [method] [token]")
        sys.exit(1)
    
    domain = sys.argv[1]
    method = sys.argv[2] if len(sys.argv) > 2 else 'dns'
    token = sys.argv[3] if len(sys.argv) > 3 else None
    
    if token is None:
        token = domain_verification_service.generate_verification_token(domain)
        print(f"Generated token: {token}")
    
    print(f"Verifying domain: {domain} using method: {method}")
    result = verify_domain(domain, method, token)
    
    print(f"Success: {result.success}")
    print(f"Message: {result.message}")
    if result.error:
        print(f"Error: {result.error}")
    if result.instruction:
        print(f"Instruction: {result.instruction}")
