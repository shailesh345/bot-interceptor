#!/usr/bin/env python3
"""Test script to verify frontend authentication flow"""

import urllib.request
import json
import time

try:
    print("Testing frontend authentication flow...")
    
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
    
    print("Attempting login through frontend proxy...")
    with urllib.request.urlopen(request) as response:
        print(f"Login response: {response.getcode()}")
        result = json.loads(response.read().decode())
        print(f"Login result: {result}")
        
        if 'access_token' in result:
            token = result['access_token']
            print("Login successful!")
            
            # Test domains endpoint through proxy
            print("\nTesting domains endpoint through proxy...")
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
                print(f"Domains: {domains}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
