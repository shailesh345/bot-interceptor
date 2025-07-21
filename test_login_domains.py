import requests
import json

def test_login_and_domains():
    # Test login
    login_url = "http://127.0.0.1:5000/auth/login"
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }
    
    print("Testing login...")
    try:
        response = requests.post(login_url, json=login_data)
        print(f"Login response: {response.status_code}")
        
        if response.status_code == 200:
            login_result = response.json()
            token = login_result.get('access_token')
            user = login_result.get('user')
            print(f"Token: {token[:50]}...")
            print(f"User: {user['username']} ({user['email']})")
            print(f"Tenant ID: {user['tenant_id']}")
            
            # Test domains endpoint
            domains_url = "http://127.0.0.1:5000/api/v1/domains"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            print("\nTesting domains endpoint...")
            domains_response = requests.get(domains_url, headers=headers)
            print(f"Domains response: {domains_response.status_code}")
            
            if domains_response.status_code == 200:
                domains_data = domains_response.json()
                print(f"Number of domains: {len(domains_data.get('domains', []))}")
                print("Domains endpoint working correctly!")
                
                # Store in localStorage format for testing
                localStorage_data = {
                    'token': token,
                    'user': json.dumps(user)
                }
                print(f"\nFor localStorage testing:")
                print(f"localStorage.setItem('token', '{token}');")
                print(f"localStorage.setItem('user', '{json.dumps(user)}');")
                
            else:
                print(f"Domains error: {domains_response.text}")
        else:
            print(f"Login error: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login_and_domains()
