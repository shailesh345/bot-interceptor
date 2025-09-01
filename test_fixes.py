#!/usr/bin/env python3
"""
Comprehensive Test Script for API Fixes
Tests all the endpoints that were failing in the health check report
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8960"
ADMIN_CREDENTIALS = {
    "username": "admin",
    "password": "admin123"
}

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.test_results = []
        
    def log_test(self, endpoint, status, message, response_time=None):
        """Log test result"""
        result = {
            'endpoint': endpoint,
            'status': status,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'response_time': response_time
        }
        self.test_results.append(result)
        
        # Print result
        status_icon = "✅" if status == "PASS" else "❌"
        print(f"{status_icon} {endpoint}: {message}")
        if response_time:
            print(f"   ⏱️  Response time: {response_time:.2f}s")
    
    def authenticate(self):
        """Authenticate and get access token"""
        try:
            print("🔐 Authenticating...")
            response = self.session.post(f"{BASE_URL}/auth/login", json=ADMIN_CREDENTIALS)
            
            if response.status_code == 200:
                data = response.json()
                self.access_token = data.get('access_token')
                if self.access_token:
                    self.session.headers.update({'Authorization': f'Bearer {self.access_token}'})
                    self.log_test("/auth/login", "PASS", "Authentication successful")
                    return True
                else:
                    self.log_test("/auth/login", "FAIL", "No access token in response")
                    return False
            else:
                self.log_test("/auth/login", "FAIL", f"Status {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("/auth/login", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_endpoint(self, endpoint, method="GET", expected_status=200, description=None):
        """Test a specific endpoint"""
        try:
            start_time = time.time()
            
            if method == "GET":
                response = self.session.get(f"{BASE_URL}{endpoint}")
            elif method == "POST":
                response = self.session.post(f"{BASE_URL}{endpoint}")
            else:
                response = self.session.request(method, f"{BASE_URL}{endpoint}")
            
            response_time = time.time() - start_time
            
            if response.status_code == expected_status:
                self.log_test(endpoint, "PASS", description or f"Status {response.status_code}", response_time)
                return True
            else:
                self.log_test(endpoint, "FAIL", f"Expected {expected_status}, got {response.status_code}: {response.text}", response_time)
                return False
                
        except Exception as e:
            self.log_test(endpoint, "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_health_endpoints(self):
        """Test health check endpoints"""
        print("\n🏥 Testing Health Endpoints...")
        
        # Basic health check
        self.test_endpoint("/health", description="Basic health check")
        
        # System health check
        self.test_endpoint("/system/health", description="System health check")
        
        # Detailed system health (requires auth)
        if self.access_token:
            self.test_endpoint("/system/status", description="System status")
    
    def test_domain_endpoints(self):
        """Test domain management endpoints"""
        print("\n🌐 Testing Domain Endpoints...")
        
        # Legacy domains API (was failing)
        self.test_endpoint("/api/domains", description="Legacy domains API")
        
        # V1 domains API (was working)
        self.test_endpoint("/api/v1/domains", description="V1 domains API")
    
    def test_traffic_endpoints(self):
        """Test traffic monitoring endpoints"""
        print("\n📊 Testing Traffic Endpoints...")
        
        # Traffic logs API (was 404)
        self.test_endpoint("/api/traffic/logs", description="Traffic logs API")
        
        # V1 traffic API
        self.test_endpoint("/api/v1/traffic", description="V1 traffic API")
    
    def test_rules_endpoints(self):
        """Test rules engine endpoints"""
        print("\n⚙️ Testing Rules Endpoints...")
        
        # V1 rules API (was failing due to schema)
        self.test_endpoint("/api/v1/rules", description="V1 rules API")
    
    def test_admin_endpoints(self):
        """Test admin management endpoints"""
        print("\n👨‍💼 Testing Admin Endpoints...")
        
        # Admin users API (was 404)
        self.test_endpoint("/api/admin/users", description="Admin users API")
    
    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        print("\n📈 Testing Analytics Endpoints...")
        
        # Analytics dashboard (was working)
        self.test_endpoint("/api/analytics/dashboard", description="Analytics dashboard")
    
    def test_billing_endpoints(self):
        """Test billing endpoints"""
        print("\n💳 Testing Billing Endpoints...")
        
        # Billing plans (was working)
        self.test_endpoint("/api/billing/plans", description="Billing plans")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Starting Comprehensive API Test Suite")
        print("=" * 60)
        print(f"Target: {BASE_URL}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Authenticate first
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with protected endpoints.")
            return False
        
        # Run all test suites
        self.test_health_endpoints()
        self.test_domain_endpoints()
        self.test_traffic_endpoints()
        self.test_rules_endpoints()
        self.test_admin_endpoints()
        self.test_analytics_endpoints()
        self.test_billing_endpoints()
        
        return True
    
    def generate_report(self):
        """Generate test report"""
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['status'] == "PASS"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if result['status'] == "FAIL":
                    print(f"  - {result['endpoint']}: {result['message']}")
        
        print("\n📋 RECOMMENDATIONS:")
        if failed_tests == 0:
            print("🎉 All tests passed! The system is fully functional.")
        elif failed_tests <= 3:
            print("🟡 Most tests passed. Minor issues need attention.")
        else:
            print("🔴 Multiple tests failed. Significant issues need immediate attention.")
        
        # Save results to file
        with open('test_results_fixes.json', 'w') as f:
            json.dump(self.test_results, f, indent=2)
        print(f"\n💾 Detailed results saved to: test_results_fixes.json")

def main():
    """Main test runner"""
    tester = APITester()
    
    try:
        if tester.run_all_tests():
            tester.generate_report()
        else:
            print("❌ Test suite failed to complete")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
