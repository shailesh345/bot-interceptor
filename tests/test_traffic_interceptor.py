#!/usr/bin/env python3
"""
Comprehensive Test Script for Traffic Interceptor System
Tests all components: interception, ML classification, content protection, and real-time processing
"""

import requests
import json
import time
import random
from datetime import datetime
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Test configuration
BASE_URL = "http://localhost:5001"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_PASSWORD = "testpassword123"

class TrafficInterceptorTester:
    """Comprehensive tester for the traffic interception system"""
    
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_results = {}
        
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Traffic Interceptor System Tests")
        print("=" * 60)
        
        # Test 1: Authentication
        if not self.test_authentication():
            print("❌ Authentication failed. Cannot continue tests.")
            return False
        
        # Test 2: Health Check
        self.test_health_check()
        
        # Test 3: Traffic Interception
        self.test_traffic_interception()
        
        # Test 4: ML Bot Classification
        self.test_ml_bot_classification()
        
        # Test 5: Content Protection
        self.test_content_protection()
        
        # Test 6: Real-time Metrics
        self.test_real_time_metrics()
        
        # Test 7: Domain Metrics
        self.test_domain_metrics()
        
        # Test 8: Alerts
        self.test_alerts()
        
        # Test 9: Protection Rules
        self.test_protection_rules()
        
        # Test 10: Performance Test
        self.test_performance()
        
        # Print results
        self.print_results()
        
        return True
    
    def test_authentication(self):
        """Test user authentication"""
        print("🔐 Testing Authentication...")
        
        try:
            # Login
            login_data = {
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD
            }
            
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('access_token')
                if self.auth_token:
                    self.session.headers.update({'Authorization': f'Bearer {self.auth_token}'})
                    print("✅ Authentication successful")
                    return True
                else:
                    print("❌ No access token received")
                    return False
            else:
                print(f"❌ Login failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Authentication test failed: {e}")
            return False
    
    def test_health_check(self):
        """Test health check endpoint"""
        print("🏥 Testing Health Check...")
        
        try:
            response = self.session.get(f"{BASE_URL}/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    print("✅ Health check passed - all systems operational")
                    self.test_results['health_check'] = 'PASS'
                else:
                    print("⚠️ Health check shows some issues")
                    print(f"Status: {data.get('status', 'unknown')}")
                    self.test_results['health_check'] = 'WARNING'
            else:
                print(f"❌ Health check failed: {response.status_code}")
                self.test_results['health_check'] = 'FAIL'
                
        except Exception as e:
            print(f"❌ Health check test failed: {e}")
            self.test_results['health_check'] = 'ERROR'
    
    def test_traffic_interception(self):
        """Test traffic interception functionality"""
        print("🚦 Testing Traffic Interception...")
        
        try:
            # Test data for interception
            test_request = {
                "method": "GET",
                "url": "https://example.com/test-page",
                "headers": {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Accept-Language": "en-US,en;q=0.5",
                    "Accept-Encoding": "gzip, deflate",
                    "Connection": "keep-alive"
                },
                "client_ip": "192.168.1.100",
                "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            
            response = self.session.post(f"{BASE_URL}/api/traffic/intercept", json=test_request)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    result = data.get('interception_result', {})
                    print("✅ Traffic interception successful")
                    print(f"   Bot detected: {result.get('bot_detected', False)}")
                    print(f"   Action taken: {result.get('action_taken', 'unknown')}")
                    print(f"   Processing time: {result.get('processing_time', 0):.3f}s")
                    self.test_results['traffic_interception'] = 'PASS'
                else:
                    print("❌ Traffic interception failed")
                    self.test_results['traffic_interception'] = 'FAIL'
            else:
                print(f"❌ Traffic interception request failed: {response.status_code}")
                print(f"Response: {response.text}")
                self.test_results['traffic_interception'] = 'FAIL'
                
        except Exception as e:
            print(f"❌ Traffic interception test failed: {e}")
            self.test_results['traffic_interception'] = 'ERROR'
    
    def test_ml_bot_classification(self):
        """Test ML-based bot classification"""
        print("🤖 Testing ML Bot Classification...")
        
        try:
            # Test data for bot classification
            test_data = {
                "client_ip": "192.168.1.101",
                "user_agent": "python-requests/2.28.1",
                "headers": {
                    "Accept": "*/*",
                    "User-Agent": "python-requests/2.28.1"
                },
                "path": "/api/data",
                "method": "GET"
            }
            
            response = self.session.post(f"{BASE_URL}/api/traffic/classify", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    classification = data.get('classification', {})
                    print("✅ ML bot classification successful")
                    print(f"   Is bot: {classification.get('is_bot', False)}")
                    print(f"   Confidence: {classification.get('confidence', 0):.2f}")
                    print(f"   Bot type: {classification.get('bot_type', 'unknown')}")
                    self.test_results['ml_classification'] = 'PASS'
                else:
                    print("❌ ML bot classification failed")
                    self.test_results['ml_classification'] = 'FAIL'
            else:
                print(f"❌ ML bot classification request failed: {response.status_code}")
                self.test_results['ml_classification'] = 'FAIL'
                
        except Exception as e:
            print(f"❌ ML bot classification test failed: {e}")
            self.test_results['ml_classification'] = 'ERROR'
    
    def test_content_protection(self):
        """Test content protection system"""
        print("🛡️ Testing Content Protection...")
        
        try:
            # Test data for content protection
            test_data = {
                "method": "GET",
                "path": "/admin/config",
                "headers": {
                    "User-Agent": "curl/7.68.0",
                    "Accept": "*/*"
                },
                "client_ip": "192.168.1.102",
                "user_agent": "curl/7.68.0"
            }
            
            response = self.session.post(f"{BASE_URL}/api/traffic/protect", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    protection = data.get('protection_result', {})
                    print("✅ Content protection successful")
                    print(f"   Is allowed: {protection.get('is_allowed', False)}")
                    print(f"   Protection level: {protection.get('protection_level', 'unknown')}")
                    print(f"   Action taken: {protection.get('action_taken', 'unknown')}")
                    self.test_results['content_protection'] = 'PASS'
                else:
                    print("❌ Content protection failed")
                    self.test_results['content_protection'] = 'FAIL'
            else:
                print(f"❌ Content protection request failed: {response.status_code}")
                self.test_results['content_protection'] = 'FAIL'
                
        except Exception as e:
            print(f"❌ Content protection test failed: {e}")
            self.test_results['content_protection'] = 'ERROR'
    
    def test_real_time_metrics(self):
        """Test real-time metrics endpoint"""
        print("📊 Testing Real-time Metrics...")
        
        try:
            response = self.session.get(f"{BASE_URL}/api/traffic/metrics/realtime")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    metrics = data.get('metrics', {})
                    print("✅ Real-time metrics successful")
                    print(f"   Total requests: {metrics.get('total_requests', 0)}")
                    print(f"   Bot requests: {metrics.get('bot_requests', 0)}")
                    print(f"   Requests per second: {metrics.get('requests_per_second', 0):.2f}")
                    self.test_results['real_time_metrics'] = 'PASS'
                else:
                    print("❌ Real-time metrics failed")
                    self.test_results['real_time_metrics'] = 'FAIL'
            else:
                print(f"❌ Real-time metrics request failed: {response.status_code}")
                self.test_results['real_time_metrics'] = 'FAIL'
                
        except Exception as e:
            print(f"❌ Real-time metrics test failed: {e}")
            self.test_results['real_time_metrics'] = 'ERROR'
    
    def test_domain_metrics(self):
        """Test domain-specific metrics"""
        print("🌐 Testing Domain Metrics...")
        
        try:
            response = self.session.get(f"{BASE_URL}/api/traffic/metrics/domain/example.com")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    metrics = data.get('metrics', {})
                    print("✅ Domain metrics successful")
                    print(f"   Domain: {data.get('domain', 'unknown')}")
                    print(f"   Current requests: {metrics.get('current', {}).get('total_requests', 0)}")
                    self.test_results['domain_metrics'] = 'PASS'
                else:
                    print("❌ Domain metrics failed")
                    self.test_results['domain_metrics'] = 'FAIL'
            else:
                print(f"❌ Domain metrics request failed: {response.status_code}")
                self.test_results['domain_metrics'] = 'FAIL'
                
        except Exception as e:
            print(f"❌ Domain metrics test failed: {e}")
            self.test_results['domain_metrics'] = 'ERROR'
    
    def test_alerts(self):
        """Test alerts endpoint"""
        print("🚨 Testing Alerts...")
        
        try:
            response = self.session.get(f"{BASE_URL}/api/traffic/alerts")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    alerts = data.get('alerts', [])
                    print("✅ Alerts endpoint successful")
                    print(f"   Total alerts: {data.get('total_alerts', 0)}")
                    self.test_results['alerts'] = 'PASS'
                else:
                    print("❌ Alerts failed")
                    self.test_results['alerts'] = 'FAIL'
            else:
                print(f"❌ Alerts request failed: {response.status_code}")
                self.test_results['alerts'] = 'FAIL'
                
        except Exception as e:
            print(f"❌ Alerts test failed: {e}")
            self.test_results['alerts'] = 'ERROR'
    
    def test_protection_rules(self):
        """Test protection rules endpoint"""
        print("📋 Testing Protection Rules...")
        
        try:
            response = self.session.get(f"{BASE_URL}/api/traffic/rules?domain=example.com")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    rules = data.get('rules', {})
                    print("✅ Protection rules successful")
                    print(f"   Total rules: {data.get('total_rules', 0)}")
                    self.test_results['protection_rules'] = 'PASS'
                else:
                    print("❌ Protection rules failed")
                    self.test_results['protection_rules'] = 'FAIL'
            else:
                print(f"❌ Protection rules request failed: {response.status_code}")
                self.test_results['protection_rules'] = 'FAIL'
                
        except Exception as e:
            print(f"❌ Protection rules test failed: {e}")
            self.test_results['protection_rules'] = 'ERROR'
    
    def test_performance(self):
        """Test system performance with multiple requests"""
        print("⚡ Testing Performance...")
        
        try:
            start_time = time.time()
            successful_requests = 0
            total_requests = 10
            
            for i in range(total_requests):
                # Generate random test data
                test_data = {
                    "method": random.choice(["GET", "POST"]),
                    "url": f"https://example{i}.com/test-{i}",
                    "headers": {
                        "User-Agent": f"test-agent-{i}",
                        "Accept": "text/html,application/xhtml+xml"
                    },
                    "client_ip": f"192.168.1.{100 + i}",
                    "user_agent": f"test-agent-{i}"
                }
                
                try:
                    response = self.session.post(f"{BASE_URL}/api/traffic/intercept", json=test_data)
                    if response.status_code == 200:
                        successful_requests += 1
                except:
                    pass
                
                # Small delay between requests
                time.sleep(0.1)
            
            end_time = time.time()
            total_time = end_time - start_time
            success_rate = (successful_requests / total_requests) * 100
            requests_per_second = total_requests / total_time
            
            print(f"✅ Performance test completed")
            print(f"   Success rate: {success_rate:.1f}%")
            print(f"   Requests per second: {requests_per_second:.2f}")
            print(f"   Total time: {total_time:.3f}s")
            
            if success_rate >= 80:
                self.test_results['performance'] = 'PASS'
            else:
                self.test_results['performance'] = 'WARNING'
                
        except Exception as e:
            print(f"❌ Performance test failed: {e}")
            self.test_results['performance'] = 'ERROR'
    
    def print_results(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("📋 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result == 'PASS')
        warning_tests = sum(1 for result in self.test_results.values() if result == 'WARNING')
        failed_tests = sum(1 for result in self.test_results.values() if result in ['FAIL', 'ERROR'])
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"⚠️ Warnings: {warning_tests}")
        print(f"❌ Failed: {failed_tests}")
        
        print("\nDetailed Results:")
        for test_name, result in self.test_results.items():
            status_icon = "✅" if result == 'PASS' else "⚠️" if result == 'WARNING' else "❌"
            print(f"   {status_icon} {test_name}: {result}")
        
        print("\n" + "=" * 60)
        
        if failed_tests == 0:
            print("🎉 All tests completed successfully!")
        else:
            print(f"⚠️ {failed_tests} test(s) failed. Please check the system.")
        
        print("=" * 60)

def main():
    """Main test runner"""
    print("🚀 Traffic Interceptor System - Comprehensive Test Suite")
    print("=" * 60)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code != 200:
            print(f"❌ Backend is not responding properly: {response.status_code}")
            return
    except requests.exceptions.RequestException:
        print("❌ Backend is not running. Please start the Flask application first.")
        print("   Run: cd backend && python run.py")
        return
    
    # Run tests
    tester = TrafficInterceptorTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎯 Testing completed successfully!")
    else:
        print("\n💥 Testing failed. Please check the system configuration.")

if __name__ == "__main__":
    main()
