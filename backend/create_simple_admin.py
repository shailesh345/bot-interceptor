#!/usr/bin/env python3
"""
Simple script to create an admin user for Traffic Interceptor
"""
import os
import sys
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Tenant

def create_simple_admin():
    """Create a simple admin user"""
    app = create_app()
    
    with app.app_context():
        try:
            # Create default tenant if it doesn't exist
            default_tenant = Tenant.query.filter_by(slug='default').first()
            if not default_tenant:
                print("Creating default tenant...")
                default_tenant = Tenant(
                    name='Default Organization',
                    slug='default',
                    domain='localhost',
                    status='active',
                    created_at=datetime.utcnow()
                )
                db.session.add(default_tenant)
                db.session.commit()
                print("✅ Default tenant created")
            
            # Check if admin user already exists
            existing_user = User.query.filter_by(email='admin@admin.com').first()
            if existing_user:
                print("Admin user already exists!")
                print(f"Username: {existing_user.username}")
                print(f"Email: {existing_user.email}")
                return
            
            # Create admin user
            admin_user = User(
                email='admin@admin.com',
                username='admin',
                first_name='Admin',
                last_name='User',
                role='super_admin',
                is_active=True,
                is_verified=True,
                tenant_id=default_tenant.id,
                created_at=datetime.utcnow()
            )
            admin_user.set_password('admin123')
            
            db.session.add(admin_user)
            db.session.commit()
            
            print("✅ Admin user created successfully!")
            print("📧 Email: admin@admin.com")
            print("👤 Username: admin")
            print("🔑 Password: admin123")
            print("\n⚠️  Please change the password after first login!")
            
        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()

if __name__ == '__main__':
    create_simple_admin()
