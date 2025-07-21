#!/usr/bin/env python3
import urllib.request
import json

try:
    print("Testing login endpoint...")
    
    # Test login endpoint
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    data = json.dumps(login_data).encode('utf-8')
    request = urllib.request.Request(
        "http://127.0.0.1:5000/auth/login",
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Content-Length': str(len(data))
        },
        method='POST'
    )
    
    with urllib.request.urlopen(request) as response:
        print(f"Login response: {response.getcode()}")
        result = json.loads(response.read().decode())
        print(f"Response: {result}")
        if 'access_token' in result:
            print("Login successful!")
            token = result['access_token']
            
            # Test domains endpoint
            print("\nTesting domains endpoint...")
            request = urllib.request.Request(
                "http://127.0.0.1:5000/api/v1/domains",
                headers={
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
            )
            
            with urllib.request.urlopen(request) as response:
                print(f"Domains response: {response.getcode()}")
                domains = json.loads(response.read().decode())
                print(f"Domains: {domains}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
