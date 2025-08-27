#!/usr/bin/env python3
"""
Enhanced script to create comprehensive bot detection rules for shaileshdwivedi.in
"""
import os
import sys
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Domain, InterceptorRule, Tenant

def create_enhanced_bot_rules():
    """Create comprehensive bot detection rules for shaileshdwivedi.in"""
    app = create_app()
    
    with app.app_context():
        try:
            # Get or create default tenant
            tenant = Tenant.query.first()
            if not tenant:
                print("⚠️  No tenant found. Creating default tenant...")
                tenant = Tenant(
                    name='Default Tenant',
                    slug='default',
                    domain='shaileshdwivedi.in',
                    status='active'
                )
                db.session.add(tenant)
                db.session.commit()
                print(f"✅ Created default tenant: {tenant.name} (ID: {tenant.id})")
            else:
                print(f"✅ Using existing tenant: {tenant.name} (ID: {tenant.id})")
            
            # Get or create admin user
            admin_user = User.query.filter_by(email='admin@trafficinterceptor.com').first()
            if not admin_user:
                print("❌ No admin user found. Please run create_admin.py first.")
                return
            
            # Update admin user to have tenant_id if it doesn't
            if admin_user.tenant_id is None:
                admin_user.tenant_id = tenant.id
                db.session.commit()
                print(f"✅ Updated admin user to belong to tenant {tenant.id}")
            
            print(f"✅ Using admin user: {admin_user.username} (ID: {admin_user.id})")
            
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
            
            # Define comprehensive bot detection rules
            bot_rules = [
                {
                    'name': 'AI Training Bot Blocking',
                    'description': 'Block AI training bots like GPTBot, ClaudeBot, etc.',
                    'conditions': [
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'GPTBot', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'ClaudeBot', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'ChatGPT', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'anthropic', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'openai', 'connector': None}
                    ],
                    'actions': [
                        {'type': 'block_request', 'value': True},
                        {'type': 'log_event', 'value': 'ai_bot_blocked'},
                        {'type': 'challenge', 'value': 'captcha'}
                    ],
                    'priority': 1
                },
                {
                    'name': 'Web Scraping Bot Detection',
                    'description': 'Detect and block web scraping bots',
                    'conditions': [
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'scraper', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'crawler', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'spider', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'bot', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'headless', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'phantom', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'selenium', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'puppeteer', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'playwright', 'connector': None}
                    ],
                    'actions': [
                        {'type': 'block_request', 'value': True},
                        {'type': 'log_event', 'value': 'scraping_bot_blocked'},
                        {'type': 'challenge', 'value': 'captcha'}
                    ],
                    'priority': 2
                },
                {
                    'name': 'Tool-Based Bot Detection',
                    'description': 'Block bots using common tools like curl, wget, etc.',
                    'conditions': [
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'curl', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'wget', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'python', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'java', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'perl', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'ruby', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'php', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'node', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'go-http', 'connector': 'OR'},
                        {'field': 'user_agent', 'operator': 'contains', 'value': 'rust', 'connector': None}
                    ],
                    'actions': [
                        {'type': 'block_request', 'value': True},
                        {'type': 'log_event', 'value': 'tool_bot_blocked'},
                        {'type': 'challenge', 'value': 'captcha'}
                    ],
                    'priority': 3
                },
                {
                    'name': 'Rate Limiting for Suspicious IPs',
                    'description': 'Rate limit requests from suspicious IPs',
                    'conditions': [
                        {'field': 'requests_per_minute', 'operator': 'greater_than', 'value': 100, 'connector': None}
                    ],
                    'actions': [
                        {'type': 'rate_limit', 'value': {'limit': 50, 'window': 60}},
                        {'type': 'log_event', 'value': 'rate_limit_applied'},
                        {'type': 'challenge', 'value': 'captcha'}
                    ],
                    'priority': 4
                }
            ]
            
            # Create each rule
            created_rules = []
            for rule_data in bot_rules:
                # Check if rule already exists
                existing_rule = InterceptorRule.query.filter_by(
                    name=rule_data['name'],
                    domain_id=domain.id
                ).first()
                
                if existing_rule:
                    print(f"✅ Rule '{rule_data['name']}' already exists with ID: {existing_rule.uuid}")
                    created_rules.append(existing_rule)
                    continue
                
                # Create rule
                rule = InterceptorRule(
                    name=rule_data['name'],
                    description=rule_data['description'],
                    rule_type='bot_detection',
                    conditions=rule_data['conditions'],
                    actions=rule_data['actions'],
                    priority=rule_data['priority'],
                    is_active=True,
                    domain_id=domain.id,
                    user_id=admin_user.id,
                    tenant_id=tenant.id
                )
                
                db.session.add(rule)
                created_rules.append(rule)
                print(f"✅ Created rule: {rule_data['name']}")
            
            # Commit all rules
            db.session.commit()
            
            print(f"\n🎉 Successfully created {len(created_rules)} bot detection rules for {domain.domain_name}")
            print(f"📋 Domain ID: {domain.uuid}")
            print(f"🔒 Rules will block AI bots, scrapers, and suspicious traffic")
            print(f"📊 All rules are active and ready to use")
            
            # Display rule summary
            print(f"\n📋 Rule Summary:")
            for rule in created_rules:
                print(f"  • {rule.name} (Priority: {rule.priority})")
            
        except Exception as e:
            print(f"❌ Error creating enhanced bot rules: {e}")
            db.session.rollback()
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    create_enhanced_bot_rules()
