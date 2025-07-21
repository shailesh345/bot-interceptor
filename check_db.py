#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from app import create_app, db
from app.models import User, Tenant

app = create_app()
with app.app_context():
    users = User.query.all()
    print(f'Users: {len(users)}')
    for u in users:
        print(f'User {u.username}: tenant_id={u.tenant_id}')
    
    tenants = Tenant.query.all()
    print(f'Tenants: {len(tenants)}')
    for t in tenants:
        print(f'Tenant {t.name}: id={t.id}')
