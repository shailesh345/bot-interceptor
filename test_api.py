#!/usr/bin/env python3
"""Test script to verify backend API functionality"""

import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_login():
    """Test user login"""
    print("Testing login...")
    
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login response: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Login successful: {result.get('message')}")
        return result.get('access_token')
    else:
        print(f"Login failed: {response.text}")
        return None

def test_domains(token):
    """Test domain management endpoints"""
    if not token:
        print("No token available, skipping domain tests")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\nTesting domain endpoints...")
    
    # Get domains
    print("Getting domains...")
    response = requests.get(f"{BASE_URL}/api/v1/domains", headers=headers)
    print(f"Get domains response: {response.status_code}")
    if response.status_code == 200:
        domains = response.json()
        print(f"Current domains: {domains}")
    else:
        print(f"Get domains failed: {response.text}")
    
    # Create domain
    print("\nCreating domain...")
    domain_data = {
        "domain_name": "example.com",
        "ssl_enabled": True,
        "verification_method": "dns"
    }
    
    response = requests.post(f"{BASE_URL}/api/v1/domains", json=domain_data, headers=headers)
    print(f"Create domain response: {response.status_code}")
    if response.status_code == 201:
        domain = response.json()
        print(f"Domain created: {domain}")
        return domain.get('domain', {}).get('id')
    else:
        print(f"Create domain failed: {response.text}")
        return None

def test_domain_operations(token, domain_id):
    """Test domain operations"""
    if not token or not domain_id:
        print("No token or domain_id available, skipping domain operations")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\nTesting domain operations for domain {domain_id}...")
    
    # Get specific domain
    print("Getting specific domain...")
    response = requests.get(f"{BASE_URL}/api/v1/domains/{domain_id}", headers=headers)
    print(f"Get domain response: {response.status_code}")
    if response.status_code == 200:
        domain = response.json()
        print(f"Domain details: {domain}")
    else:
        print(f"Get domain failed: {response.text}")
    
    # Update domain
    print("\nUpdating domain...")
    update_data = {
        "ssl_enabled": False,
        "verification_method": "http"
    }
    
    response = requests.put(f"{BASE_URL}/api/v1/domains/{domain_id}", json=update_data, headers=headers)
    print(f"Update domain response: {response.status_code}")
    if response.status_code == 200:
        domain = response.json()
        print(f"Domain updated: {domain}")
    else:
        print(f"Update domain failed: {response.text}")

if __name__ == "__main__":
    print("Starting API tests...")
    
    try:
        # Test login
        token = test_login()
        
        # Test domains
        domain_id = test_domains(token)
        
        # Test domain operations
        test_domain_operations(token, domain_id)
        
        print("\nAPI tests completed!")
    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()
