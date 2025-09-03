#!/usr/bin/env python3
"""
Script to fix super admin user authentication issues
"""
import os
import sys
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User

def fix_super_admin():
    """Fix super admin user authentication"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🔧 Fixing Super Admin User Authentication...")
            print("=" * 60)
            
            # Find existing super admin
            super_admin = User.query.filter_by(role='super_admin').first()
            
            if super_admin:
                print(f"👑 Found existing Super Admin:")
                print(f"   Username: {super_admin.username}")
                print(f"   Email: {super_admin.email}")
                print(f"   Status: {'Active' if super_admin.is_active else 'Inactive'}")
                print(f"   Verified: {'Yes' if super_admin.is_verified else 'No'}")
                
                # Reset password to admin123
                super_admin.set_password('admin123')
                super_admin.is_active = True
                super_admin.is_verified = True
                super_admin.last_login = None
                
                db.session.commit()
                print("\n✅ Super Admin password reset successfully!")
                print(f"   🔑 New Password: admin123")
                print(f"   📱 Status: Active and Verified")
                
            else:
                print("❌ No Super Admin user found!")
                return False
            
            # Also create a new superadmin user if it doesn't exist
            superadmin_user = User.query.filter_by(username='superadmin').first()
            if not superadmin_user:
                print("\n🎯 Creating additional Super Admin user...")
                new_super_admin = User(
                    username='superadmin',
                    email='superadmin@trafficinterceptor.com',
                    first_name='Super',
                    last_name='Admin',
                    role='super_admin',
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.utcnow()
                )
                new_super_admin.set_password('superadmin123')
                
                db.session.add(new_super_admin)
                db.session.commit()
                
                print("✅ Additional Super Admin created successfully!")
                print(f"   👤 Username: superadmin")
                print(f"   🔑 Password: superadmin123")
                print(f"   📧 Email: superadmin@trafficinterceptor.com")
            
            print("\n" + "=" * 60)
            print("🎉 Super Admin authentication fixed!")
            print("\n📋 Available Super Admin credentials:")
            print("   1. Username: admin, Password: admin123")
            print("   2. Username: superadmin, Password: superadmin123")
            print("\n🌐 Access the system at: http://localhost:9889")
            print("=" * 60)
            
            return True
            
        except Exception as e:
            print(f"❌ Error fixing super admin: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return False

def test_super_admin_login():
    """Test super admin login credentials"""
    app = create_app()
    
    with app.app_context():
        try:
            print("\n🧪 Testing Super Admin Login...")
            print("-" * 40)
            
            # Test admin user
            admin_user = User.query.filter_by(username='admin').first()
            if admin_user:
                print(f"✅ Admin user exists:")
                print(f"   Username: {admin_user.username}")
                print(f"   Role: {admin_user.role}")
                print(f"   Active: {admin_user.is_active}")
                print(f"   Verified: {admin_user.is_verified}")
                
                # Test password
                if admin_user.check_password('admin123'):
                    print(f"   🔑 Password 'admin123' is correct!")
                else:
                    print(f"   ❌ Password 'admin123' is incorrect!")
            else:
                print("❌ Admin user not found!")
            
            # Test superadmin user
            superadmin_user = User.query.filter_by(username='superadmin').first()
            if superadmin_user:
                print(f"\n✅ Superadmin user exists:")
                print(f"   Username: {superadmin_user.username}")
                print(f"   Role: {superadmin_user.role}")
                print(f"   Active: {superadmin_user.is_active}")
                print(f"   Verified: {superadmin_user.is_verified}")
                
                # Test password
                if superadmin_user.check_password('superadmin123'):
                    print(f"   🔑 Password 'superadmin123' is correct!")
                else:
                    print(f"   ❌ Password 'superadmin123' is incorrect!")
            else:
                print("\n❌ Superadmin user not found!")
            
        except Exception as e:
            print(f"❌ Error testing login: {e}")

if __name__ == '__main__':
    print("🔧 Traffic Interceptor - Super Admin Fix")
    print("=" * 60)
    
    # Fix super admin
    success = fix_super_admin()
    
    if success:
        # Test login
        test_super_admin_login()
