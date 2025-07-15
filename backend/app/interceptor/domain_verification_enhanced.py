"""
Enhanced Domain Verification Service for Phase 2
Handles domain ownership verification using multiple methods
"""

import dns.resolver
import requests
import time
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlparse

class DomainVerificationService:
    """Service for verifying domain ownership"""
    
    def __init__(self):
        self.verification_methods = {
            'dns': self._verify_dns_record,
            'html': self._verify_html_file,
            'meta': self._verify_meta_tag,
            'cname': self._verify_cname_record
        }
    
    def generate_verification_token(self, domain: str) -> str:
        """Generate a unique verification token for a domain"""
        timestamp = str(int(time.time()))
        random_string = secrets.token_hex(16)
        content = f"{domain}-{timestamp}-{random_string}"
        return hashlib.sha256(content.encode()).hexdigest()[:32]
    
    def verify_domain_ownership(self, domain: str, method: str, token: str) -> Dict:
        """Verify domain ownership using specified method"""
        try:
            # Normalize domain
            domain = domain.lower().strip()
            if domain.startswith(('http://', 'https://')):
                domain = urlparse(domain).netloc
            
            # Check if verification method is supported
            if method not in self.verification_methods:
                return {
                    'success': False,
                    'error': f'Unsupported verification method: {method}',
                    'method': method
                }
            
            # Perform verification
            result = self.verification_methods[method](domain, token)
            
            # Add timestamp and method info
            result.update({
                'domain': domain,
                'method': method,
                'timestamp': datetime.utcnow().isoformat(),
                'token': token
            })
            
            return result
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Verification failed: {str(e)}',
                'domain': domain,
                'method': method,
                'timestamp': datetime.utcnow().isoformat()
            }
    
    def _verify_dns_record(self, domain: str, token: str) -> Dict:
        """Verify domain via DNS TXT record"""
        try:
            # Look for TXT record with verification token
            txt_records = dns.resolver.resolve(f'_traffic-interceptor.{domain}', 'TXT')
            
            for record in txt_records:
                txt_content = record.to_text().strip('"')
                if txt_content == f'traffic-interceptor-verification={token}':
                    return {
                        'success': True,
                        'message': 'DNS verification successful',
                        'record_found': txt_content
                    }
            
            return {
                'success': False,
                'error': 'DNS TXT record not found or token mismatch',
                'expected': f'traffic-interceptor-verification={token}',
                'instruction': f'Add TXT record to _traffic-interceptor.{domain}'
            }
            
        except dns.resolver.NXDOMAIN:
            return {
                'success': False,
                'error': 'Domain not found in DNS',
                'instruction': f'Add TXT record to _traffic-interceptor.{domain}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'DNS lookup failed: {str(e)}'
            }
    
    def _verify_html_file(self, domain: str, token: str) -> Dict:
        """Verify domain via HTML file upload"""
        try:
            # Try both HTTP and HTTPS
            for protocol in ['https', 'http']:
                try:
                    url = f'{protocol}://{domain}/traffic-interceptor-verification.html'
                    response = requests.get(url, timeout=10, verify=False)
                    
                    if response.status_code == 200:
                        content = response.text.strip()
                        if content == token:
                            return {
                                'success': True,
                                'message': 'HTML file verification successful',
                                'url': url,
                                'protocol': protocol
                            }
                        else:
                            return {
                                'success': False,
                                'error': 'HTML file content mismatch',
                                'expected': token,
                                'found': content[:100] + '...' if len(content) > 100 else content
                            }
                except requests.RequestException:
                    continue
            
            return {
                'success': False,
                'error': 'HTML verification file not accessible',
                'instruction': f'Upload file with content "{token}" to http(s)://{domain}/traffic-interceptor-verification.html'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'HTML verification failed: {str(e)}'
            }
    
    def _verify_meta_tag(self, domain: str, token: str) -> Dict:
        """Verify domain via HTML meta tag"""
        try:
            # Try both HTTP and HTTPS
            for protocol in ['https', 'http']:
                try:
                    url = f'{protocol}://{domain}/'
                    response = requests.get(url, timeout=10, verify=False)
                    
                    if response.status_code == 200:
                        content = response.text.lower()
                        expected_tag = f'<meta name="traffic-interceptor-verification" content="{token}"'
                        
                        if expected_tag.lower() in content:
                            return {
                                'success': True,
                                'message': 'Meta tag verification successful',
                                'url': url,
                                'protocol': protocol
                            }
                except requests.RequestException:
                    continue
            
            return {
                'success': False,
                'error': 'Meta tag not found',
                'instruction': f'Add meta tag: <meta name="traffic-interceptor-verification" content="{token}" /> to the <head> section'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': f'Meta tag verification failed: {str(e)}'
            }
    
    def _verify_cname_record(self, domain: str, token: str) -> Dict:
        """Verify domain via CNAME record"""
        try:
            # Look for CNAME record
            cname_records = dns.resolver.resolve(f'verify.{domain}', 'CNAME')
            
            for record in cname_records:
                cname_target = record.target.to_text().rstrip('.')
                expected_cname = f'{token}.traffic-interceptor.com'
                
                if cname_target == expected_cname:
                    return {
                        'success': True,
                        'message': 'CNAME verification successful',
                        'record_found': cname_target
                    }
            
            return {
                'success': False,
                'error': 'CNAME record not found or target mismatch',
                'expected': f'{token}.traffic-interceptor.com',
                'instruction': f'Add CNAME record for verify.{domain}'
            }
            
        except dns.resolver.NXDOMAIN:
            return {
                'success': False,
                'error': 'CNAME record not found',
                'instruction': f'Add CNAME record for verify.{domain} pointing to {token}.traffic-interceptor.com'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'CNAME lookup failed: {str(e)}'
            }
    
    def get_verification_instructions(self, domain: str, method: str, token: str) -> Dict:
        """Get detailed instructions for domain verification"""
        instructions = {
            'dns': {
                'title': 'DNS TXT Record Verification',
                'steps': [
                    'Log in to your DNS provider (e.g., Cloudflare, Route53, etc.)',
                    f'Add a TXT record for: _traffic-interceptor.{domain}',
                    f'Set the value to: traffic-interceptor-verification={token}',
                    'Save the record and wait for DNS propagation (up to 24 hours)',
                    'Click "Verify" to complete the process'
                ],
                'note': 'DNS changes may take up to 24 hours to propagate worldwide'
            },
            'html': {
                'title': 'HTML File Verification',
                'steps': [
                    f'Create a file named: traffic-interceptor-verification.html',
                    f'Add this content to the file: {token}',
                    f'Upload the file to: http(s)://{domain}/traffic-interceptor-verification.html',
                    'Ensure the file is publicly accessible',
                    'Click "Verify" to complete the process'
                ],
                'note': 'The file must be accessible via both HTTP and HTTPS'
            },
            'meta': {
                'title': 'HTML Meta Tag Verification',
                'steps': [
                    f'Add this meta tag to the <head> section of your homepage:',
                    f'<meta name="traffic-interceptor-verification" content="{token}" />',
                    'Save and publish your changes',
                    f'Ensure the tag is visible at: http(s)://{domain}/',
                    'Click "Verify" to complete the process'
                ],
                'note': 'The meta tag must be in the <head> section of your homepage'
            },
            'cname': {
                'title': 'CNAME Record Verification',
                'steps': [
                    'Log in to your DNS provider',
                    f'Add a CNAME record for: verify.{domain}',
                    f'Point it to: {token}.traffic-interceptor.com',
                    'Save the record and wait for DNS propagation',
                    'Click "Verify" to complete the process'
                ],
                'note': 'CNAME records typically propagate faster than TXT records'
            }
        }
        
        return instructions.get(method, {
            'title': 'Unknown Verification Method',
            'steps': ['Please select a valid verification method'],
            'note': 'Supported methods: DNS, HTML, Meta Tag, CNAME'
        })
    
    def check_domain_ssl(self, domain: str) -> Dict:
        """Check SSL certificate status for domain"""
        try:
            import ssl
            import socket
            
            # Create SSL context
            context = ssl.create_default_context()
            
            # Connect to domain
            with socket.create_connection((domain, 443), timeout=10) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    
                    # Extract certificate info
                    subject = dict(x[0] for x in cert['subject'])
                    issuer = dict(x[0] for x in cert['issuer'])
                    
                    # Check expiration
                    not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    days_until_expiry = (not_after - datetime.utcnow()).days
                    
                    return {
                        'ssl_enabled': True,
                        'common_name': subject.get('commonName', domain),
                        'issuer': issuer.get('organizationName', 'Unknown'),
                        'expires_on': not_after.isoformat(),
                        'days_until_expiry': days_until_expiry,
                        'is_valid': days_until_expiry > 0
                    }
                    
        except Exception as e:
            return {
                'ssl_enabled': False,
                'error': str(e)
            }
    
    def validate_domain_access(self, domain: str) -> Dict:
        """Validate that domain is accessible and get basic info"""
        try:
            results = {}
            
            # Test HTTP and HTTPS access
            for protocol in ['https', 'http']:
                try:
                    url = f'{protocol}://{domain}'
                    response = requests.get(url, timeout=10, allow_redirects=True)
                    
                    results[protocol] = {
                        'accessible': True,
                        'status_code': response.status_code,
                        'response_time': response.elapsed.total_seconds(),
                        'final_url': response.url,
                        'redirected': response.url != url
                    }
                    
                except requests.RequestException as e:
                    results[protocol] = {
                        'accessible': False,
                        'error': str(e)
                    }
            
            # Get SSL info if HTTPS is accessible
            if results.get('https', {}).get('accessible'):
                results['ssl'] = self.check_domain_ssl(domain)
            
            return {
                'success': True,
                'domain': domain,
                'access_results': results,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'domain': domain,
                'timestamp': datetime.utcnow().isoformat()
            }

# Create singleton instance
domain_verification_service = DomainVerificationService()
