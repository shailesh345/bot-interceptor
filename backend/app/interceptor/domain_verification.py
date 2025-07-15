# Domain Verification System
import os
import dns.resolver
import requests
import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
from dataclasses import dataclass
from flask import current_app
from app.models import Domain, User
from app import db
import asyncio
import aiohttp
from urllib.parse import urlparse

@dataclass
class VerificationResult:
    success: bool
    method: str
    message: str
    details: Optional[Dict[str, Any]] = None

class DomainVerificationService:
    """
    Service for verifying domain ownership through DNS records and file uploads
    """
    
    def __init__(self):
        self.verification_timeout = 30  # seconds
        self.max_retries = 3
    
    def generate_verification_token(self, domain_name: str, user_id: str) -> str:
        """Generate a unique verification token for a domain"""
        timestamp = str(int(datetime.now().timestamp()))
        data = f"{domain_name}:{user_id}:{timestamp}"
        return hashlib.sha256(data.encode()).hexdigest()[:32]
    
    def get_dns_verification_record(self, domain_name: str, token: str) -> Dict[str, str]:
        """Get DNS TXT record for verification"""
        return {
            'type': 'TXT',
            'name': f'_botinterceptor.{domain_name}',
            'value': f'botinterceptor-verification={token}',
            'ttl': 300
        }
    
    def get_file_verification_info(self, domain_name: str, token: str) -> Dict[str, str]:
        """Get file verification information"""
        filename = f'botinterceptor-{token}.txt'
        content = f'botinterceptor-domain-verification={token}'
        return {
            'filename': filename,
            'content': content,
            'path': f'http://{domain_name}/.well-known/{filename}',
            'alternative_path': f'http://{domain_name}/{filename}'
        }
    
    async def verify_dns_record(self, domain_name: str, expected_token: str) -> VerificationResult:
        """Verify domain ownership via DNS TXT record"""
        try:
            resolver = dns.resolver.Resolver()
            resolver.timeout = self.verification_timeout
            
            # Look for the verification TXT record
            txt_name = f'_botinterceptor.{domain_name}'
            
            try:
                answers = resolver.resolve(txt_name, 'TXT')
                
                for rdata in answers:
                    txt_value = rdata.to_text().strip('\"')
                    
                    # Check if this is our verification record
                    if txt_value == f'botinterceptor-verification={expected_token}':
                        return VerificationResult(
                            success=True,
                            method='dns',
                            message=f'DNS verification successful for {domain_name}',
                            details={
                                'record_name': txt_name,
                                'record_value': txt_value,
                                'verified_at': datetime.now().isoformat()
                            }
                        )
                
                return VerificationResult(
                    success=False,
                    method='dns',
                    message=f'Verification token not found in DNS records for {domain_name}',
                    details={
                        'record_name': txt_name,
                        'expected_token': expected_token,
                        'found_records': [rdata.to_text().strip('\"') for rdata in answers]
                    }
                )
                
            except dns.resolver.NXDOMAIN:
                return VerificationResult(
                    success=False,
                    method='dns',
                    message=f'DNS record not found for {txt_name}',
                    details={'record_name': txt_name}
                )
                
        except Exception as e:
            current_app.logger.error(f"DNS verification error for {domain_name}: {e}")
            return VerificationResult(
                success=False,
                method='dns',
                message=f'DNS verification failed: {str(e)}',
                details={'error': str(e)}
            )
    
    async def verify_file_upload(self, domain_name: str, expected_token: str) -> VerificationResult:
        """Verify domain ownership via file upload"""
        try:
            filename = f'botinterceptor-{expected_token}.txt'
            expected_content = f'botinterceptor-domain-verification={expected_token}'
            
            # Try both HTTP and HTTPS
            protocols = ['https', 'http']
            paths = [f'/.well-known/{filename}', f'/{filename}']
            
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=self.verification_timeout)) as session:
                for protocol in protocols:
                    for path in paths:
                        url = f'{protocol}://{domain_name}{path}'
                        
                        try:
                            async with session.get(url) as response:
                                if response.status == 200:
                                    content = await response.text()
                                    content = content.strip()
                                    
                                    if content == expected_content:
                                        return VerificationResult(
                                            success=True,
                                            method='file',
                                            message=f'File verification successful for {domain_name}',
                                            details={
                                                'verification_url': url,
                                                'verified_at': datetime.now().isoformat()
                                            }
                                        )
                        except Exception as e:
                            current_app.logger.debug(f"File verification attempt failed for {url}: {e}")
                            continue
            
            return VerificationResult(
                success=False,
                method='file',
                message=f'Verification file not found or incorrect content for {domain_name}',
                details={
                    'expected_filename': filename,
                    'expected_content': expected_content,
                    'attempted_urls': [f'{p}://{domain_name}{path}' for p in protocols for path in paths]
                }
            )
            
        except Exception as e:
            current_app.logger.error(f"File verification error for {domain_name}: {e}")
            return VerificationResult(
                success=False,
                method='file',
                message=f'File verification failed: {str(e)}',
                details={'error': str(e)}
            )
    
    async def verify_domain_ownership(self, domain_name: str, method: str, token: str) -> VerificationResult:
        """Verify domain ownership using the specified method"""
        if method == 'dns':
            return await self.verify_dns_record(domain_name, token)
        elif method == 'file':
            return await self.verify_file_upload(domain_name, token)
        else:
            return VerificationResult(
                success=False,
                method=method,
                message=f'Unsupported verification method: {method}'
            )
    
    def update_domain_verification_status(self, domain_id: int, result: VerificationResult) -> bool:
        """Update domain verification status in database"""
        try:
            domain = Domain.query.get(domain_id)
            if not domain:
                return False
            
            if result.success:
                domain.is_verified = True
                domain.status = 'verified'
                domain.verification_token = None  # Clear the token
                domain.updated_at = datetime.now()
            else:
                domain.is_verified = False
                domain.status = 'verification_failed'
                domain.updated_at = datetime.now()
            
            db.session.commit()
            return True
            
        except Exception as e:
            current_app.logger.error(f"Failed to update domain verification status: {e}")
            db.session.rollback()
            return False
    
    def check_domain_health(self, domain_name: str) -> Dict[str, Any]:
        """Check domain health and basic information"""
        try:
            health_info = {
                'domain': domain_name,
                'accessible': False,
                'ssl_enabled': False,
                'response_time': None,
                'status_code': None,
                'server_info': None,
                'checked_at': datetime.now().isoformat()
            }
            
            # Check HTTP and HTTPS accessibility
            protocols = ['https', 'http']
            
            for protocol in protocols:
                url = f'{protocol}://{domain_name}'
                
                try:
                    start_time = datetime.now()
                    response = requests.get(url, timeout=10, allow_redirects=True)
                    end_time = datetime.now()
                    
                    health_info['accessible'] = True
                    health_info['status_code'] = response.status_code
                    health_info['response_time'] = (end_time - start_time).total_seconds()
                    health_info['server_info'] = response.headers.get('Server', 'Unknown')
                    
                    if protocol == 'https':
                        health_info['ssl_enabled'] = True
                    
                    break  # If we get a response, we're done
                    
                except Exception as e:
                    current_app.logger.debug(f"Domain health check failed for {url}: {e}")
                    continue
            
            return health_info
            
        except Exception as e:
            current_app.logger.error(f"Domain health check failed: {e}")
            return {
                'domain': domain_name,
                'accessible': False,
                'error': str(e),
                'checked_at': datetime.now().isoformat()
            }
    
    def get_domain_verification_instructions(self, domain_name: str, method: str, token: str) -> Dict[str, Any]:
        """Get detailed verification instructions for a domain"""
        instructions = {
            'domain': domain_name,
            'method': method,
            'token': token,
            'expires_at': (datetime.now() + timedelta(days=7)).isoformat()
        }
        
        if method == 'dns':
            dns_record = self.get_dns_verification_record(domain_name, token)
            instructions.update({
                'dns_record': dns_record,
                'instructions': [
                    f"1. Log into your DNS provider's control panel",
                    f"2. Create a new TXT record:",
                    f"   - Name: {dns_record['name']}",
                    f"   - Value: {dns_record['value']}",
                    f"   - TTL: {dns_record['ttl']} (or leave default)",
                    f"3. Wait for DNS propagation (usually 5-30 minutes)",
                    f"4. Click 'Verify Domain' to complete verification"
                ]
            })
        
        elif method == 'file':
            file_info = self.get_file_verification_info(domain_name, token)
            instructions.update({
                'file_info': file_info,
                'instructions': [
                    f"1. Create a file named '{file_info['filename']}'",
                    f"2. Add this content to the file:",
                    f"   {file_info['content']}",
                    f"3. Upload the file to one of these locations:",
                    f"   - {file_info['path']}",
                    f"   - {file_info['alternative_path']}",
                    f"4. Make sure the file is publicly accessible",
                    f"5. Click 'Verify Domain' to complete verification"
                ]
            })
        
        return instructions

# Global domain verification service instance
domain_verification_service = DomainVerificationService()
