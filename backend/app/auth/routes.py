# Authentication Routes
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.auth import auth
from app.models import User, Tenant
from app import db
import uuid

@auth.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'username', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'{field} is required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already taken'}), 400
    
    # Create new tenant for the user
    tenant = Tenant(
        name=f"{data['first_name']} {data['last_name']}'s Organization",
        slug=f"{data['username']}-org"
    )
    db.session.add(tenant)
    db.session.flush()  # Get the tenant ID
    
    # Create new user
    user = User(
        email=data['email'],
        username=data['username'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        tenant_id=tenant.id,
        role='admin'  # First user in tenant is admin
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token, refresh_token = user.generate_tokens()
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.uuid,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role
        }
    }), 201

@auth.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'message': 'Account is deactivated'}), 401
    
    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate tokens
    access_token, refresh_token = user.generate_tokens()
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.uuid,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'tenant_id': user.tenant.uuid if user.tenant else None
        }
    }), 200

@auth.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout"""
    jti = get_jwt()['jti']
    current_app.redis.set(f"revoked_token:{jti}", "true", ex=86400)  # 24 hours
    return jsonify({'message': 'Successfully logged out'}), 200

@auth.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user or not user.is_active:
        return jsonify({'message': 'User not found or inactive'}), 404
    
    access_token, _ = user.generate_tokens()
    return jsonify({'access_token': access_token}), 200

@auth.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user profile"""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user.uuid,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_verified': user.is_verified,
            'created_at': user.created_at.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
            'tenant': {
                'id': user.tenant.uuid,
                'name': user.tenant.name,
                'slug': user.tenant.slug
            } if user.tenant else None
        }
    }), 200

@auth.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user profile"""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'username' in data and data['username'] != user.username:
        # Check if username is already taken
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already taken'}), 400
        user.username = data['username']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': {
            'id': user.uuid,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role
        }
    }), 200

@auth.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change user password"""
    current_user_uuid = get_jwt_identity()
    user = User.query.filter_by(uuid=current_user_uuid).first()
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'message': 'Current password and new password are required'}), 400
    
    if not user.check_password(data['current_password']):
        return jsonify({'message': 'Current password is incorrect'}), 400
    
    user.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200
