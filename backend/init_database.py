#!/usr/bin/env python3
"""
Database initialization script for Traffic Interceptor SaaS
"""
import os
import sys
from datetime import datetime
import uuid

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def init_database():
    """Initialize the database with tables and initial data"""
    try:
        from app import create_app, db
        from app.models import User, Tenant, Domain
        
        print("🔧 Initializing database...")
        
        # Create app context
        app = create_app('development')
        
        with app.app_context():
            # Create all tables
            print("📋 Creating database tables...")
            db.create_all()
            print("✅ Tables created successfully")
            
            # Check if default tenant exists
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
            
            # Check if super admin exists
            super_admin = User.query.filter_by(role='super_admin').first()
            if not super_admin:
                print("👑 Creating super admin user...")
                super_admin = User(
                    uuid=str(uuid.uuid4()),
                    username='admin',
                    email='admin@trafficinterceptor.com',
                    first_name='Super',
                    last_name='Admin',
                    role='super_admin',
                    is_active=True,
                    is_verified=True,
                    created_at=datetime.utcnow()
                )
                super_admin.set_password('admin123')
                db.session.add(super_admin)
                db.session.commit()
                print("✅ Super admin created (username: admin, password: admin123)")
            
            # Check if demo user exists
            demo_user = User.query.filter_by(username='demo').first()
            if not demo_user:
                print("👤 Creating demo user...")
                demo_user = User(
                    uuid=str(uuid.uuid4()),
                    username='demo',
                    email='demo@trafficinterceptor.com',
                    first_name='Demo',
                    last_name='User',
                    role='user',
                    is_active=True,
                    is_verified=True,
                    tenant_id=default_tenant.id,
                    created_at=datetime.utcnow()
                )
                demo_user.set_password('demo123')
                db.session.add(demo_user)
                db.session.commit()
                print("✅ Demo user created (username: demo, password: demo123)")
            
            # Check if demo domain exists
            demo_domain = Domain.query.filter_by(domain_name='demo.example.com').first()
            if not demo_domain:
                print("🌐 Creating demo domain...")
                demo_domain = Domain(
                    domain_name='demo.example.com',
                    is_verified=True,
                    status='active',
                    tenant_id=default_tenant.id,
                    created_at=datetime.utcnow()
                )
                db.session.add(demo_domain)
                db.session.commit()
                print("✅ Demo domain created")
            
            print("\n🎉 Database initialization completed successfully!")
            print("\n📋 Available users:")
            print("   - Super Admin: admin / admin123")
            print("   - Demo User: demo / demo123")
            print("\n🌐 Demo domain: demo.example.com")
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Please install the required dependencies first:")
        print("pip install -r requirements_working.txt")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    init_database()
