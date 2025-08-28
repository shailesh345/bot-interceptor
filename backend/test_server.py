#!/usr/bin/env python3
"""
Simple test script to verify the server is working
"""
import requests
import time
import sys

def test_server():
    """Test if the server is responding"""
    base_url = "http://localhost:8960"
    
    print("Testing Traffic Interceptor API Server...")
    print(f"Base URL: {base_url}")
    
    # Test health endpoint
    try:
        print("\n1. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - server not running")
        return False
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    # Test API test endpoint
    try:
        print("\n2. Testing API test endpoint...")
        response = requests.get(f"{base_url}/test", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test auth endpoint
    try:
        print("\n3. Testing auth endpoint...")
        response = requests.get(f"{base_url}/auth", timeout=5)
        print(f"Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test domains endpoint (should require auth)
    try:
        print("\n4. Testing domains endpoint (should require auth)...")
        response = requests.get(f"{base_url}/domains", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("✅ Correctly requires authentication")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n✅ Server test completed!")
    return True

if __name__ == "__main__":
    success = test_server()
    sys.exit(0 if success else 1)
