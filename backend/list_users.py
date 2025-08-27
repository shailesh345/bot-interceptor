#!/usr/bin/env python3
"""
Simple script to list all users in the database
"""
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Tenant

def list_users():
    """List all users in the database"""
    app = create_app()
    
    with app.app_context():
        try:
            print("👥 Users in database:")
            print("=" * 50)
            
            users = User.query.all()
            if not users:
                print("❌ No users found in database")
                return
            
            for user in users:
                print(f"ID: {user.id}")
                print(f"UUID: {user.uuid}")
                print(f"Username: {user.username}")
                print(f"Email: {user.email}")
                print(f"Role: {user.role}")
                print(f"Tenant ID: {user.tenant_id}")
                print(f"Active: {user.is_active}")
                print(f"Verified: {user.is_verified}")
                print("-" * 30)
            
            print("\n🏢 Tenants in database:")
            print("=" * 50)
            
            tenants = Tenant.query.all()
            if not tenants:
                print("❌ No tenants found in database")
                return
            
            for tenant in tenants:
                print(f"ID: {tenant.id}")
                print(f"UUID: {tenant.uuid}")
                print(f"Name: {tenant.name}")
                print(f"Slug: {tenant.slug}")
                print(f"Domain: {tenant.domain}")
                print("-" * 30)
                
        except Exception as e:
            print(f"❌ Error listing users: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    list_users()
