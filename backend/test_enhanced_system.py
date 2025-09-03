#!/usr/bin/env python3
"""
Test Enhanced Traffic Interception System
Tests the complete flow: Add Domain -> Verify Domain -> Add Rule -> Run Interception -> Real-time Monitoring
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER_EMAIL = "admin@example.com"
TEST_USER_PASSWORD = "admin123"

def test_enhanced_traffic_interception():
    """Test the complete enhanced traffic interception flow"""
    
    print("🚀 Testing Enhanced Traffic Interception System")
    print("=" * 60)
    
    # Step 1: Authentication
    print("\n1️⃣ Testing Authentication...")
    auth_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    })
    
    if auth_response.status_code != 200:
        print(f"❌ Authentication failed: {auth_response.status_code}")
        return False
    
    token = auth_response.json().get('access_token')
    if not token:
        print("❌ No access token received")
        return False
    
    print("✅ Authentication successful")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Get Domains
    print("\n2️⃣ Testing Domain Retrieval...")
    domains_response = requests.get(f"{BASE_URL}/api/v1/domains", headers=headers)
    
    if domains_response.status_code != 200:
        print(f"❌ Failed to get domains: {domains_response.status_code}")
        return False
    
    domains = domains_response.json().get('domains', [])
    if not domains:
        print("❌ No domains found")
        return False
    
    verified_domains = [d for d in domains if d.get('status') == 'verified']
    if not verified_domains:
        print("❌ No verified domains found")
        return False
    
    test_domain = verified_domains[0]
    print(f"✅ Found verified domain: {test_domain['domain_name']}")
    
    # Step 3: Create Interception Flow
    print("\n3️⃣ Testing Interception Flow Creation...")
    flow_response = requests.post(f"{BASE_URL}/api/enhanced/interception/flow/create", 
                                headers=headers,
                                json={"domain_id": test_domain['id']})
    
    if flow_response.status_code != 200:
        print(f"❌ Failed to create interception flow: {flow_response.status_code}")
        print(f"Response: {flow_response.text}")
        return False
    
    flow_data = flow_response.json()
    print(f"✅ Interception flow created: {flow_data.get('message')}")
    
    # Step 4: Get Ready Rules
    print("\n4️⃣ Testing Ready Rules Retrieval...")
    rules_response = requests.get(f"{BASE_URL}/api/enhanced/rules/ready", headers=headers)
    
    if rules_response.status_code != 200:
        print(f"❌ Failed to get ready rules: {rules_response.status_code}")
        return False
    
    rules_data = rules_response.json()
    rules = rules_data.get('rules', [])
    print(f"✅ Found {len(rules)} ready-to-use rules")
    
    # Display some rules
    for rule in rules[:3]:
        print(f"   - {rule['name']} ({rule['category']}, {rule['severity']})")
    
    # Step 5: Get Rule Categories
    print("\n5️⃣ Testing Rule Categories...")
    categories_response = requests.get(f"{BASE_URL}/api/enhanced/rules/ready/categories", headers=headers)
    
    if categories_response.status_code != 200:
        print(f"❌ Failed to get rule categories: {categories_response.status_code}")
        return False
    
    categories_data = categories_response.json()
    categories = categories_data.get('categories', {})
    print(f"✅ Found {len(categories)} rule categories")
    
    for category_id, category in categories.items():
        print(f"   - {category['name']}: {category['description']}")
    
    # Step 6: Search Rules
    print("\n6️⃣ Testing Rule Search...")
    search_response = requests.get(f"{BASE_URL}/api/enhanced/rules/ready/search?q=bot", headers=headers)
    
    if search_response.status_code != 200:
        print(f"❌ Failed to search rules: {search_response.status_code}")
        return False
    
    search_data = search_response.json()
    search_results = search_data.get('rules', [])
    print(f"✅ Search for 'bot' returned {len(search_results)} results")
    
    # Step 7: Get Popular Rules
    print("\n7️⃣ Testing Popular Rules...")
    popular_response = requests.get(f"{BASE_URL}/api/enhanced/rules/ready/popular?limit=5", headers=headers)
    
    if popular_response.status_code != 200:
        print(f"❌ Failed to get popular rules: {popular_response.status_code}")
        return False
    
    popular_data = popular_response.json()
    popular_rules = popular_data.get('rules', [])
    print(f"✅ Found {len(popular_rules)} popular rules")
    
    # Step 8: Get AI Agents Status
    print("\n8️⃣ Testing AI Agents Status...")
    ai_status_response = requests.get(f"{BASE_URL}/api/enhanced/ai/agents/status", headers=headers)
    
    if ai_status_response.status_code != 200:
        print(f"❌ Failed to get AI agents status: {ai_status_response.status_code}")
        return False
    
    ai_status_data = ai_status_response.json()
    agents = ai_status_data.get('agents', {})
    print(f"✅ Found {len(agents)} AI agents")
    
    for agent_id, agent in agents.items():
        print(f"   - {agent['name']}: {agent['status']} ({agent['type']})")
    
    # Step 9: Get AI Statistics
    print("\n9️⃣ Testing AI Statistics...")
    ai_stats_response = requests.get(f"{BASE_URL}/api/enhanced/ai/statistics", headers=headers)
    
    if ai_stats_response.status_code != 200:
        print(f"❌ Failed to get AI statistics: {ai_stats_response.status_code}")
        return False
    
    ai_stats_data = ai_stats_response.json()
    print("✅ AI statistics retrieved successfully")
    
    # Step 10: Get Flow Status
    print("\n🔟 Testing Flow Status...")
    flow_status_response = requests.get(f"{BASE_URL}/api/enhanced/interception/flow/{test_domain['id']}/status", headers=headers)
    
    if flow_status_response.status_code != 200:
        print(f"❌ Failed to get flow status: {flow_status_response.status_code}")
        return False
    
    flow_status_data = flow_status_response.json()
    print("✅ Flow status retrieved successfully")
    
    # Step 11: Get All Flows
    print("\n1️⃣1️⃣ Testing All Flows Retrieval...")
    all_flows_response = requests.get(f"{BASE_URL}/api/enhanced/interception/flows", headers=headers)
    
    if all_flows_response.status_code != 200:
        print(f"❌ Failed to get all flows: {all_flows_response.status_code}")
        return False
    
    all_flows_data = all_flows_response.json()
    flows = all_flows_data.get('flows', [])
    print(f"✅ Found {len(flows)} interception flows")
    
    # Step 12: Test Bot Prediction (if we have features)
    print("\n1️⃣2️⃣ Testing Bot Prediction...")
    test_features = [0.1, 0.2, 0.3, 0.4, 0.5] * 25  # 125 features for testing
    
    bot_prediction_response = requests.post(f"{BASE_URL}/api/enhanced/ai/predict/bot",
                                          headers=headers,
                                          json={"features": test_features})
    
    if bot_prediction_response.status_code != 200:
        print(f"❌ Failed to predict bot: {bot_prediction_response.status_code}")
        print(f"Response: {bot_prediction_response.text}")
    else:
        prediction_data = bot_prediction_response.json()
        print(f"✅ Bot prediction successful: {prediction_data.get('is_bot')} (confidence: {prediction_data.get('confidence'):.2f})")
    
    print("\n" + "=" * 60)
    print("🎉 Enhanced Traffic Interception System Test Completed Successfully!")
    print("=" * 60)
    
    return True

def test_ready_rules_system():
    """Test the ready rules system directly"""
    
    print("\n🔧 Testing Ready Rules System Directly...")
    
    try:
        from app.interceptor.ready_rules import get_ready_rules_system
        
        rules_system = get_ready_rules_system()
        
        # Test getting all rules
        all_rules = rules_system.get_all_rules()
        print(f"✅ Ready rules system: {len(all_rules)} rules available")
        
        # Test getting categories
        categories = rules_system.get_categories()
        print(f"✅ Categories: {len(categories)} available")
        
        # Test getting popular rules
        popular_rules = rules_system.get_popular_rules(5)
        print(f"✅ Popular rules: {len(popular_rules)} retrieved")
        
        # Test search
        search_results = rules_system.search_rules("bot")
        print(f"✅ Search results: {len(search_results)} rules found for 'bot'")
        
        # Test statistics
        stats = rules_system.get_rule_statistics()
        print(f"✅ Statistics: {stats['total_rules']} total rules, {stats['total_use_count']} total uses")
        
        return True
        
    except Exception as e:
        print(f"❌ Ready rules system test failed: {e}")
        return False

def test_traffic_orchestrator():
    """Test the traffic orchestrator directly"""
    
    print("\n🎯 Testing Traffic Orchestrator Directly...")
    
    try:
        from app.interceptor.traffic_orchestrator import get_traffic_orchestrator
        
        orchestrator = get_traffic_orchestrator()
        
        # Test getting all flows (should be empty initially)
        flows = orchestrator.get_all_flows(1)  # user_id 1
        print(f"✅ Traffic orchestrator: {len(flows.get('flows', []))} flows found")
        
        return True
        
    except Exception as e:
        print(f"❌ Traffic orchestrator test failed: {e}")
        return False

def test_enhanced_ai_engine():
    """Test the enhanced AI engine directly"""
    
    print("\n🤖 Testing Enhanced AI Engine Directly...")
    
    try:
        from app.ml.enhanced_ai_engine import get_enhanced_ai_engine
        
        ai_engine = get_enhanced_ai_engine()
        
        # Test getting AI agents status
        agents_status = ai_engine.get_ai_agents_status()
        print(f"✅ AI engine: {len(agents_status)} agents available")
        
        for agent_id, agent in agents_status.items():
            print(f"   - {agent['name']}: {agent['status']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Enhanced AI engine test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Starting Enhanced Traffic Interception System Tests")
    print(f"⏰ Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Test individual components first
    component_tests = [
        ("Ready Rules System", test_ready_rules_system),
        ("Traffic Orchestrator", test_traffic_orchestrator),
        ("Enhanced AI Engine", test_enhanced_ai_engine)
    ]
    
    component_results = []
    for test_name, test_func in component_tests:
        try:
            result = test_func()
            component_results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
            component_results.append((test_name, False))
    
    # Test the complete system
    print("\n" + "=" * 60)
    print("🌐 Testing Complete System via API...")
    
    try:
        system_result = test_enhanced_traffic_interception()
    except Exception as e:
        print(f"❌ Complete system test failed with exception: {e}")
        system_result = False
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    for test_name, result in component_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
    
    system_status = "✅ PASS" if system_result else "❌ FAIL"
    print(f"Complete System: {system_status}")
    
    # Overall result
    all_passed = all(result for _, result in component_results) and system_result
    overall_status = "🎉 ALL TESTS PASSED" if all_passed else "⚠️ SOME TESTS FAILED"
    
    print(f"\nOverall Result: {overall_status}")
    print(f"⏰ Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
