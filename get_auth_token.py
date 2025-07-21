#!/usr/bin/env python3
"""
Test script to get a fresh token and provide localStorage setup commands
"""
import requests
import json

def get_fresh_auth():
    print("Getting fresh authentication token...")
    
    # Login to get fresh token
    login_url = "http://127.0.0.1:5000/auth/login"
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Login response: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('access_token')
            user = data.get('user')
            refresh_token = data.get('refresh_token')
            
            print(f"✓ Login successful")
            print(f"User: {user['username']} ({user['email']})")
            print(f"Token: {token[:50]}...")
            
            # Generate localStorage commands
            print("\n--- Copy and paste these commands in browser console ---")
            print(f"localStorage.setItem('token', '{token}');")
            print(f"localStorage.setItem('user', '{json.dumps(user)}');")
            print(f"localStorage.setItem('refreshToken', '{refresh_token}');")
            print("console.log('Authentication data set in localStorage');")
            print("--- End of commands ---\n")
            
            # Test domains endpoint
            print("Testing domains endpoint...")
            domains_url = "http://127.0.0.1:5000/api/v1/domains"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            domains_response = requests.get(domains_url, headers=headers)
            print(f"Domains response: {domains_response.status_code}")
            
            if domains_response.status_code == 200:
                domains_data = domains_response.json()
                print(f"✓ Found {len(domains_data.get('domains', []))} domains")
            else:
                print(f"✗ Domains error: {domains_response.text}")
                
            return True
        else:
            print(f"✗ Login failed: {response.text}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    return False

if __name__ == "__main__":
    get_fresh_auth()
