#!/usr/bin/env python3
"""
DNS/Proxy Setup Testing Script
Tests if DNS/Proxy traffic interception is working correctly
"""

import requests
import socket
import redis
import json
import sys
import time
from urllib.parse import urlparse

def test_redis_connection():
    """Test Redis connection"""
    print("🔍 Testing Redis connection...")
    try:
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis: Connected and responsive")
        return True
    except Exception as e:
        print(f"❌ Redis: Connection failed - {e}")
        print("💡 Start Redis: redis-server")
        return False

def test_proxy_service():
    """Test if proxy interceptor is running"""
    print("🔍 Testing Proxy Interceptor service...")
    try:
        # Test if port 8080 is open
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('localhost', 8080))
        sock.close()
        
        if result == 0:
            print("✅ Proxy Service: Running on port 8080")
            return True
        else:
            print("❌ Proxy Service: Not running on port 8080")
            print("💡 Start proxy: python start_proxy_interceptor.py")
            return False
    except Exception as e:
        print(f"❌ Proxy Service: Test failed - {e}")
        return False

def test_flask_api():
    """Test if Flask API is running"""
    print("🔍 Testing Flask API service...")
    try:
        response = requests.get('http://localhost:8960/health', timeout=5)
        if response.status_code == 200:
            print("✅ Flask API: Running on port 8960")
            return True
        else:
            print(f"❌ Flask API: Unexpected response {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Flask API: Not running on port 8960")
        print("💡 Start Flask: python start_with_proxy.py")
        return False
    except Exception as e:
        print(f"❌ Flask API: Test failed - {e}")
        return False

def test_proxy_routing(domain="test.local"):
    """Test proxy routing with a test domain"""
    print(f"🔍 Testing proxy routing for {domain}...")
    try:
        headers = {'Host': domain}
        response = requests.get('http://localhost:8080/', headers=headers, timeout=10)
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code in [200, 404, 502]:  # 502 expected if no target configured
            print("✅ Proxy Routing: Service responding to requests")
            return True
        else:
            print(f"❌ Proxy Routing: Unexpected status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Proxy Routing: Connection failed")
        return False
    except Exception as e:
        print(f"❌ Proxy Routing: Test failed - {e}")
        return False

def test_domain_configuration():
    """Test if any domains are configured for proxy"""
    print("🔍 Testing domain configuration...")
    try:
        # Try to get domain list from API
        response = requests.get('http://localhost:8960/api/v1/domains', 
                               headers={'Authorization': 'Bearer test'}, 
                               timeout=5)
        
        # We expect 401 (unauthorized) since we don't have a real token
        # But this confirms the endpoint exists
        if response.status_code == 401:
            print("✅ Domain API: Endpoint accessible (authentication required)")
            return True
        elif response.status_code == 200:
            print("✅ Domain API: Endpoint accessible and responsive")
            data = response.json()
            domain_count = len(data.get('domains', []))
            print(f"📊 Configured domains: {domain_count}")
            return True
        else:
            print(f"⚠️  Domain API: Unexpected response {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Domain API: Test failed - {e}")
        return False

def test_dns_resolution(domain):
    """Test DNS resolution for a domain"""
    print(f"🔍 Testing DNS resolution for {domain}...")
    try:
        ip = socket.gethostbyname(domain)
        print(f"📊 {domain} resolves to: {ip}")
        
        # Check if it's pointing to localhost (for testing)
        if ip in ['127.0.0.1', '::1']:
            print("✅ DNS: Domain pointing to localhost (good for testing)")
            return True
        else:
            print(f"📊 DNS: Domain pointing to {ip}")
            print("💡 For testing, consider using test.local in /etc/hosts")
            return True
            
    except socket.gaierror:
        print(f"❌ DNS: Cannot resolve {domain}")
        return False
    except Exception as e:
        print(f"❌ DNS: Test failed - {e}")
        return False

def run_full_test():
    """Run complete test suite"""
    print("🎯 Boot Interceptor DNS/Proxy Test Suite")
    print("=" * 50)
    
    tests = [
        ("Redis Connection", test_redis_connection),
        ("Proxy Service", test_proxy_service), 
        ("Flask API", test_flask_api),
        ("Proxy Routing", lambda: test_proxy_routing("test.local")),
        ("Domain Configuration", test_domain_configuration),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n{test_name}")
        print("-" * 30)
        
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name}: Exception - {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("🚀 All tests passed! DNS/Proxy method should work.")
    elif passed >= len(results) - 1:
        print("⚠️  Most tests passed. Minor issues to resolve.")
    else:
        print("❌ Multiple issues found. DNS/Proxy method needs fixes.")
    
    # Recommendations
    print("\n💡 Next Steps:")
    if not results[0][1]:  # Redis failed
        print("   1. Start Redis: redis-server")
    if not results[1][1]:  # Proxy failed
        print("   2. Start Proxy: python start_proxy_interceptor.py")
    if not results[2][1]:  # Flask failed
        print("   3. Start Flask: python start_with_proxy.py")
    
    print("   4. Configure domain DNS to point to your server IP")
    print("   5. Test with: curl -H 'Host: yourdomain.com' http://your-ip:8080/")
    
    return passed == len(results)

if __name__ == '__main__':
    if len(sys.argv) > 1 and sys.argv[1] == '--domain':
        domain = sys.argv[2] if len(sys.argv) > 2 else 'example.com'
        test_dns_resolution(domain)
    else:
        run_full_test()
