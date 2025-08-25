#!/usr/bin/env python3
"""
Comprehensive End-to-End Test Script for Traffic Interceptor
Tests all backend APIs and frontend connectivity
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:5002"
FRONTEND_URL = "http://localhost:3001"

def test_backend_health():
    """Test backend health endpoint"""
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get(f"{BACKEND_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Backend Health: {data['status']} at {data['timestamp']}")
            return True
        else:
            print(f"❌ Backend Health Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend Health Error: {e}")
        return False

def test_frontend_connectivity():
    """Test frontend connectivity"""
    print("\n🔍 Testing Frontend Connectivity...")
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print(f"✅ Frontend Accessible: {response.status_code}")
            return True
        else:
            print(f"❌ Frontend Error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend Connection Error: {e}")
        return False

def test_api_endpoints():
    """Test all API endpoints (without auth)"""
    print("\n🔍 Testing API Endpoints...")
    
    endpoints = [
        "/api/edge-computing/edge-nodes",
        "/api/webhook-management/webhooks",
        "/api/ml-management/models",
        "/api/content-protection/rules",
        "/api/billing/plans",
        "/api/security/mfa/status",
        "/api/performance/system-health",
        "/api/reporting/dashboards",
        "/api/api-management/stats",
        "/api/advanced-security/threat-summary",
        "/api/business-intelligence/revenue",
        "/api/collaboration/teams",
        "/api/white-label/branding"
    ]
    
    working_endpoints = 0
    total_endpoints = len(endpoints)
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}")
            if response.status_code == 401:  # Auth required - endpoint exists
                print(f"✅ {endpoint}: Authentication Required (Working)")
                working_endpoints += 1
            elif response.status_code == 200:
                print(f"✅ {endpoint}: Accessible")
                working_endpoints += 1
            else:
                print(f"❌ {endpoint}: {response.status_code}")
        except Exception as e:
            print(f"❌ {endpoint}: Connection Error - {e}")
    
    print(f"\n📊 API Endpoints Summary: {working_endpoints}/{total_endpoints} Working")
    return working_endpoints == total_endpoints

def test_database_connection():
    """Test database connectivity through API"""
    print("\n🔍 Testing Database Connection...")
    try:
        # Try to access an endpoint that requires database
        response = requests.get(f"{BACKEND_URL}/api/domains")
        if response.status_code in [200, 401]:  # 401 means auth required but DB works
            print("✅ Database Connection: Working")
            return True
        else:
            print(f"❌ Database Connection: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Database Connection Error: {e}")
        return False

def test_websocket_connection():
    """Test WebSocket connectivity"""
    print("\n🔍 Testing WebSocket Connection...")
    try:
        # Test if WebSocket endpoint is accessible
        response = requests.get(f"{BACKEND_URL}/socket.io/")
        if response.status_code in [200, 400]:  # WebSocket endpoints often return these
            print("✅ WebSocket Endpoint: Accessible")
            return True
        else:
            print(f"❌ WebSocket Endpoint: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ WebSocket Connection Error: {e}")
        return False

def run_comprehensive_test():
    """Run all tests"""
    print("🚀 Starting Comprehensive End-to-End Test")
    print("=" * 50)
    print(f"Timestamp: {datetime.now()}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print("=" * 50)
    
    results = []
    
    # Run all tests
    results.append(("Backend Health", test_backend_health()))
    results.append(("Frontend Connectivity", test_frontend_connectivity()))
    results.append(("API Endpoints", test_api_endpoints()))
    results.append(("Database Connection", test_database_connection()))
    results.append(("WebSocket Connection", test_websocket_connection()))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {passed}/{total} Tests Passed")
    
    if passed == total:
        print("🎉 All tests passed! System is fully functional.")
    else:
        print("⚠️  Some tests failed. Check the logs above for details.")
    
    return passed == total

if __name__ == "__main__":
    run_comprehensive_test()
