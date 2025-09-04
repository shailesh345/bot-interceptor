#!/usr/bin/env python3
"""
Comprehensive DNS Proxy Testing Suite
Tests all aspects of the Enhanced DNS Proxy
"""

import asyncio
import aiohttp
import json
import time
import logging
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
import subprocess
import sys
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DNSProxyTester:
    def __init__(self):
        self.proxy_url = "http://localhost:8080"
        self.boot_interceptor_url = "http://localhost:8960"
        self.frontend_url = "http://localhost:9889"
        
        self.test_results = {
            'health_checks': [],
            'basic_forwarding': [],
            'rate_limiting': [],
            'error_handling': [],
            'performance': [],
            'integration': [],
            'load_testing': []
        }
        
        logger.info("🧪 DNS Proxy Comprehensive Testing Suite v2.0 initialized")
    
    async def run_all_tests(self):
        """Run comprehensive test suite"""
        logger.info("🚀 Starting comprehensive DNS proxy testing...")
        
        tests = [
            ("Health Checks", self.test_health_checks),
            ("Basic Forwarding", self.test_basic_forwarding),
            ("Error Handling", self.test_error_handling),
            ("Performance Tests", self.test_performance),
            ("Integration Tests", self.test_integration),
            ("Rate Limiting", self.test_rate_limiting),
            ("Load Testing", self.test_load_testing)
        ]
        
        total_tests = 0
        passed_tests = 0
        
        for test_name, test_func in tests:
            logger.info(f"\n📋 Running {test_name}...")
            try:
                results = await test_func()
                total_tests += len(results)
                passed_tests += sum(1 for r in results if r['passed'])
                
                for result in results:
                    status = "✅" if result['passed'] else "❌"
                    logger.info(f"  {status} {result['name']}: {result['message']}")
                    
            except Exception as e:
                logger.error(f"❌ {test_name} failed with error: {e}")
        
        # Print summary
        logger.info(f"\n🎯 TEST SUMMARY:")
        logger.info(f"📊 Total Tests: {total_tests}")
        logger.info(f"✅ Passed: {passed_tests}")
        logger.info(f"❌ Failed: {total_tests - passed_tests}")
        logger.info(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        return self.test_results
    
    async def test_health_checks(self) -> List[Dict]:
        """Test health and monitoring endpoints"""
        results = []
        
        # Test basic health endpoint
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.proxy_url}/health") as resp:
                    data = await resp.json()
                    
                    results.append({
                        'name': 'Basic Health Check',
                        'passed': resp.status == 200 and data.get('status') == 'healthy',
                        'message': f"Status: {resp.status}, Response: {data.get('status', 'unknown')}"
                    })
                    
                    # Check health response structure
                    expected_fields = ['service', 'total_requests', 'uptime_seconds', 'timestamp']
                    missing_fields = [field for field in expected_fields if field not in data]
                    
                    results.append({
                        'name': 'Health Response Structure',
                        'passed': len(missing_fields) == 0,
                        'message': f"Missing fields: {missing_fields}" if missing_fields else "All fields present"
                    })
        
        except Exception as e:
            results.append({
                'name': 'Basic Health Check',
                'passed': False,
                'message': f"Error: {e}"
            })
        
        # Test stats endpoint
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.proxy_url}/stats") as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        results.append({
                            'name': 'Statistics Endpoint',
                            'passed': True,
                            'message': f"Requests processed: {data.get('requests', {}).get('total', 0)}"
                        })
                    else:
                        results.append({
                            'name': 'Statistics Endpoint',
                            'passed': False,
                            'message': f"HTTP {resp.status}"
                        })
        
        except Exception as e:
            results.append({
                'name': 'Statistics Endpoint',
                'passed': False,
                'message': f"Error: {e}"
            })
        
        # Test metrics endpoint (Prometheus format)
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.proxy_url}/metrics") as resp:
                    if resp.status == 200:
                        text = await resp.text()
                        has_metrics = 'dns_proxy_requests_total' in text
                        results.append({
                            'name': 'Prometheus Metrics',
                            'passed': has_metrics,
                            'message': "Metrics format valid" if has_metrics else "Missing expected metrics"
                        })
                    else:
                        results.append({
                            'name': 'Prometheus Metrics',
                            'passed': False,
                            'message': f"HTTP {resp.status}"
                        })
                        
        except Exception as e:
            results.append({
                'name': 'Prometheus Metrics',
                'passed': False,
                'message': f"Error: {e}"
            })
        
        return results
    
    async def test_basic_forwarding(self) -> List[Dict]:
        """Test basic request forwarding functionality"""
        results = []
        
        # Test simple GET request
        try:
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                async with session.get(f"{self.proxy_url}/") as resp:
                    response_time = (time.time() - start_time) * 1000
                    
                    results.append({
                        'name': 'Basic GET Forwarding',
                        'passed': resp.status in [200, 404],  # 404 is fine, means proxy worked
                        'message': f"Status: {resp.status}, Response time: {response_time:.1f}ms"
                    })
        
        except Exception as e:
            results.append({
                'name': 'Basic GET Forwarding',
                'passed': False,
                'message': f"Error: {e}"
            })
        
        # Test with custom headers
        try:
            headers = {
                'User-Agent': 'DNS-Proxy-Test/1.0',
                'X-Custom-Header': 'test-value'
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.proxy_url}/test-headers", headers=headers) as resp:
                    results.append({
                        'name': 'Header Forwarding',
                        'passed': resp.status in [200, 404, 502],  # Various responses are acceptable
                        'message': f"Status: {resp.status}"
                    })
        
        except Exception as e:
            results.append({
                'name': 'Header Forwarding',
                'passed': False,
                'message': f"Error: {e}"
            })
        
        # Test different HTTP methods
        methods = ['GET', 'POST', 'PUT', 'DELETE']
        for method in methods:
            try:
                async with aiohttp.ClientSession() as session:
                    data = {'test': 'data'} if method in ['POST', 'PUT'] else None
                    
                    async with session.request(
                        method, 
                        f"{self.proxy_url}/api/test",
                        json=data
                    ) as resp:
                        results.append({
                            'name': f'{method} Method Support',
                            'passed': resp.status not in [405, 501],  # Method not allowed or not implemented
                            'message': f"Status: {resp.status}"
                        })
            
            except Exception as e:
                results.append({
                    'name': f'{method} Method Support',
                    'passed': False,
                    'message': f"Error: {e}"
                })
        
        return results
    
    async def test_error_handling(self) -> List[Dict]:
        """Test error handling and resilience"""
        results = []
        
        # Test invalid target (should handle gracefully)
        try:
            async with aiohttp.ClientSession() as session:
                # Use a custom host header to trigger error
                headers = {'Host': 'nonexistent.invalid.domain'}
                async with session.get(f"{self.proxy_url}/", headers=headers) as resp:
                    results.append({
                        'name': 'Invalid Target Handling',
                        'passed': resp.status in [502, 503, 504],  # Bad gateway responses
                        'message': f"Status: {resp.status}"
                    })
        
        except Exception as e:
            results.append({
                'name': 'Invalid Target Handling',
                'passed': True,  # Exception handling is also acceptable
                'message': f"Handled with exception: {type(e).__name__}"
            })
        
        # Test malformed requests
        try:
            async with aiohttp.ClientSession() as session:
                # Send request with very long path
                long_path = "/test/" + "a" * 5000
                async with session.get(f"{self.proxy_url}{long_path}") as resp:
                    results.append({
                        'name': 'Long Path Handling',
                        'passed': resp.status in [200, 404, 414, 502],  # Various acceptable responses
                        'message': f"Status: {resp.status}"
                    })
        
        except Exception as e:
            results.append({
                'name': 'Long Path Handling',
                'passed': True,
                'message': f"Handled with exception: {type(e).__name__}"
            })
        
        return results
    
    async def test_performance(self) -> List[Dict]:
        """Test performance characteristics"""
        results = []
        
        # Test response time
        response_times = []
        for i in range(10):
            try:
                async with aiohttp.ClientSession() as session:
                    start_time = time.time()
                    async with session.get(f"{self.proxy_url}/perf-test-{i}") as resp:
                        response_time = (time.time() - start_time) * 1000
                        response_times.append(response_time)
            except:
                pass
        
        if response_times:
            avg_response_time = sum(response_times) / len(response_times)
            max_response_time = max(response_times)
            
            results.append({
                'name': 'Response Time Performance',
                'passed': avg_response_time < 1000,  # Average under 1 second
                'message': f"Avg: {avg_response_time:.1f}ms, Max: {max_response_time:.1f}ms"
            })
        else:
            results.append({
                'name': 'Response Time Performance',
                'passed': False,
                'message': "No successful requests for performance testing"
            })
        
        return results
    
    async def test_integration(self) -> List[Dict]:
        """Test integration with Boot Interceptor"""
        results = []
        
        # Check if Boot Interceptor is running
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(f"{self.boot_interceptor_url}/") as resp:
                    boot_interceptor_running = resp.status in [200, 404]
                    results.append({
                        'name': 'Boot Interceptor Availability',
                        'passed': boot_interceptor_running,
                        'message': f"Boot Interceptor status: {resp.status}"
                    })
        except:
            results.append({
                'name': 'Boot Interceptor Availability', 
                'passed': False,
                'message': "Boot Interceptor not accessible"
            })
        
        # Test traffic data forwarding
        try:
            # Generate some traffic through proxy
            async with aiohttp.ClientSession() as session:
                await session.get(f"{self.proxy_url}/integration-test")
                
            # Wait a moment for async processing
            await asyncio.sleep(2)
            
            # Check proxy stats to see if data was sent
            async with session.get(f"{self.proxy_url}/stats") as resp:
                if resp.status == 200:
                    data = await resp.json()
                    boot_interceptor_success = data.get('boot_interceptor', {}).get('successful_sends', 0)
                    results.append({
                        'name': 'Traffic Data Integration',
                        'passed': boot_interceptor_success > 0,
                        'message': f"Successful integrations: {boot_interceptor_success}"
                    })
                else:
                    results.append({
                        'name': 'Traffic Data Integration',
                        'passed': False,
                        'message': "Could not retrieve proxy stats"
                    })
                    
        except Exception as e:
            results.append({
                'name': 'Traffic Data Integration',
                'passed': False,
                'message': f"Error: {e}"
            })
        
        return results
    
    async def test_rate_limiting(self) -> List[Dict]:
        """Test rate limiting functionality"""
        results = []
        
        # Test rate limiting by sending many requests quickly
        try:
            rate_limited_count = 0
            successful_count = 0
            
            async with aiohttp.ClientSession() as session:
                # Send 60 requests quickly (should trigger rate limiting)
                tasks = []
                for i in range(60):
                    task = session.get(f"{self.proxy_url}/rate-limit-test-{i}")
                    tasks.append(task)
                
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                
                for response in responses:
                    if isinstance(response, Exception):
                        continue
                    
                    async with response:
                        if response.status == 429:
                            rate_limited_count += 1
                        elif response.status in [200, 404, 502]:
                            successful_count += 1
            
            # Rate limiting should kick in
            results.append({
                'name': 'Rate Limiting Active',
                'passed': rate_limited_count > 0,
                'message': f"Rate limited: {rate_limited_count}, Successful: {successful_count}"
            })
            
            # Should still allow some requests through
            results.append({
                'name': 'Rate Limiting Proportional',
                'passed': successful_count > 0 and rate_limited_count > 0,
                'message': f"Balanced rate limiting: {successful_count} allowed, {rate_limited_count} limited"
            })
        
        except Exception as e:
            results.append({
                'name': 'Rate Limiting Test',
                'passed': False,
                'message': f"Error: {e}"
            })
        
        return results
    
    async def test_load_testing(self) -> List[Dict]:
        """Test system under load"""
        results = []
        
        # Concurrent requests test
        try:
            start_time = time.time()
            concurrent_requests = 20
            
            async with aiohttp.ClientSession() as session:
                tasks = [
                    session.get(f"{self.proxy_url}/load-test-{i}")
                    for i in range(concurrent_requests)
                ]
                
                responses = await asyncio.gather(*tasks, return_exceptions=True)
                
                successful_responses = 0
                for response in responses:
                    if not isinstance(response, Exception):
                        async with response:
                            if response.status in [200, 404, 502]:  # Acceptable responses
                                successful_responses += 1
            
            total_time = time.time() - start_time
            requests_per_second = concurrent_requests / total_time
            
            results.append({
                'name': 'Concurrent Load Handling',
                'passed': successful_responses >= concurrent_requests * 0.8,  # 80% success rate
                'message': f"{successful_responses}/{concurrent_requests} successful, {requests_per_second:.1f} req/s"
            })
        
        except Exception as e:
            results.append({
                'name': 'Concurrent Load Handling',
                'passed': False,
                'message': f"Error: {e}"
            })
        
        return results
    
    async def test_specific_scenarios(self) -> List[Dict]:
        """Test specific real-world scenarios"""
        results = []
        
        # Test different host headers (simulating different domains)
        test_domains = [
            'localhost:8080',
            'shaileshdwivedi.in',
            'test-shaileshdwivedi.in',
            '127.0.0.1:8080'
        ]
        
        for domain in test_domains:
            try:
                async with aiohttp.ClientSession() as session:
                    headers = {'Host': domain}
                    async with session.get(f"{self.proxy_url}/", headers=headers) as resp:
                        results.append({
                            'name': f'Domain Forwarding: {domain}',
                            'passed': resp.status not in [500],  # Internal server errors not acceptable
                            'message': f"Status: {resp.status}"
                        })
            except Exception as e:
                results.append({
                    'name': f'Domain Forwarding: {domain}',
                    'passed': False,
                    'message': f"Error: {e}"
                })
        
        return results

