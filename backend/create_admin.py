#!/usr/bin/env python3
"""
Simple script to create an admin user for Traffic Interceptor
"""
import os
import sys
from werkzeug.security import generate_password_hash

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User

def create_admin_user():
    """Create a default admin user"""
    app = create_app()
    
    with app.app_context():
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
            is_verified=True
        )
        admin_user.set_password('admin123')
        
        try:
            db.session.add(admin_user)
            db.session.commit()
            print("✅ Admin user created successfully!")
            print("📧 Email: admin@admin.com")
            print("👤 Username: admin")
            print("🔑 Password: admin123")
            print("\n⚠️  Please change the password after first login!")
        except Exception as e:
            print(f"❌ Error creating admin user: {e}")
            db.session.rollback()

if __name__ == '__main__':
    create_admin_user()
