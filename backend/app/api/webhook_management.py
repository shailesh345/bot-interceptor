#!/usr/bin/env python3
"""
Webhook Management System
Handles third-party integrations, webhook delivery, and API ecosystem
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.api.security import admin_required
from app.models import db, User, Domain
from datetime import datetime, timedelta
import json
import hashlib
import hmac
import requests
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

webhook_management = Blueprint('webhook_management', __name__)

@webhook_management.route('/webhooks', methods=['GET'])
@jwt_required()
def get_webhooks():
    """Get all webhooks for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        webhooks = get_tenant_webhooks(user.tenant_id)
        
        return jsonify({
            'webhooks': webhooks,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/webhooks', methods=['POST'])
@jwt_required()
@admin_required
def create_webhook():
    """Create a new webhook"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        url = data.get('url')
        events = data.get('events', [])
        secret = data.get('secret', '')
        description = data.get('description', '')
        
        # Create webhook
        webhook = create_tenant_webhook(
            user.tenant_id, url, events, secret, description
        )
        
        return jsonify({
            'message': 'Webhook created successfully',
            'webhook': webhook
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/webhooks/<webhook_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_webhook(webhook_id):
    """Update webhook configuration"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        
        # Update webhook
        webhook = update_tenant_webhook(
            user.tenant_id, webhook_id, data
        )
        
        return jsonify({
            'message': 'Webhook updated successfully',
            'webhook': webhook
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/webhooks/<webhook_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_webhook(webhook_id):
    """Delete webhook"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Delete webhook
        delete_tenant_webhook(user.tenant_id, webhook_id)
        
        return jsonify({
            'message': 'Webhook deleted successfully'
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/webhooks/<webhook_id>/test', methods=['POST'])
@jwt_required()
@admin_required
def test_webhook(webhook_id):
    """Test webhook delivery"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Test webhook
        test_result = test_webhook_delivery(user.tenant_id, webhook_id)
        
        return jsonify({
            'message': 'Webhook test completed',
            'result': test_result
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/webhooks/<webhook_id>/logs', methods=['GET'])
@jwt_required()
def get_webhook_logs(webhook_id):
    """Get webhook delivery logs"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        logs = get_webhook_delivery_logs(user.tenant_id, webhook_id)
        
        return jsonify({
            'logs': logs,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/integrations', methods=['GET'])
@jwt_required()
def get_integrations():
    """Get available third-party integrations"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        integrations = get_available_integrations(user.tenant_id)
        
        return jsonify({
            'integrations': integrations,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/integrations/<integration_id>/connect', methods=['POST'])
@jwt_required()
@admin_required
def connect_integration(integration_id):
    """Connect to a third-party integration"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        credentials = data.get('credentials', {})
        
        # Connect integration
        connection = connect_third_party_integration(
            user.tenant_id, integration_id, credentials
        )
        
        return jsonify({
            'message': 'Integration connected successfully',
            'connection': connection
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/api-keys', methods=['GET'])
@jwt_required()
def get_api_keys():
    """Get API keys for tenant"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        api_keys = get_tenant_api_keys(user.tenant_id)
        
        return jsonify({
            'api_keys': api_keys,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@webhook_management.route('/api-keys', methods=['POST'])
@jwt_required()
@admin_required
def create_api_key():
    """Create new API key"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        name = data.get('name')
        permissions = data.get('permissions', [])
        expires_at = data.get('expires_at')
        
        # Create API key
        api_key = create_tenant_api_key(
            user.tenant_id, name, permissions, expires_at
        )
        
        return jsonify({
            'message': 'API key created successfully',
            'api_key': api_key
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper functions
def get_tenant_webhooks(tenant_id: int) -> List[Dict[str, Any]]:
    """Get webhooks for tenant"""
    # In production, this would query a webhooks table
    return [
        {
            'id': f'webhook_{tenant_id}_1',
            'name': 'Slack Notifications',
            'url': 'https://hooks.slack.com/services/...',
            'events': ['security_incident', 'traffic_anomaly'],
            'secret': '***',
            'description': 'Send security alerts to Slack',
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'last_delivery': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            'delivery_count': 45,
            'success_rate': 98.5
        },
        {
            'id': f'webhook_{tenant_id}_2',
            'name': 'Zapier Integration',
            'url': 'https://hooks.zapier.com/...',
            'events': ['new_customer', 'payment_received'],
            'secret': '***',
            'description': 'Automate customer onboarding',
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'last_delivery': (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            'delivery_count': 23,
            'success_rate': 100.0
        }
    ]

def create_tenant_webhook(tenant_id: int, url: str, events: List[str], 
                          secret: str, description: str) -> Dict[str, Any]:
    """Create webhook for tenant"""
    webhook_id = f'webhook_{tenant_id}_{int(datetime.utcnow().timestamp())}'
    
    return {
        'id': webhook_id,
        'name': f'Webhook {len(get_tenant_webhooks(tenant_id)) + 1}',
        'url': url,
        'events': events,
        'secret': secret,
        'description': description,
        'status': 'active',
        'created_at': datetime.utcnow().isoformat(),
        'last_delivery': None,
        'delivery_count': 0,
        'success_rate': 100.0
    }

def update_tenant_webhook(tenant_id: int, webhook_id: str, 
                         updates: Dict[str, Any]) -> Dict[str, Any]:
    """Update webhook for tenant"""
    webhooks = get_tenant_webhooks(tenant_id)
    
    for webhook in webhooks:
        if webhook['id'] == webhook_id:
            webhook.update(updates)
            webhook['updated_at'] = datetime.utcnow().isoformat()
            return webhook
    
    raise ValueError('Webhook not found')

def delete_tenant_webhook(tenant_id: int, webhook_id: str):
    """Delete webhook for tenant"""
    # In production, this would delete from database
    logger.info(f"Deleting webhook {webhook_id} for tenant {tenant_id}")

def test_webhook_delivery(tenant_id: int, webhook_id: str) -> Dict[str, Any]:
    """Test webhook delivery"""
    webhooks = get_tenant_webhooks(tenant_id)
    webhook = next((w for w in webhooks if w['id'] == webhook_id), None)
    
    if not webhook:
        raise ValueError('Webhook not found')
    
    # Test payload
    test_payload = {
        'event': 'webhook_test',
        'timestamp': datetime.utcnow().isoformat(),
        'data': {
            'message': 'This is a test webhook delivery',
            'tenant_id': tenant_id,
            'webhook_id': webhook_id
        }
    }
    
    # Add signature if secret exists
    if webhook['secret']:
        signature = generate_webhook_signature(test_payload, webhook['secret'])
        test_payload['signature'] = signature
    
    try:
        # Send test webhook
        response = requests.post(
            webhook['url'],
            json=test_payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        return {
            'success': response.status_code < 400,
            'status_code': response.status_code,
            'response_time': response.elapsed.total_seconds(),
            'response_body': response.text[:200] if response.text else None
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'status_code': None,
            'response_time': None
        }

def get_webhook_delivery_logs(tenant_id: int, webhook_id: str) -> List[Dict[str, Any]]:
    """Get webhook delivery logs"""
    # In production, this would query delivery logs
    return [
        {
            'id': f'log_{webhook_id}_1',
            'webhook_id': webhook_id,
            'event': 'security_incident',
            'payload': {'incident_id': 'inc_123', 'severity': 'high'},
            'status': 'delivered',
            'status_code': 200,
            'response_time': 0.45,
            'delivered_at': datetime.utcnow().isoformat(),
            'retry_count': 0
        },
        {
            'id': f'log_{webhook_id}_2',
            'webhook_id': webhook_id,
            'event': 'traffic_anomaly',
            'payload': {'anomaly_score': 8.5, 'ip_address': '192.168.1.100'},
            'status': 'failed',
            'status_code': 500,
            'response_time': 5.2,
            'delivered_at': None,
            'retry_count': 2
        }
    ]

def get_available_integrations(tenant_id: int) -> List[Dict[str, Any]]:
    """Get available third-party integrations"""
    return [
        {
            'id': 'slack',
            'name': 'Slack',
            'description': 'Send notifications and alerts to Slack channels',
            'icon': 'slack',
            'status': 'available',
            'features': ['notifications', 'alerts', 'team_collaboration'],
            'setup_required': ['webhook_url', 'channel_name'],
            'pricing': 'free'
        },
        {
            'id': 'zapier',
            'name': 'Zapier',
            'description': 'Automate workflows with 5000+ apps',
            'icon': 'zapier',
            'status': 'available',
            'features': ['automation', 'workflows', 'app_integrations'],
            'setup_required': ['api_key', 'webhook_url'],
            'pricing': 'freemium'
        },
        {
            'id': 'hubspot',
            'name': 'HubSpot',
            'description': 'CRM and marketing automation platform',
            'icon': 'hubspot',
            'status': 'available',
            'features': ['crm', 'marketing', 'sales_automation'],
            'setup_required': ['api_key', 'portal_id'],
            'pricing': 'paid'
        },
        {
            'id': 'salesforce',
            'name': 'Salesforce',
            'description': 'Enterprise CRM and business platform',
            'icon': 'salesforce',
            'status': 'available',
            'features': ['crm', 'sales', 'analytics'],
            'setup_required': ['client_id', 'client_secret', 'instance_url'],
            'pricing': 'enterprise'
        }
    ]

def connect_third_party_integration(tenant_id: int, integration_id: str, 
                                  credentials: Dict[str, Any]) -> Dict[str, Any]:
    """Connect to third-party integration"""
    integration = next((i for i in get_available_integrations(tenant_id) 
                       if i['id'] == integration_id), None)
    
    if not integration:
        raise ValueError('Integration not found')
    
    # In production, this would validate credentials and establish connection
    return {
        'id': f'connection_{tenant_id}_{integration_id}',
        'integration_id': integration_id,
        'tenant_id': tenant_id,
        'status': 'connected',
        'connected_at': datetime.utcnow().isoformat(),
        'last_sync': datetime.utcnow().isoformat(),
        'sync_status': 'success',
        'credentials_encrypted': True
    }

def get_tenant_api_keys(tenant_id: int) -> List[Dict[str, Any]]:
    """Get API keys for tenant"""
    return [
        {
            'id': f'key_{tenant_id}_1',
            'name': 'Production API Key',
            'key_prefix': 'tk_live_...',
            'permissions': ['read', 'write', 'webhooks'],
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'last_used': (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            'expires_at': None,
            'usage_count': 1250
        },
        {
            'id': f'key_{tenant_id}_2',
            'name': 'Read-only Key',
            'key_prefix': 'tk_test_...',
            'permissions': ['read'],
            'status': 'active',
            'created_at': datetime.utcnow().isoformat(),
            'last_used': (datetime.utcnow() - timedelta(days=1)).isoformat(),
            'expires_at': (datetime.utcnow() + timedelta(days=30)).isoformat(),
            'usage_count': 45
        }
    ]

def create_tenant_api_key(tenant_id: int, name: str, permissions: List[str], 
                          expires_at: str) -> Dict[str, Any]:
    """Create API key for tenant"""
    key_id = f'key_{tenant_id}_{int(datetime.utcnow().timestamp())}'
    
    # Generate API key
    api_key = f"tk_{hashlib.sha256(f'{tenant_id}_{datetime.utcnow().isoformat()}'.encode()).hexdigest()[:24]}"
    
    return {
        'id': key_id,
        'name': name,
        'key': api_key,
        'key_prefix': f"{api_key[:8]}...",
        'permissions': permissions,
        'status': 'active',
        'created_at': datetime.utcnow().isoformat(),
        'last_used': None,
        'expires_at': expires_at,
        'usage_count': 0
    }

def generate_webhook_signature(payload: Dict[str, Any], secret: str) -> str:
    """Generate webhook signature for verification"""
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hmac.new(
        secret.encode('utf-8'),
        payload_str.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f"sha256={signature}"
