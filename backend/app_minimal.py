#!/usr/bin/env python3
"""
Minimal Flask app for Traffic Interceptor with basic auth
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime
import os

app = Flask(__name__)

# Basic configuration
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['JWT_SECRET_KEY'] = 'jwt-secret-key-change-in-production'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(hours=24)

# Initialize extensions
jwt = JWTManager(app)
CORS(app, origins=['http://localhost:9889', 'http://localhost:9890', 'http://localhost:9891'])

# In-memory user storage (replace with database in production)
USERS = {
    'admin': {
        'username': 'admin',
        'email': 'admin@admin.com',
        'password_hash': generate_password_hash('admin123'),
        'role': 'super_admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'is_active': True,
        'is_verified': True
    },
    'demo': {
        'username': 'demo',
        'email': 'demo@demo.com',
        'password_hash': generate_password_hash('demo123'),
        'role': 'user',
        'first_name': 'Demo',
        'last_name': 'User',
        'is_active': True,
        'is_verified': True
    }
}

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'traffic-interceptor-api',
        'timestamp': datetime.datetime.utcnow().isoformat()
    })

# Login endpoint
@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Username and password are required'}), 400
        
        username = data['username']
        password = data['password']
        
        # Find user by username or email
        user = None
        for user_data in USERS.values():
            if user_data['username'] == username or user_data['email'] == username:
                user = user_data
                break
        
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        if not user['is_active']:
            return jsonify({'message': 'Account is deactivated'}), 401
        
        # Generate tokens
        access_token = create_access_token(identity=user['username'])
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'username': user['username'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'role': user['role']
            },
            'access_token': access_token
        })
        
    except Exception as e:
        return jsonify({'message': 'Error during login', 'error': str(e)}), 500

# Profile endpoint
@app.route('/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_username = get_jwt_identity()
        user = USERS.get(current_username)
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'username': user['username'],
                'email': user['email'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'role': user['role'],
                'is_active': user['is_active'],
                'is_verified': user['is_verified']
            }
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching profile', 'error': str(e)}), 500

# Mock domains endpoint
@app.route('/api/v1/domains', methods=['GET'])
@jwt_required()
def get_domains():
    try:
        # Mock domains data
        domains = [
            {
                'id': 1,
                'uuid': '123e4567-e89b-12d3-a456-426614174000',
                'domain_name': 'example.com',
                'is_verified': True,
                'status': 'active',
                'created_at': datetime.datetime.utcnow().isoformat()
            },
            {
                'id': 2,
                'uuid': '123e4567-e89b-12d3-a456-426614174001',
                'domain_name': 'demo.example.com',
                'is_verified': False,
                'status': 'pending',
                'created_at': datetime.datetime.utcnow().isoformat()
            }
        ]
        
        return jsonify({
            'success': True,
            'data': domains,
            'total': len(domains)
        })
        
    except Exception as e:
        return jsonify({'message': 'Error fetching domains', 'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Starting minimal Traffic Interceptor backend...")
    print("📧 Admin credentials: admin@admin.com / admin123")
    print("👤 Demo credentials: demo@demo.com / demo123")
    app.run(host='0.0.0.0', port=8960, debug=True)
