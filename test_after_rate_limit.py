#!/usr/bin/env python3
"""Test the rate limiting issue"""

import urllib.request
import json
import time

# Wait for rate limit to reset
print("Waiting for rate limit to reset...")
time.sleep(60)

try:
    print("Testing after rate limit reset...")
    
    # Test frontend login endpoint through proxy
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    data = json.dumps(login_data).encode('utf-8')
    request = urllib.request.Request(
        "http://localhost:3000/auth/login",
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Content-Length': str(len(data))
        },
        method='POST'
    )
    
    print("Attempting login...")
    with urllib.request.urlopen(request) as response:
        print(f"Login response: {response.getcode()}")
        result = json.loads(response.read().decode())
        print("Login successful!")
        
        if 'access_token' in result:
            token = result['access_token']
            
            # Test domains endpoint 
            print("\nTesting domains endpoint...")
            request = urllib.request.Request(
                "http://localhost:3000/api/v1/domains",
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
            )
            
            with urllib.request.urlopen(request) as response:
                print(f"Domains response: {response.getcode()}")
                domains = json.loads(response.read().decode())
                print(f"Domains count: {len(domains.get('domains', []))}")
                for domain in domains.get('domains', []):
                    print(f"  - {domain.get('domain_name', 'Unknown')}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
