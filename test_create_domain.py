#!/usr/bin/env python3
import urllib.request
import json

try:
    print("Testing domain creation...")
    
    # First, login to get token
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
        result = json.loads(response.read().decode())
        token = result['access_token']
        print("Login successful!")
    
    # Create a new domain
    print("\nCreating new domain...")
    domain_data = {
        "domain_name": "testdomain.com",
        "ssl_enabled": True,
        "verification_method": "dns"
    }
    
    data = json.dumps(domain_data).encode('utf-8')
    request = urllib.request.Request(
        "http://127.0.0.1:5000/api/v1/domains",
        data=data,
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json',
            'Content-Length': str(len(data))
        },
        method='POST'
    )
    
    with urllib.request.urlopen(request) as response:
        print(f"Create domain response: {response.getcode()}")
        result = json.loads(response.read().decode())
        print(f"Domain created: {result}")
    
    # List domains again to verify
    print("\nListing domains after creation...")
    request = urllib.request.Request(
        "http://127.0.0.1:5000/api/v1/domains",
        headers={
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    )
    
    with urllib.request.urlopen(request) as response:
        domains = json.loads(response.read().decode())
        print(f"All domains: {domains}")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
