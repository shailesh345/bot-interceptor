#!/usr/bin/env python3
"""
Setup DNS Proxy Domains for Real-time Traffic
Creates the required domains in the database for DNS proxy traffic
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app import create_app, db
from backend.app.models import User, Domain
from datetime import datetime
import uuid

def setup_dns_domains():
    """Setup domains for DNS proxy traffic"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🔧 Setting up DNS proxy domains for real-time traffic...")
            
            # Find or create a user (admin user)
            user = User.query.filter_by(role='admin').first()
            if not user:
                # Create an admin user
                user = User(
                    uuid=str(uuid.uuid4()),
                    email='admin@bootinterceptor.com',
                    name='Boot Interceptor Admin',
                    role='admin',
                    tenant_id='default',
                    is_verified=True,
                    created_at=datetime.utcnow()
                )
                db.session.add(user)
                db.session.flush()
                print(f"✅ Created admin user: {user.email}")
            else:
                print(f"✅ Using existing admin user: {user.email}")
            
            # DNS proxy domains to register
            dns_domains = [
                'localhost',
                '127.0.0.1',
                'test-shaileshdwivedi.in',
                'shaileshdwivedi.in'
            ]
            
            created_domains = []
            updated_domains = []
            
            for domain_name in dns_domains:
                # Check if domain already exists
                existing_domain = Domain.query.filter_by(domain_name=domain_name).first()
                
                if existing_domain:
                    # Update existing domain to be verified and traffic-enabled
                    existing_domain.is_verified = True
                    existing_domain.traffic_enabled = True
                    existing_domain.status = 'verified'
                    existing_domain.verified_at = datetime.utcnow()
                    existing_domain.updated_at = datetime.utcnow()
                    updated_domains.append(domain_name)
                    print(f"🔄 Updated existing domain: {domain_name}")
                else:
                    # Create new domain
                    new_domain = Domain(
                        uuid=str(uuid.uuid4()),
                        domain_name=domain_name,
                        tenant_id=user.tenant_id,
                        is_verified=True,  # Auto-verify for DNS proxy
                        traffic_enabled=True,  # Enable traffic monitoring
                        status='verified',
                        verified_at=datetime.utcnow(),
                        verification_token=str(uuid.uuid4()),
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow()
                    )
                    db.session.add(new_domain)
                    created_domains.append(domain_name)
                    print(f"✅ Created new domain: {domain_name}")
            
            # Commit all changes
            db.session.commit()
            
            print("\n🎉 DNS Proxy Domain Setup Complete!")
            print(f"📊 Summary:")
            print(f"   • Created domains: {len(created_domains)}")
            print(f"   • Updated domains: {len(updated_domains)}")
            print(f"   • Total DNS domains: {len(dns_domains)}")
            
            if created_domains:
                print(f"✅ New domains: {', '.join(created_domains)}")
            if updated_domains:
                print(f"🔄 Updated domains: {', '.join(updated_domains)}")
                
            print("\n🚀 Real-time traffic should now work!")
            print("📊 Visit http://localhost:8080 to generate traffic")
            print("📱 Check monitoring dashboard for real-time updates")
            
            # Verify the setup
            print("\n🔍 Verification:")
            all_domains = Domain.query.filter(Domain.domain_name.in_(dns_domains)).all()
            for domain in all_domains:
                status = "✅" if (domain.is_verified and domain.traffic_enabled) else "❌"
                print(f"   {status} {domain.domain_name}: verified={domain.is_verified}, traffic_enabled={domain.traffic_enabled}")
                
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error setting up DNS domains: {e}")
            return False
            
    return True

if __name__ == '__main__':
    success = setup_dns_domains()
    if success:
        print("\n🎯 Setup completed successfully!")
        exit(0)
    else:
        print("\n💥 Setup failed!")
        exit(1)
