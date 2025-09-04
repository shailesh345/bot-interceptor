#!/usr/bin/env python3
"""
Generate Test Traffic for Boot Interceptor
Tests the complete traffic monitoring pipeline
"""

import requests
import json
import time
import random
from datetime import datetime

def generate_test_traffic():
    """Generate test traffic to verify the pipeline"""
    
    # Test domains from our database
    test_domains = ['example.com', 'testshop.com', 'blog.example.com']
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36'
    ]
    
    pages = ['/home', '/about', '/products', '/contact', '/blog', '/api/test']
    
    print("🚀 Generating test traffic for Boot Interceptor...")
    print("=" * 50)
    
    success_count = 0
    error_count = 0
    
    for i in range(10):  # Generate 10 test requests
        domain = random.choice(test_domains)
        page = random.choice(pages)
        user_agent = random.choice(user_agents)
        
        traffic_data = {
            "url": f"http://{domain}{page}",
            "method": "GET",
            "user_agent": user_agent,
            "page_title": f"Test Page {i+1}",
            "event_type": "page_view",
            "screen_resolution": "1920x1080",
            "viewport_size": "1200x800",
            "timezone": "America/New_York",
            "language": "en-US",
            "platform": "MacIntel"
        }
        
        try:
            print(f"📊 Sending request {i+1}: {domain}{page}")
            
            response = requests.post(
                'http://localhost:8960/api/traffic/intercept',
                headers={'Content-Type': 'application/json'},
                json=traffic_data,
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ Request {i+1}: SUCCESS - {result.get('message', '')}")
                    success_count += 1
                else:
                    print(f"❌ Request {i+1}: FAILED - {result.get('error', 'Unknown error')}")
                    error_count += 1
            else:
                print(f"❌ Request {i+1}: HTTP {response.status_code} - {response.text[:100]}")
                error_count += 1
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Request {i+1}: CONNECTION ERROR - {e}")
            error_count += 1
        
        # Small delay between requests
        time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print(f"📊 RESULTS:")
    print(f"✅ Successful requests: {success_count}")
    print(f"❌ Failed requests: {error_count}")
    print(f"📈 Success rate: {(success_count / 10) * 100:.1f}%")
    
    if success_count > 0:
        print("\n🎯 Traffic generated successfully!")
        print("👀 Check the Live Traffic Stream in your dashboard")
        print("🌐 Go to: http://localhost:9889 → Monitoring → Live Traffic")
    else:
        print("\n❌ No traffic was generated successfully")
        print("🔍 Check backend logs for detailed error information")
    
    return success_count > 0

if __name__ == '__main__':
    try:
        generate_test_traffic()
    except KeyboardInterrupt:
        print("\n🛑 Test traffic generation stopped by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        import traceback
        traceback.print_exc()
