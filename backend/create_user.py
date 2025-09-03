#!/usr/bin/env python3
"""
Simple script to create individual users in Traffic Interceptor
Usage: python create_user.py [role] [email] [username] [password]
"""
import os
import sys
from datetime import datetime
import uuid

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Tenant

def create_user(role='user', email=None, username=None, password=None, first_name=None, last_name=None):
    """Create a user with specified role and details"""
    app = create_app()
    
    with app.app_context():
        try:
            print(f"🚀 Creating {role} user...")
            print("=" * 50)
            
            # Validate role
            valid_roles = ['super_admin', 'admin', 'user']
            if role not in valid_roles:
                print(f"❌ Invalid role: {role}")
                print(f"Valid roles: {', '.join(valid_roles)}")
                return False
            
            # Set default values if not provided
            if not email:
                email = f"{role}@example.com"
            if not username:
                username = role
            if not password:
                password = f"{role}123"
            if not first_name:
                first_name = role.title()
            if not last_name:
                last_name = "User"
            
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                print(f"❌ User with email {email} already exists!")
                print(f"Username: {existing_user.username}")
                print(f"Role: {existing_user.role}")
                return False
            
            existing_username = User.query.filter_by(username=username).first()
            if existing_username:
                print(f"❌ Username {username} already exists!")
                return False
            
            # Get or create default tenant for non-super_admin users
            tenant_id = None
            if role != 'super_admin':
                default_tenant = Tenant.query.filter_by(slug='default').first()
                if not default_tenant:
                    print("🏢 Creating default tenant...")
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
                tenant_id = default_tenant.id
            
            # Create user
            user = User(
                uuid=str(uuid.uuid4()),
                email=email,
                username=username,
                first_name=first_name,
                last_name=last_name,
                role=role,
                is_active=True,
                is_verified=True,
                tenant_id=tenant_id,
                created_at=datetime.utcnow()
            )
            user.set_password(password)
            
            db.session.add(user)
            db.session.commit()
            
            print("✅ User created successfully!")
            print(f"   📧 Email: {email}")
            print(f"   👤 Username: {username}")
            print(f"   🔑 Password: {password}")
            print(f"   🎭 Role: {role}")
            print(f"   👤 Name: {first_name} {last_name}")
            if tenant_id:
                print(f"   🏢 Tenant: Default Organization")
            else:
                print(f"   🏢 Tenant: No Tenant (Super Admin)")
            
            print("\n⚠️  Please change the password after first login!")
            return True
            
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            return False

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) < 2:
        print("Usage: python create_user.py [role] [email] [username] [password] [first_name] [last_name]")
        print("\nExamples:")
        print("  python create_user.py super_admin")
        print("  python create_user.py admin admin@company.com adminuser adminpass")
        print("  python create_user.py user client@company.com clientuser clientpass John Client")
        print("\nValid roles: super_admin, admin, user")
        return
    
    role = sys.argv[1]
    email = sys.argv[2] if len(sys.argv) > 2 else None
    username = sys.argv[3] if len(sys.argv) > 3 else None
    password = sys.argv[4] if len(sys.argv) > 4 else None
    first_name = sys.argv[5] if len(sys.argv) > 5 else None
    last_name = sys.argv[6] if len(sys.argv) > 6 else None
    
    success = create_user(role, email, username, password, first_name, last_name)
    
    if success:
        print("\n🎉 User creation completed!")
        print("🌐 Access the system at: http://localhost:9889")

if __name__ == '__main__':
    main()
