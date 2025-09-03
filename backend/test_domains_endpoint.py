#!/usr/bin/env python3
"""
Test script to isolate the domains endpoint 500 error
"""

import requests
import json

def test_domains_endpoint():
    """Test the domains endpoint to see what the actual error is"""
    
    print("🧪 Testing Domains Endpoint")
    print("=" * 40)
    
    # Test 1: Health check
    print("\n1️⃣ Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8960/health")
        print(f"Health check: {response.status_code}")
        if response.status_code == 200:
            print("✅ Health check successful")
        else:
            print(f"❌ Health check failed: {response.text}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return
    
    # Test 2: Domains endpoint without auth (should fail with 401)
    print("\n2️⃣ Testing domains endpoint without authentication...")
    try:
        response = requests.post(
            "http://localhost:8960/api/domains",
            headers={"Content-Type": "application/json"},
            json={"domain_name": "test.com", "verification_method": "dns"}
        )
        print(f"Domains endpoint (no auth): {response.status_code}")
        if response.status_code == 401:
            print("✅ Correctly rejected unauthorized request")
        else:
            print(f"❌ Unexpected response: {response.text}")
    except Exception as e:
        print(f"❌ Domains endpoint error: {e}")
    
    # Test 3: Check if server is actually running
    print("\n3️⃣ Checking server status...")
    try:
        response = requests.get("http://localhost:8960/")
        print(f"Root endpoint: {response.status_code}")
    except Exception as e:
        print(f"❌ Server not accessible: {e}")
        print("The server might not be running or there's a configuration issue")
    
    print("\n" + "=" * 40)
    print("Test completed!")

if __name__ == "__main__":
    test_domains_endpoint()
