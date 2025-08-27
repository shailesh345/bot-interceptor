#!/usr/bin/env python3
"""
Script to create domain shaileshdwivedi.in and add bot detection rule
"""
import os
import sys
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Domain, InterceptorRule, Tenant

def create_domain_and_rule():
    """Create domain shaileshdwivedi.in and bot detection rule"""
    app = create_app()
    
    with app.app_context():
        try:
            # Get or create default tenant
            tenant = Tenant.query.first()
            if not tenant:
                print("❌ No tenant found. Please create a tenant first.")
                return
            
            # Get or create admin user
            admin_user = User.query.filter_by(email='admin@admin.com').first()
            if not admin_user:
                print("❌ No admin user found. Please run create_admin.py first.")
                return
            
            # Check if domain already exists
            existing_domain = Domain.query.filter_by(domain_name='shaileshdwivedi.in').first()
            if existing_domain:
                print(f"✅ Domain shaileshdwivedi.in already exists with ID: {existing_domain.uuid}")
                domain = existing_domain
            else:
                # Create domain
                domain = Domain(
                    domain_name='shaileshdwivedi.in',
                    tenant_id=tenant.id,
                    is_verified=True,  # Mark as verified for testing
                    verification_method='dns',
                    ssl_enabled=True,
                    cdn_enabled=False,
                    traffic_enabled=True,
                    status='active',
                    verified_at=datetime.utcnow()
                )
                
                db.session.add(domain)
                db.session.commit()
                print(f"✅ Domain shaileshdwivedi.in created successfully with ID: {domain.uuid}")
            
            # Check if bot detection rule already exists
            existing_rule = InterceptorRule.query.filter_by(
                name='ShaileshDwivedi Bot Detection',
                domain_id=domain.id
            ).first()
            
            if existing_rule:
                print(f"✅ Bot detection rule already exists with ID: {existing_rule.uuid}")
                return
            
            # Create bot detection rule
            bot_rule = InterceptorRule(
                name='ShaileshDwivedi Bot Detection',
                description='Advanced bot detection and blocking for shaileshdwivedi.in domain',
                rule_type='bot_detection',
                conditions=[
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'bot',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'crawler',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'spider',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'scraper',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'curl',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'wget',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'python',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'selenium',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'phantom',
                        'connector': 'OR'
                    },
                    {
                        'field': 'user_agent',
                        'operator': 'contains',
                        'value': 'headless',
                        'connector': None
                    }
                ],
                actions=[
                    {
                        'type': 'block_request',
                        'value': True
                    },
                    {
                        'type': 'log_event',
                        'value': 'bot_blocked_shaileshdwivedi'
                    },
                    {
                        'type': 'challenge',
                        'value': 'captcha'
                    }
                ],
                priority=1,
                is_active=True,
                domain_id=domain.id,
                user_id=admin_user.id,
                tenant_id=tenant.id
            )
            
            db.session.add(bot_rule)
            db.session.commit()
            
            print(f"✅ Bot detection rule created successfully with ID: {bot_rule.uuid}")
            print(f"📋 Rule Name: {bot_rule.name}")
            print(f"🎯 Domain: {domain.domain_name}")
            print(f"🔒 Actions: Block requests, Log events, Challenge with captcha")
            print(f"⚡ Priority: {bot_rule.priority}")
            print(f"✅ Status: {'Active' if bot_rule.is_active else 'Inactive'}")
            
        except Exception as e:
            print(f"❌ Error creating domain and rule: {e}")
            db.session.rollback()
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    create_domain_and_rule()