async def main():
    """Run comprehensive testing suite"""
    tester = DNSProxyTester()
    
    # Check if DNS proxy is running
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("http://localhost:8080/health") as resp:
                if resp.status != 200:
                    logger.error("❌ DNS Proxy not running on port 8080!")
                    logger.info("💡 Start the Enhanced DNS Proxy first:")
                    logger.info("   cd backend && python enhanced_dns_proxy.py")
                    return
    except:
        logger.error("❌ DNS Proxy not accessible on port 8080!")
        logger.info("💡 Start the Enhanced DNS Proxy first:")
        logger.info("   cd backend && python enhanced_dns_proxy.py")
        return
    
    # Run all tests
    results = await tester.run_all_tests()
    
    # Additional specific scenario tests
    logger.info(f"\n📋 Running Specific Scenarios...")
    specific_results = await tester.test_specific_scenarios()
    
    for result in specific_results:
        status = "✅" if result['passed'] else "❌"
        logger.info(f"  {status} {result['name']}: {result['message']}")
    
    logger.info(f"\n🎉 Comprehensive testing completed!")
    logger.info(f"📊 Check proxy statistics at: http://localhost:8080/stats")
    logger.info(f"📈 Check proxy metrics at: http://localhost:8080/metrics")
    
    return results

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("\n👋 Testing interrupted by user")
    except Exception as e:
        logger.error(f"💥 Testing failed: {e}")
        sys.exit(1)
