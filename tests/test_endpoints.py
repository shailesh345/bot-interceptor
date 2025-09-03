#!/usr/bin/env python3
"""
Simple endpoint test script for Traffic Interceptor API
"""
import requests
import json

BASE_URL = "http://localhost:5001"

def test_endpoints():
    print("🚀 Testing Traffic Interceptor API Endpoints")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            print(f"   Response: {response.json()}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Login
    print("\n2. Testing Login...")
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            token = response.json()['access_token']
            print(f"   Token received: {token[:20]}...")
        else:
            print(f"   Error: {response.text}")
            return
    except Exception as e:
        print(f"   Error: {e}")
        return
    
    # Test 3: Traffic Interception
    print("\n3. Testing Traffic Interception...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        traffic_data = {
            "method": "GET",
            "url": "http://example.com/test",
            "headers": {"User-Agent": "Mozilla/5.0"},
            "client_ip": "192.168.1.1",
            "user_agent": "Mozilla/5.0 (Test Browser)"
        }
        response = requests.post(f"{BASE_URL}/api/traffic/intercept", json=traffic_data, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Bot detected: {result['interception_result']['bot_detected']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 4: ML Classification
    print("\n4. Testing ML Classification...")
    try:
        classify_data = {
            "client_ip": "192.168.1.1",
            "user_agent": "Mozilla/5.0 (Test Browser)",
            "headers": {"User-Agent": "Mozilla/5.0"},
            "path": "/test",
            "method": "GET"
        }
        response = requests.post(f"{BASE_URL}/api/traffic/classify", json=classify_data, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Is bot: {result['classification']['is_bot']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 5: Content Protection
    print("\n5. Testing Content Protection...")
    try:
        protect_data = {
            "url": "http://example.com/test",
            "method": "GET",
            "headers": {"User-Agent": "Mozilla/5.0"},
            "client_ip": "192.168.1.1",
            "path": "/test",
            "user_agent": "Mozilla/5.0 (Test Browser)"
        }
        response = requests.post(f"{BASE_URL}/api/traffic/protect", json=protect_data, headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Is allowed: {result['protection_result']['is_allowed']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 6: Real-time Metrics
    print("\n6. Testing Real-time Metrics...")
    try:
        response = requests.get(f"{BASE_URL}/api/traffic/metrics/realtime", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Total requests: {result['metrics']['total_requests']}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 7: Protection Rules
    print("\n7. Testing Protection Rules...")
    try:
        response = requests.get(f"{BASE_URL}/api/traffic/rules?domain=example.com", headers=headers)
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Total rules: {len(result['rules'])}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    print("\n" + "=" * 50)
    print("✅ Endpoint testing completed!")

if __name__ == "__main__":
    test_endpoints()
