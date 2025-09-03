#!/usr/bin/env python3
"""
Simple script to list all users in the Traffic Interceptor system
"""
import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Tenant

def list_all_users():
    """List all users in the system with detailed information"""
    app = create_app()
    
    with app.app_context():
        try:
            print("📋 Traffic Interceptor - User Directory")
            print("=" * 60)
            
            # Get all users
            users = User.query.all()
            
            if not users:
                print("❌ No users found in the system.")
                return
            
            # Group users by role
            users_by_role = {}
            for user in users:
                role = user.role
                if role not in users_by_role:
                    users_by_role[role] = []
                users_by_role[role].append(user)
            
            # Display users by role
            for role in ['super_admin', 'admin', 'user']:
                if role in users_by_role:
                    role_users = users_by_role[role]
                    role_display = {
                        'super_admin': '👑 Super Admin',
                        'admin': '👨‍💼 Admin',
                        'user': '👥 User/Tenant/Client'
                    }.get(role, role.title())
                    
                    print(f"\n{role_display} Users ({len(role_users)}):")
                    print("-" * 40)
                    
                    for user in role_users:
                        tenant_name = user.tenant.name if user.tenant else "No Tenant"
                        status = "✅ Active" if user.is_active else "❌ Inactive"
                        verified = "✅ Verified" if user.is_verified else "❌ Unverified"
                        
                        print(f"\n👤 {user.first_name} {user.last_name}")
                        print(f"   📧 Email: {user.email}")
                        print(f"   👤 Username: {user.username}")
                        print(f"   🎭 Role: {user.role}")
                        print(f"   🏢 Tenant: {tenant_name}")
                        print(f"   📊 Status: {status}")
                        print(f"   🔐 {verified}")
                        print(f"   📅 Created: {user.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
                        if user.last_login:
                            print(f"   🕒 Last Login: {user.last_login.strftime('%Y-%m-%d %H:%M:%S')}")
            
            print("\n" + "=" * 60)
            print(f"📊 Total Users: {len(users)}")
            
            # Count by role
            role_counts = {}
            for user in users:
                role_counts[user.role] = role_counts.get(user.role, 0) + 1
            
            print("\n📈 User Distribution:")
            for role, count in role_counts.items():
                role_icon = {
                    'super_admin': '👑',
                    'admin': '👨‍💼',
                    'user': '👥'
                }.get(role, '👤')
                print(f"   {role_icon} {role.replace('_', ' ').title()}: {count}")
            
            print("\n" + "=" * 60)
            
        except Exception as e:
            print(f"❌ Error listing users: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    list_all_users()
