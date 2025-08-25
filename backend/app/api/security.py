#!/usr/bin/env python3
"""
Advanced Security & Compliance API
Handles MFA, advanced RBAC, audit logging, and security monitoring
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token, create_refresh_token
from app.models import db, User, Tenant, SecurityLog, AuditLog, Role, UserRole
from datetime import datetime, timedelta
import pyotp
import qrcode
import io
import base64
import hashlib
import secrets
import json
from functools import wraps

security = Blueprint('security', __name__)

# Security configuration
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION = 15  # minutes
SESSION_TIMEOUT = 60  # minutes
PASSWORD_MIN_LENGTH = 12
PASSWORD_REQUIREMENTS = {
    'uppercase': True,
    'lowercase': True,
    'numbers': True,
    'special_chars': True
}

def admin_required(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not user or user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def log_security_event(event_type, user_id, details, severity='info'):
    """Log security events for audit purposes"""
    try:
        log = SecurityLog(
            event_type=event_type,
            user_id=user_id,
            details=details,
            severity=severity,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent'),
            timestamp=datetime.utcnow()
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to log security event: {e}")

def log_audit_event(action, resource_type, resource_id, user_id, details):
    """Log audit events for compliance"""
    try:
        log = AuditLog(
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            user_id=user_id,
            details=details,
            ip_address=request.remote_addr,
            timestamp=datetime.utcnow()
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        current_app.logger.error(f"Failed to log audit event: {e}")

@security.route('/mfa/setup', methods=['POST'])
@jwt_required()
def setup_mfa():
    """Setup MFA for user account"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Generate secret key for TOTP
        secret = pyotp.random_base32()
        user.mfa_secret = secret
        user.mfa_enabled = False  # Will be enabled after verification
        
        # Generate QR code
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="Traffic Interceptor"
        )
        
        # Create QR code image
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        db.session.commit()
        
        log_security_event('mfa_setup_initiated', current_user_id, {
            'mfa_type': 'totp',
            'status': 'pending_verification'
        })
        
        return jsonify({
            'secret': secret,
            'qr_code': f"data:image/png;base64,{qr_base64}",
            'provisioning_uri': provisioning_uri
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@security.route('/mfa/verify', methods=['POST'])
@jwt_required()
def verify_mfa():
    """Verify MFA token and enable MFA"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({'error': 'MFA token required'}), 400
    
    try:
        if not user.mfa_secret:
            return jsonify({'error': 'MFA not set up'}), 400
        
        # Verify TOTP token
        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(token, valid_window=2):  # Allow 2 time windows for clock skew
            user.mfa_enabled = True
            db.session.commit()
            
            log_security_event('mfa_enabled', current_user_id, {
                'mfa_type': 'totp',
                'status': 'enabled'
            })
            
            return jsonify({'message': 'MFA enabled successfully'}), 200
        else:
            log_security_event('mfa_verification_failed', current_user_id, {
                'mfa_type': 'totp',
                'reason': 'invalid_token'
            }, 'warning')
            
            return jsonify({'error': 'Invalid MFA token'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security.route('/mfa/disable', methods=['POST'])
@jwt_required()
def disable_mfa():
    """Disable MFA for user account"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        user.mfa_enabled = False
        user.mfa_secret = None
        db.session.commit()
        
        log_security_event('mfa_disabled', current_user_id, {
            'mfa_type': 'totp',
            'status': 'disabled'
        })
        
        return jsonify({'message': 'MFA disabled successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@security.route('/mfa/validate', methods=['POST'])
def validate_mfa():
    """Validate MFA token during login"""
    data = request.get_json()
    email = data.get('email')
    token = data.get('token')
    
    if not email or not token:
        return jsonify({'error': 'Email and MFA token required'}), 400
    
    try:
        user = User.query.filter_by(email=email).first()
        if not user or not user.mfa_enabled:
            return jsonify({'error': 'Invalid user or MFA not enabled'}), 400
        
        # Verify TOTP token
        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(token, valid_window=2):
            # Generate new tokens
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)
            
            log_security_event('mfa_login_success', user.id, {
                'login_method': 'mfa',
                'ip_address': request.remote_addr
            })
            
            return jsonify({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': user.to_dict()
            }), 200
        else:
            log_security_event('mfa_login_failed', user.id, {
                'login_method': 'mfa',
                'reason': 'invalid_token',
                'ip_address': request.remote_addr
            }, 'warning')
            
            return jsonify({'error': 'Invalid MFA token'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security.route('/password/change', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password with validation"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password required'}), 400
    
    try:
        # Verify current password
        if not user.check_password(current_password):
            log_security_event('password_change_failed', current_user_id, {
                'reason': 'incorrect_current_password',
                'ip_address': request.remote_addr
            }, 'warning')
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Validate new password
        if len(new_password) < PASSWORD_MIN_LENGTH:
            return jsonify({'error': f'Password must be at least {PASSWORD_MIN_LENGTH} characters'}), 400
        
        # Check password requirements
        has_upper = any(c.isupper() for c in new_password)
        has_lower = any(c.islower() for c in new_password)
        has_number = any(c.isdigit() for c in new_password)
        has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in new_password)
        
        if not all([has_upper, has_lower, has_number, has_special]):
            return jsonify({'error': 'Password must contain uppercase, lowercase, numbers, and special characters'}), 400
        
        # Update password
        user.set_password(new_password)
        user.password_changed_at = datetime.utcnow()
        db.session.commit()
        
        log_security_event('password_changed', current_user_id, {
            'ip_address': request.remote_addr,
            'password_strength': 'strong'
        })
        
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@security.route('/roles', methods=['GET'])
@jwt_required()
@admin_required
def get_roles():
    """Get all available roles"""
    try:
        roles = Role.query.all()
        return jsonify({
            'roles': [role.to_dict() for role in roles],
            'total': len(roles)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security.route('/roles', methods=['POST'])
@jwt_required()
@admin_required
def create_role():
    """Create a new role"""
    data = request.get_json()
    
    required_fields = ['name', 'description', 'permissions']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    try:
        role = Role(
            name=data['name'],
            description=data['description'],
            permissions=data['permissions'],
            created_by=get_jwt_identity()
        )
        
        db.session.add(role)
        db.session.commit()
        
        log_audit_event('role_created', 'role', role.id, get_jwt_identity(), {
            'role_name': role.name,
            'permissions': role.permissions
        })
        
        return jsonify({
            'message': 'Role created successfully',
            'role': role.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@security.route('/users/<int:user_id>/roles', methods=['POST'])
@jwt_required()
@admin_required
def assign_role(user_id):
    """Assign role to user"""
    data = request.get_json()
    role_id = data.get('role_id')
    
    if not role_id:
        return jsonify({'error': 'Role ID required'}), 400
    
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        role = Role.query.get(role_id)
        if not role:
            return jsonify({'error': 'Role not found'}), 404
        
        # Check if role already assigned
        existing = UserRole.query.filter_by(user_id=user_id, role_id=role_id).first()
        if existing:
            return jsonify({'error': 'Role already assigned to user'}), 400
        
        user_role = UserRole(user_id=user_id, role_id=role_id)
        db.session.add(user_role)
        db.session.commit()
        
        log_audit_event('role_assigned', 'user_role', user_role.id, get_jwt_identity(), {
            'user_id': user_id,
            'role_id': role_id,
            'role_name': role.name
        })
        
        return jsonify({'message': 'Role assigned successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@security.route('/security/logs', methods=['GET'])
@jwt_required()
@admin_required
def get_security_logs():
    """Get security logs for monitoring"""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Get filter parameters
        event_type = request.args.get('event_type')
        severity = request.args.get('severity')
        user_id = request.args.get('user_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = SecurityLog.query
        
        if event_type:
            query = query.filter(SecurityLog.event_type == event_type)
        if severity:
            query = query.filter(SecurityLog.severity == severity)
        if user_id:
            query = query.filter(SecurityLog.user_id == user_id)
        if start_date:
            query = query.filter(SecurityLog.timestamp >= start_date)
        if end_date:
            query = query.filter(SecurityLog.timestamp <= end_date)
        
        # Order by timestamp descending
        query = query.order_by(SecurityLog.timestamp.desc())
        
        # Paginate
        logs = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': logs.total,
                'pages': logs.pages,
                'has_next': logs.has_next,
                'has_prev': logs.has_prev
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security.route('/audit/logs', methods=['GET'])
@jwt_required()
@admin_required
def get_audit_logs():
    """Get audit logs for compliance"""
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 50, type=int), 100)
        
        # Get filter parameters
        action = request.args.get('action')
        resource_type = request.args.get('resource_type')
        user_id = request.args.get('user_id', type=int)
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        # Build query
        query = AuditLog.query
        
        if action:
            query = query.filter(AuditLog.action == action)
        if resource_type:
            query = query.filter(AuditLog.resource_type == resource_type)
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)
        if start_date:
            query = query.filter(AuditLog.timestamp >= start_date)
        if end_date:
            query = query.filter(AuditLog.timestamp <= end_date)
        
        # Order by timestamp descending
        query = query.order_by(AuditLog.timestamp.desc())
        
        # Paginate
        logs = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'logs': [log.to_dict() for log in logs.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': logs.total,
                'pages': logs.pages,
                'has_next': logs.has_next,
                'has_prev': logs.has_prev
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security.route('/security/status', methods=['GET'])
@jwt_required()
def get_security_status():
    """Get current security status for user"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    try:
        # Get recent security events
        recent_events = SecurityLog.query.filter_by(user_id=current_user_id)\
            .order_by(SecurityLog.timestamp.desc())\
            .limit(10).all()
        
        # Get failed login attempts
        failed_logins = SecurityLog.query.filter(
            SecurityLog.user_id == current_user_id,
            SecurityLog.event_type.in_(['login_failed', 'mfa_login_failed'])
        ).filter(
            SecurityLog.timestamp >= datetime.utcnow() - timedelta(hours=24)
        ).count()
        
        return jsonify({
            'mfa_enabled': user.mfa_enabled,
            'last_password_change': user.password_changed_at.isoformat() if user.password_changed_at else None,
            'recent_security_events': [event.to_dict() for event in recent_events],
            'failed_login_attempts_24h': failed_logins,
            'account_locked': user.account_locked if hasattr(user, 'account_locked') else False,
            'session_timeout': SESSION_TIMEOUT
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security.route('/security/export', methods=['GET'])
@jwt_required()
@admin_required
def export_security_logs():
    """Export security logs for compliance reporting"""
    try:
        # Get date range
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'error': 'Start and end dates required'}), 400
        
        # Get logs in date range
        logs = SecurityLog.query.filter(
            SecurityLog.timestamp >= start_date,
            SecurityLog.timestamp <= end_date
        ).order_by(SecurityLog.timestamp.desc()).all()
        
        # Format for export
        export_data = []
        for log in logs:
            export_data.append({
                'timestamp': log.timestamp.isoformat(),
                'event_type': log.event_type,
                'severity': log.severity,
                'user_id': log.user_id,
                'ip_address': log.ip_address,
                'user_agent': log.user_agent,
                'details': log.details
            })
        
        return jsonify({
            'export_data': export_data,
            'total_records': len(export_data),
            'date_range': {
                'start': start_date,
                'end': end_date
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@security.route('/mfa/status', methods=['GET'])
@jwt_required()
def get_mfa_status():
    """Get MFA status for current user"""
    try:
        user_uuid = get_jwt_identity()
        user = User.query.filter_by(uuid=user_uuid).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'mfa_status': {
                'enabled': user.mfa_enabled,
                'setup_complete': bool(user.mfa_secret),
                'last_used': user.last_login.isoformat() if user.last_login else None
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Get MFA status error: {str(e)}")
        return jsonify({'error': str(e)}), 500
