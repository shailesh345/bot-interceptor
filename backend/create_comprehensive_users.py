#!/usr/bin/env python3
"""
Comprehensive user creation script for Traffic Interceptor SaaS
Creates different types of users: Super Admin, Admin, Tenant/Client, and MVP User
"""
import os
import sys
from datetime import datetime
import uuid

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Tenant

def create_comprehensive_users():
    """Create comprehensive set of users for the system"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🚀 Creating comprehensive user setup for Traffic Interceptor...")
            print("=" * 60)
            
            # 1. Create default tenant if it doesn't exist
            print("\n🏢 Setting up tenant structure...")
            default_tenant = Tenant.query.filter_by(slug='default').first()
            if not default_tenant:
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
            else:
                print("✅ Default tenant already exists")
            
            # 2. Create Super Admin User
            print("\n👑 Creating Super Admin User...")
            super_admin = User.query.filter_by(role='super_admin').first()
            if not super_admin:
                super_admin = User(
                    uuid=str(uuid.uuid4()),
                    email='superadmin@trafficinterceptor.com',
                    username='superadmin',
                    first_name='Super',
                    last_name='Admin',
                    role='super_admin',
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.utcnow()
                )
                super_admin.set_password('superadmin123')
                db.session.add(super_admin)
                db.session.commit()
                print("✅ Super Admin created successfully!")
                print("   📧 Email: superadmin@trafficinterceptor.com")
                print("   👤 Username: superadmin")
                print("   🔑 Password: superadmin123")
                print("   🎭 Role: super_admin")
            else:
                print("✅ Super Admin already exists")
            
            # 3. Create Admin User
            print("\n👨‍💼 Creating Admin User...")
            admin_user = User.query.filter_by(role='admin').first()
            if not admin_user:
                admin_user = User(
                    uuid=str(uuid.uuid4()),
                    email='admin@trafficinterceptor.com',
                    username='admin',
                    first_name='Admin',
                    last_name='User',
                    role='admin',
                    is_active=True,
                    is_verified=True,
                    tenant_id=default_tenant.id,
                    created_at=datetime.utcnow()
                )
                admin_user.set_password('admin123')
                db.session.add(admin_user)
                db.session.commit()
                print("✅ Admin User created successfully!")
                print("   📧 Email: admin@trafficinterceptor.com")
                print("   👤 Username: admin")
                print("   🔑 Password: admin123")
                print("   🎭 Role: admin")
                print("   🏢 Tenant: Default Organization")
            else:
                print("✅ Admin User already exists")
            
            # 4. Create Tenant/Client User
            print("\n👥 Creating Tenant/Client User...")
            tenant_user = User.query.filter_by(role='user').filter_by(email='client@example.com').first()
            if not tenant_user:
                tenant_user = User(
                    uuid=str(uuid.uuid4()),
                    email='client@example.com',
                    username='client',
                    first_name='John',
                    last_name='Client',
                    role='user',
                    is_active=True,
                    is_verified=True,
                    tenant_id=default_tenant.id,
                    created_at=datetime.utcnow()
                )
                tenant_user.set_password('client123')
                db.session.add(tenant_user)
                db.session.commit()
                print("✅ Tenant/Client User created successfully!")
                print("   📧 Email: client@example.com")
                print("   👤 Username: client")
                print("   🔑 Password: client123")
                print("   🎭 Role: user (tenant/client)")
                print("   🏢 Tenant: Default Organization")
            else:
                print("✅ Tenant/Client User already exists")
            
            # 5. Create MVP User
            print("\n🎯 Creating MVP User...")
            mvp_user = User.query.filter_by(role='user').filter_by(email='mvp@example.com').first()
            if not mvp_user:
                mvp_user = User(
                    uuid=str(uuid.uuid4()),
                    email='mvp@example.com',
                    username='mvpuser',
                    first_name='MVP',
                    last_name='User',
                    role='user',
                    is_active=True,
                    is_verified=True,
                    tenant_id=default_tenant.id,
                    created_at=datetime.utcnow()
                )
                mvp_user.set_password('mvp123')
                db.session.add(mvp_user)
                db.session.commit()
                print("✅ MVP User created successfully!")
                print("   📧 Email: mvp@example.com")
                print("   👤 Username: mvpuser")
                print("   🔑 Password: mvp123")
                print("   🎭 Role: user (MVP)")
                print("   🏢 Tenant: Default Organization")
            else:
                print("✅ MVP User already exists")
            
            # 6. Create additional demo users for testing
            print("\n🧪 Creating additional demo users for testing...")
            
            # Demo Admin
            demo_admin = User.query.filter_by(email='demo.admin@example.com').first()
            if not demo_admin:
                demo_admin = User(
                    uuid=str(uuid.uuid4()),
                    email='demo.admin@example.com',
                    username='demo_admin',
                    first_name='Demo',
                    last_name='Admin',
                    role='admin',
                    is_active=True,
                    is_verified=True,
                    tenant_id=default_tenant.id,
                    created_at=datetime.utcnow()
                )
                demo_admin.set_password('demo123')
                db.session.add(demo_admin)
                print("   ✅ Demo Admin created")
            
            # Demo Client
            demo_client = User.query.filter_by(email='demo.client@example.com').first()
            if not demo_client:
                demo_client = User(
                    uuid=str(uuid.uuid4()),
                    email='demo.client@example.com',
                    username='demo_client',
                    first_name='Demo',
                    last_name='Client',
                    role='user',
                    is_active=True,
                    is_verified=True,
                    tenant_id=default_tenant.id,
                    created_at=datetime.utcnow()
                )
                demo_client.set_password('demo123')
                db.session.add(demo_client)
                print("   ✅ Demo Client created")
            
            # Demo MVP
            demo_mvp = User.query.filter_by(email='demo.mvp@example.com').first()
            if not demo_mvp:
                demo_mvp = User(
                    uuid=str(uuid.uuid4()),
                    email='demo.mvp@example.com',
                    username='demo_mvp',
                    first_name='Demo',
                    last_name='MVP',
                    role='user',
                    is_active=True,
                    is_verified=True,
                    tenant_id=default_tenant.id,
                    created_at=datetime.utcnow()
                )
                demo_mvp.set_password('demo123')
                db.session.add(demo_mvp)
                print("   ✅ Demo MVP created")
            
            # Commit all demo users
            if any([demo_admin, demo_client, demo_mvp]):
                db.session.commit()
            
            print("\n" + "=" * 60)
            print("🎉 User creation completed successfully!")
            print("\n📋 Summary of created users:")
            print("   👑 Super Admin: superadmin / superadmin123")
            print("   👨‍💼 Admin: admin / admin123")
            print("   👥 Client: client / client123")
            print("   🎯 MVP: mvpuser / mvp123")
            print("   🧪 Demo Admin: demo_admin / demo123")
            print("   🧪 Demo Client: demo_client / demo123")
            print("   🧪 Demo MVP: demo_mvp / demo123")
            print("\n⚠️  IMPORTANT: Change all passwords after first login!")
            print("🌐 Access the system at: http://localhost:9889")
            print("=" * 60)
            
        except Exception as e:
            print(f"\n❌ Error creating users: {e}")
            import traceback
            traceback.print_exc()
            db.session.rollback()

def list_all_users():
    """List all users in the system"""
    app = create_app()
    
    with app.app_context():
        try:
            print("\n📋 Current users in the system:")
            print("=" * 60)
            
            users = User.query.all()
            if not users:
                print("No users found in the system.")
                return
            
            for user in users:
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
            
            print("\n" + "=" * 60)
            
        except Exception as e:
            print(f"❌ Error listing users: {e}")

if __name__ == '__main__':
    print("🚀 Traffic Interceptor - Comprehensive User Creation")
    print("=" * 60)
    
    # Create users
    create_comprehensive_users()
    
    # List all users
    list_all_users()
