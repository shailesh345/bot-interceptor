#!/usr/bin/env python3
"""
Test script to verify frontend-backend communication when domains page is loaded
"""
import requests
import json

def test_frontend_domains_api():
    print("Testing frontend domains API through proxy...")
    
    # First, login to get a token
    print("\n1. Getting fresh token...")
    login_url = "http://localhost:3000/auth/login"
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Login response: {response.status_code}")
        
        if response.status_code == 200:
            login_result = response.json()
            token = login_result.get('access_token')
            print(f"✓ Token received: {token[:30]}...")
            
            # Test domains endpoint through frontend proxy
            print("\n2. Testing domains endpoint through frontend proxy...")
            domains_url = "http://localhost:3000/api/v1/domains"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            domains_response = requests.get(domains_url, headers=headers)
            print(f"Domains proxy response: {domains_response.status_code}")
            
            if domains_response.status_code == 200:
                domains_data = domains_response.json()
                print(f"✓ Domains through proxy: {len(domains_data.get('domains', []))} domains found")
                return True
            else:
                print(f"✗ Domains proxy error: {domains_response.text}")
        else:
            print(f"✗ Login failed: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    return False

if __name__ == "__main__":
    success = test_frontend_domains_api()
    if success:
        print("\n🎉 Frontend proxy is working correctly!")
    else:
        print("\n❌ Frontend proxy test failed.")
