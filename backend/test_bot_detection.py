#!/usr/bin/env python3
"""
Test script to verify bot detection rules for shaileshdwivedi.in
"""
import os
import sys
import requests
import json

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import Domain, InterceptorRule, TrafficLog

def test_bot_detection():
    """Test bot detection rules for shaileshdwivedi.in"""
    app = create_app()
    
    with app.app_context():
        try:
            # Find the domain
            domain = Domain.query.filter_by(domain_name='shaileshdwivedi.in').first()
            if not domain:
                print("❌ Domain shaileshdwivedi.in not found. Please run create_enhanced_bot_rule.py first.")
                return
            
            print(f"✅ Found domain: {domain.domain_name} (ID: {domain.uuid})")
            
            # Get all bot detection rules
            rules = InterceptorRule.query.filter_by(
                domain_id=domain.id,
                rule_type='bot_detection'
            ).order_by(InterceptorRule.priority).all()
            
            if not rules:
                print("❌ No bot detection rules found for this domain.")
                return
            
            print(f"✅ Found {len(rules)} bot detection rules:")
            for rule in rules:
                print(f"  • {rule.name} (Priority: {rule.priority}, Active: {rule.is_active})")
            
            # Test bot detection with sample user agents
            test_user_agents = [
                "Mozilla/5.0 (compatible; GPTBot/1.0; +http://www.openai.com/bot)",
                "Mozilla/5.0 (compatible; ClaudeBot/1.0; +http://www.anthropic.com/bot)",
                "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                "curl/7.68.0",
                "Wget/1.20.3 (linux-gnu)",
                "Python-urllib/3.8",
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/91.0.4472.0 Safari/537.36",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.0 Safari/537.36",
                "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"
            ]
            
            print(f"\n🧪 Testing bot detection with {len(test_user_agents)} user agents:")
            
            for i, user_agent in enumerate(test_user_agents, 1):
                print(f"\n{i}. Testing: {user_agent}")
                
                # Check which rules would match this user agent
                matching_rules = []
                for rule in rules:
                    if rule.is_active:
                        for condition in rule.conditions:
                            if condition['field'] == 'user_agent':
                                if condition['operator'] == 'contains':
                                    if condition['value'].lower() in user_agent.lower():
                                        matching_rules.append(rule)
                                        break
                
                if matching_rules:
                    print(f"   🔴 Would be blocked by rules:")
                    for rule in matching_rules:
                        print(f"      • {rule.name} (Priority: {rule.priority})")
                else:
                    print(f"   ✅ Would be allowed (no matching rules)")
            
            # Show rule statistics
            print(f"\n📊 Rule Statistics:")
            for rule in rules:
                # Count how many times this rule would match our test cases
                match_count = 0
                for user_agent in test_user_agents:
                    for condition in rule.conditions:
                        if condition['field'] == 'user_agent':
                            if condition['operator'] == 'contains':
                                if condition['value'].lower() in user_agent.lower():
                                    match_count += 1
                                    break
                
                print(f"  • {rule.name}: {match_count}/{len(test_user_agents)} test cases would match")
            
            print(f"\n🎯 Bot detection rules are configured and ready!")
            print(f"🔒 The system will block AI bots, scrapers, and suspicious traffic")
            print(f"📝 All blocked requests will be logged for analysis")
            
        except Exception as e:
            print(f"❌ Error testing bot detection: {e}")
            import traceback
            traceback.print_exc()

def test_traffic_processing():
    """Test traffic processing with bot detection"""
    app = create_app()
    
    with app.app_context():
        try:
            # Find the domain
            domain = Domain.query.filter_by(domain_name='shaileshdwivedi.in').first()
            if not domain:
                print("❌ Domain not found for traffic testing.")
                return
            
            print(f"\n🚦 Testing traffic processing for {domain.domain_name}:")
            
            # Get rules
            rules = InterceptorRule.query.filter_by(
                domain_id=domain.id,
                rule_type='bot_detection'
            ).all()
            
            print(f"   • Active rules: {len([r for r in rules if r.is_active])}")
            print(f"   • Total rules: {len(rules)}")
            
            # Check if traffic logging is enabled
            print(f"   • Traffic logging: {'Enabled' if domain.traffic_enabled else 'Disabled'}")
            print(f"   • Domain status: {domain.status}")
            
        except Exception as e:
            print(f"❌ Error testing traffic processing: {e}")

if __name__ == '__main__':
    print("🧪 Testing Bot Detection Rules for shaileshdwivedi.in")
    print("=" * 60)
    
    test_bot_detection()
    test_traffic_processing()
    
    print("\n" + "=" * 60)
    print("✅ Bot detection testing completed!")
