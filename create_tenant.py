#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, db
from app.models import User, Tenant

app = create_app()
with app.app_context():
    # Create default tenant
    tenant = Tenant(
        name='Default Tenant',
        slug='default',
        domain='example.com',
        status='active'
    )
    db.session.add(tenant)
    db.session.commit()
    
    # Assign user to tenant
    user = User.query.filter_by(username='admin').first()
    if user:
        user.tenant_id = tenant.id
        db.session.commit()
        print(f'User {user.username} assigned to tenant {tenant.name}')
    else:
        print('Admin user not found')
    
    print(f'Created tenant: {tenant.name} (id: {tenant.id})')
