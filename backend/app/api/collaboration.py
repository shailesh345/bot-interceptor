#!/usr/bin/env python3
"""
Real-time Collaboration API
Handles team management, shared workspaces, and collaborative features
"""

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Tenant, Domain, TrafficLog
from app.websocket import socketio, broadcast_to_team
from datetime import datetime, timedelta
import json
from sqlalchemy import func, desc, and_

collaboration = Blueprint('collaboration', __name__)

@collaboration.route('/teams', methods=['GET'])
@jwt_required()
def get_user_teams():
    """Get all teams the user belongs to"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Get teams from tenant
        teams = get_teams_for_tenant(user.tenant_id)
        
        return jsonify({
            'teams': teams,
            'user_role': user.role,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration.route('/teams', methods=['POST'])
@jwt_required()
def create_team():
    """Create a new team"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if user.role not in ['admin', 'super_admin']:
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        team_name = data.get('name')
        description = data.get('description', '')
        members = data.get('members', [])
        
        # Create team
        team = create_team_in_tenant(user.tenant_id, team_name, description, members)
        
        # Notify team members
        broadcast_to_team(team['id'], 'team_created', {
            'team': team,
            'created_by': user.email
        })
        
        return jsonify({
            'message': 'Team created successfully',
            'team': team
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration.route('/teams/<team_id>/members', methods=['POST'])
@jwt_required()
def add_team_member(team_id):
    """Add a member to a team"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not is_team_admin(user.id, team_id):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        member_email = data.get('email')
        role = data.get('role', 'member')
        
        # Add member to team
        member = add_member_to_team(team_id, member_email, role)
        
        # Notify team
        broadcast_to_team(team_id, 'member_added', {
            'member': member,
            'added_by': user.email
        })
        
        return jsonify({
            'message': 'Member added successfully',
            'member': member
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration.route('/workspaces', methods=['GET'])
@jwt_required()
def get_workspaces():
    """Get user's workspaces"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        workspaces = get_workspaces_for_user(user.id, user.tenant_id)
        
        return jsonify({
            'workspaces': workspaces,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration.route('/workspaces', methods=['POST'])
@jwt_required()
def create_workspace():
    """Create a new workspace"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        data = request.get_json()
        workspace_name = data.get('name')
        description = data.get('description', '')
        team_id = data.get('team_id')
        is_public = data.get('is_public', False)
        
        # Create workspace
        workspace = create_workspace_for_user(
            user.id, user.tenant_id, workspace_name, 
            description, team_id, is_public
        )
        
        return jsonify({
            'message': 'Workspace created successfully',
            'workspace': workspace
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration.route('/workspaces/<workspace_id>/share', methods=['POST'])
@jwt_required()
def share_workspace(workspace_id):
    """Share a workspace with other users"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not can_share_workspace(user.id, workspace_id):
            return jsonify({'error': 'Insufficient permissions'}), 403
        
        data = request.get_json()
        user_emails = data.get('user_emails', [])
        permissions = data.get('permissions', ['read'])
        
        # Share workspace
        shared_users = share_workspace_with_users(workspace_id, user_emails, permissions)
        
        # Notify users
        for shared_user in shared_users:
            socketio.emit('workspace_shared', {
                'workspace_id': workspace_id,
                'shared_by': user.email,
                'permissions': permissions
            }, room=f'user_{shared_user["id"]}')
        
        return jsonify({
            'message': 'Workspace shared successfully',
            'shared_users': shared_users
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration.route('/collaborative-editing/<resource_type>/<resource_id>', methods=['POST'])
@jwt_required()
def start_collaborative_editing(resource_type, resource_id):
    """Start collaborative editing session"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # Start editing session
        session = start_editing_session(user.id, resource_type, resource_id)
        
        # Notify other users
        broadcast_editing_session(resource_type, resource_id, user.id, 'started')
        
        return jsonify({
            'message': 'Editing session started',
            'session': session
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration.route('/collaborative-editing/<resource_type>/<resource_id>', methods=['DELETE'])
@jwt_required()
def end_collaborative_editing(resource_type, resource_id):
    """End collaborative editing session"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        # End editing session
        session = end_editing_session(user.id, resource_type, resource_id)
        
        # Notify other users
        broadcast_editing_session(resource_type, resource_id, user.id, 'ended')
        
        return jsonify({
            'message': 'Editing session ended',
            'session': session
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@collaboration.route('/notifications/team/<team_id>', methods=['POST'])
@jwt_required()
def send_team_notification(team_id):
    """Send notification to team members"""
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        
        if not is_team_member(user.id, team_id):
            return jsonify({'error': 'Not a team member'}), 403
        
        data = request.get_json()
        message = data.get('message')
        notification_type = data.get('type', 'info')
        priority = data.get('priority', 'normal')
        
        # Send team notification
        notification = send_notification_to_team(team_id, user.id, message, notification_type, priority)
        
        return jsonify({
            'message': 'Notification sent successfully',
            'notification': notification
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Helper functions
def get_teams_for_tenant(tenant_id):
    """Get teams for a tenant"""
    # In production, this would query a teams table
    # For now, return sample data
    return [
        {
            'id': f'team_{tenant_id}_1',
            'name': 'Development Team',
            'description': 'Core development team',
            'members': [
                {'id': 1, 'email': 'dev1@example.com', 'role': 'admin'},
                {'id': 2, 'email': 'dev2@example.com', 'role': 'member'}
            ],
            'created_at': datetime.utcnow().isoformat()
        },
        {
            'id': f'team_{tenant_id}_2',
            'name': 'Analytics Team',
            'description': 'Data analytics and insights',
            'members': [
                {'id': 3, 'email': 'analyst1@example.com', 'role': 'admin'},
                {'id': 4, 'email': 'analyst2@example.com', 'role': 'member'}
            ],
            'created_at': datetime.utcnow().isoformat()
        }
    ]

def create_team_in_tenant(tenant_id, name, description, members):
    """Create a team in a tenant"""
    team_id = f'team_{tenant_id}_{int(datetime.utcnow().timestamp())}'
    
    return {
        'id': team_id,
        'name': name,
        'description': description,
        'members': members,
        'tenant_id': tenant_id,
        'created_at': datetime.utcnow().isoformat()
    }

def is_team_admin(user_id, team_id):
    """Check if user is team admin"""
    # In production, this would query team membership
    return True  # Simplified for demo

def add_member_to_team(team_id, email, role):
    """Add member to team"""
    return {
        'id': int(datetime.utcnow().timestamp()),
        'email': email,
        'role': role,
        'team_id': team_id,
        'added_at': datetime.utcnow().isoformat()
    }

def get_workspaces_for_user(user_id, tenant_id):
    """Get workspaces for a user"""
    return [
        {
            'id': f'workspace_{tenant_id}_1',
            'name': 'Main Dashboard',
            'description': 'Primary workspace for monitoring',
            'owner_id': user_id,
            'team_id': None,
            'is_public': True,
            'created_at': datetime.utcnow().isoformat()
        },
        {
            'id': f'workspace_{tenant_id}_2',
            'name': 'Team Analytics',
            'description': 'Shared analytics workspace',
            'owner_id': user_id,
            'team_id': f'team_{tenant_id}_2',
            'is_public': False,
            'created_at': datetime.utcnow().isoformat()
        }
    ]

def create_workspace_for_user(user_id, tenant_id, name, description, team_id, is_public):
    """Create workspace for user"""
    workspace_id = f'workspace_{tenant_id}_{int(datetime.utcnow().timestamp())}'
    
    return {
        'id': workspace_id,
        'name': name,
        'description': description,
        'owner_id': user_id,
        'team_id': team_id,
        'is_public': is_public,
        'tenant_id': tenant_id,
        'created_at': datetime.utcnow().isoformat()
    }

def can_share_workspace(user_id, workspace_id):
    """Check if user can share workspace"""
    # In production, this would check ownership and permissions
    return True  # Simplified for demo

def share_workspace_with_users(workspace_id, user_emails, permissions):
    """Share workspace with users"""
    shared_users = []
    
    for email in user_emails:
        shared_users.append({
            'id': int(datetime.utcnow().timestamp()),
            'email': email,
            'workspace_id': workspace_id,
            'permissions': permissions,
            'shared_at': datetime.utcnow().isoformat()
        })
    
    return shared_users

def start_editing_session(user_id, resource_type, resource_id):
    """Start editing session"""
    session_id = f'session_{resource_type}_{resource_id}_{user_id}_{int(datetime.utcnow().timestamp())}'
    
    return {
        'id': session_id,
        'user_id': user_id,
        'resource_type': resource_type,
        'resource_id': resource_id,
        'started_at': datetime.utcnow().isoformat(),
        'status': 'active'
    }

def end_editing_session(user_id, resource_type, resource_id):
    """End editing session"""
    return {
        'user_id': user_id,
        'resource_type': resource_type,
        'resource_id': resource_id,
        'ended_at': datetime.utcnow().isoformat(),
        'status': 'ended'
    }

def broadcast_editing_session(resource_type, resource_id, user_id, action):
    """Broadcast editing session to other users"""
    socketio.emit('editing_session_update', {
        'resource_type': resource_type,
        'resource_id': resource_id,
        'user_id': user_id,
        'action': action,
        'timestamp': datetime.utcnow().isoformat()
    }, broadcast=True)

def is_team_member(user_id, team_id):
    """Check if user is team member"""
    # In production, this would query team membership
    return True  # Simplified for demo

def send_notification_to_team(team_id, sender_id, message, notification_type, priority):
    """Send notification to team"""
    return {
        'id': int(datetime.utcnow().timestamp()),
        'team_id': team_id,
        'sender_id': sender_id,
        'message': message,
        'type': notification_type,
        'priority': priority,
        'sent_at': datetime.utcnow().isoformat()
    }
