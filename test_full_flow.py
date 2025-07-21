#!/usr/bin/env python3
"""
Simple test to verify the domain page works end-to-end
"""
import time
import requests
import json

def test_full_flow():
    print("Testing full authentication and domains flow...")
    
    # Step 1: Login
    login_url = "http://127.0.0.1:5000/auth/login"
    login_data = {
        "email": "test@example.com", 
        "password": "password123"
    }
    
    print("\n1. Testing login...")
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Login response: {response.status_code}")
        
        if response.status_code == 200:
            login_result = response.json()
            token = login_result.get('access_token')
            user = login_result.get('user')
            print(f"✓ Login successful - User: {user['username']}")
            print(f"✓ Token: {token[:30]}...")
            
            # Step 2: Test domains endpoint
            domains_url = "http://127.0.0.1:5000/api/v1/domains"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            print("\n2. Testing domains endpoint...")
            domains_response = requests.get(domains_url, headers=headers)
            print(f"Domains response: {domains_response.status_code}")
            
            if domains_response.status_code == 200:
                domains_data = domains_response.json()
                print(f"✓ Domains endpoint working - Found {len(domains_data.get('domains', []))} domains")
                
                # Step 3: Test creating a domain
                create_data = {
                    "name": "test-domain.com",
                    "interception_type": "full",
                    "rules": []
                }
                
                print("\n3. Testing domain creation...")
                create_response = requests.post(domains_url, json=create_data, headers=headers)
                print(f"Create domain response: {create_response.status_code}")
                
                if create_response.status_code == 201:
                    domain_data = create_response.json()
                    print(f"✓ Domain created successfully - ID: {domain_data.get('id')}")
                    
                    # Step 4: Test listing domains again
                    print("\n4. Testing domains list after creation...")
                    list_response = requests.get(domains_url, headers=headers)
                    if list_response.status_code == 200:
                        updated_domains = list_response.json()
                        print(f"✓ Updated domains list - Found {len(updated_domains.get('domains', []))} domains")
                        return True
                    else:
                        print(f"✗ Failed to list domains: {list_response.text}")
                else:
                    print(f"✗ Failed to create domain: {create_response.text}")
            else:
                print(f"✗ Failed to access domains: {domains_response.text}")
        else:
            print(f"✗ Login failed: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    return False

if __name__ == "__main__":
    success = test_full_flow()
    if success:
        print("\n🎉 All tests passed! The domains page should be working correctly.")
    else:
        print("\n❌ Some tests failed. Please check the errors above.")
