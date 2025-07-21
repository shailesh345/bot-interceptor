#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, db
from app.models import User, Tenant
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    # Check if test user exists
    test_user = User.query.filter_by(email='test@example.com').first()
    
    if not test_user:
        # Get the default tenant
        tenant = Tenant.query.filter_by(slug='default').first()
        if not tenant:
            print("Default tenant not found. Please run create_tenant.py first.")
            sys.exit(1)
        
        # Create test user
        test_user = User(
            username='testuser',
            email='test@example.com',
            password_hash=generate_password_hash('password123'),
            tenant_id=tenant.id,
            first_name='Test',
            last_name='User',
            role='user'
        )
        
        db.session.add(test_user)
        db.session.commit()
        print(f'Created test user: {test_user.email} (uuid: {test_user.uuid})')
    else:
        print(f'Test user already exists: {test_user.email} (uuid: {test_user.uuid})')
