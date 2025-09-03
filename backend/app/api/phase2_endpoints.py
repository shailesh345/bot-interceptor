"""
Enhanced API endpoints for Phase 2: Domain & Rules Management
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json
from ..models import Domain, InterceptorRule, User, TrafficLog
from ..interceptor.domain_verification_enhanced import domain_verification_service
from ..interceptor.traffic_processor_enhanced import traffic_processor
from .. import db

# Create blueprints
domains_bp = Blueprint('domains', __name__)
rules_bp = Blueprint('rules', __name__)
traffic_bp = Blueprint('traffic', __name__)

# ================== DOMAIN MANAGEMENT ENDPOINTS ==================

@domains_bp.route('/domains', methods=['GET'])
@jwt_required()
def get_domains():
    """Get all domains for current user"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domains = Domain.query.filter_by(tenant_id=user.tenant_id).all()
        return jsonify({
            'domains': [domain.to_dict() for domain in domains]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains', methods=['POST'])
@jwt_required()
def create_domain():
    """Create a new domain"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        if not data or 'domain_name' not in data:
            return jsonify({'error': 'Domain name is required'}), 400
        
        domain_name = data['domain_name'].strip().lower()
        
        # Check if domain already exists
        existing_domain = Domain.query.filter_by(domain_name=domain_name).first()
        if existing_domain:
            return jsonify({'error': 'Domain already exists'}), 409
        
        # Create new domain
        domain = Domain(
            domain_name=domain_name,
            tenant_id=user.tenant_id or 1,  # Default to tenant 1 if None
            ssl_enabled=data.get('ssl_enabled', False),
            cdn_enabled=data.get('cdn_enabled', False),
            traffic_enabled=data.get('traffic_enabled', True),
            verification_method=data.get('verification_method', 'dns'),
            status='pending',
            created_at=datetime.utcnow()
        )
        
        db.session.add(domain)
        db.session.commit()
        
        return jsonify({
            'message': 'Domain created successfully',
            'domain': domain.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating domain: {str(e)}")
        current_app.logger.error(f"User tenant_id: {user.tenant_id}")
        current_app.logger.error(f"Request data: {data}")
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>', methods=['GET'])
@jwt_required()
def get_domain(domain_id):
    """Get a specific domain"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        return jsonify({'domain': domain.to_dict()})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>', methods=['PUT'])
@jwt_required()
def update_domain(domain_id):
    """Update domain settings"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'ssl_enabled' in data:
            domain.ssl_enabled = data['ssl_enabled']
        if 'cdn_enabled' in data:
            domain.cdn_enabled = data['cdn_enabled']
        if 'traffic_enabled' in data:
            domain.traffic_enabled = data['traffic_enabled']
        if 'verification_method' in data:
            domain.verification_method = data['verification_method']
        
        domain.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'domain': domain.to_dict()})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>', methods=['DELETE'])
@jwt_required()
def delete_domain(domain_id):
    """Delete a domain"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        db.session.delete(domain)
        db.session.commit()
        
        return jsonify({'message': 'Domain deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>/verify-simple', methods=['POST'])
@jwt_required()
def verify_domain(domain_id):
    """Verify domain ownership"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        if domain.is_verified:
            return jsonify({
                'success': True,
                'message': 'Domain already verified',
                'domain': domain.to_dict()
            }), 200
        
        data = request.get_json() or {}
        method = data.get('method', 'dns')
        
        if method not in ['dns', 'file', 'html_file', 'meta_tag']:
            return jsonify({'error': 'Invalid verification method'}), 400
        
        # For now, simulate verification process
        # In a real implementation, you would:
        # 1. Check DNS records for DNS verification
        # 2. Check file upload for file verification
        # 3. Check meta tag for HTML verification
        
        # Mock verification - in development, automatically verify for demo
        domain.is_verified = True
        domain.status = 'verified'
        domain.verified_at = datetime.utcnow()
        domain.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Domain verified successfully!',
            'method': method,
            'domain': domain.to_dict(),
            'details': {
                'verification_method': method,
                'verified_at': domain.verified_at.isoformat() if domain.verified_at else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error verifying domain {domain_id}: {str(e)}")
        return jsonify({'error': f'Verification failed: {str(e)}'}), 500

# ================== INTERCEPTOR RULES MANAGEMENT ==================

@rules_bp.route('/rules', methods=['GET'])
@jwt_required()
def get_rules():
    """Get all rules for current user"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        rules = InterceptorRule.query.filter_by(tenant_id=user.tenant_id).all()
        return jsonify({
            'rules': [rule.to_dict() for rule in rules]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@rules_bp.route('/rules', methods=['POST'])
@jwt_required()
def create_rule():
    """Create a new interceptor rule"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['domain_id', 'rule_type', 'conditions']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Verify domain ownership
        domain = Domain.query.filter_by(id=data['domain_id'], tenant_id=user.tenant_id).first()
        if not domain:
            return jsonify({'error': 'Domain not found or not owned by user'}), 404
        
        # Create new rule
        rule = InterceptorRule(
            name=data.get('name', f"Rule {data['rule_type']}"),
            description=data.get('description', ''),
            tenant_id=user.tenant_id,
            domain_id=data['domain_id'],
            user_id=user.id,
            rule_type=data['rule_type'],
            conditions=data['conditions'],
            actions=data.get('actions', []),
            priority=data.get('priority', 100),
            is_active=data.get('is_active', data.get('enabled', True)),
            created_at=datetime.utcnow()
        )
        
        db.session.add(rule)
        db.session.commit()
        
        return jsonify({
            'message': 'Rule created successfully',
            'rule': rule.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>/verify', methods=['POST'])
@jwt_required()
def verify_domain_ownership(domain_id):
    """Verify domain ownership using selected method"""
    try:
        user_uuid = get_jwt_identity()
        current_app.logger.info(f"Domain verification attempt - Domain ID: {domain_id}, User UUID: {user_uuid}")
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        data = request.get_json()
        method = data.get('method', 'dns')  # dns, html_file, meta_tag
        
        # Generate verification token if missing
        if not domain.verification_token:
            import secrets
            domain.verification_token = secrets.token_hex(16)
            db.session.commit()
            current_app.logger.info(f"Generated new verification token for domain {domain.domain_name}")
        
        # Handle case where verification_token might be None
        token_preview = domain.verification_token[:8] + "..." if domain.verification_token else "None"
        current_app.logger.info(f"Domain verification - Method: {method}, Domain: {domain.domain_name}, Token: {token_preview}")
        
        # Use real verification functions
        verification_result = None
        
        try:
            if method == 'dns':
                current_app.logger.info(f"Attempting DNS verification for {domain.domain_name}")
                verification_result = verify_dns_record(domain.domain_name, domain.verification_token)
            elif method == 'html_file':
                current_app.logger.info(f"Attempting HTML file verification for {domain.domain_name}")
                verification_result = verify_html_file(domain.domain_name, domain.verification_token)
            elif method == 'meta_tag':
                current_app.logger.info(f"Attempting meta tag verification for {domain.domain_name}")
                verification_result = verify_meta_tag(domain.domain_name, domain.verification_token)
            else:
                return jsonify({'error': 'Invalid verification method'}), 400
            
            current_app.logger.info(f"Verification result: {verification_result}")
            
        except Exception as verification_error:
            current_app.logger.error(f"Verification error: {str(verification_error)}")
            return jsonify({
                'success': False,
                'message': f'Verification failed: {str(verification_error)}',
                'details': {'method': method, 'error': str(verification_error)}
            }), 200
        
        if verification_result and verification_result.get('success'):
            domain.is_verified = True
            domain.status = 'active'
            domain.verified_at = datetime.utcnow()
            domain.verification_method = method
            db.session.commit()
            
            return jsonify({
                'success': True,
                'message': 'Domain verified successfully!',
                'domain': {
                    'id': domain.id,
                    'name': domain.domain_name,
                    'status': domain.status,
                    'is_verified': domain.is_verified,
                    'verified_at': domain.verified_at.isoformat(),
                    'verification_method': method
                },
                'verification_details': verification_result
            })
        else:
            return jsonify({
                'success': False,
                'message': verification_result.get('message', 'Verification failed. Please check your settings and try again.'),
                'details': verification_result
            })
        
    except Exception as e:
        current_app.logger.error(f"Unexpected error in domain verification: {str(e)}")
        import traceback
        current_app.logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

# ================== DOMAIN VERIFICATION ENDPOINTS ==================

@domains_bp.route('/domains/<int:domain_id>/verification', methods=['GET'])
@jwt_required()
def get_domain_verification_info(domain_id):
    """Get domain verification information including TXT record"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        # Generate verification token if not exists
        if not domain.verification_token:
            import secrets
            import hashlib
            timestamp = str(int(datetime.utcnow().timestamp()))
            random_string = secrets.token_hex(16)
            content = f"{domain.domain_name}-{timestamp}-{random_string}"
            domain.verification_token = hashlib.sha256(content.encode()).hexdigest()[:32]
            db.session.commit()
        
        return jsonify({
            'domain': {
                'id': domain.id,
                'name': domain.domain_name,
                'status': domain.status,
                'is_verified': domain.is_verified
            },
            'verification_methods': {
                'dns': {
                    'method': 'DNS TXT Record',
                    'description': 'Add this TXT record to your domain\'s DNS settings',
                    'instructions': [
                        '1. Go to your hosting provider\'s DNS management page (cPanel, Cloudflare, etc.)',
                        '2. Find the DNS Zone Editor or DNS Records section',
                        '3. Add a new TXT record with these exact details:',
                        f'   • Record Type: TXT',
                        f'   • Name/Host: _botinterceptor.{domain.domain_name}',
                        f'   • Value/Content: botinterceptor-verification={domain.verification_token}',
                        f'   • TTL: 300 (or leave default)',
                        '4. Save the DNS record',
                        '5. Wait 5-30 minutes for DNS propagation',
                        '6. Click "Verify Domain" below to complete verification'
                    ],
                    'copy_values': {
                        'record_name': f'_botinterceptor.{domain.domain_name}',
                        'record_value': f'botinterceptor-verification={domain.verification_token}',
                        'record_type': 'TXT',
                        'ttl': '300'
                    }
                },
                'html_file': {
                    'method': 'HTML File Upload',
                    'description': 'Upload a verification file to your website',
                    'file_info': {
                        'filename': f'botinterceptor-{domain.verification_token}.txt',
                        'content': f'botinterceptor-domain-verification={domain.verification_token}',
                        'upload_path': f'/.well-known/botinterceptor-{domain.verification_token}.txt',
                        'verification_url': f'http://{domain.domain_name}/.well-known/botinterceptor-{domain.verification_token}.txt'
                    }
                },
                'meta_tag': {
                    'method': 'HTML Meta Tag',
                    'description': 'Add a meta tag to your website\'s homepage',
                    'tag_info': {
                        'tag': f'<meta name="botinterceptor-domain-verification" content="{domain.verification_token}" />',
                        'placement': 'Add to <head> section of your homepage'
                    }
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>/verification/download', methods=['GET'])
@jwt_required()
def download_verification_file(domain_id):
    """Download verification file for HTML method"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        domain = Domain.query.filter_by(id=domain_id, tenant_id=user.tenant_id).first()
        
        if not domain:
            return jsonify({'error': 'Domain not found'}), 404
        
        if not domain.verification_token:
            return jsonify({'error': 'Verification token not found'}), 404
        
        # Generate file content
        filename = f'botinterceptor-{domain.verification_token}.txt'
        content = f'botinterceptor-domain-verification={domain.verification_token}'
        
        from flask import make_response
        
        response = make_response(content)
        response.headers['Content-Type'] = 'text/plain'
        response.headers['Content-Disposition'] = f'attachment; filename="{filename}"'
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ================== REAL VERIFICATION FUNCTIONS ==================

def verify_dns_record(domain_name, expected_token):
    """Verify domain via DNS TXT record"""
    try:
        import dns.resolver
        
        resolver = dns.resolver.Resolver()
        resolver.timeout = 10
        
        # Look for TXT record with verification token
        txt_name = f'_botinterceptor.{domain_name}'
        
        try:
            answers = resolver.resolve(txt_name, 'TXT')
            
            for record in answers:
                txt_content = record.to_text().strip('"')
                expected_value = f'botinterceptor-verification={expected_token}'
                
                if txt_content == expected_value:
                    return {
                        'success': True,
                        'message': 'DNS verification successful',
                        'method': 'dns',
                        'record_found': txt_content,
                        'record_name': txt_name
                    }
            
            return {
                'success': False,
                'message': 'DNS TXT record not found or token mismatch',
                'method': 'dns',
                'expected_record': txt_name,
                'expected_value': f'botinterceptor-verification={expected_token}',
                'instruction': f'Add TXT record to {txt_name} with value: botinterceptor-verification={expected_token}'
            }
            
        except dns.resolver.NXDOMAIN:
            return {
                'success': False,
                'message': 'Domain not found in DNS',
                'method': 'dns',
                'expected_record': txt_name,
                'instruction': f'Add TXT record to {txt_name} with value: botinterceptor-verification={expected_token}'
            }
        except dns.resolver.NoAnswer:
            return {
                'success': False,
                'message': 'No TXT records found for verification subdomain',
                'method': 'dns',
                'expected_record': txt_name,
                'instruction': f'Add TXT record to {txt_name} with value: botinterceptor-verification={expected_token}'
            }
            
    except ImportError:
        # Fallback if dnspython is not available
        return {
            'success': False,
            'message': 'DNS verification not available (dnspython not installed)',
            'method': 'dns'
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'DNS lookup failed: {str(e)}',
            'method': 'dns'
        }

def verify_html_file(domain_name, expected_token):
    """Verify domain via HTML file upload"""
    try:
        import requests
        
        filename = f'botinterceptor-{expected_token}.txt'
        expected_content = f'botinterceptor-domain-verification={expected_token}'
        
        # Try multiple possible URLs
        possible_urls = [
            f'http://{domain_name}/.well-known/{filename}',
            f'https://{domain_name}/.well-known/{filename}',
            f'http://{domain_name}/{filename}',
            f'https://{domain_name}/{filename}'
        ]
        
        for url in possible_urls:
            try:
                response = requests.get(url, timeout=10, allow_redirects=True)
                
                if response.status_code == 200:
                    content = response.text.strip()
                    
                    if content == expected_content:
                        return {
                            'success': True,
                            'message': 'HTML file verification successful',
                            'method': 'html_file',
                            'verification_url': url,
                            'content_found': content
                        }
                    else:
                        return {
                            'success': False,
                            'message': 'HTML file found but content mismatch',
                            'method': 'html_file',
                            'verification_url': url,
                            'expected_content': expected_content,
                            'actual_content': content[:100] + ('...' if len(content) > 100 else '')
                        }
                        
            except requests.exceptions.RequestException:
                continue  # Try next URL
        
        return {
            'success': False,
            'message': 'HTML verification file not found or not accessible',
            'method': 'html_file',
            'expected_filename': filename,
            'expected_content': expected_content,
            'tried_urls': possible_urls,
            'instruction': f'Upload file {filename} with content: {expected_content}'
        }
        
    except ImportError:
        return {
            'success': False,
            'message': 'HTML file verification not available (requests not installed)',
            'method': 'html_file'
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'HTML file verification failed: {str(e)}',
            'method': 'html_file'
        }

def verify_meta_tag(domain_name, expected_token):
    """Verify domain via HTML meta tag"""
    try:
        import requests
        
        # Try both HTTP and HTTPS
        possible_urls = [
            f'https://{domain_name}',
            f'http://{domain_name}',
            f'https://www.{domain_name}',
            f'http://www.{domain_name}'
        ]
        
        expected_meta_content = expected_token
        
        for url in possible_urls:
            try:
                response = requests.get(url, timeout=10, allow_redirects=True)
                
                if response.status_code == 200:
                    # Simple HTML parsing without BeautifulSoup
                    html_content = response.text.lower()
                    
                    # Look for meta tag with name="botinterceptor-domain-verification"
                    import re
                    meta_pattern = r'<meta[^>]*name=["\']botinterceptor-domain-verification["\'][^>]*content=["\']([^"\']*)["\'][^>]*>'
                    meta_pattern_alt = r'<meta[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']botinterceptor-domain-verification["\'][^>]*>'
                    
                    match = re.search(meta_pattern, html_content) or re.search(meta_pattern_alt, html_content)
                    
                    if match:
                        actual_content = match.group(1).strip()
                        
                        if actual_content == expected_meta_content:
                            return {
                                'success': True,
                                'message': 'Meta tag verification successful',
                                'method': 'meta_tag',
                                'verification_url': url,
                                'meta_content_found': actual_content
                            }
                        else:
                            return {
                                'success': False,
                                'message': 'Meta tag found but content mismatch',
                                'method': 'meta_tag',
                                'verification_url': url,
                                'expected_content': expected_meta_content,
                                'actual_content': actual_content
                            }
                            
            except requests.exceptions.RequestException:
                continue  # Try next URL
        
        return {
            'success': False,
            'message': 'Meta tag not found on homepage',
            'method': 'meta_tag',
            'expected_tag': f'<meta name="botinterceptor-domain-verification" content="{expected_token}" />',
            'tried_urls': possible_urls,
            'instruction': f'Add meta tag to <head> section: <meta name="botinterceptor-domain-verification" content="{expected_token}" />'
        }
        
    except ImportError:
        return {
            'success': False,
            'message': 'Meta tag verification not available (requests not installed)',
            'method': 'meta_tag'
        }
    except Exception as e:
        return {
            'success': False,
            'message': f'Meta tag verification failed: {str(e)}',
            'method': 'meta_tag'
        }

@domains_bp.route('/domains/<int:domain_id>/test-monitoring', methods=['POST'])
@jwt_required()
def test_monitoring_features(domain_id):
    """Test endpoint for monitoring features"""
    try:
        domain = Domain.query.get_or_404(domain_id)
        
        # Check if user has access to this domain
        current_user_uuid = get_jwt_identity()
        current_user = User.query.filter_by(uuid=current_user_uuid).first()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if domain belongs to user's tenant (if multi-tenant) or skip check for now
        # TODO: Implement proper tenant-based domain ownership check
        # For now, allow access if user is authenticated
        
        # Generate test traffic data for monitoring simulation
        test_traffic = {
            'timestamp': datetime.utcnow().isoformat(),
            'ip': '192.168.1.100',
            'user_agent': 'Mozilla/5.0 (Test Browser)',
            'method': 'GET',
            'path': '/test',
            'status_code': 200,
            'response_time': 150,
            'is_bot': False,
            'country': 'US',
            'city': 'Test City',
            'domain_id': domain_id,
            'user_id': current_user.uuid,
            'tenant_id': current_user.tenant_id if hasattr(current_user, 'tenant_id') else 1
        }
        
        # Log the test traffic for monitoring purposes
        current_app.logger.info(f"Test monitoring data generated for domain {domain.domain_name}: {test_traffic}")
        
        return jsonify({
            'success': True,
            'message': f'Test monitoring initiated for domain {domain.domain_name}',
            'domain_id': domain_id,
            'domain_name': domain.domain_name,
            'test_data': test_traffic
        })
            
    except Exception as e:
        current_app.logger.error(f"Error testing monitoring features: {e}")
        return jsonify({'error': str(e)}), 500

@domains_bp.route('/domains/<int:domain_id>/monitoring', methods=['PUT'])
@jwt_required()
def update_domain_monitoring(domain_id):
    """Update domain monitoring configuration"""
    try:
        domain = Domain.query.get_or_404(domain_id)
        
        # Check if user has access to this domain
        current_user_uuid = get_jwt_identity()
        current_user = User.query.filter_by(uuid=current_user_uuid).first()
        if not current_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if domain belongs to user's tenant (if multi-tenant) or skip check for now
        # TODO: Implement proper tenant-based domain ownership check
        # For now, allow access if user is authenticated
        
        data = request.get_json()
        
        # Update monitoring settings
        if 'monitoring_enabled' in data:
            domain.monitoring_enabled = data['monitoring_enabled']
        
        if 'monitoring_interval' in data:
            domain.monitoring_interval = data['monitoring_interval']
        
        if 'monitoring_url' in data:
            domain.monitoring_url = data['monitoring_url']
        
        if 'monitoring_content' in data:
            domain.monitoring_content = data['monitoring_content']
        
        if 'monitoring_headers' in data:
            domain.monitoring_headers = data['monitoring_headers']
        
        # Update security scanning settings
        if 'security_scan_enabled' in data:
            domain.security_scan_enabled = data['security_scan_enabled']
        
        if 'security_scan_interval' in data:
            domain.security_scan_interval = data['security_scan_interval']
        
        # Note: Additional monitoring features can be added to the Domain model as needed
        # For now, we only support the basic monitoring attributes defined in the model
        
        domain.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Monitoring configuration updated successfully',
            'domain': {
                'id': domain.id,
                'domain_name': domain.domain_name,
                'monitoring_enabled': domain.monitoring_enabled,
                'monitoring_interval': domain.monitoring_interval,
                'monitoring_url': domain.monitoring_url,
                'monitoring_content': domain.monitoring_content,
                'monitoring_headers': domain.monitoring_headers,
                'security_scan_enabled': domain.security_scan_enabled,
                'security_scan_interval': domain.security_scan_interval
            }
        })
        
    except Exception as e:
        current_app.logger.error(f"Error updating domain monitoring: {e}")
        return jsonify({'error': str(e)}), 500

# Export blueprints
__all__ = ['domains_bp', 'rules_bp', 'traffic_bp']