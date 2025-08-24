#!/usr/bin/env python3
"""
White-Label & Multi-Tenant API
Handles custom branding, domain management, and multi-tenant features
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from .security import admin_required
from app.models import db, User, Tenant, Domain
from datetime import datetime, timedelta
import json
import os
from PIL import Image
import io
import base64

white_label = Blueprint('white_label', __name__)

@white_label.route('/branding', methods=['GET'])
@jwt_required()
def get_branding():
    """Get current branding configuration"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        branding = get_tenant_branding(user.tenant_id)
        
        return jsonify({
            'branding': branding,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/branding', methods=['PUT'])
@jwt_required()
@admin_required
def update_branding():
    """Update branding configuration"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        
        # Update branding
        branding = update_tenant_branding(user.tenant_id, data)
        
        return jsonify({
            'message': 'Branding updated successfully',
            'branding': branding
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/domains', methods=['GET'])
@jwt_required()
def get_custom_domains():
    """Get custom domains for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        domains = get_tenant_domains(user.tenant_id)
        
        return jsonify({
            'domains': domains,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/domains', methods=['POST'])
@jwt_required()
@admin_required
def add_custom_domain():
    """Add custom domain for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        domain_name = data.get('domain')
        ssl_enabled = data.get('ssl_enabled', True)
        cdn_enabled = data.get('cdn_enabled', False)
        
        # Add custom domain
        domain = add_tenant_domain(user.tenant_id, domain_name, ssl_enabled, cdn_enabled)
        
        return jsonify({
            'message': 'Domain added successfully',
            'domain': domain
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/domains/<domain_id>/verify', methods=['POST'])
@jwt_required()
@admin_required
def verify_domain(domain_id):
    """Verify domain ownership"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Verify domain
        verification_result = verify_domain_ownership(user.tenant_id, domain_id)
        
        return jsonify({
            'message': 'Domain verification completed',
            'verification': verification_result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/templates', methods=['GET'])
@jwt_required()
def get_email_templates():
    """Get email templates for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        templates = get_tenant_email_templates(user.tenant_id)
        
        return jsonify({
            'templates': templates,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/templates/<template_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_email_template(template_id):
    """Update email template"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        subject = data.get('subject')
        body = data.get('body')
        variables = data.get('variables', [])
        
        # Update template
        template = update_tenant_email_template(user.tenant_id, template_id, subject, body, variables)
        
        return jsonify({
            'message': 'Template updated successfully',
            'template': template
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/css', methods=['GET'])
@jwt_required()
def get_custom_css():
    """Get custom CSS for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        css = get_tenant_custom_css(user.tenant_id)
        
        return jsonify({
            'css': css,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/css', methods=['PUT'])
@jwt_required()
@admin_required
def update_custom_css():
    """Update custom CSS for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        css_content = data.get('css')
        
        # Update CSS
        css = update_tenant_custom_css(user.tenant_id, css_content)
        
        return jsonify({
            'message': 'CSS updated successfully',
            'css': css
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/features', methods=['GET'])
@jwt_required()
def get_feature_flags():
    """Get feature flags for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        features = get_tenant_feature_flags(user.tenant_id)
        
        return jsonify({
            'features': features,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/features/<feature_name>', methods=['PUT'])
@jwt_required()
@admin_required
def update_feature_flag(feature_name):
    """Update feature flag for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        enabled = data.get('enabled')
        config = data.get('config', {})
        
        # Update feature flag
        feature = update_tenant_feature_flag(user.tenant_id, feature_name, enabled, config)
        
        return jsonify({
            'message': 'Feature flag updated successfully',
            'feature': feature
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@white_label.route('/analytics', methods=['GET'])
@jwt_required()
def get_white_label_analytics():
    """Get white-label analytics for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        analytics = get_tenant_white_label_analytics(user.tenant_id)
        
        return jsonify({
            'analytics': analytics,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper functions
def get_tenant_branding(tenant_id):
    """Get branding configuration for tenant"""
    # In production, this would query a branding table
    return {
        'tenant_id': tenant_id,
        'company_name': 'Traffic Interceptor',
        'logo_url': f'/static/tenants/{tenant_id}/logo.png',
        'favicon_url': f'/static/tenants/{tenant_id}/favicon.ico',
        'primary_color': '#1976d2',
        'secondary_color': '#dc004e',
        'accent_color': '#ff9800',
        'font_family': 'Roboto, sans-serif',
        'custom_css': '',
        'email_templates': {
            'welcome': {
                'subject': 'Welcome to {company_name}',
                'body': 'Welcome to our platform!'
            },
            'password_reset': {
                'subject': 'Password Reset Request',
                'body': 'Click here to reset your password: {reset_link}'
            }
        },
        'updated_at': datetime.utcnow().isoformat()
    }

def update_tenant_branding(tenant_id, data):
    """Update branding configuration for tenant"""
    branding = get_tenant_branding(tenant_id)
    
    # Update fields
    for key, value in data.items():
        if key in branding:
            branding[key] = value
    
    branding['updated_at'] = datetime.utcnow().isoformat()
    
    return branding

def get_tenant_domains(tenant_id):
    """Get custom domains for tenant"""
    # In production, this would query a domains table
    return [
        {
            'id': f'domain_{tenant_id}_1',
            'domain': f'tenant{tenant_id}.example.com',
            'tenant_id': tenant_id,
            'ssl_enabled': True,
            'cdn_enabled': True,
            'verified': True,
            'created_at': datetime.utcnow().isoformat()
        },
        {
            'id': f'domain_{tenant_id}_2',
            'domain': f'app.tenant{tenant_id}.com',
            'tenant_id': tenant_id,
            'ssl_enabled': True,
            'cdn_enabled': False,
            'verified': False,
            'created_at': datetime.utcnow().isoformat()
        }
    ]

def add_tenant_domain(tenant_id, domain_name, ssl_enabled, cdn_enabled):
    """Add custom domain for tenant"""
    domain_id = f'domain_{tenant_id}_{int(datetime.utcnow().timestamp())}'
    
    return {
        'id': domain_id,
        'domain': domain_name,
        'tenant_id': tenant_id,
        'ssl_enabled': ssl_enabled,
        'cdn_enabled': cdn_enabled,
        'verified': False,
        'created_at': datetime.utcnow().isoformat()
    }

def verify_domain_ownership(tenant_id, domain_id):
    """Verify domain ownership"""
    # In production, this would implement actual domain verification
    # For now, return success
    return {
        'domain_id': domain_id,
        'verified': True,
        'verification_method': 'dns_txt_record',
        'verified_at': datetime.utcnow().isoformat()
    }

def get_tenant_email_templates(tenant_id):
    """Get email templates for tenant"""
    return {
        'welcome': {
            'id': 'welcome',
            'name': 'Welcome Email',
            'subject': 'Welcome to {company_name}',
            'body': 'Welcome to our platform! We\'re excited to have you on board.',
            'variables': ['company_name', 'user_name'],
            'updated_at': datetime.utcnow().isoformat()
        },
        'password_reset': {
            'id': 'password_reset',
            'name': 'Password Reset',
            'subject': 'Password Reset Request',
            'body': 'Click the following link to reset your password: {reset_link}',
            'variables': ['reset_link', 'user_name'],
            'updated_at': datetime.utcnow().isoformat()
        },
        'notification': {
            'id': 'notification',
            'name': 'General Notification',
            'subject': '{notification_title}',
            'body': '{notification_message}',
            'variables': ['notification_title', 'notification_message', 'user_name'],
            'updated_at': datetime.utcnow().isoformat()
        }
    }

def update_tenant_email_template(tenant_id, template_id, subject, body, variables):
    """Update email template for tenant"""
    templates = get_tenant_email_templates(tenant_id)
    
    if template_id in templates:
        templates[template_id].update({
            'subject': subject,
            'body': body,
            'variables': variables,
            'updated_at': datetime.utcnow().isoformat()
        })
    
    return templates.get(template_id, {})

def get_tenant_custom_css(tenant_id):
    """Get custom CSS for tenant"""
    return {
        'tenant_id': tenant_id,
        'css_content': f'''
        /* Custom CSS for Tenant {tenant_id} */
        .custom-header {{
            background-color: var(--primary-color);
            color: white;
        }}
        
        .custom-button {{
            background-color: var(--secondary-color);
            border-radius: 8px;
        }}
        ''',
        'updated_at': datetime.utcnow().isoformat()
    }

def update_tenant_custom_css(tenant_id, css_content):
    """Update custom CSS for tenant"""
    css = get_tenant_custom_css(tenant_id)
    css['css_content'] = css_content
    css['updated_at'] = datetime.utcnow().isoformat()
    
    return css

def get_tenant_feature_flags(tenant_id):
    """Get feature flags for tenant"""
    return {
        'advanced_analytics': {
            'enabled': True,
            'config': {'max_data_points': 10000}
        },
        'ml_bot_detection': {
            'enabled': True,
            'config': {'model_version': 'v2.0'}
        },
        'real_time_monitoring': {
            'enabled': True,
            'config': {'update_interval': 5000}
        },
        'collaborative_features': {
            'enabled': False,
            'config': {}
        },
        'white_label': {
            'enabled': True,
            'config': {'custom_domains': True}
        }
    }

def update_tenant_feature_flag(tenant_id, feature_name, enabled, config):
    """Update feature flag for tenant"""
    features = get_tenant_feature_flags(tenant_id)
    
    if feature_name in features:
        features[feature_name].update({
            'enabled': enabled,
            'config': config
        })
    
    return features.get(feature_name, {})

def get_tenant_white_label_analytics(tenant_id):
    """Get white-label analytics for tenant"""
    return {
        'tenant_id': tenant_id,
        'custom_domains': {
            'total': 2,
            'verified': 1,
            'ssl_enabled': 2,
            'cdn_enabled': 1
        },
        'branding_updates': {
            'total_updates': 5,
            'last_update': datetime.utcnow().isoformat()
        },
        'feature_usage': {
            'white_label_enabled': True,
            'custom_css_enabled': True,
            'email_templates_enabled': True
        },
        'performance': {
            'page_load_time': 1.2,
            'api_response_time': 150,
            'uptime': 99.9
        }
    }
